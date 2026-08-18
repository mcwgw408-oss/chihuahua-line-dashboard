import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("dashboard keeps the requested editable inputs and linked formulas", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /月の生活費/);
  assert.match(app, /年金/);
  assert.match(app, /家賃/);
  assert.match(app, /引っ越し資金/);
  assert.match(app, /現在の貯金/);
  assert.match(app, /チワワのお迎え資金/);
  assert.match(app, /Skill販売/);
  assert.match(app, /Brainアフィリエイト/);
  assert.match(app, /note/);
  assert.match(app, /その他/);
  assert.match(app, /inputs\.livingCost \+ inputs\.rent/);
  assert.match(app, /requiredBusinessIncome/);
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
