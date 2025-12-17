import * as React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/demo/base/card';
import { Button } from '@/demo/base/button';
import { MessageSquareIcon } from 'lucide-react';

export function SuggestedPromptsCard() {
  const prompts = [
    'Add a new monitoring source: Kubernetes Cluster on port 10255 in Production environment',
    'Show monitoring sources by category for the last 30 days',
    'Show me all pending monitoring sources',
    'Mark the Kubernetes Cluster source as active',
    'How many monitoring sources are in the Infrastructure category?',
    'Show me all monitoring sources in Production environment',
  ];

  const sendMessageToChat = React.useCallback((message: string) => {
    // Use a retry mechanism to ensure the chat is ready
    const trySendMessage = (attempt = 0) => {
      // Find the chat input element by its role attribute
      const chatInput = document.querySelector('input[role="input"][aria-label="Message input"]') as HTMLInputElement;
      const chatForm = document.querySelector('form[role="inputWrapper"]') as HTMLFormElement;

      if (!chatInput || !chatForm) {
        // If chat isn't ready yet, retry after a short delay
        if (attempt < 10) {
          setTimeout(() => trySendMessage(attempt + 1), 100);
        }
        return;
      }

      // Focus the input first to ensure it's ready
      chatInput.focus();

      // Use React's synthetic event system by accessing the input's value setter
      // This bypasses React's controlled input restrictions
      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
      if (nativeInputValueSetter) {
        nativeInputValueSetter.call(chatInput, message);
      } else {
        chatInput.value = message;
      }

      // Create a proper React synthetic event for onChange
      // React expects an event with target.value
      const inputEvent = new Event('input', { bubbles: true, cancelable: true });
      Object.defineProperty(inputEvent, 'target', {
        writable: false,
        value: { ...chatInput, value: message },
      });

      // Also trigger change event
      const changeEvent = new Event('change', { bubbles: true, cancelable: true });
      Object.defineProperty(changeEvent, 'target', {
        writable: false,
        value: { ...chatInput, value: message },
      });

      // Trigger both events
      chatInput.dispatchEvent(inputEvent);
      chatInput.dispatchEvent(changeEvent);

      // Wait for React to process the state update, then submit
      // Use requestAnimationFrame to ensure React has processed the update
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          // Click the submit button instead of dispatching submit event
          // This is more reliable with React forms
          const submitButton = chatForm.querySelector('button[type="submit"]') as HTMLButtonElement;
          if (submitButton) {
            submitButton.click();
          } else {
            // Fallback to form submit
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            chatForm.dispatchEvent(submitEvent);
          }
        });
      });
    };

    trySendMessage();
  }, []);

  const handlePromptClick = React.useCallback(
    (prompt: string) => {
      // Try to open chat by clicking the open button if it exists
      const openChatButton = document.querySelector('.autoui-chat-open-btn') as HTMLButtonElement;
      if (openChatButton) {
        // Check if chat is closed (button shows plus icon when closed)
        const icon = openChatButton.querySelector('img');
        if (icon && icon.src.includes('plus-large')) {
          // Chat is closed, open it first
          openChatButton.click();
          // Wait for chat to mount, then send message
          setTimeout(() => {
            sendMessageToChat(prompt);
          }, 300);
          return;
        }
      }
      // Chat is already open or button not found, try to send immediately
      sendMessageToChat(prompt);
    },
    [sendMessageToChat],
  );

  return (
    <Card className="@container/card h-full">
      <CardHeader className="relative">
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold">Try asking…</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-0">
        <div className="flex flex-col gap-3">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto gap-0 py-2 justify-start whitespace-normal text-left font-normal hover:bg-accent"
              onClick={() => handlePromptClick(prompt)}
            >
              <MessageSquareIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
              <span className="text-xs">{prompt}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
