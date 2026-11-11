import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("workspace pages meet automated WCAG A/AA checks", async ({ page }) => {
  await page.goto("/auth/login");
  await page.getByLabel("Email address").fill("doctor@petvet.demo");
  await page.getByLabel("Password", { exact: true }).fill("PetVetDemo123!");
  await page.getByRole("button", { name: "Sign in", exact: true }).click();
  await page.getByText("Registered pets", { exact: true }).waitFor();
  for (const path of [
    "/dashboard",
    "/dashboard/pets",
    "/dashboard/pets/create-pet",
    "/dashboard/visits",
  ]) {
    await page.goto(path);
    await page.locator(".page-heading").waitFor();
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations, path).toEqual([]);
  }
});
test("signup completes a session and an expired token returns to sign-in", async ({
  page,
}) => {
  await page.goto("/auth/signup");
  await page.getByLabel("Full name").fill("New Test Owner");
  await page
    .getByLabel("Email address")
    .fill("new-" + Date.now() + "@example.test");
  await page.getByLabel("Contact number").fill("09123456789");
  await page
    .getByLabel("Address", { exact: true })
    .fill("Test address, Cagayan de Oro");
  await page.getByLabel("Password", { exact: true }).fill("BrowserPass123!");
  await page
    .getByLabel("Confirm password", { exact: true })
    .fill("BrowserPass123!");
  await page.getByRole("button", { name: "Create my account" }).click();
  await expect(
    page.getByRole("heading", { name: "Hello, New." }),
  ).toBeVisible();
  await page.evaluate(() => {
    const payload = btoa(
      JSON.stringify({ exp: Math.floor(Date.now() / 1000) - 10 }),
    );
    localStorage.setItem("token", "expired." + payload + ".signature");
  });
  await page.reload();
  await expect(page).toHaveURL(/\/auth\/login$/);
  expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
});
