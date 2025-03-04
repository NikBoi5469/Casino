import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { placeBet, getLeaderboard, getUserBets } from "./games";
import { setupWebSocket } from "./ws";
import { isAdmin, getAllUsers, updateUser, getAnalytics, updateGameSettings } from "./admin";
import { createTransaction, getUserTransactions } from "./transactions";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Game routes
  app.post("/api/bet", placeBet);
  app.get("/api/leaderboard", getLeaderboard);
  app.get("/api/bets", getUserBets);

  // Transaction routes
  app.post("/api/transactions", createTransaction);
  app.get("/api/transactions", getUserTransactions);

  // Admin routes
  app.get("/api/admin/users", isAdmin, getAllUsers);
  app.patch("/api/admin/users/:id", isAdmin, updateUser);
  app.get("/api/admin/analytics", isAdmin, getAnalytics);
  app.post("/api/admin/game-settings", isAdmin, updateGameSettings);

  const httpServer = createServer(app);
  setupWebSocket(httpServer);

  return httpServer;
}