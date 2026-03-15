# Building NewsPrism: Redefining News with Amazon Nova

*This piece of content was created for the purposes of entering the Amazon Nova Hackathon.*

In an era of deep polarization and "echo chambers," understanding the full story behind a headline is harder than ever. That’s why we built **NewsPrism**—an AI-powered news analysis platform designed to break down complex narratives into multiple, distinct perspectives. 

In this post, we’ll dive into how we leveraged **Amazon's cutting-edge AI models** and **AWS** to build a real-time, multimodal experience that turns static news into a dynamic debate.

---

### The Vision: Beyond the Headline
NewsPrism doesn't just summarize an article; it analyzes it through the eyes of different personas:
- **The Sentinel**: The data-driven skeptic.
- **The Advocate**: The empathetic humanist.
- **The Jurist**: The pragmatic realist.

By presenting these conflicting viewpoints, we empower users to form their own conclusions rather than being fed a single narrative.

### The Engine: Amazon Bedrock & Amazon Nova
The heart of NewsPrism is **Amazon Bedrock**. We utilized a multi-model approach to balance speed and depth:

1.  **Deep Analysis with Amazon Nova Pro**: When a user submits a URL, we use Amazon Nova Pro to perform a comprehensive analysis of the text. It identifies core arguments, detects bias, and generates the detailed "perspectives" for our AI agents.
2.  **Real-Time Interaction with Amazon Nova Lite**: This is the "magic" of the project. In our **Live Debate** mode, we use Amazon Nova Lite to facilitate a real-time discussion between our agents. 
    -   **Low Latency**: Nova Lite allows for near-instantaneous responses.
    -   **Agentic Workflow**: We implemented custom system instructions to ensure agents respect a structured debate format, calling on each other and waiting for user input.

### The Infrastructure: AWS
To ensure NewsPrism is production-ready and scalable, we turned to **AWS**:

-   **AWS App Runner**: The entire application is containerized and deployed on AWS App Runner. This allows us to scale automatically based on traffic while keeping latency low for our global users.
-   **Security & Environment Management**: Using AWS Secrets Manager, we securely handle API keys and other services, ensuring that our integration is both powerful and safe.

### Building the Experience: React & Tailwind CSS
On the frontend, we wanted a "Technical Dashboard" aesthetic—precise, clean, and information-dense.
-   **Tailwind CSS**: Used for the sleek, dark-mode interface and responsive layouts.
-   **Framer Motion**: Powering the smooth transitions and the "Speaking" animations for our AI agents.

### Conclusion: The Future of Informed Citizens
NewsPrism is more than just a tool; it’s an experiment in using AI to promote critical thinking. By combining the reasoning power of **Amazon Nova Pro** with the speed of **Amazon Nova Lite**, we’ve created a platform that doesn't just tell you the news—it talks it through with you.

---

**Try NewsPrism today and see the news from every angle.**
