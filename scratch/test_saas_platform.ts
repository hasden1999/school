import { prisma } from "../src/lib/prisma";
import { getSchoolBrandingAction, loginAction, registerSchoolAction } from "../src/app/actions/authActions";
import { toggleSchoolSuspensionAction, extendSchoolTrialAction } from "../src/app/actions/superAdminActions";
import { registerStudentAction } from "../src/app/actions/studentActions";
import { setSession } from "../src/lib/auth";

async function runSaaSTests() {
  console.log("=== STARTING SAAS SUITE TESTS ===");

  // 1. Test getSchoolBrandingAction with existing school
  console.log("\n--- Test 1: getSchoolBrandingAction ---");
  const branding1 = await getSchoolBrandingAction("al-nukhba");
  if (branding1.success && branding1.school?.name) {
    console.log("✓ Found school branding:", branding1.school.name, `(${branding1.school.code})`);
  } else {
    console.error("✗ Failed to find school branding:", branding1);
    process.exit(1);
  }

  // Test with invalid school code
  const brandingInvalid = await getSchoolBrandingAction("invalid-nonexistent-code");
  if (!brandingInvalid.success && brandingInvalid.error) {
    console.log("✓ Invalid school code rejected with Arabic message:", brandingInvalid.error);
  } else {
    console.error("✗ Expected invalid school code to fail, got:", brandingInvalid);
    process.exit(1);
  }

  // 2. Test loginAction with School Code, Username, and Password
  console.log("\n--- Test 2: loginAction with School Code ---");
  const validForm = new FormData();
  validForm.append("schoolCode", "al-nukhba");
  validForm.append("username", "admin");
  validForm.append("password", "admin");

  const loginRes = await loginAction(validForm);
  if (loginRes.success && loginRes.redirectUrl) {
    console.log("✓ Successful login with schoolCode 'al-nukhba': redirected to", loginRes.redirectUrl);
  } else {
    console.error("✗ Login failed:", loginRes);
    process.exit(1);
  }

  // Test login with bad school code
  const badSchoolForm = new FormData();
  badSchoolForm.append("schoolCode", "bad-school-code");
  badSchoolForm.append("username", "admin");
  badSchoolForm.append("password", "admin");

  const badSchoolRes = await loginAction(badSchoolForm);
  if (badSchoolRes.error && badSchoolRes.error.includes("غير مسجل")) {
    console.log("✓ Login with bad schoolCode rejected:", badSchoolRes.error);
  } else {
    console.error("✗ Expected bad schoolCode rejection, got:", badSchoolRes);
    process.exit(1);
  }

  // 3. Test New School Self-Registration (14-Day Free Trial)
  console.log("\n--- Test 3: registerSchoolAction (14-Day Free Trial) ---");
  const testCode = "test-school-" + Math.floor(1000 + Math.random() * 9000);
  const regForm = new FormData();
  regForm.append("schoolName", "مدرسة الاختبار الحديثة");
  regForm.append("schoolCode", testCode);
  regForm.append("directorName", "أ. سعد الاختبار");
  regForm.append("directorPhone", "07809999888");
  regForm.append("province", "بغداد");
  regForm.append("username", "admin");
  regForm.append("password", "pass12345");

  const regRes = await registerSchoolAction(regForm);
  if (regRes.success && regRes.redirectUrl) {
    console.log("✓ School successfully registered with 14-day trial. Redirect:", regRes.redirectUrl);
  } else {
    console.error("✗ Registration failed:", regRes);
    process.exit(1);
  }

  // Verify created tenant in SQLite DB
  const createdTenant = await prisma.tenant.findUnique({
    where: { code: testCode },
    include: {
      classRooms: true,
      subjects: true,
      documentRequirements: true,
      users: true,
    },
  });

  if (
    createdTenant &&
    createdTenant.subscriptionStatus === "TRIAL" &&
    createdTenant.classRooms.length > 0 &&
    createdTenant.subjects.length > 0
  ) {
    console.log(
      `✓ Verified created tenant: ${createdTenant.name} (${createdTenant.code}), Status: ${createdTenant.subscriptionStatus}, Classes: ${createdTenant.classRooms.length}, Subjects: ${createdTenant.subjects.length}`
    );
  } else {
    console.error("✗ Created tenant verification failed:", createdTenant);
    process.exit(1);
  }

  // 4. Test Super Admin Trial Extension (+14 Days)
  console.log("\n--- Test 4: extendSchoolTrialAction ---");
  // Set session as Super Admin
  const superAdminUser = await prisma.user.findFirst({ where: { role: "SUPER_ADMIN" } });
  if (superAdminUser) {
    (global as any).__MOCK_SESSION__ = {
      id: superAdminUser.id,
      tenantId: superAdminUser.tenantId,
      username: superAdminUser.username,
      fullName: superAdminUser.fullName,
      role: "SUPER_ADMIN",
      phone: superAdminUser.phone,
      mustChangePassword: false,
      schoolName: "Super Platform",
    };

    const extendRes = await extendSchoolTrialAction(createdTenant.id, 14);
    if (extendRes.success) {
      console.log("✓ Trial extended successfully to:", extendRes.newTrialEnd);
    } else {
      console.error("✗ Failed to extend trial:", extendRes);
      process.exit(1);
    }

    // 5. Test Suspension Toggle & Login Block
    console.log("\n--- Test 5: toggleSchoolSuspensionAction & Login Block ---");
    const suspendRes = await toggleSchoolSuspensionAction(createdTenant.id, true);
    if (suspendRes.success && suspendRes.status === "SUSPENDED") {
      console.log("✓ School successfully suspended by Super Admin.");
    } else {
      console.error("✗ Failed to suspend school:", suspendRes);
      process.exit(1);
    }

    // Attempt login into suspended school
    const suspendedLoginForm = new FormData();
    suspendedLoginForm.append("schoolCode", testCode);
    suspendedLoginForm.append("username", "admin");
    suspendedLoginForm.append("password", "pass12345");

    const blockedRes = await loginAction(suspendedLoginForm);
    if (blockedRes.error && blockedRes.error.includes("معلق")) {
      console.log("✓ Login to suspended school correctly blocked:", blockedRes.error);
    } else {
      console.error("✗ Suspended school login was NOT blocked!", blockedRes);
      process.exit(1);
    }

    // Un-suspend
    await toggleSchoolSuspensionAction(createdTenant.id, false);
    console.log("✓ School un-suspended successfully.");
  }

  // Clean up test school
  console.log("\n--- Cleaning up test tenant ---");
  await prisma.documentRequirement.deleteMany({ where: { tenantId: createdTenant.id } });
  await prisma.subject.deleteMany({ where: { tenantId: createdTenant.id } });
  await prisma.section.deleteMany({ where: { tenantId: createdTenant.id } });
  await prisma.classRoom.deleteMany({ where: { tenantId: createdTenant.id } });
  await prisma.user.deleteMany({ where: { tenantId: createdTenant.id } });
  await prisma.tenant.delete({ where: { id: createdTenant.id } });
  console.log("✓ Test tenant cleaned up successfully.");

  console.log("\n🎉 ALL SAAS INTEGRATION & LOGIC TESTS PASSED WITH 100% SUCCESS!");
}

runSaaSTests()
  .catch((e) => {
    console.error("Test runner error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
