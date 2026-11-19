# Portfolio

One-page portfolio: profile, About, AWS experience, my websites as cards, and a contact form.

**Live:** https://jacobus-jacobs-portfolio.netlify.app

```
site/          The website (plain HTML/CSS/JS, no build step) — published by Netlify
contact-api/   Contact form backend on AWS (CDK, TypeScript) — never published
netlify.toml   Netlify config: publishes site/, security headers
```

## Edit the content

Everything you'd normally change is in **`site/sites.js`**: name, intro, photo, links, About,
AWS experience, the contact form URL, and the list of websites.

```js
{
  title: "My Next Site",
  url: "https://example.com",
  description: "What it does in one sentence.",
  tags: ["HTML", "CSS"],
  code: "https://github.com/JacobusTheOne/repo-name",   // optional
  image: "images/my-next-site.png",                      // optional, 16:9 works best
  featured: true,                                        // optional, shows first
},
```

Preview by double-clicking `site/index.html`. (The contact form only works from the live site:
the API only accepts requests from it.)

## Deploy the website

```bash
git push
netlify deploy --prod      # publishes site/ (see netlify.toml)
```

## Contact form backend

```
form ──POST──► API Gateway HTTP API ──► Lambda (submit) ──► DynamoDB
               CORS: portfolio only,                          │
               throttled 2 req/s                              │
EventBridge Scheduler, 08:00 America/New_York ──► Lambda (digest) ──► SNS ──► email
                                                  only when there are new messages
```

- Spam protection: hidden honeypot field, minimum time on page, length and email validation.
  Spam gets a fake "OK" and isn't saved.
- The digest remembers its last successful run, so a failed day is picked up the next day.
- Messages are kept for a year (DynamoDB TTL). The table is retained if the stack is deleted.
- AWS project Region: **us-east-2**. Resources are tagged `Project=portfolio`, `Owner=JacobusTheOne`.

Deploy or update (needs `aws login --profile aws-project`):

```bash
cd contact-api
npm install
npm test
NOTIFY_EMAIL=you@example.com npm run deploy
```

`NOTIFY_EMAIL` is the digest recipient. It's passed at deploy time so it never ends up in this
public repo. After the first deploy, confirm the subscription email from AWS Notifications.
If the API URL ever changes, update `contactApi` in `site/sites.js` and `connect-src` in
`netlify.toml`.

Read messages without waiting for the digest:

```bash
aws dynamodb query --profile aws-project --region us-east-2 \
  --table-name <TableName output> --key-condition-expression "pk = :p" \
  --expression-attribute-values '{":p":{"S":"MSG"}}'
```

Send a digest now: invoke the `DigestFunctionName` output in the Lambda console (Test).

Remove everything: `npx cdk destroy --profile aws-project`, then delete the retained DynamoDB
table if you no longer need the messages.
