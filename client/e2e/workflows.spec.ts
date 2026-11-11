import { test, expect, type Page } from "@playwright/test";

async function signIn(page: Page, account = "doctor") {
  await page.goto("/auth/login");
  await page.getByLabel("Email address").fill(account + "@petvet.demo");
  await page.getByLabel("Password", { exact: true }).fill("PetVetDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("heading", { name: /Hello,/ })).toBeVisible();
}
test("landing and invalid login show useful feedback", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /Every pet deserves/ }),
  ).toBeVisible();
  await expect(page.locator("body")).not.toHaveJSProperty("scrollWidth", 0);
  await page.goto("/auth/login");
  await page.getByLabel("Email address").fill("doctor@petvet.demo");
  await page.getByLabel("Password", { exact: true }).fill("wrong-password");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await expect(page.getByRole("alert")).toContainText("incorrect");
});
test("staff can look up a tag, refresh details, edit vaccinations and book a visit", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await signIn(page);
  await page.goto("/dashboard/scan");
  await page.getByLabel("RFID number").fill("00123");
  await page.getByRole("button", { name: "Look up pet" }).click();
  await expect(
    page.getByRole("heading", { name: "Mochi", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "Open pet profile" }).click();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Mochi", exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Edit details" }).click();
  await page.getByLabel("Vaccine name", { exact: true }).fill("Test vaccine");
  await page.getByLabel("Date given", { exact: true }).fill("2025-05-01");
  await page
    .getByRole("button", { name: "Add vaccination to history" })
    .click();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByRole("cell", { name: "Test vaccine", exact: true }).first(),
  ).toBeVisible();
  await page.getByRole("button", { name: "Book a visit" }).click();
  const future = new Date(Date.now() + 7 * 86400000);
  const local = new Date(future.getTime() - future.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  await page.getByLabel("Appointment date & time").fill(local);
  await page
    .getByLabel("Reason for the visit")
    .fill("Browser regression visit");
  await page
    .getByRole("button", { name: "Book appointment", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeHidden();
  await expect(
    page.getByText("Browser regression visit").first(),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
test("owner registration, profile refresh, private routes and mobile navigation", async ({
  page,
}, testInfo) => {
  await signIn(page, "owner");
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open navigation" }).click();
    await expect(
      page.getByRole("link", { name: "Pet registry" }),
    ).toBeVisible();
    await page.getByRole("link", { name: "Pet registry" }).click();
    await expect(
      page.getByRole("button", { name: "Open navigation" }),
    ).toHaveAttribute("aria-expanded", "false");
  }
  await page.goto("/dashboard/pets/create-pet");
  await page.getByLabel("Pet’s name").fill("Browser Pet");
  await page.getByLabel("Date of birth").fill("2024-01-01");
  await page.getByLabel("RFID number").fill("TEST-" + Date.now());
  await page.getByLabel("Primary breed").fill("Aspin");
  await page.getByRole("button", { name: "Register pet", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Browser Pet", exact: true }).first(),
  ).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("heading", { name: "Browser Pet", exact: true }).first(),
  ).toBeVisible();
  await expect(page.getByLabel("New remark")).toHaveCount(0);
  await page.getByRole("button", { name: "Edit details" }).click();
  await expect(page.getByLabel("Vaccine name")).toHaveCount(0);
  await page.getByRole("button", { name: "Close", exact: true }).click();
  await page.goto("/dashboard/owners");
  await expect(page).toHaveURL(/\/dashboard$/);
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.width);
});
test("unavailable services show retry controls; unknown URLs have recovery links", async ({
  page,
}) => {
  await signIn(page);
  await page.route("**/api/pets", (route) =>
    route.fulfill({
      status: 503,
      contentType: "application/json",
      body: JSON.stringify({ message: "Service temporarily unavailable." }),
    }),
  );
  await page.goto("/dashboard/pets");
  await expect(page.getByRole("alert")).toContainText(
    "temporarily unavailable",
  );
  await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();
  await page.goto("/missing-page");
  await expect(
    page.getByRole("heading", { name: "This page wandered off." }),
  ).toBeVisible();
});
