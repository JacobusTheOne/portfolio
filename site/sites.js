// ─────────────────────────────────────────────────────────────
//  EDIT THIS FILE to change your portfolio. No other file needs to change.
// ─────────────────────────────────────────────────────────────

window.PROFILE = {
  name: "Jacobus Jacobs",
  role: "DevOps & Software Engineer",
  photo: "Selfportrait.png", // set to "" to hide
  // Contact form endpoint (contact-api stack output "ContactUrl"). Set to "" to hide the form.
  // If this URL changes, update connect-src in netlify.toml too.
  contactApi: "https://vrlo92aei2.execute-api.us-east-2.amazonaws.com/contact",
  status: "Open to remote opportunities", // set to "" to hide the badge
  intro:
    "I’m a DevOps and Software Engineer with a background in infrastructure automation, CI/CD, backend development, and systems design. I enjoy building reliable, scalable platforms that enable engineering teams to deliver software efficiently, whether through automation, deployment pipelines, or developer tooling.",
  links: [
    // icon: "linkedin" or "github" (leave it out for a text-only button)
    { label: "LinkedIn", url: "https://www.linkedin.com/in/jacobus-jacobs-855345145", icon: "linkedin" },
    { label: "GitHub", url: "https://github.com/JacobusTheOne", icon: "github" },
  ],

  // "About me" section: one string per paragraph.
  about: [
    "My professional experience includes designing and maintaining CI/CD pipelines, automating build and deployment processes, developing internal tools in Python and C++, and managing development infrastructure using technologies such as Jenkins, Docker, Kubernetes, Prometheus, Linux, Ansible, Gitea, and Artifactory. I enjoy solving complex technical problems, improving system reliability, and eliminating manual processes through automation.",
    "My path into software has been unconventional. I began my career as an aircraft maintenance engineer, working on safety-critical systems where precision, reliability, and structured problem-solving were essential. That experience continues to shape how I approach software engineering today, with a strong focus on operational excellence, maintainability, and resilient system design.",
    "I currently run an independent consultancy, partnering with clients on software engineering, DevOps, and technical automation projects. I enjoy collaborating with distributed teams to improve engineering workflows, modernize infrastructure, and build scalable solutions.",
    "I’m particularly interested in cloud infrastructure, platform engineering, automation, system reliability, and developer experience. I’m open to remote opportunities where I can contribute to building secure, scalable, and well-engineered platforms that help teams ship software faster and more reliably.",
  ],
  expertiseTitle: "Professionally, I have worked across",
  expertise: [
    "DevOps and CI/CD Engineering",
    "Infrastructure Automation",
    "Backend Development (Python, C++, JavaScript)",
    "Linux Systems Administration",
    "Containerization and Orchestration (Docker, Kubernetes)",
    "Monitoring and Observability (Prometheus)",
    "Developer Tools and Workflow Automation",
    "Cloud Infrastructure (AWS)",
  ],

  // "AWS experience" section. One card per area; delete the whole block to hide it.
  aws: {
    title: "AWS experience",
    intro:
      "Hands-on work in my own AWS environment, from serverless application backends to databases, infrastructure as code and cost governance.",
    groups: [
      {
        name: "Serverless backends",
        services: ["AWS Lambda", "AWS AppSync", "Lambda function URLs"],
        detail:
          "Built a GraphQL API whose Lambda resolvers validate every game move on the server, and a public Lambda function URL that serves HTML and stores form input.",
      },
      {
        name: "Data",
        services: ["Amazon DynamoDB", "Aurora PostgreSQL Serverless v2"],
        detail:
          "Designed DynamoDB tables with transactions, conditional writes, secondary-index queries and TTL expiry; ran Aurora Serverless v2 with IAM database authentication and auto-pause.",
      },
      {
        name: "Identity & security",
        services: ["Amazon Cognito", "AWS IAM"],
        detail:
          "Cognito user and identity pools for sign-in and guest access; least-privilege IAM grants; replaced long-lived access keys with short-term credentials and kept AWS keys out of CI.",
      },
      {
        name: "Infrastructure as code",
        services: ["AWS CDK (TypeScript)", "AWS CloudFormation", "AWS Amplify Gen 2"],
        detail:
          "Define whole backends in code, test changes in a per-developer sandbox stack before production, and roll out tags across nested stacks without replacing resources.",
      },
      {
        name: "Compute",
        services: ["Amazon EC2"],
        detail: "Launched, managed and cleanly terminated EC2 instances.",
      },
      {
        name: "Cost & governance",
        services: ["AWS Cost Explorer", "Tag Editor", "AWS Free Tier"],
        detail:
          "Project/Owner tagging strategy, cost tracking and resource cleanup to keep cloud spend near zero.",
      },
    ],
  },
};

// One entry per website. Only `title` and `url` are required.
//   title        Name shown on the card
//   url          Link to the live website
//   description  One or two sentences about it
//   tags         Technologies (also used for the filter buttons)
//   code         Link to the source code (optional)
//   image        Screenshot path, e.g. "images/mastermind.png" (optional;
//                without it the card shows a colored placeholder)
//   featured     true = shown first, with a "Featured" badge
window.SITES = [
  {
    title: "Mastermind",
    url: "https://mastermind-game-789.netlify.app",
    description:
      "Crack the secret color code against the clock. Three difficulty levels, sign-in, and public leaderboards with server-side anti-cheat.",
    tags: ["Next.js", "TypeScript", "AWS", "AWS Amplify", "Netlify"],
    code: "https://github.com/JacobusTheOne/mastermind-game",
    image: "",
    featured: true,
  },
  {
    title: "Rent Rush",
    url: "https://rent-rush-715.netlify.app",
    description:
      "A real-time multiplayer property-trading board game for 2–4 players: lobby, private tables with invite links, guest play, trading and table chat, with every move validated on the server.",
    tags: ["Next.js", "TypeScript", "AWS", "AWS Amplify", "Netlify"],
    code: "https://github.com/JacobusTheOne/rent-rush",
    image: "",
    featured: true,
  },

  // Copy this block to add another site:
  // {
  //   title: "My Next Site",
  //   url: "https://example.com",
  //   description: "What it does in one sentence.",
  //   tags: ["HTML", "CSS"],
  //   code: "https://github.com/JacobusTheOne/repo-name",
  //   image: "images/my-next-site.png",
  // },
];
