import { prisma } from "@/lib/db";
import { getCurrentUserId } from "@/lib/current-user";
import { ChatClient } from "./ChatClient";
import { PageHeader } from "@/components/PageHeader";

export default async function ChatPage() {
  const userId = await getCurrentUserId();
  const messages = await prisma.chatMessage.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
    take: 50,
  });

  return (
    <div>
      <PageHeader
        title="Chat with Max"
        subtitle="Your money coach. Friendly, never judgy."
      />
      <ChatClient
        initial={messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
        }))}
      />
    </div>
  );
}
