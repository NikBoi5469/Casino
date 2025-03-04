import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { rollDice, generateDiceAnimation } from "@/lib/games/dice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";

export default function DicePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("10");
  const [rolling, setRolling] = useState(false);
  const [diceValue, setDiceValue] = useState(1);

  const handleRoll = async () => {
    const betAmount = Number(amount);
    if (isNaN(betAmount) || betAmount <= 0) {
      toast({
        title: "Invalid bet amount",
        variant: "destructive",
      });
      return;
    }

    if (!user?.balance || betAmount > Number(user.balance)) {
      toast({
        title: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    setRolling(true);
    try {
      // Animate dice rolls
      const animationInterval = setInterval(() => {
        setDiceValue(generateDiceAnimation());
      }, 100);

      const result = await rollDice(betAmount);
      clearInterval(animationInterval);

      setDiceValue(Math.floor(Number(result.bet.multiplier) * 6));
      toast({
        title: Number(result.bet.payout) > 0 ? "You won!" : "You lost",
        description: `Payout: $${Number(result.bet.payout).toFixed(2)}`,
        variant: Number(result.bet.payout) > 0 ? "default" : "destructive",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: String(error),
        variant: "destructive",
      });
    } finally {
      setRolling(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Dice Game</h1>
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
            <div className="flex justify-center">
              <div
                className={`text-8xl transition-transform ${
                  rolling ? "animate-spin" : ""
                }`}
              >
                {["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][diceValue - 1]}
              </div>
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
                onClick={handleRoll}
                disabled={rolling}
                className="min-w-[100px]"
              >
                {rolling ? "Rolling..." : "Roll"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}