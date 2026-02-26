import { MapPin, Users } from "lucide-react";

interface User {
  id: string;
  name: string;
  neighborhood: string;
}

interface OnlineUsersProps {
  users: User[];
}

export default function OnlineUsers({ users }: OnlineUsersProps) {
  return (
    <div className="glass rounded-2xl p-4 h-full flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-4 h-4 text-primary" />
        <h2 className="font-display font-semibold text-sm">Online</h2>
        <span className="ml-auto bg-online/20 text-online text-xs font-bold px-2 py-0.5 rounded-full">
          {users.length}
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-2 h-2 rounded-full bg-online pulse-online flex-shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-[10px] text-muted-foreground flex items-center gap-0.5">
                <MapPin className="w-2.5 h-2.5" />
                {user.neighborhood}
              </p>
            </div>
          </div>
        ))}
        {users.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Ninguém online</p>
        )}
      </div>
    </div>
  );
}
