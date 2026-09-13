import { MessageList } from "@/modules/messages/components/message-list";
import { listMessages } from "@/modules/messages/message.dal";
import { requirePagePermission } from "@/server/rbac/guard";

export const dynamic = "force-dynamic";

export default async function MessagesPage() {
  await requirePagePermission("message.manage");
  const messages = await listMessages();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl">Pesan</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pesan dari formulir di halaman Kontak. Balas lewat email pengirim, lalu arsipkan pesan yang
          sudah selesai.
        </p>
      </div>
      <MessageList
        messages={messages.map((message) => ({
          ...message,
          createdAt: message.createdAt.getTime(),
        }))}
      />
    </div>
  );
}
