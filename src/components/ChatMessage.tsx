import { MapPin } from "lucide-react";

interface ChatMessageProps {
  senderName: string;
  neighborhood: string;
  content: string;
  createdAt: string;
  isOwn: boolean;
}

export default function ChatMessage({ senderName, neighborhood, content, createdAt, isOwn }: ChatMessageProps) {
  const time = new Date(createdAt).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[80%] ${isOwn ? "items-end" : "items-start"}`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-semibold text-foreground">{senderName}</span>
          <span className="inline-flex items-center gap-0.5 text-[10px] text-primary bg-primary/15 px-1.5 py-0.5 rounded-full">
            <MapPin className="w-2.5 h-2.5" />
            {neighborhood}
          </span>
          <span className="text-[10px] text-muted-foreground">{time}</span>
        </div>
        <div
          className={`px-3 py-2 rounded-2xl text-sm leading-relaxed ${
            isOwn
              ? "bg-primary text-primary-foreground rounded-br-md"
              : "glass rounded-bl-md"
          }`}
        >
          {content}
        </div>
      </div>
    </div>
  );
}
