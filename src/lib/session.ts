export function getSessionId(): string {
  let id = sessionStorage.getItem("chat-session-id");
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem("chat-session-id", id);
  }
  return id;
}
