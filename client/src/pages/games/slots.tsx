import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { spinSlots, generateReels } from "@/lib/games/slots";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";

export default function SlotsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("10");
  const [spinning, setSpinning] = useState(false);
  const [reels, setReels] = useState(generateReels());

  const handleSpin = async () => {
    const betAmount = Number(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        variant: "destructive",
      });
      return;
    }

    if (betAmount > (user?.balance || 0)) {
      toast({
        title: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    setSpinning(true);
    try {
      // Animate slot spins
      const spinInterval = setInterval(() => {
        setReels(generateReels());
      }, 100);

      const result = await spinSlots(betAmount);
      clearInterval(spinInterval);

      // Show final state
      setReels(generateReels());

      toast({
        title: result.bet.payout > 0 ? "You won!" : "You lost",
        description: `Payout: $${result.bet.payout.toFixed(2)}`,
        variant: result.bet.payout > 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setSpinning(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Slots</h1>
          <Link href="/">
            <Button variant="outline">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Balance: ${Number(user?.balance).toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-3 gap-2 p-4 bg-muted rounded-lg">
              {reels.map((reel, i) => (
                <div key={i} className="space-y-2">
                  {reel.map((symbol, j) => (
                    <div
                      key={j}
                      className={`text-4xl text-center p-2 bg-background rounded ${
                        j === 1 ? "border-2 border-primary" : ""
                      }`}
                    >
                      {symbol}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <Input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Bet amount"
                min="1"
                step="1"
              />
              <Button
                onClick={handleSpin}
                disabled={spinning}
                className="min-w-[100px]"
              >
                {spinning ? "Spinning..." : "Spin"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
