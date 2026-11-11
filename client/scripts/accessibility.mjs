import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
});
const page = await context.newPage();
await page.goto("http://localhost:5173/auth/login");
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
  await page.goto("http://localhost:5173" + path);
  await page.locator(".page-heading").waitFor();
  const result = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
    .analyze();
  console.log(
    path,
    JSON.stringify(
      result.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        nodes: v.nodes
          .map((n) => ({ target: n.target, summary: n.failureSummary }))
          .slice(0, 12),
      })),
      null,
      2,
    ),
  );
}
await browser.close();
