import { Request, Response } from "express";
import { storage } from "./storage";
import { transactionMethods } from "@shared/schema";
import { z } from "zod";

const transactionSchema = z.object({
  type: z.enum(["deposit", "withdraw"]),
  amount: z.string(),
  method: z.enum(transactionMethods),
});

export async function createTransaction(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const { type, amount, method } = transactionSchema.parse(req.body);
    const user = req.user!;
    const numericAmount = Number(amount);

    if (type === "withdraw" && numericAmount > Number(user.balance)) {
      return res.status(400).send("Insufficient balance");
    }

    const transaction = await storage.createTransaction({
      userId: user.id,
      type,
      amount,
      method,
      status: "completed", // In a real app, this would be pending until confirmed
    });

    // Update user balance
    const newBalance = type === "deposit"
      ? (Number(user.balance) + numericAmount).toString()
      : (Number(user.balance) - numericAmount).toString();

    const updatedUser = await storage.updateUserBalance(user.id, newBalance);
    req.login(updatedUser, (err) => {
      if (err) throw err;
    });

    res.json({ transaction, user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getUserTransactions(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const transactions = await storage.getUserTransactions(req.user!.id);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}