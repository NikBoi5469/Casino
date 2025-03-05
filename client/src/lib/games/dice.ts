import { apiRequest } from "../queryClient";

export async function rollDice(amount: number) {
  const response = await apiRequest("POST", "/api/bet", {
    game: "dice",
    amount,
  });
  return response.json();
}

export function generateDiceAnimation() {
  return Math.floor(Math.random() * 6) + 1;
}
