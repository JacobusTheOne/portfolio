import { App, Tags } from "aws-cdk-lib";
import { ContactStack } from "../lib/contact-stack.ts";

const app = new App();

// The digest recipient is passed at deploy time so it never lands in the public repo:
//   NOTIFY_EMAIL=you@example.com npm run deploy
const notifyEmail = process.env.NOTIFY_EMAIL ?? app.node.tryGetContext("notifyEmail");
if (!notifyEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(notifyEmail)) {
  throw new Error("Set NOTIFY_EMAIL (the address that receives the daily digest) before synth/deploy.");
}

new ContactStack(app, "PortfolioContact", {
  // The AWS project only allows its assigned Region.
  env: { account: process.env.CDK_DEFAULT_ACCOUNT, region: "us-east-2" },
  description: "Portfolio contact form: HTTP API, Lambda, DynamoDB and a daily SNS email digest",
  notifyEmail,
  // A list so two hosts can work side by side while moving the site (cdk.json "siteOrigins").
  siteOrigins: [app.node.tryGetContext("siteOrigins")].flat(),
});

Tags.of(app).add("Project", "portfolio");
Tags.of(app).add("Owner", "JacobusTheOne");
