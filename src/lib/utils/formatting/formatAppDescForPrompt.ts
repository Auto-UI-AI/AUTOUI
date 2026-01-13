import type { AutoUIConfig } from "@lib/types";

export const formatAppDescForPrompt = (config: AutoUIConfig) => {
    return config.llm.appDescriptionPrompt
    ? `\nAPP CONTEXT:\n${config.llm.appDescriptionPrompt}${config.metadata?.appName ? `\nApp: ${config.metadata.appName}` : ''}\n`
    : '';
}