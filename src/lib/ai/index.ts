import type { AITranslationService, AIDescriptionService } from "./types";
import { MockTranslationService, MockDescriptionService } from "./mock-provider";

export function getTranslationService(): AITranslationService {
  const provider = process.env.AI_PROVIDER ?? "mock";

  switch (provider) {
    // Future providers: case "deepl": return new DeepLTranslationService();
    // case "claude": return new ClaudeTranslationService();
    default:
      return new MockTranslationService();
  }
}

export function getDescriptionService(): AIDescriptionService {
  const provider = process.env.AI_PROVIDER ?? "mock";

  switch (provider) {
    // Future providers: case "claude": return new ClaudeDescriptionService();
    default:
      return new MockDescriptionService();
  }
}

export type { Lang, PropertyContext, AITranslationService, AIDescriptionService } from "./types";
