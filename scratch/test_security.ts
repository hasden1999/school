import { signSessionToken, verifySessionToken } from "../src/lib/auth";
import { SessionUser } from "../src/types";

async function runTests() {
  console.log("=== STARTING SECURITY & JWT TESTS ===");

  const testUser: SessionUser = {
    id: "user_test_123",
    tenantId: "tenant_456",
    username: "admin_tester",
    fullName: "مدير الاختبار",
    role: "ADMIN",
    mustChangePassword: false,
    schoolName: "مدرسة النخبة الأهلية",
  };

  // Test 1: Sign token
  const token = await signSessionToken(testUser);
  console.log("✓ Generated JWT Token:", token.substring(0, 30) + "...");

  // Test 2: Verify valid token
  const verified = await verifySessionToken(token);
  if (verified && verified.id === testUser.id && verified.role === "ADMIN") {
    console.log("✓ Test 1 Passed: Valid token correctly verified.");
  } else {
    console.error("✗ Test 1 Failed: Valid token was not verified.", verified);
    process.exit(1);
  }

  // Test 3: Forged / Tampered Token
  const parts = token.split(".");
  const forgedPayload = Buffer.from(
    JSON.stringify({ id: "hacker", role: "SUPER_ADMIN", exp: 9999999999 })
  ).toString("base64url");
  const forgedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;

  const forgedResult = await verifySessionToken(forgedToken);
  if (forgedResult === null) {
    console.log("✓ Test 2 Passed: Tampered JWT token rejected successfully.");
  } else {
    console.error("✗ Test 2 Failed: Tampered JWT token was accepted!", forgedResult);
    process.exit(1);
  }

  // Test 4: Old base64 session cookie forgery attack
  const rawBase64Cookie = Buffer.from(
    JSON.stringify({ id: "hacker_old", role: "SUPER_ADMIN" })
  ).toString("base64");
  const base64Result = await verifySessionToken(rawBase64Cookie);
  if (base64Result === null) {
    console.log("✓ Test 3 Passed: Unsigned base64 string rejected successfully.");
  } else {
    console.error("✗ Test 3 Failed: Unsigned base64 string was accepted!", base64Result);
    process.exit(1);
  }

  console.log("🎉 ALL SECURITY VERIFICATION TESTS PASSED SUCCESSFULLY!");
}

runTests().catch((err) => {
  console.error("Test execution error:", err);
  process.exit(1);
});
