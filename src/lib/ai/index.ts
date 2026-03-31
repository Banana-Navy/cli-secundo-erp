import type { AITranslationService, AIDescriptionService } from "./types";
import { MockTranslationService, MockDescriptionService } from "./mock-provider";
import { OpenAITranslationService, OpenAIDescriptionService } from "./openai-provider";

export function getTranslationService(): AITranslationService {
  const provider = process.env.AI_PROVIDER ?? "mock";

  switch (provider) {
    case "openai":
      return new OpenAITranslationService();
    default:
      return new MockTranslationService();
  }
}

export function getDescriptionService(): AIDescriptionService {
  const provider = process.env.AI_PROVIDER ?? "mock";

  switch (provider) {
    case "openai":
      return new OpenAIDescriptionService();
    default:
      return new MockDescriptionService();
  }
}

export type { Lang, PropertyContext, AITranslationService, AIDescriptionService } from "./types";
