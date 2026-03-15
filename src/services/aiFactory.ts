import { AIService } from "./aiTypes";
import { NovaProvider } from "./novaProvider";

export type AIProviderType = "nova";

export class AIFactory {
  private static instance: AIService | null = null;
  private static currentType: AIProviderType = "nova";

  static getService(type?: AIProviderType): AIService {
    if (type && type !== this.currentType) {
      this.instance = null;
      this.currentType = type;
    }

    if (!this.instance) {
      this.instance = new NovaProvider();
    }
    return this.instance;
  }

  static getCurrentType(): AIProviderType {
    return this.currentType;
  }
}
