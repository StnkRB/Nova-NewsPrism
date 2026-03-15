# NewsPrism

NewsPrism is an AI-powered news analysis platform that breaks down complex narratives into multiple, distinct perspectives using **Amazon Nova** models.

## Features

- **Multi-Lens Analysis**: Analyze news articles through three distinct AI personas (Conservative, Progressive, Neutral).
- **Live AI Debate**: Watch the agents debate the article's points in real-time.
- **Polarization Index**: Get a quantitative measure of how polarized a news piece is.
- **Jury Mode**: Interact with the agents and ask for specific viewpoints.

## Tech Stack

- **AI**: Amazon Bedrock (Amazon Nova Pro & Amazon Nova Lite)
- **Frontend**: React 19, Tailwind CSS 4, Framer Motion
- **Backend**: Node.js, Express.js
- **Infrastructure**: AWS (App Runner, Secrets Manager)

## Getting Started

### Prerequisites

- Node.js 20+
- AWS Account with Bedrock access (Amazon Nova models enabled)
- AWS CLI configured

### Environment Variables

Create a `.env` file in the root directory and add your AWS credentials:

```env
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
```

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

The application is designed to be deployed on **AWS App Runner**.

1. Build the Docker image:
   ```bash
   docker build -t newsprism .
   ```

2. Push to Amazon ECR and deploy via App Runner.

## License

MIT
