import { BedrockRuntimeClient, ConverseCommand, ConverseStreamCommand } from "@aws-sdk/client-bedrock-runtime";
import { AIService, AnalysisResult, LiveSessionCallbacks } from "./aiTypes";
import { AGENTS } from "./newsPrismService";

export class NovaProvider implements AIService {
  private client: BedrockRuntimeClient;
  private abortController: AbortController | null = null;

  constructor() {
    this.client = new BedrockRuntimeClient({
      region: process.env.AWS_REGION || "us-east-1",
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
      },
    });
  }

  async analyzeUrl(url: string): Promise<AnalysisResult> {
    // For Nova, we first need to fetch the content since it doesn't have a native urlContext tool like Gemini.
    // We'll use a server-side proxy for this.
    const fetchResponse = await fetch(`/api/fetch-url?url=${encodeURIComponent(url)}`);
    const { content } = await fetchResponse.json();

    const prompt = `
      Analyze the following article content:
      
      ${content}
      
      Provide three distinct political perspectives (Far Left, Far Right, and Central) based ONLY on the facts presented in the article.
      
      Then, evaluate the degree of convergence and divergence between these views.
      
      Finally, as a "Polarization Evaluating Agent", provide a polarization score (0-100) and a summary of the narrative landscape.
      
      Return the result in strict JSON format.
    `;

    const command = new ConverseCommand({
      modelId: "amazon.nova-pro-v1:0",
      messages: [{ role: "user", content: [{ text: prompt }] }],
      inferenceConfig: {
        maxTokens: 2000,
        temperature: 0.7,
      },
    });

    const response = await this.client.send(command);
    const text = response.output?.message?.content?.[0]?.text || "{}";
    
    // Clean up potential markdown formatting
    const jsonStr = text.replace(/```json\n?|\n?```/g, "").trim();
    return JSON.parse(jsonStr) as AnalysisResult;
  }

  async connectLive(url: string, analysis: AnalysisResult, callbacks: LiveSessionCallbacks): Promise<any> {
    this.abortController = new AbortController();
    callbacks.onOpen();

    const systemInstruction = `
        You are the moderator and the voices of "NewsPrism", a high-stakes live debate platform. 
        You MUST manage three distinct AI debaters: 
        1. Elias Thorne (Far Left): ${AGENTS[0].personality}
        2. Marcus Sterling (Far Right): ${AGENTS[1].personality}
        3. Sarah Jenkins (Central): ${AGENTS[2].personality}

        TOPIC: Based on this article: ${url}
        ANALYSIS CONTEXT:
        - Convergence: ${analysis.convergence}
        - Divergence: ${analysis.divergence}
        - Polarization Score: ${analysis.polarizationScore}/100

        DEBATE RULES:
        - You must facilitate a structured, one-at-a-time debate.
        - ONLY ONE AGENT SHOULD TALK AT A TIME. An agent must complete their entire thought before another begins.
        - NEVER output speech for multiple agents in a single response turn.
        - After an agent speaks, they should either challenge another specific agent by name or wait for the User (The Jury) to intervene.
        - If the User asks a specific agent a question, ONLY that agent should respond.
        - The User is the "Jury" and the ultimate Moderator. Respect their interruptions and follow their lead.
        
        CRITICAL FORMATTING:
        - Every time a speaker changes, you MUST start the new segment with their name followed by a colon, e.g., "Elias: [speech]", "Marcus: [speech]", "Sarah: [speech]".
        
        Start now by briefly introducing the panel and the topic, then WAIT for the User to invite the first speaker or ask a question.
      `;

    const command = new ConverseStreamCommand({
      modelId: "amazon.nova-lite-v1:0",
      system: [{ text: systemInstruction }],
      messages: [{ role: "user", content: [{ text: "Start the debate." }] }],
      inferenceConfig: {
        maxTokens: 4000,
        temperature: 0.9,
      },
    });

    try {
      const response = await this.client.send(command, { abortSignal: this.abortController.signal });
      
      if (response.stream) {
        let currentText = "";
        for await (const chunk of response.stream) {
          if (chunk.contentBlockDelta?.delta?.text) {
            const delta = chunk.contentBlockDelta.delta.text;
            currentText += delta;
            callbacks.onMessage(currentText);
          }
        }
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        callbacks.onError(error.message);
      }
    } finally {
      callbacks.onClose();
    }

    return this.abortController;
  }

  sendAudio(data: string): void {
    // Nova doesn't support real-time audio input in the same way.
    // In a real app, you'd use Amazon Transcribe here.
    console.log("Audio input received for Nova (STT not implemented in this demo)");
  }

  sendText(text: string): void {
    console.log("Text input received for Nova:", text);
  }

  close(): void {
    this.abortController?.abort();
  }
}
