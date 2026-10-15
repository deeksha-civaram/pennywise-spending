import { useState } from "react";
import { askWalletWise } from "@/services/walletWiseService";
import { Button } from "@/components/ui/button";
import {
  Bot,
  X,
  Send,
  Sparkles,
  Loader2,
  MessageCircle,
} from "lucide-react";

type Message = {
  role: "user" | "assistant";
  text: string;
};

export function FloatingWalletWise() {
  const [open, setOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      text: "Hi! I'm WalletWise 💜 Ask me about your expenses, spending habits, or budgeting.",
    },
  ]);

  async function sendMessage() {
    const text = question.trim();

    if (!text || loading) return;

    setMessages((previous) => [
      ...previous,
      { role: "user", text },
    ]);
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
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open && (
        <section className="flex h-[min(480px,70vh)] w-[min(350px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-2xl border border-violet-400/25 bg-card shadow-2xl shadow-violet-950/40">
          {/* Chat header */}
          <div className="flex items-center justify-between border-b border-border bg-gradient-to-r from-violet-600/20 to-indigo-500/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-violet-400/30 bg-gradient-to-br from-violet-500/30 to-indigo-500/30 text-violet-300">
                <Bot className="h-7 w-7" />
              </div>

              <div>
                <h2 className="text-sm font-semibold">WalletWise AI</h2>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3 text-violet-400" />
                  Your money companion
                </p>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              aria-label="Close WalletWise chat"
              className="h-8 w-8 rounded-full"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto p-3">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${
                  message.role === "user"
                    ? "justify-end"
                    : "justify-start"
                }`}
              >
                {message.role === "assistant" && (
                  <div className="mr-2 mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-violet-500/15 text-violet-300">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] whitespace-pre-wrap break-words rounded-2xl px-3 py-2.5 text-sm leading-5 ${
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                WalletWise is thinking...
              </div>
            )}
          </div>

          {/* Message input */}
          <form
            className="flex items-center gap-2 border-t border-border p-3"
            onSubmit={(event) => {
              event.preventDefault();
              void sendMessage();
            }}
          >
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              placeholder="Ask me anything..."
              maxLength={1000}
              disabled={loading}
              className="min-w-0 flex-1 rounded-xl border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring"
            />

            <Button
              type="submit"
              size="icon"
              disabled={loading || !question.trim()}
              aria-label="Send message"
              className="shrink-0 rounded-xl"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </section>
      )}

      {/* Floating robot button */}
      <div className="group relative">
        {!open && (
          <span className="pointer-events-none absolute bottom-full right-0 mb-3 w-max max-w-[240px] rounded-xl border border-violet-400/20 bg-card px-3 py-2 text-xs text-foreground opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Need help with your money? 💜
          </span>
        )}

        <button
          type="button"
          onClick={() => setOpen((previous) => !previous)}
          aria-label={
            open ? "Close WalletWise chatbot" : "Open WalletWise chatbot"
          }
          aria-expanded={open}
          className="relative grid h-[62px] w-[62px] place-items-center rounded-full border border-violet-300/40 bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white shadow-xl shadow-violet-950/40 transition-all duration-200 hover:scale-105 hover:shadow-violet-500/30 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
        >
          {open ? (
            <X className="h-6 w-6" />
          ) : (
            <>
              <span className="absolute inset-1 rounded-full border border-white/20" />
              <Bot className="h-8 w-8 transition-transform group-hover:-rotate-6" />
              <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-background bg-emerald-400" />
            </>
          )}
        </button>

        {!open && (
          <span className="absolute -right-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-background text-violet-400">
            <MessageCircle className="h-3 w-3" />
          </span>
        )}
      </div>
    </div>
  );
}