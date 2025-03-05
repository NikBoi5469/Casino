import { useEffect, useRef, useState } from "react";
import { useAuth } from "./use-auth";

interface ChatMessage {
  type: "chat";
  username: string;
  message: string;
}

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as ChatMessage;
      setMessages((prev) => [...prev, message]);
    };

    return () => {
      ws.close();
    };
  }, []);

  const sendMessage = (message: string) => {
    if (!wsRef.current || !user) return;
    
    const chatMessage: ChatMessage = {
      type: "chat",
      username: user.username,
      message,
    };
    
    wsRef.current.send(JSON.stringify(chatMessage));
  };

  return {
    messages,
    connected,
    sendMessage,
  };
}
