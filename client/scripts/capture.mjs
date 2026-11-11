import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await page.goto("http://localhost:5173/auth/login");
await page.getByLabel("Email address").fill("doctor@petvet.demo");
await page.getByLabel("Password", { exact: true }).fill("PetVetDemo123!");
await page.getByRole("button", { name: "Sign in", exact: true }).click();
await page.getByRole("heading", { name: /Hello,/ }).waitFor();
await page.getByText("Registered pets", { exact: true }).waitFor();
await page.evaluate(() => document.fonts.ready);
await mkdir("test-results/screenshots", { recursive: true });
await page.screenshot({
  path: "test-results/screenshots/dashboard-desktop.png",
  fullPage: true,
});
await page.goto("http://localhost:5173/dashboard/pets");
await page.getByRole("link", { name: "Mochi Golden Retriever" }).waitFor();
await page.screenshot({
  path: "test-results/screenshots/registry-desktop.png",
  fullPage: true,
});
await page.setViewportSize({ width: 390, height: 844 });
await page.goto("http://localhost:5173/dashboard");
await page.getByText("Registered pets", { exact: true }).waitFor();
await page.screenshot({
  path: "test-results/screenshots/dashboard-mobile.png",
  fullPage: true,
});
await browser.close();
