import { cn } from "@/lib/cn";

const renderInline = (line: string, key: number) => {
  // bold **text**
  const parts = line.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span key={key}>
      {parts.map((p, i) =>
        p.startsWith("**") && p.endsWith("**") ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </span>
  );
};

export const MaxMessage = ({
  role, content, isLatest,
}: { role: string; content: string; isLatest?: boolean }) => {
  const isUser = role === "user";
  const lines = content.split("\n");
  return (
    <div className={cn("flex gap-3", isUser && "justify-end")}>
      {!isUser && (
        <div className="h-8 w-8 rounded-full bg-brand-600 text-white grid place-items-center font-semibold text-sm shrink-0">
          M
        </div>
      )}
      <div
        className={cn(
          "max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap",
          isUser
            ? "bg-brand-600 text-white rounded-br-md"
            : "bg-white border border-ink-100 text-ink-900 rounded-bl-md"
        )}
      >
        {lines.map((line, i) => (
          <div key={i}>{line ? renderInline(line, i) : <br />}</div>
        ))}
      </div>
    </div>
  );
};
