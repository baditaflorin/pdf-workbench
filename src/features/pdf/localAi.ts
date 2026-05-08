type LanguageModelSession = {
  prompt(input: string): Promise<string>;
  destroy?: () => void;
};

type LanguageModelProvider = {
  availability?: () => Promise<string>;
  create: () => Promise<LanguageModelSession>;
};

type BrowserAiGlobal = Window &
  typeof globalThis & {
    LanguageModel?: LanguageModelProvider;
    ai?: {
      languageModel?: LanguageModelProvider;
    };
  };

export async function summarizeWithLocalModel(text: string) {
  const provider = resolveLanguageModelProvider();

  if (!provider) {
    throw new Error(
      "No browser-local language model API is available in this browser.",
    );
  }

  const availability = await provider.availability?.();
  if (availability && !["available", "readily"].includes(availability)) {
    throw new Error(`The browser-local language model is ${availability}.`);
  }

  const session = await provider.create();
  try {
    return await session.prompt(
      `Summarize this PDF text in concise bullet points. Do not use outside knowledge.\n\n${text.slice(0, 12000)}`,
    );
  } finally {
    session.destroy?.();
  }
}

export function hasLocalLanguageModel() {
  return Boolean(resolveLanguageModelProvider());
}

function resolveLanguageModelProvider() {
  const global = window as BrowserAiGlobal;
  return global.LanguageModel ?? global.ai?.languageModel ?? null;
}
