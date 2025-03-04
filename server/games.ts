import { Request, Response } from "express";
import { storage } from "./storage";
import { gameTypes } from "@shared/schema";
import { z } from "zod";

const betSchema = z.object({
  amount: z.number().positive(),
  game: z.enum(gameTypes),
});

function getRandomNumber(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

export async function placeBet(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const { amount, game } = betSchema.parse(req.body);
    const user = req.user!;

    if (amount > Number(user.balance)) {
      return res.status(400).send("Insufficient balance");
    }

    let multiplier = 1;
    let payout = 0;

    switch (game) {
      case "dice":
        multiplier = getRandomNumber(0, 2);
        break;
      case "slots":
        multiplier = Math.random() > 0.7 ? getRandomNumber(2, 5) : 0;
        break;
      case "crash":
        multiplier = Math.random() > 0.5 ? getRandomNumber(1.1, 3) : 0;
        break;
      case "mines":
        multiplier = Math.random() > 0.6 ? getRandomNumber(1.5, 4) : 0;
        break;
    }

    payout = amount * multiplier;

    const bet = await storage.createBet({
      userId: user.id,
      game,
      amount: amount.toString(),
      multiplier: multiplier.toString(),
      payout: payout.toString(),
    });

    const newBalance = (Number(user.balance) - amount + payout).toString();
    const updatedUser = await storage.updateUserBalance(user.id, newBalance);
    req.login(updatedUser, (err) => {
      if (err) throw err;
    });

    res.json({ bet, user: updatedUser });
  } catch (error) {
    res.status(400).json({ error: String(error) });
  }
}

export async function getLeaderboard(_req: Request, res: Response) {
  try {
    const leaderboard = await storage.getLeaderboard();
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}

export async function getUserBets(req: Request, res: Response) {
  if (!req.isAuthenticated()) {
    return res.status(401).send("Unauthorized");
  }

  try {
    const bets = await storage.getUserBets(req.user!.id);
    res.json(bets);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}