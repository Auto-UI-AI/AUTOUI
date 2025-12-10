import type { AutoUIConfig } from '../../lib/types/index';
import { Chat, ModalChat } from '../../lib/components';

const config: AutoUIConfig = {
  llm: {
    provider: 'openai',
    apiKey: 'YOUR_KEY',
    model: 'gpt-5.1-chat',
    temperature: 0.7,
    maxTokens: 2048,
    appDescriptionPrompt: 'This is a demo Auto UI chat system.',
  },

  runtime: {
    validateLLMOutput: true,
    storeChatToLocalStorage: true,
    localStorageKey: 'ecommerce_demo_chat',
    enableDebugLogs: true,
    maxSteps: 4,
    errorHandling: {
      showToUser: true,
      retryOnFail: true,
    },
  },

  functions: {
    getTime: {
      prompt: 'Returns the current time.',
      params: { timezone: 'Timezone to format the time' },
      returns: 'A formatted string of current time',
      callFunc: ({ timezone }: { timezone: any }) => {
        return new Date().toLocaleString('en-US', { timeZone: timezone });
      },
      tags: ['utility'],
    },
  },

  components: {
    SimpleText: {
      prompt: 'Renders simple text output.',
      props: { text: 'String to render' },
      callComponent: ({ text }: { text: any }) => <p>{text}</p>,
      defaults: { text: 'Hello world!' },
      category: 'display',
    },
  },

  metadata: {
    appName: 'Demo Auto UI App',
    appVersion: '1.0',
  },
};
export const Demo = () => {
  return (
    <div>
      <h3>Chat example</h3>
      <Chat config={config} />
      <h3>ModalChat example</h3>
      <ModalChat config={config} />
    </div>
  );
};
