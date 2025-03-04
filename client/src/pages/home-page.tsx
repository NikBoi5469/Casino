import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Chat } from "@/components/chat";
import { Leaderboard } from "@/components/leaderboard";
import { Dice1, Gamepad2, TrendingUp, Bomb, LogOut, Shield, CandlestickChart } from "lucide-react";
import { Transactions } from "@/components/transactions"; // Assuming Transactions component exists

const games = [
  {
    title: "Dice",
    description: "Classic dice rolling game with multipliers",
    icon: Dice1,
    path: "/games/dice",
  },
  {
    title: "Slots",
    description: "Three-reel slot machine with various symbols",
    icon: Gamepad2,
    path: "/games/slots",
  },
  {
    title: "Crash",
    description: "Multiplier-based game with crash mechanics",
    icon: TrendingUp,
    path: "/games/crash",
  },
  {
    title: "Mines",
    description: "Grid-based mine avoidance game",
    icon: Bomb,
    path: "/games/mines",
  },
  {
    title: "Trading",
    description: "Trade stocks with real-time market data",
    icon: CandlestickChart,
    path: "/games/trading",
  },
];

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <div className="flex items-center gap-4">
              <img src="/logo.webp" alt="$OMO CASINO" className="h-12 w-12" />
              <h1 className="text-3xl font-bold text-primary">$OMO CASINO</h1>
            </div>
            <p className="text-muted-foreground">
              Welcome back, {user?.username} - Balance: ${Number(user?.balance).toFixed(2)}
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
          {user?.isAdmin && (
            <Link href="/admin">
              <Button variant="outline" className="ml-2">
                <Shield className="w-4 h-4 mr-2" />
                Admin Panel
              </Button>
            </Link>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {games.map((game) => (
            <Link key={game.path} href={game.path}>
              <Card className="cursor-pointer hover:bg-accent transition-colors">
                <CardHeader>
                  <game.icon className="w-8 h-8 mb-2 text-primary" />
                  <CardTitle>{game.title}</CardTitle>
                  <CardDescription>{game.description}</CardDescription>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Chat />
          <div className="space-y-6">
            <Leaderboard />
            <Transactions />
          </div>
        </div>
      </div>
    </div>
  );
}