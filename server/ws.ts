import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

interface ChatMessage {
  type: "chat";
  username: string;
  message: string;
}

export function setupWebSocket(server: Server) {
  const wss = new WebSocketServer({ server, path: "/ws" });

  const clients = new Set<WebSocket>();

  wss.on("connection", (ws) => {
    clients.add(ws);

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString()) as ChatMessage;
        
        if (message.type === "chat") {
          const broadcastMessage = JSON.stringify({
            type: "chat",
            username: message.username,
            message: message.message,
          });

          for (const client of clients) {
            if (client.readyState === WebSocket.OPEN) {
              client.send(broadcastMessage);
            }
          }
        }
      } catch (error) {
        console.error("WebSocket message error:", error);
      }
    });

    ws.on("close", () => {
      clients.delete(ws);
    });
  });

  return wss;
}
