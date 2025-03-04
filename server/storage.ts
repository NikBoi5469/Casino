import { User, InsertUser, Bet, InsertBet, Transaction, InsertTransaction } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserBalance(userId: number, balance: string): Promise<User>;
  createBet(bet: InsertBet): Promise<Bet>;
  getLeaderboard(): Promise<User[]>;
  getUserBets(userId: number): Promise<Bet[]>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, updates: Partial<User>): Promise<User>;
  getUserCount(): Promise<number>;
  getBetCount(): Promise<number>;
  getTotalVolume(): Promise<string>;
  getRecentBets(): Promise<Bet[]>;
  updateGameSettings(game: string, settings: any): Promise<void>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getUserTransactions(userId: number): Promise<Transaction[]>;
  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private bets: Map<number, Bet>;
  private transactions: Map<number, Transaction>;
  private currentUserId: number;
  private currentBetId: number;
  private currentTransactionId: number;
  private gameSettings: Map<string, any>;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.bets = new Map();
    this.transactions = new Map();
    this.gameSettings = new Map();
    this.currentUserId = 1;
    this.currentBetId = 1;
    this.currentTransactionId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });

    // Create initial admin user
    this.createInitialAdmin();
  }

  private async createInitialAdmin() {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync("Nik", salt, 64)) as Buffer;
    const hashedPassword = `${buf.toString("hex")}.${salt}`;

    const adminUser: User = {
      id: this.currentUserId++,
      username: "Nik",
      password: hashedPassword,
      balance: "1000",
      isAdmin: true,
      totalProfit: "0",
    };
    this.users.set(adminUser.id, adminUser);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = {
      id,
      ...insertUser,
      balance: "1000",
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserBalance(userId: number, balance: string): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, balance };
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  async createBet(bet: InsertBet): Promise<Bet> {
    const id = this.currentBetId++;
    const newBet: Bet = {
      id,
      ...bet,
      createdAt: new Date(),
    };
    this.bets.set(id, newBet);
    return newBet;
  }

  async getLeaderboard(): Promise<User[]> {
    return Array.from(this.users.values())
      .sort((a, b) => Number(b.balance) - Number(a.balance))
      .slice(0, 10);
  }

  async getUserBets(userId: number): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .filter((bet) => bet.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User> {
    const user = await this.getUser(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getUserCount(): Promise<number> {
    return this.users.size;
  }

  async getBetCount(): Promise<number> {
    return this.bets.size;
  }

  async getTotalVolume(): Promise<string> {
    const total = Array.from(this.bets.values()).reduce(
      (sum, bet) => sum + Number(bet.amount),
      0
    );
    return total.toString();
  }

  async getRecentBets(): Promise<Bet[]> {
    return Array.from(this.bets.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 10);
  }

  async updateGameSettings(game: string, settings: any): Promise<void> {
    this.gameSettings.set(game, settings);
  }

  async createTransaction(transaction: InsertTransaction): Promise<Transaction> {
    const id = this.currentTransactionId++;
    const newTransaction: Transaction = {
      id,
      ...transaction,
      createdAt: new Date(),
    };
    this.transactions.set(id, newTransaction);
    return newTransaction;
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactions.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }
}

export const storage = new MemStorage();