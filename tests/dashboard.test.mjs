import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("monthly balance is separate from one-time funds", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /月次の生活収支/);
  assert.match(app, /毎月必要な生活費/);
  assert.match(app, /必要な事業収入/);
  assert.match(app, /実際の事業収入合計/);
  assert.match(app, /必要額との差額/);
  assert.match(app, /inputs\.livingCost \+ inputs\.rent/);
  assert.match(app, /requiredLivingCost - inputs\.pension/);
  assert.doesNotMatch(app, /monthlyReserve/);
});

test("one-time fund shows target current and remaining without monthly reserve", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /引っ越し・チワワお迎えの一時資金/);
  assert.match(app, /目標額/);
  assert.match(app, /現在額/);
  assert.match(app, /残額/);
  assert.match(app, /inputs\.movingFund \+ inputs\.chihuahuaFund/);
  assert.match(app, /Math\.max\(target - current, 0\)/);
});

test("business income includes all requested channels", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /Skill販売/);
  assert.match(app, /Brainアフィリエイト/);
  assert.match(app, /note/);
  assert.match(app, /アプリ販売/);
  assert.match(app, /Kindle/);
  assert.match(app, /その他/);
  assert.match(app, /localStorage/);
});

test("github pages build configuration matches the repository path", async () => {
  const [viteConfig, workflow] = await Promise.all([
    readFile(new URL("../vite.config.ts", import.meta.url), "utf8"),
    readFile(new URL("../.github/workflows/deploy.yml", import.meta.url), "utf8"),
  ]);

  assert.match(viteConfig, /base:\s*"\/chihuahua-line-dashboard\/"/);
  assert.match(workflow, /Deploy to GitHub Pages/);
  assert.match(workflow, /actions\/deploy-pages@v4/);
  assert.match(workflow, /path:\s*\.\/dist/);
});
