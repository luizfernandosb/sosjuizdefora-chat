import { useState } from "react";
import EntryForm from "@/components/EntryForm";
import ChatRoom from "@/components/ChatRoom";

const Index = () => {
  const [user, setUser] = useState<{ name: string; neighborhood: string } | null>(null);

  if (!user) {
    return <EntryForm onJoin={(name, neighborhood) => setUser({ name, neighborhood })} />;
  }

  return (
    <ChatRoom
      name={user.name}
      neighborhood={user.neighborhood}
      onLeave={() => setUser(null)}
    />
  );
};

export default Index;
