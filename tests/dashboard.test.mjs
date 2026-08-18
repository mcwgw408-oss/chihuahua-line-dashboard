import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("monthly living cost is calculated from editable expense items", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /月の生活費 内訳/);
  assert.match(app, /食費/);
  assert.match(app, /日用品/);
  assert.match(app, /J:COM（電気・ガス・スマホ・TV）/);
  assert.match(app, /水道/);
  assert.match(app, /医療費/);
  assert.match(app, /仕事・事業費/);
  assert.match(app, /趣味・娯楽費/);
  assert.match(app, /交通費/);
  assert.match(app, /服・美容費/);
  assert.match(app, /チワワ費/);
  assert.match(app, /貯蓄・予備費/);
  assert.match(app, /Object\.values\(inputs\.expenses\)\.reduce/);
});

test("rent pension and savings are separate categories", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /月次支出/);
  assert.match(app, /事業外収入/);
  assert.match(app, /資産状況/);
  assert.match(app, /家賃/);
  assert.match(app, /年金/);
  assert.match(app, /現在の貯金/);
  assert.match(app, /一時資金の現在額/);
  assert.doesNotMatch(app, /家賃・年金/);
});

test("monthly formula excludes total savings and one-time funds", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /月の生活費 \+ 家賃/);
  assert.match(app, /毎月必要な生活費 - 年金/);
  assert.match(app, /const requiredLivingCost = monthlyLivingCost \+ inputs\.rent/);
  assert.match(app, /requiredLivingCost - inputs\.pension/);
  assert.match(app, /totalSavings: 500000/);
  assert.match(app, /参考表示・月次計算には含めない/);
  assert.doesNotMatch(app, /requiredLivingCost.*totalSavings/);
  assert.doesNotMatch(app, /requiredBusinessIncome.*totalSavings/);
  assert.doesNotMatch(app, /achievement.*totalSavings/);
  assert.doesNotMatch(app, /monthlyReserve/);
});

test("business income and one-time funds are preserved", async () => {
  const app = await readFile(new URL("../src/App.tsx", import.meta.url), "utf8");

  assert.match(app, /Skill販売/);
  assert.match(app, /Brainアフィリエイト/);
  assert.match(app, /note/);
  assert.match(app, /アプリ販売/);
  assert.match(app, /Kindle/);
  assert.match(app, /その他/);
  assert.match(app, /引っ越し・チワワお迎えの一時資金/);
  assert.match(app, /目標額/);
  assert.match(app, /残額/);
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
