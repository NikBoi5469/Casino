import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Home, Search, TrendingUp, TrendingDown } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function TradingPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [symbol, setSymbol] = useState("");
  const [stockPrice, setStockPrice] = useState<number | null>(null);
  const [quantity, setQuantity] = useState("1");
  const [portfolio, setPortfolio] = useState<Array<{
    symbol: string;
    quantity: number;
    avgPrice: number;
  }>>([]);

  useEffect(() => {
    // Load TradingView widget
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/tv.js';
    script.async = true;
    document.head.appendChild(script);

    script.onload = () => {
      new (window as any).TradingView.widget({
        width: "100%",
        height: 500,
        symbol: symbol || "NASDAQ:AAPL",
        interval: "D",
        timezone: "exchange",
        theme: "dark",
        style: "1",
        toolbar_bg: "#f1f3f6",
        enable_publishing: false,
        allow_symbol_change: true,
        container_id: "tradingview_chart"
      });
    };

    return () => {
      document.head.removeChild(script);
    };
  }, [symbol]);

  const handleSearch = async () => {
    if (!symbol) {
      toast({
        title: "Please enter a stock symbol",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real app, you would fetch the actual stock price from an API
      const mockPrice = Math.random() * 1000;
      setStockPrice(mockPrice);
    } catch (error) {
      toast({
        title: "Error fetching stock price",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  const handleTrade = async (action: 'buy' | 'sell') => {
    if (!stockPrice) return;

    const amount = Number(quantity) * stockPrice;
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid quantity",
        variant: "destructive",
      });
      return;
    }

    if (action === 'buy' && amount > Number(user?.balance)) {
      toast({
        title: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    try {
      // Update balance through API request
      const response = await apiRequest("POST", "/api/bet", {
        amount: amount.toString(),
        game: "trading",
        multiplier: "1",
      });

      const result = await response.json();
      queryClient.invalidateQueries(["/api/user"]); // Refresh user data

      if (action === 'buy') {
        setPortfolio([...portfolio, {
          symbol: symbol,
          quantity: Number(quantity),
          avgPrice: stockPrice
        }]);
      } else {
        // Check if user has enough stocks to sell
        const position = portfolio.find(p => p.symbol === symbol);
        if (!position || position.quantity < Number(quantity)) {
          toast({
            title: "Insufficient stocks",
            variant: "destructive",
          });
          return;
        }
        const updatedPortfolio = portfolio.map(p =>
          p.symbol === symbol ? { ...p, quantity: p.quantity - Number(quantity) } : p
        );
        setPortfolio(updatedPortfolio);
      }

      toast({
        title: `${action === 'buy' ? 'Bought' : 'Sold'} ${quantity} shares of ${symbol}`,
        description: `Total: $${amount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Trade failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-primary">Trading</h1>
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
            <div className="flex gap-4">
              <Input
                value={symbol}
                onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                placeholder="Enter stock symbol (e.g., AAPL)"
                className="flex-1"
              />
              <Button onClick={handleSearch}>
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </div>

            <div id="tradingview_chart" className="w-full h-[500px] bg-muted rounded-lg" />

            {stockPrice && (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">${stockPrice.toFixed(2)}</div>
                  <div className="text-muted-foreground">Current Price</div>
                </div>

                <div className="flex gap-4">
                  <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="Quantity"
                    min="1"
                    step="1"
                  />
                  <Button
                    onClick={() => handleTrade('buy')}
                    className="flex-1"
                    variant="default"
                  >
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Buy
                  </Button>
                  <Button
                    onClick={() => handleTrade('sell')}
                    className="flex-1"
                    variant="destructive"
                  >
                    <TrendingDown className="w-4 h-4 mr-2" />
                    Sell
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Portfolio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {portfolio.map((position, index) => (
                <div key={index} className="py-4 flex justify-between items-center">
                  <div>
                    <div className="font-semibold">{position.symbol}</div>
                    <div className="text-sm text-muted-foreground">
                      {position.quantity} shares @ ${position.avgPrice.toFixed(2)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      ${(position.quantity * position.avgPrice).toFixed(2)}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total Value
                    </div>
                  </div>
                </div>
              ))}
              {portfolio.length === 0 && (
                <div className="py-4 text-center text-muted-foreground">
                  No positions yet. Start trading to build your portfolio!
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}