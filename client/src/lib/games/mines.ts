import { apiRequest } from "../queryClient";

export const GRID_SIZE = 5;
export const MINE_COUNT = 3;

export async function playMines(amount: number) {
  const response = await apiRequest("POST", "/api/bet", {
    game: "mines",
    amount,
  });
  return response.json();
}

export function generateMineField() {
  const field = Array(GRID_SIZE * GRID_SIZE).fill(false);
  let minesPlaced = 0;
  
  while (minesPlaced < MINE_COUNT) {
    const pos = Math.floor(Math.random() * field.length);
    if (!field[pos]) {
      field[pos] = true;
      minesPlaced++;
    }
  }
  
  return field;
}
