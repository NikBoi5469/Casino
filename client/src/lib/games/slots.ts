import { apiRequest } from "../queryClient";

const SYMBOLS = ["🍒", "🍊", "🍇", "💎", "7️⃣", "🎰"];

export async function spinSlots(amount: number) {
  const response = await apiRequest("POST", "/api/bet", {
    game: "slots",
    amount,
  });
  return response.json();
}

export function generateReels() {
  const reels = Array(3).fill(null).map(() => 
    Array(3).fill(null).map(() => 
      SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)]
    )
  );
  return reels;
}
