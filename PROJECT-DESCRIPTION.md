# NewsPrism: Redefining News with Amazon Nova

## Inspiration
Today's news media—print or otherwise—are pushing their own "narratives," harming global democracies. In a healthy democracy, every voter has the right to know all the facts, presented in an unbiased way, before forming an opinion. This lack of neutrality is resulting in polarized societies where voters are easily persuaded by high-polarization news from fragmented sources.

In print and digital media, news articles have increasingly reported biased information over the last decade. Often, it is only through community discussions on platforms like X (Twitter) or Reddit that we encounter diverse opinions. This trend hurts our democratic foundations.

## What it does
NewsPrism solves this issue by deploying **three AI agents—one with a Conservative view, one with a Progressive view, and one with a Neutral view**. Every news article, link, or video is independently analyzed by these three agents in parallel. They then engage in a **live debating session** to present their viewpoints.

The **user acts as a Jury**, able to ask any agent for their specific perspective on the topic. These agents independently identify commonalities and disagreements in the source material and generate a **Polarization Index** to guide the debate.

**Multi-Lens Analysis**: Every article is processed by three distinct agents:
- **The Sentinel**: Analyzes through a right-leaning, market-focused perspective.
- **The Advocate**: Analyzes through a left-leaning, equity-focused perspective.
- **The Jurist**: A neutral fact-checker that strips away bias and identifies missing context.

**Prism Synthesis**: A final "Orchestrator" agent cross-references all outputs to find the "Shared Reality" and calculates a Polarization Index.

## How we built it
- **Frontend**: React 19, Tailwind CSS 4, Motion (Framer Motion), Lucide React.
- **Backend**: Express.js (Node.js), Axios, Cheerio (for web scraping).
- **AI Engine**: **Amazon Bedrock** featuring **Amazon Nova Pro** (for complex reasoning) and **Amazon Nova Lite** (for rapid-fire debate responses).
- **Infrastructure**: **Amazon Web Services (AWS)**.

### The Infrastructure: AWS
To ensure NewsPrism is production-ready and scalable, we leveraged the **AWS** ecosystem:

- **AWS App Runner**: The entire application is containerized and deployed via App Runner. This allows us to scale automatically based on traffic while keeping latency low for our global users.
- **AWS Secrets Manager**: We securely handle our Amazon Bedrock credentials and other sensitive environment variables, ensuring our integration is both powerful and secure.
- **Amazon Bedrock**: Used to orchestrate the agentic workflow, utilizing the high-speed inference of the **Amazon Nova** model family to maintain a fluid, real-time debate experience.

## Challenges we ran into
Transitioning our agentic workflows to the **Amazon Nova** architecture required significant prompt engineering. Adapting to Nova's specific reasoning patterns was an exciting learning curve, but ultimately resulted in much faster response times for our live debate feature.

## Accomplishments that we're proud of
We tested the agents with highly biased news links from recent global escalations and political topics. We were amazed at how well the **Amazon Nova** models maintained their grounded personas, presenting viewpoints solely based on the facts presented in the article (grounding) without hallucinating external biases.

## What we learned
Agents can be more consistent than humans in conveying a specific, grounded perspective. The beauty of using **Amazon Nova** is the ability to define a persona that remains steadfast and logical, providing a far more reliable "prism" for analysis than a human counterpart might.

## What's next for NewsPrism
We want to realize and develop this app for a global audience. We have ideas to extend this agentic flow further—perhaps incorporating real-time social media sentiment analysis via AWS Lambda—to provide even deeper context to the "Shared Reality" our agents seek to find.
