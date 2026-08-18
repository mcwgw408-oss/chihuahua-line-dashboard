import { useEffect, useMemo, useState } from "react";

type IncomeKey = "skill" | "brain" | "note" | "other";

type Inputs = {
  livingCost: number;
  pension: number;
  rent: number;
  movingFund: number;
  currentSavings: number;
  chihuahuaFund: number;
  monthsToGoal: number;
  incomes: Record<IncomeKey, number>;
};

const initialInputs: Inputs = {
  livingCost: 130000,
  pension: 70000,
  rent: 85000,
  movingFund: 450000,
  currentSavings: 180000,
  chihuahuaFund: 320000,
  monthsToGoal: 10,
  incomes: {
    skill: 90000,
    brain: 45000,
    note: 25000,
    other: 15000,
  },
};

const incomeLabels: Record<IncomeKey, string> = {
  skill: "Skill販売",
  brain: "Brainアフィリエイト",
  note: "note",
  other: "その他",
};

const inputLabels: Array<{
  key: keyof Omit<Inputs, "incomes">;
  label: string;
  suffix: string;
}> = [
  { key: "livingCost", label: "月の生活費", suffix: "円/月" },
  { key: "pension", label: "年金", suffix: "円/月" },
  { key: "rent", label: "家賃", suffix: "円/月" },
  { key: "movingFund", label: "引っ越し資金", suffix: "円" },
  { key: "currentSavings", label: "現在の貯金", suffix: "円" },
  { key: "chihuahuaFund", label: "チワワのお迎え資金", suffix: "円" },
  { key: "monthsToGoal", label: "目標までの月数", suffix: "か月" },
];

function yen(value: number) {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}

function clampPercent(value: number) {
  return Math.max(0, Math.min(100, value));
}

function NumberField({
  label,
  value,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  suffix: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="number-field">
      <span>{label}</span>
      <div>
        <input
          inputMode="numeric"
          min="0"
          type="number"
          value={Number.isFinite(value) ? value : 0}
          onChange={(event) => onChange(Number(event.target.value))}
        />
        <small>{suffix}</small>
      </div>
    </label>
  );
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>(initialInputs);

  useEffect(() => {
    const saved = window.localStorage.getItem("chihuahua-line-dashboard");
    if (saved) {
      setInputs({ ...initialInputs, ...JSON.parse(saved) });
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      "chihuahua-line-dashboard",
      JSON.stringify(inputs),
    );
  }, [inputs]);

  const totals = useMemo(() => {
    const businessIncome = Object.values(inputs.incomes).reduce(
      (sum, value) => sum + value,
      0,
    );
    const requiredLifeCost = inputs.livingCost + inputs.rent;
    const oneTimeGoal = inputs.movingFund + inputs.chihuahuaFund;
    const remainingFund = Math.max(oneTimeGoal - inputs.currentSavings, 0);
    const monthlyReserve = Math.ceil(
      remainingFund / Math.max(inputs.monthsToGoal, 1),
    );
    const requiredBusinessIncome = Math.max(
      requiredLifeCost + monthlyReserve - inputs.pension,
      0,
    );
    const gap = businessIncome - requiredBusinessIncome;
    const achievement =
      requiredBusinessIncome === 0
        ? 100
        : (businessIncome / requiredBusinessIncome) * 100;
    const savingsProgress =
      oneTimeGoal === 0 ? 100 : (inputs.currentSavings / oneTimeGoal) * 100;

    return {
      businessIncome,
      requiredLifeCost,
      oneTimeGoal,
      remainingFund,
      monthlyReserve,
      requiredBusinessIncome,
      gap,
      achievement,
      savingsProgress,
    };
  }, [inputs]);

  const updateInput = (
    key: keyof Omit<Inputs, "incomes">,
    value: number,
  ) => {
    setInputs((current) => ({ ...current, [key]: Math.max(value || 0, 0) }));
  };

  const updateIncome = (key: IncomeKey, value: number) => {
    setInputs((current) => ({
      ...current,
      incomes: { ...current.incomes, [key]: Math.max(value || 0, 0) },
    }));
  };

  return (
    <main className="dashboard-shell">
      <section className="hero-band">
        <div className="hero-copy">
          <p className="eyebrow">Chihuahua Line Dashboard</p>
          <h1>チワワライン Dashboard</h1>
          <p>
            生活、引っ越し、犬との暮らしに必要な収益をひとつの線で見える化。
            数字を動かすたび、目標までの距離が変わります。
          </p>
        </div>
        <div className="goal-card" aria-label="達成率">
          <span>目標達成率</span>
          <strong>{Math.round(totals.achievement)}%</strong>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${clampPercent(totals.achievement)}%` }}
            />
          </div>
          <p>
            {totals.gap >= 0
              ? `目標を ${yen(totals.gap)} 上回っています`
              : `あと ${yen(Math.abs(totals.gap))} で到達`}
          </p>
        </div>
      </section>

      <section className="kpi-grid" aria-label="主要指標">
        <article>
          <span>必要生活費</span>
          <strong>{yen(totals.requiredLifeCost)}</strong>
          <small>生活費 + 家賃</small>
        </article>
        <article>
          <span>必要な事業収入</span>
          <strong>{yen(totals.requiredBusinessIncome)}</strong>
          <small>生活費 + 積立 - 年金</small>
        </article>
        <article>
          <span>現在の事業収入</span>
          <strong>{yen(totals.businessIncome)}</strong>
          <small>項目別収益の合計</small>
        </article>
        <article className={totals.gap >= 0 ? "positive" : "negative"}>
          <span>目標との差額</span>
          <strong>
            {totals.gap >= 0 ? "+" : ""}
            {yen(totals.gap)}
          </strong>
          <small>{totals.gap >= 0 ? "余裕あり" : "伸ばす余地あり"}</small>
        </article>
      </section>

      <section className="line-panel">
        <div className="line-header">
          <div>
            <p className="eyebrow">Goal Route</p>
            <h2>お迎えまでのチワワライン</h2>
          </div>
          <strong>{yen(totals.remainingFund)} 残り</strong>
        </div>
        <div className="route-line">
          <div
            className="route-fill"
            style={{ width: `${clampPercent(totals.savingsProgress)}%` }}
          />
          <span className="station start">今</span>
          <span className="station middle">引っ越し</span>
          <span className="station end">お迎え</span>
        </div>
        <div className="route-meta">
          <span>一時資金目標 {yen(totals.oneTimeGoal)}</span>
          <span>月あたり積立 {yen(totals.monthlyReserve)}</span>
        </div>
      </section>

      <section className="editor-grid">
        <div className="panel">
          <div className="panel-heading">
            <h2>生活と目標</h2>
            <button type="button" onClick={() => setInputs(initialInputs)}>
              初期値に戻す
            </button>
          </div>
          <div className="field-grid">
            {inputLabels.map((item) => (
              <NumberField
                key={item.key}
                label={item.label}
                suffix={item.suffix}
                value={inputs[item.key]}
                onChange={(value) => updateInput(item.key, value)}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>収益入力</h2>
            <span>{yen(totals.businessIncome)}</span>
          </div>
          <div className="income-list">
            {(Object.keys(incomeLabels) as IncomeKey[]).map((key) => {
              const percent =
                totals.requiredBusinessIncome === 0
                  ? 100
                  : (inputs.incomes[key] / totals.requiredBusinessIncome) * 100;
              return (
                <label className="income-row" key={key}>
                  <span>{incomeLabels[key]}</span>
                  <input
                    inputMode="numeric"
                    min="0"
                    type="number"
                    value={inputs.incomes[key]}
                    onChange={(event) =>
                      updateIncome(key, Number(event.target.value))
                    }
                  />
                  <div className="mini-track">
                    <div
                      className={`mini-fill ${key}`}
                      style={{ width: `${clampPercent(percent)}%` }}
                    />
                  </div>
                </label>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
