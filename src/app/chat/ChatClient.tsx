"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { MaxMessage } from "@/components/MaxMessage";

type Msg = { id: string; role: string; content: string };

const QUICK = [
  "Check me in",
  "What's my weekly report?",
  "Help me with debt",
  "I want to set a new goal",
  "Where is my money going?",
  "I'm stressed about money",
];

export const ChatClient = ({ initial }: { initial: Msg[] }) => {
  const [messages, setMessages] = useState<Msg[]>(initial);
  const [text, setText] = useState("");
  const [pending, setPending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages.length, pending]);

  const send = async (override?: string) => {
    const value = (override ?? text).trim();
    if (!value || pending) return;
    setText("");
    setPending(true);
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: value };
    setMessages((m) => [...m, userMsg]);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: value }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setMessages((m) => [
        ...m,
        { id: data.id, role: "assistant", content: data.content },
      ]);
    } catch (e: any) {
      setMessages((m) => [
        ...m,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: `Hmm, something glitched: ${e.message || e}. Try again?`,
        },
      ]);
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-9rem)] card overflow-hidden">
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-5 space-y-4 bg-ink-50">
        {messages.map((m, i) => (
          <MaxMessage
            key={m.id}
            role={m.role}
            content={m.content}
            isLatest={i === messages.length - 1}
          />
        ))}
        {pending && (
          <MaxMessage role="assistant" content="…" />
        )}
      </div>
      <div className="border-t border-ink-100 bg-white px-3 py-3">
        <div className="flex gap-2 mb-2 overflow-x-auto no-scrollbar">
          {QUICK.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => send(q)}
              disabled={pending}
              className="pill bg-ink-100 text-ink-700 hover:bg-ink-200 whitespace-nowrap"
            >
              {q}
            </button>
          ))}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); send(); }}
          className="flex gap-2"
        >
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Ask Max anything…"
            className="input"
            disabled={pending}
          />
          <button
            type="submit"
            disabled={pending || !text.trim()}
            className="btn-primary"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
