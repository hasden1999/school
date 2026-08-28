/**
 * Iraqi Mobile Phone Validation and Normalization Utility
 * Supports all Iraqi mobile carriers:
 * - Asiacell (0770, 0771, 0772, 0773, 0774, 0775, 0776, 0777, 0778, 0779)
 * - Zain Iraq (0780, 0781, 0782, 0783, 0784, 0785, 0786, 0787, 0788, 0789, 0790)
 * - Korek Telecom (0750, 0751, 0752, 0753, 0754, 0755, 0756, 0757, 0758, 0759)
 */

export interface IraqiPhoneValidationResult {
  isValid: boolean;
  normalized: string; // e.g. "+9647701234567"
  localFormat: string; // e.g. "07701234567"
  operator: "Asiacell" | "Zain" | "Korek" | "Unknown";
  error?: string;
}

const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

export function normalizeArabicDigits(input: string): string {
  let result = input;
  for (let i = 0; i < 10; i++) {
    result = result.replace(new RegExp(ARABIC_INDIC_DIGITS[i], "g"), i.toString());
  }
  return result;
}

export function validateAndNormalizeIraqiPhone(rawPhone?: string | null): IraqiPhoneValidationResult {
  if (!rawPhone || !rawPhone.trim()) {
    return {
      isValid: false,
      normalized: "",
      localFormat: "",
      operator: "Unknown",
      error: "رقم الهاتف مطلوب",
    };
  }

  // 1. Clean characters and convert Arabic numerals
  let cleaned = normalizeArabicDigits(rawPhone.trim())
    .replace(/[^\d+]/g, ""); // keep only digits and +

  // Remove leading +
  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  }

  // 2. Standardize to 10 digits starting with 7
  // Format examples:
  // 07701234567 (11 digits) -> 7701234567 (10 digits)
  // 9647701234567 (13 digits) -> 7701234567 (10 digits)
  // 009647701234567 (15 digits) -> 7701234567 (10 digits)
  // 7701234567 (10 digits)

  if (cleaned.startsWith("00964")) {
    cleaned = cleaned.substring(5);
  } else if (cleaned.startsWith("964")) {
    cleaned = cleaned.substring(3);
  } else if (cleaned.startsWith("07")) {
    cleaned = cleaned.substring(1);
  }

  // Check if starts with 7 and has exactly 10 digits
  if (!/^7[5789]\d{8}$/.test(cleaned)) {
    return {
      isValid: false,
      normalized: rawPhone,
      localFormat: rawPhone,
      operator: "Unknown",
      error: "رقم الهاتف غير صالح. يجب أن يبدأ بـ (077 أو 078 أو 075) ويتكون من 11 رقماً",
    };
  }

  // 3. Detect Operator
  let operator: "Asiacell" | "Zain" | "Korek" | "Unknown" = "Unknown";
  if (cleaned.startsWith("77")) {
    operator = "Asiacell";
  } else if (cleaned.startsWith("78") || cleaned.startsWith("79")) {
    operator = "Zain";
  } else if (cleaned.startsWith("75")) {
    operator = "Korek";
  }

  const normalized = `+964${cleaned}`;
  const localFormat = `0${cleaned}`;

  return {
    isValid: true,
    normalized,
    localFormat,
    operator,
  };
}
