# chihuahua-line-dashboard

「チワワライン Dashboard」は、生活・引っ越し・犬との暮らしに必要な収益を見える化する個人用Webアプリです。

## 主な機能

- 月の生活費、年金、家賃、引っ越し資金、現在の貯金、チワワのお迎え資金、目標月数を編集
- Skill販売、Brainアフィリエイト、note、その他の収益を項目別に入力
- 家賃変更に連動して必要生活費と必要な事業収入を再計算
- 目標との差額、達成率、残り資金、月あたり積立を自動表示
- 入力値をブラウザの localStorage に保存

## 技術構成

- Vite
- React
- TypeScript
- GitHub Pages
- GitHub Actions

## 開発

```bash
npm install
npm run dev
npm test
npm run build
```

## 公開

`main` ブランチへ push すると、GitHub Actions が `dist` をビルドして GitHub Pages に公開します。
