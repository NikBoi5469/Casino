import { Request, Response } from "express";
import { storage } from "./storage";
import { User } from "@shared/schema";

// Admin middleware to check if the user has admin privileges
export function isAdmin(req: Request, res: Response, next: Function) {
  if (!req.isAuthenticated() || !req.user?.isAdmin) {
    return res.status(403).send("Unauthorized: Admin access required");
  }
  next();
}

// Get all users with detailed information
export async function getAllUsers(_req: Request, res: Response) {
  try {
    const users = await storage.getAllUsers();
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}

// Update user (ban/unban, reset password, etc.)
export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;
    const user = await storage.updateUser(Number(id), updates);
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}

// Get analytics data
export async function getAnalytics(_req: Request, res: Response) {
  try {
    const totalUsers = await storage.getUserCount();
    const totalBets = await storage.getBetCount();
    const totalVolume = await storage.getTotalVolume();
    const recentBets = await storage.getRecentBets();
    const gameStats = await storage.getGameStats();
    const activeUsers = await storage.getActiveUsers();
    const riskAnalysis = await storage.getRiskAnalysis();

    res.json({
      totalUsers,
      totalBets,
      totalVolume,
      recentBets,
      gameStats,
      activeUsers,
      riskAnalysis,
    });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}

// Update game settings
export async function updateGameSettings(req: Request, res: Response) {
  try {
    const { game, settings } = req.body;
    await storage.updateGameSettings(game, settings);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}

// Get detailed transaction history
export async function getTransactionHistory(req: Request, res: Response) {
  try {
    const transactions = await storage.getAllTransactions();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}

// Get game settings
export async function getGameSettings(req: Request, res: Response) {
  try {
    const { game } = req.params;
    const settings = await storage.getGameSettings(game);
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: String(error) });
  }
}