import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { playMines, generateMineField, GRID_SIZE } from "@/lib/games/mines";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Bomb, Diamond } from "lucide-react";

export default function MinesPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("10");
  const [gameState, setGameState] = useState<"idle" | "playing" | "ended">("idle");
  const [mineField, setMineField] = useState<boolean[]>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);

  const startGame = () => {
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

    setMineField(generateMineField());
    setRevealed(Array(GRID_SIZE * GRID_SIZE).fill(false));
    setGameState("playing");
  };

  const handleCellClick = async (index: number) => {
    if (gameState !== "playing" || revealed[index]) return;

    const newRevealed = [...revealed];
    newRevealed[index] = true;
    setRevealed(newRevealed);

    if (mineField[index]) {
      setGameState("ended");
      toast({
        title: "Game Over!",
        description: "You hit a mine!",
        variant: "destructive",
      });
      return;
    }

    try {
      const result = await playMines(Number(amount));
      toast({
        title: "Success!",
        description: `Payout: $${result.bet.payout.toFixed(2)}`,
        variant: "default",
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
    setMineField([]);
    setRevealed([]);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Mines</h1>
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
            <div className="grid grid-cols-5 gap-2">
              {Array(GRID_SIZE * GRID_SIZE)
                .fill(null)
                .map((_, i) => (
                  <Button
                    key={i}
                    variant="outline"
                    className="aspect-square"
                    onClick={() => handleCellClick(i)}
                    disabled={gameState !== "playing" || revealed[i]}
                  >
                    {revealed[i] ? (
                      mineField[i] ? (
                        <Bomb className="w-6 h-6 text-destructive" />
                      ) : (
                        <Diamond className="w-6 h-6 text-primary" />
                      )
                    ) : (
                      "?"
                    )}
                  </Button>
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
                disabled={gameState === "playing"}
              />
              {gameState === "idle" && (
                <Button onClick={startGame} className="min-w-[100px]">
                  Start
                </Button>
              )}
              {gameState === "ended" && (
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
