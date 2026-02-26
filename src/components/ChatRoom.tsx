import { useState, useEffect, useRef, useCallback } from "react";
import { Send, AlertTriangle, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getSessionId } from "@/lib/session";
import { Button } from "@/components/ui/button";
import ChatMessage from "./ChatMessage";
import OnlineUsers from "./OnlineUsers";

interface ChatRoomProps {
  name: string;
  neighborhood: string;
  onLeave: () => void;
}

interface Message {
  id: string;
  sender_name: string;
  sender_neighborhood: string;
  content: string;
  created_at: string;
}

interface OnlineUser {
  id: string;
  name: string;
  neighborhood: string;
}

export default function ChatRoom({ name, neighborhood, onLeave }: ChatRoomProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sessionId = getSessionId();

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Register presence
  useEffect(() => {
    const register = async () => {
      // Upsert presence
      await supabase.from("online_users").upsert(
        { session_id: sessionId, name, neighborhood, last_seen: new Date().toISOString() },
        { onConflict: "session_id" }
      );
    };
    register();

    // Heartbeat every 30s
    const interval = setInterval(register, 30000);

    // Cleanup on leave
    const cleanup = () => {
      supabase.from("online_users").delete().eq("session_id", sessionId).then(() => {});
    };
    window.addEventListener("beforeunload", cleanup);

    return () => {
      clearInterval(interval);
      window.removeEventListener("beforeunload", cleanup);
      cleanup();
    };
  }, [name, neighborhood, sessionId]);

  // Clean stale users (>60s)
  useEffect(() => {
    const cleanStale = async () => {
      const cutoff = new Date(Date.now() - 60000).toISOString();
      await supabase.from("online_users").delete().lt("last_seen", cutoff);
    };
    const interval = setInterval(cleanStale, 30000);
    cleanStale();
    return () => clearInterval(interval);
  }, []);

  // Load messages
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("messages")
        .select("*")
        .order("created_at", { ascending: true })
        .limit(200);
      if (data) setMessages(data);
    };
    load();
  }, []);

  // Load online users
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("online_users").select("*");
      if (data) setOnlineUsers(data);
    };
    load();
    const interval = setInterval(load, 10000);
    return () => clearInterval(interval);
  }, []);

  // Realtime messages
  useEffect(() => {
    const channel = supabase
      .channel("messages-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((prev) => [...prev, payload.new as Message]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Realtime online users
  useEffect(() => {
    const channel = supabase
      .channel("users-realtime")
      .on("postgres_changes", { event: "*", schema: "public", table: "online_users" }, () => {
        supabase.from("online_users").select("*").then(({ data }) => {
          if (data) setOnlineUsers(data);
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  useEffect(scrollToBottom, [messages, scrollToBottom]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = input.trim();
    if (!content || sending) return;
    setSending(true);
    setInput("");
    await supabase.from("messages").insert({
      sender_name: name,
      sender_neighborhood: neighborhood,
      content: content.slice(0, 500),
    });
    setSending(false);
  };

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="glass border-b border-border px-4 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            <h1 className="font-display font-bold text-lg">Chat JF</h1>
          </div>
          <span className="hidden sm:inline text-xs text-muted-foreground">Emergência Climática</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUsers(!showUsers)}
            className="sm:hidden flex items-center gap-1 text-xs bg-muted px-2 py-1 rounded-lg"
          >
            <span className="w-2 h-2 rounded-full bg-online" />
            {onlineUsers.length}
          </button>
          <Button variant="ghost" size="sm" onClick={onLeave} className="text-muted-foreground hover:text-foreground">
            <LogOut className="w-4 h-4" />
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Messages */}
        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-muted-foreground text-sm">Seja o primeiro a enviar uma mensagem!</p>
              </div>
            )}
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                senderName={msg.sender_name}
                neighborhood={msg.sender_neighborhood}
                content={msg.content}
                createdAt={msg.created_at}
                isOwn={msg.sender_name === name && msg.sender_neighborhood === neighborhood}
              />
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={sendMessage} className="px-4 py-3 border-t border-border flex gap-2 flex-shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem..."
              maxLength={500}
              className="flex-1 bg-muted rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <Button
              type="submit"
              disabled={!input.trim() || sending}
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl px-4"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>

        {/* Sidebar - Desktop always, mobile toggle */}
        <div className={`w-64 border-l border-border p-3 flex-shrink-0 ${showUsers ? "block" : "hidden"} sm:block`}>
          <OnlineUsers users={onlineUsers} />
        </div>
      </div>
    </div>
  );
}
