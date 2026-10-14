import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { AppShell } from "@/components/layout/AppShell";
import { Button } from "@/components/ui/button";
import { askWalletWise } from "@/services/walletWiseService";
import { Send, Wallet, Sparkles, Loader2 } from "lucide-react";

export const Route = createFileRoute("/walletwise")({
  component: WalletWisePage,
});

type Message = {
  role: "user" | "assistant";
  text: string;
};

function WalletWisePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm WalletWise AI. Ask me about your spending, expenses, or budgeting. I'll use your saved transactions to help you understand your money.",
    },
  ]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = question.trim();

    if (!text || loading) return;

    setMessages((previous) => [...previous, { role: "user", text }]);
    setQuestion("");
    setLoading(true);

    try {
      const answer = await askWalletWise(text);
      setMessages((previous) => [
        ...previous,
        { role: "assistant", text: answer },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          text: `Sorry, I couldn't answer that. ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell
      title="WalletWise AI"
      subtitle="Your personal spending assistant"
    >
      <div className="mx-auto flex h-[calc(100vh-12rem)] max-w-3xl flex-col overflow-hidden rounded-xl border border-border bg-background">
        <div className="flex items-center gap-3 border-b border-border p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <Wallet className="h-5 w-5 text-primary" />
          </div>

          <div>
            <h2 className="font-semibold">WalletWise AI</h2>
            <p className="text-xs text-muted-foreground">
              <Sparkles className="mr-1 inline h-3 w-3" />
              Spending insights and budgeting help
            </p>
          </div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[95%] overflow-x-auto rounded-2xl px-4 py-3 text-sm sm:max-w-[85%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-foreground"
                }`}
              >
                {message.role === "user" ? (
                  <p className="whitespace-pre-wrap">{message.text}</p>
                ) : (
                  <div className="break-words leading-6 [&_h1]:mb-3 [&_h1]:mt-4 [&_h1]:text-xl [&_h1]:font-bold [&_h2]:mb-2 [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-bold [&_h3]:mb-2 [&_h3]:mt-3 [&_h3]:font-bold [&_p]:my-2 [&_strong]:font-bold [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:my-2 [&_ol]:list-decimal [&_ol]:pl-5 [&_li]:my-1 [&_hr]:my-3 [&_hr]:border-border [&_blockquote]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_code]:rounded [&_code]:bg-background [&_code]:px-1 [&_code]:py-0.5 [&_pre]:my-3 [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-background [&_pre]:p-3">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        table: ({ children }) => (
                          <div className="my-3 w-full overflow-x-auto rounded-lg border border-border">
                            <table className="w-full min-w-[280px] border-collapse text-left text-sm">
                              {children}
                            </table>
                          </div>
                        ),
                        thead: ({ children }) => (
                          <thead className="bg-background">{children}</thead>
                        ),
                        th: ({ children }) => (
                          <th className="border-b border-border px-3 py-2 font-bold">
                            {children}
                          </th>
                        ),
                        td: ({ children }) => (
                          <td className="border-b border-border px-3 py-2 align-top">
                            {children}
                          </td>
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              WalletWise is thinking...
            </div>
          )}
        </div>

        <form
          className="flex gap-2 border-t border-border p-3"
          onSubmit={(event) => {
            event.preventDefault();
            void sendMessage();
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about your spending..."
            maxLength={1000}
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />

          <Button
            type="submit"
            size="icon"
            disabled={loading || !question.trim()}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </AppShell>
  );
}