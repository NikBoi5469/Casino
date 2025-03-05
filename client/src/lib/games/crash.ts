import { apiRequest } from "../queryClient";

export async function placeCrashBet(amount: number) {
  const response = await apiRequest("POST", "/api/bet", {
    game: "crash",
    amount,
  });
  return response.json();
}

export function generateCrashPoint() {
  return Math.random() > 0.5 ? 
    Math.random() * 2 + 1 : // Win scenario
    Math.random() * 0.9 + 0.1; // Lose scenario
}

export function calculateGrowth(time: number) {
  return Math.pow(Math.E, 0.1 * time);
}
