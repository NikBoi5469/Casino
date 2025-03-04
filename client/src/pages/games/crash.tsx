import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { placeCrashBet, generateCrashPoint, calculateGrowth } from "@/lib/games/crash";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home } from "lucide-react";

export default function CrashPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("10");
  const [multiplier, setMultiplier] = useState(1);
  const [gameState, setGameState] = useState<"idle" | "playing" | "crashed">("idle");
  const [crashPoint, setCrashPoint] = useState(1);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>();

  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const animate = (timestamp: number) => {
    if (!startTimeRef.current) {
      startTimeRef.current = timestamp;
    }

    const elapsed = (timestamp - startTimeRef.current) / 1000;
    const currentMultiplier = calculateGrowth(elapsed);

    if (currentMultiplier >= crashPoint) {
      setGameState("crashed");
      setMultiplier(crashPoint);
      return;
    }

    setMultiplier(currentMultiplier);
    animationRef.current = requestAnimationFrame(animate);
  };

  const startGame = async () => {
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

    try {
      setGameState("playing");
      setCrashPoint(generateCrashPoint());
      startTimeRef.current = undefined;
      animationRef.current = requestAnimationFrame(animate);

      const result = await placeCrashBet(betAmount);
      
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
    }
  };

  const resetGame = () => {
    setGameState("idle");
    setMultiplier(1);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Crash</h1>
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
            <div className="text-center p-8 bg-muted rounded-lg">
              <div
                className={`text-6xl font-bold ${
                  gameState === "crashed" ? "text-destructive" : "text-primary"
                }`}
              >
                {multiplier.toFixed(2)}x
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
                disabled={gameState === "playing"}
              />
              {gameState === "idle" && (
                <Button onClick={startGame} className="min-w-[100px]">
                  Start
                </Button>
              )}
              {gameState === "crashed" && (
                <Button onClick={resetGame} className="min-w-[100px]">
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
