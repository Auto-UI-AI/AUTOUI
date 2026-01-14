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
    'Display monitoring sources breakdown by category',
  ];

  const sendMessageToChat = React.useCallback((message: string) => {
    // Dispatch a custom event that the chat can listen to
    const event = new CustomEvent('autoui-send-message', {
      detail: { message },
      bubbles: true,
    });
    document.dispatchEvent(event);
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
          }, 500);
          return;
        }
      }
      // Chat is already open or button not found, send immediately
      sendMessageToChat(prompt);
    },
    [sendMessageToChat],
  );

  return (
    <Card className="@container/card h-full bg-[#1A1D23] border-[#2A2F37] shadow-lg">
      <CardHeader className="relative border-b border-[#2A2F37]">
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold text-[#F5F7FA]">Try asking…</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pt-4">
        <div className="flex flex-col gap-3">
          {prompts.map((prompt, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="h-auto gap-0 py-2.5 justify-start whitespace-normal text-left font-normal border-[#2A2F37] bg-[#1A1D23] text-[#A9B2C1] hover:bg-[#2A2F37] hover:text-[#00E5FF] hover:border-[#00E5FF]/30 transition-all duration-200"
              onClick={() => handlePromptClick(prompt)}
            >
              <MessageSquareIcon className="mr-2 size-4 shrink-0 text-[#00B8D4]" />
              <span className="text-xs">{prompt}</span>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
