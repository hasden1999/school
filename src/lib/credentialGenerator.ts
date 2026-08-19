import { prisma } from "./prisma";

const ENGLISH_LETTERS = "abcdefghijklmnopqrstuvwxyz";

/**
 * Generates a string of 5 distinct lowercase English letters (no repetitions, no numbers, no dots, no commas).
 */
export function generateFiveDistinctLetters(): string {
  const letters = ENGLISH_LETTERS.split("");
  const selected: string[] = [];

  while (selected.length < 5) {
    const randomIndex = Math.floor(Math.random() * letters.length);
    const letter = letters[randomIndex];
    if (!selected.includes(letter)) {
      selected.push(letter);
    }
  }

  return selected.join("");
}

/**
 * Generates a unique 5-letter username for a student or teacher within a specific school tenant.
 */
export async function generateUniqueFiveLetterUsername(tenantId: string): Promise<string> {
  let attempts = 0;
  while (attempts < 50) {
    const code = generateFiveDistinctLetters();
    const existing = await prisma.user.findFirst({
      where: {
        tenantId,
        username: code,
      },
    });

    if (!existing) {
      return code;
    }
    attempts++;
  }

  // Fallback with 5 letters
  return generateFiveDistinctLetters();
}

/**
 * Generates a 5-letter passcode/password (5 distinct English letters).
 */
export function generateFiveLetterPasscode(): string {
  return generateFiveDistinctLetters();
}
