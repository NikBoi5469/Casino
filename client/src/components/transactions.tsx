import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Wallet, CreditCard, Bitcoin } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

export function Transactions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"crypto" | "card" | "paypal">("crypto");
  const [mode, setMode] = useState<"deposit" | "withdraw">("deposit");

  const handleTransaction = async () => {
    if (!user) {
      toast({
        title: "Please log in first",
        variant: "destructive",
      });
      return;
    }

    const value = Number(amount);
    if (isNaN(value) || value <= 0) {
      toast({
        title: "Invalid amount",
        variant: "destructive",
      });
      return;
    }

    if (mode === "withdraw" && value > Number(user?.balance)) {
      toast({
        title: "Insufficient balance",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await apiRequest("POST", "/api/transactions", {
        type: mode,
        amount: value.toString(),
        method,
      });

      const result = await response.json();
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });

      toast({
        title: `${mode === "deposit" ? "Deposit" : "Withdrawal"} successful`,
        description: `$${value.toFixed(2)} via ${method}`,
      });

      // Clear form after successful transaction
      setAmount("");
    } catch (error) {
      toast({
        title: "Transaction failed",
        description: String(error),
        variant: "destructive",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button
            variant={mode === "deposit" ? "default" : "outline"}
            onClick={() => setMode("deposit")}
            className="flex-1"
          >
            Deposit
          </Button>
          <Button
            variant={mode === "withdraw" ? "default" : "outline"}
            onClick={() => setMode("withdraw")}
            className="flex-1"
          >
            Withdraw
          </Button>
        </div>

        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount"
          min="1"
          step="1"
        />

        <Select value={method} onValueChange={(value: any) => setMethod(value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select payment method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="crypto">
              <div className="flex items-center">
                <Bitcoin className="w-4 h-4 mr-2" />
                Cryptocurrency
              </div>
            </SelectItem>
            <SelectItem value="card">
              <div className="flex items-center">
                <CreditCard className="w-4 h-4 mr-2" />
                Credit Card
              </div>
            </SelectItem>
            <SelectItem value="paypal">
              <div className="flex items-center">
                <Wallet className="w-4 h-4 mr-2" />
                PayPal
              </div>
            </SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleTransaction} className="w-full">
          {mode === "deposit" ? "Deposit" : "Withdraw"}
        </Button>
      </CardContent>
    </Card>
  );
}