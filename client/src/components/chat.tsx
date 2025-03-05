import { useState } from "react";
import { useChat } from "@/hooks/use-chat";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

export function Chat() {
  const { messages, connected, sendMessage } = useChat();
  const [input, setInput] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    sendMessage(input);
    setInput("");
  };

  return (
    <Card className="w-full h-[400px] flex flex-col">
      <CardHeader className="py-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
          <h3 className="font-semibold">Global Chat</h3>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-[300px] p-4">
          {messages.map((msg, i) => (
            <div key={i} className="mb-2">
              <span className="font-bold text-primary">{msg.username}: </span>
              <span className="text-foreground">{msg.message}</span>
            </div>
          ))}
        </ScrollArea>
      </CardContent>

      <CardFooter className="p-2">
        <form onSubmit={handleSubmit} className="flex w-full gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1"
          />
          <Button type="submit" size="sm">Send</Button>
        </form>
      </CardFooter>
    </Card>
  );
}
