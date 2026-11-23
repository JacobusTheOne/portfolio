import * as path from "node:path";
import { fileURLToPath } from "node:url";
import { CfnOutput, Duration, RemovalPolicy, Stack, TimeZone, type StackProps } from "aws-cdk-lib";
import * as apigw from "aws-cdk-lib/aws-apigatewayv2";
import { HttpLambdaIntegration } from "aws-cdk-lib/aws-apigatewayv2-integrations";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { NodejsFunction, OutputFormat } from "aws-cdk-lib/aws-lambda-nodejs";
import * as logs from "aws-cdk-lib/aws-logs";
import * as scheduler from "aws-cdk-lib/aws-scheduler";
import * as schedulerTargets from "aws-cdk-lib/aws-scheduler-targets";
import * as sns from "aws-cdk-lib/aws-sns";
import * as subs from "aws-cdk-lib/aws-sns-subscriptions";
import type { Construct } from "constructs";

const here = path.dirname(fileURLToPath(import.meta.url));

export interface ContactStackProps extends StackProps {
  notifyEmail: string;
  /** Sites allowed to call the API from a browser (CORS), e.g. the Cloudflare Pages URL. */
  siteOrigins: string[];
}

export class ContactStack extends Stack {
  constructor(scope: Construct, id: string, props: ContactStackProps) {
    super(scope, id, props);

    // Messages from real people: keep the table if the stack is ever deleted,
    // and allow point-in-time restore. Items expire after a year (TTL).
    const table = new dynamodb.TableV2(this, "Messages", {
      partitionKey: { name: "pk", type: dynamodb.AttributeType.STRING },
      sortKey: { name: "sk", type: dynamodb.AttributeType.STRING },
      billing: dynamodb.Billing.onDemand(),
      timeToLiveAttribute: "expiresAt",
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: RemovalPolicy.RETAIN,
    });

    const topic = new sns.Topic(this, "DigestTopic", {
      displayName: "Portfolio messages",
      enforceSSL: true,
    });
    topic.addSubscription(new subs.EmailSubscription(props.notifyEmail));

    const fn = (name: string, entry: string, timeout: number, environment: Record<string, string>) =>
      new NodejsFunction(this, name, {
        entry: path.join(here, "..", "lambda", entry),
        runtime: lambda.Runtime.NODEJS_22_X,
        architecture: lambda.Architecture.ARM_64,
        memorySize: 256,
        timeout: Duration.seconds(timeout),
        environment: { TABLE_NAME: table.tableName, ...environment },
        logGroup: new logs.LogGroup(this, `${name}Logs`, {
          retention: logs.RetentionDays.ONE_MONTH,
          removalPolicy: RemovalPolicy.DESTROY,
        }),
        bundling: { format: OutputFormat.ESM, minify: true, externalModules: ["@aws-sdk/*"] },
      });

    // Least privilege: submit can only write; digest can only read and record its progress.
    const submitFn = fn("SubmitFunction", "submit.ts", 10, {});
    table.grant(submitFn, "dynamodb:PutItem");

    const digestFn = fn("DigestFunction", "digest.ts", 30, { TOPIC_ARN: topic.topicArn });
    table.grant(digestFn, "dynamodb:Query", "dynamodb:GetItem", "dynamodb:PutItem");
    topic.grantPublish(digestFn);

    // Public endpoint for the form. CORS allows only the portfolio site; throttling caps abuse
    // (and cost) at a few requests per second.
    const api = new apigw.HttpApi(this, "ContactApi", {
      description: "Portfolio contact form",
      createDefaultStage: false,
      corsPreflight: {
        allowOrigins: props.siteOrigins,
        allowMethods: [apigw.CorsHttpMethod.POST],
        allowHeaders: ["content-type"],
        maxAge: Duration.days(1),
      },
    });
    new apigw.HttpStage(this, "DefaultStage", {
      httpApi: api,
      stageName: "$default",
      autoDeploy: true,
      throttle: { rateLimit: 2, burstLimit: 5 },
    });
    api.addRoutes({
      path: "/contact",
      methods: [apigw.HttpMethod.POST],
      integration: new HttpLambdaIntegration("SubmitIntegration", submitFn),
    });

    // Daily digest. Only emails when new messages arrived since the last successful run.
    new scheduler.Schedule(this, "DailyDigest", {
      description: "Email a digest of new portfolio messages",
      schedule: scheduler.ScheduleExpression.cron({
        minute: "0",
        hour: "8",
        timeZone: TimeZone.AMERICA_NEW_YORK,
      }),
      target: new schedulerTargets.LambdaInvoke(digestFn, {
        retryAttempts: 2,
        maxEventAge: Duration.hours(2),
      }),
    });

    new CfnOutput(this, "ContactUrl", { value: `${api.apiEndpoint}/contact` });
    new CfnOutput(this, "TableName", { value: table.tableName });
    new CfnOutput(this, "DigestFunctionName", { value: digestFn.functionName });
  }
}
