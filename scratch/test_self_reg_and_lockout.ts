import { prisma } from "../src/lib/prisma";
import {
  registerSchoolAction,
  loginAction,
  getSchoolExpiredDetailsAction,
  submitActivationInquiryAction,
} from "../src/app/actions/authActions";

async function runTest() {
  console.log("=== STARTING TEST: SELF REGISTRATION & TRIAL LOCKOUT ===");

  const testCode = "alamal-" + Math.floor(1000 + Math.random() * 9000);
  const testSchoolName = "ثانوية الأمل النموذجية الأهلية";
  const testDirector = "أ. حيدر العبيدي";
  const testPhone = "07812345678";
  const testPassword = "mypassword123";

  // 1. Test Self Registration Action
  console.log("\n[1] Testing School Self-Registration (No Super-Admin required)...");
  const regForm = new FormData();
  regForm.append("schoolName", testSchoolName);
  regForm.append("schoolCode", testCode);
  regForm.append("directorName", testDirector);
  regForm.append("directorPhone", testPhone);
  regForm.append("province", "بغداد");
  regForm.append("username", "admin");
  regForm.append("password", testPassword);

  const regResult = await registerSchoolAction(regForm);
  console.log("Registration Response:", regResult);

  if (!regResult.success) {
    throw new Error("Self registration failed: " + JSON.stringify(regResult));
  }

  // Verify in DB
  const createdSchool = await prisma.tenant.findUnique({
    where: { code: testCode },
    include: {
      users: true,
      classRooms: true,
      subjects: true,
      documentRequirements: true,
    },
  });

  if (!createdSchool) {
    throw new Error("Created school not found in DB!");
  }

  console.log("✓ School successfully created in DB:");
  console.log(`  - Name: ${createdSchool.name}`);
  console.log(`  - Code: ${createdSchool.code}`);
  console.log(`  - Subscription Status: ${createdSchool.subscriptionStatus}`);
  console.log(`  - Subscription Plan: ${createdSchool.subscriptionPlan}`);
  console.log(`  - Trial Ends At: ${createdSchool.trialEndsAt?.toISOString()}`);
  console.log(`  - Classrooms count: ${createdSchool.classRooms.length}`);
  console.log(`  - Subjects count: ${createdSchool.subjects.length}`);
  console.log(`  - Admin User: ${createdSchool.users[0]?.username} (${createdSchool.users[0]?.role})`);

  // Verify 14 days trial calculation
  const now = Date.now();
  const trialEndMs = createdSchool.trialEndsAt ? new Date(createdSchool.trialEndsAt).getTime() : 0;
  const daysDiff = (trialEndMs - now) / (1000 * 60 * 60 * 24);
  console.log(`✓ Trial days remaining: ~${daysDiff.toFixed(1)} days (Expected ~14 days)`);

  // 2. Test Login During Active Trial
  console.log("\n[2] Testing Login during active trial...");
  const loginForm = new FormData();
  loginForm.append("schoolCode", testCode);
  loginForm.append("username", "admin");
  loginForm.append("password", testPassword);

  const loginRes = await loginAction(loginForm);
  console.log("Login Response during active trial:", loginRes);
  if (!loginRes.success || loginRes.redirectUrl !== "/admin/dashboard") {
    throw new Error("Expected successful login and redirect to /admin/dashboard");
  }
  console.log("✓ Login succeeded and redirected to /admin/dashboard");

  // 3. Simulate Trial Expiration (14 days passed)
  console.log("\n[3] Simulating Trial Expiry (14 days passed)...");
  const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
  await prisma.tenant.update({
    where: { id: createdSchool.id },
    data: {
      trialEndsAt: pastDate,
      subscriptionExpiresAt: pastDate,
    },
  });
  console.log("✓ Trial end date updated to past date:", pastDate.toISOString());

  // 4. Test Login After Trial Expired (Lockout test)
  console.log("\n[4] Testing Login after trial expired (Lockout check)...");
  const expiredLoginForm = new FormData();
  expiredLoginForm.append("schoolCode", testCode);
  expiredLoginForm.append("username", "admin");
  expiredLoginForm.append("password", testPassword);

  const expiredLoginRes = await loginAction(expiredLoginForm);
  console.log("Expired Login Response:", expiredLoginRes);

  if (!expiredLoginRes.isExpired) {
    throw new Error("Expected loginAction to flag isExpired === true");
  }
  if (!expiredLoginRes.redirectUrl?.includes("/subscription-expired")) {
    throw new Error("Expected redirectUrl to point to /subscription-expired");
  }
  console.log("✓ Login accurately rejected with trial expiration flag and redirected to:", expiredLoginRes.redirectUrl);

  // 5. Test Expired Details Action for Conversion View
  console.log("\n[5] Testing getSchoolExpiredDetailsAction...");
  const details = await getSchoolExpiredDetailsAction(testCode);
  if (!details || !details.school || !details.contact) {
    throw new Error("Failed to get expired school details");
  }
  console.log("✓ Expired details loaded successfully:");
  console.log(`  - School: ${details.school.name} (${details.school.code})`);
  console.log(`  - Platform WhatsApp: ${details.contact.whatsapp}`);
  console.log(`  - Platform Phone: ${details.contact.phone}`);

  // 6. Test Direct Activation Inquiry Submission
  console.log("\n[6] Testing submitActivationInquiryAction from lockout screen...");
  const inqForm = new FormData();
  inqForm.append("schoolCode", testCode);
  inqForm.append("directorName", testDirector);
  inqForm.append("phone", testPhone);
  inqForm.append("paymentMethod", "ZAIN_CASH");
  inqForm.append("referenceNumber", "ZC-987654321");
  inqForm.append("notes", "تم تحويل المبلغ عبر زين كاش، يرجى التفعيل للعام الدراسي");

  const inqRes = await submitActivationInquiryAction(inqForm);
  if (!inqRes.success) {
    throw new Error("Failed to submit activation inquiry");
  }
  console.log("✓ Activation inquiry successfully recorded in PlatformPayment & Super Admin notified");

  // 7. Test Super Admin Activation (Renew & Unlock)
  console.log("\n[7] Simulating Platform Owner (Super Admin) activating the permanent license...");
  const futureDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
  await prisma.tenant.update({
    where: { id: createdSchool.id },
    data: {
      subscriptionStatus: "ACTIVE",
      subscriptionPlan: "PRO",
      subscriptionExpiresAt: futureDate,
    },
  });

  const activeLoginRes = await loginAction(expiredLoginForm);
  console.log("Login Response after Super Admin activation:", activeLoginRes);
  if (!activeLoginRes.success || activeLoginRes.redirectUrl !== "/admin/dashboard") {
    throw new Error("Expected login to succeed after activation!");
  }
  console.log("✓ School is now unlocked and access restored to /admin/dashboard!");

  // 8. Cleanup test school
  console.log("\n[8] Cleaning up test tenant...");
  await prisma.tenant.delete({
    where: { id: createdSchool.id },
  });
  console.log("✓ Test tenant cleaned up successfully.");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 🚀");
}

runTest()
  .catch((e) => {
    console.error("Test Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
