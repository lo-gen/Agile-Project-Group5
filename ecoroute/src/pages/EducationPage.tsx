import { useEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { askEducationChat } from "../utils/educationChatApi";

type MessageRole = "user" | "assistant";

interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
}

const INITIAL_MESSAGE: ChatMessage = {
  id: "intro",
  role: "assistant",
  content:
    "Hi, I can help with flights, routes, airports, emissions, and climate-aware travel. Ask me anything in that area.",
};

export default function EducationPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = chatContainerRef.current;
    if (!element) return;
    element.scrollTop = element.scrollHeight;
  }, [messages, isLoading]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const prompt = input.trim();
    if (!prompt || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: prompt,
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const reply = await askEducationChat(prompt);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: reply,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (error) {
      const assistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content:
          error instanceof Error
            ? error.message
            : "Something went wrong while contacting the AI.",
      };
      setMessages((current) => [...current, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="h-full overflow-y-auto bg-eco-bg px-4 py-10 text-eco-text sm:px-8">
      <div className="mx-auto flex h-full w-full max-w-4xl flex-col rounded-2xl border border-eco-border bg-eco-panel p-5 sm:p-7">
        <div>
          <p className="inline-flex rounded-full border border-eco-border px-3 py-1 text-xs font-medium text-eco-green">
            Education
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight">
            EcoRoute Education Chat
          </h1>
          <p className="mt-3 text-sm text-eco-muted">
            Ask quick questions about sustainable travel and flight emissions.
          </p>
        </div>

        <div
          ref={chatContainerRef}
          className="mt-6 min-h-0 flex-1 space-y-3 overflow-y-auto rounded-xl border border-eco-border bg-eco-bg p-4"
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-[90%] rounded-lg px-3 py-2 text-sm leading-6 ${
                message.role === "user"
                  ? "ml-auto bg-eco-green text-eco-bg"
                  : "mr-auto bg-eco-panel text-eco-text"
              }`}
            >
              {message.content}
            </div>
          ))}
          {isLoading && (
            <div className="mr-auto rounded-lg bg-eco-panel px-3 py-2 text-sm text-eco-muted">
              Thinking...
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Ask about flights, emissions, routes..."
            className="w-full rounded-md border border-eco-border bg-eco-bg px-3 py-2 text-sm text-eco-text outline-none transition focus:border-eco-green"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="rounded-md bg-eco-green px-4 py-2 text-sm font-semibold text-eco-bg transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading || input.trim().length === 0}
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}
