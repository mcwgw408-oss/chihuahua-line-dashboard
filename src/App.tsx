import { useEffect, useMemo, useState } from "react";

type IncomeKey = "skill" | "brain" | "note" | "app" | "kindle" | "other";

type ExpenseKey =
  | "food"
  | "dailyGoods"
  | "jcom"
  | "water"
  | "medical"
  | "business"
  | "hobby"
  | "transport"
  | "beauty"
  | "chihuahua"
  | "savings";

type Inputs = {
  expenses: Record<ExpenseKey, number>;
  pension: number;
  rent: number;
  movingFund: number;
  currentSavings: number;
  chihuahuaFund: number;
  incomes: Record<IncomeKey, number>;
};

const storageKey = "chihuahua-line-dashboard";

const initialExpenses: Record<ExpenseKey, number> = {
  food: 45000,
  dailyGoods: 10000,
  jcom: 15000,
  water: 5000,
  medical: 10000,
  business: 30000,
  hobby: 30000,
  transport: 8000,
  beauty: 10000,
  chihuahua: 40000,
  savings: 50000,
};

const initialInputs: Inputs = {
  expenses: initialExpenses,
  pension: 77000,
  rent: 200000,
  movingFund: 450000,
  currentSavings: 180000,
  chihuahuaFund: 320000,
  incomes: {
    skill: 90000,
    brain: 45000,
    note: 25000,
    app: 0,
    kindle: 0,
    other: 15000,
  },
};

const expenseLabels: Record<ExpenseKey, string> = {
  food: "食費",
  dailyGoods: "日用品",
  jcom: "J:COM（電気・ガス・スマホ・TV）",
  water: "水道",
  medical: "医療費",
  business: "仕事・事業費",
  hobby: "趣味・娯楽費",
  transport: "交通費",
  beauty: "服・美容費",
  chihuahua: "チワワ費",
  savings: "貯蓄・予備費",
};

const incomeLabels: Record<IncomeKey, string> = {
  skill: "Skill販売",
  brain: "Brainアフィリエイト",
  note: "note",
  app: "アプリ販売",
  kindle: "Kindle",
  other: "その他",
};

const oneTimeInputLabels: Array<{
  key: "movingFund" | "currentSavings" | "chihuahuaFund";
  label: string;
  suffix: string;
}> = [
  { key: "movingFund", label: "引っ越し資金", suffix: "円" },
  { key: "chihuahuaFund", label: "チワワのお迎え資金", suffix: "円" },
  { key: "currentSavings", label: "現在額", suffix: "円" },
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

function normalizeInputs(value: unknown): Inputs {
  if (!value || typeof value !== "object") {
    return initialInputs;
  }

  const partial = value as Partial<Inputs> & {
    livingCost?: number;
  };

  return {
    ...initialInputs,
    ...partial,
    expenses: {
      ...initialInputs.expenses,
      ...(partial.expenses ?? {}),
    },
    incomes: {
      ...initialInputs.incomes,
      ...(partial.incomes ?? {}),
    },
  };
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
    const saved = window.localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    try {
      setInputs(normalizeInputs(JSON.parse(saved)));
    } catch {
      setInputs(initialInputs);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(inputs));
  }, [inputs]);

  const monthly = useMemo(() => {
    const monthlyLivingCost = Object.values(inputs.expenses).reduce(
      (sum, value) => sum + value,
      0,
    );
    const actualBusinessIncome = Object.values(inputs.incomes).reduce(
      (sum, value) => sum + value,
      0,
    );
    const requiredLivingCost = monthlyLivingCost + inputs.rent;
    const requiredBusinessIncome = Math.max(
      requiredLivingCost - inputs.pension,
      0,
    );
    const gap = actualBusinessIncome - requiredBusinessIncome;
    const achievement =
      requiredBusinessIncome === 0
        ? 100
        : (actualBusinessIncome / requiredBusinessIncome) * 100;

    return {
      monthlyLivingCost,
      actualBusinessIncome,
      requiredLivingCost,
      requiredBusinessIncome,
      gap,
      achievement,
    };
  }, [inputs]);

  const oneTime = useMemo(() => {
    const target = inputs.movingFund + inputs.chihuahuaFund;
    const current = inputs.currentSavings;
    const remaining = Math.max(target - current, 0);
    const progress = target === 0 ? 100 : (current / target) * 100;

    return {
      target,
      current,
      remaining,
      progress,
    };
  }, [inputs]);

  const updateInput = (
    key: keyof Omit<Inputs, "expenses" | "incomes">,
    value: number,
  ) => {
    setInputs((current) => ({ ...current, [key]: Math.max(value || 0, 0) }));
  };

  const updateExpense = (key: ExpenseKey, value: number) => {
    setInputs((current) => ({
      ...current,
      expenses: { ...current.expenses, [key]: Math.max(value || 0, 0) },
    }));
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
            支出は生活費内訳と家賃で整理し、年金は事業外収入として別管理。
            毎月必要な生活費から年金を引いて、必要な事業収入を確認します。
          </p>
        </div>
        <div className="goal-card" aria-label="月次達成率">
          <span>月次の達成率</span>
          <strong>{Math.round(monthly.achievement)}%</strong>
          <div className="progress-track">
            <div
              className="progress-fill"
              style={{ width: `${clampPercent(monthly.achievement)}%` }}
            />
          </div>
          <p>
            {monthly.gap >= 0
              ? `必要額を ${yen(monthly.gap)} 上回っています`
              : `あと ${yen(Math.abs(monthly.gap))} で月次達成`}
          </p>
        </div>
      </section>

      <section className="kpi-grid" aria-label="月次の生活収支">
        <article>
          <span>月の生活費</span>
          <strong>{yen(monthly.monthlyLivingCost)}</strong>
          <small>内訳の合計</small>
        </article>
        <article>
          <span>家賃</span>
          <strong>{yen(inputs.rent)}</strong>
          <small>月次支出</small>
        </article>
        <article>
          <span>毎月必要な生活費</span>
          <strong>{yen(monthly.requiredLivingCost)}</strong>
          <small>月の生活費 + 家賃</small>
        </article>
        <article>
          <span>年金</span>
          <strong>{yen(inputs.pension)}</strong>
          <small>事業外収入</small>
        </article>
        <article>
          <span>必要な事業収入</span>
          <strong>{yen(monthly.requiredBusinessIncome)}</strong>
          <small>毎月必要な生活費 - 年金</small>
        </article>
        <article>
          <span>実際の事業収入合計</span>
          <strong>{yen(monthly.actualBusinessIncome)}</strong>
          <small>各事業収入の合計</small>
        </article>
        <article className={monthly.gap >= 0 ? "positive" : "negative"}>
          <span>必要額との差額</span>
          <strong>
            {monthly.gap >= 0 ? "+" : ""}
            {yen(monthly.gap)}
          </strong>
          <small>{monthly.gap >= 0 ? "月次クリア" : "事業収入で補う額"}</small>
        </article>
      </section>

      <section className="line-panel">
        <div className="line-header">
          <div>
            <p className="eyebrow">One-Time Fund</p>
            <h2>引っ越し・チワワお迎えの一時資金</h2>
          </div>
          <strong>{yen(oneTime.remaining)} 残り</strong>
        </div>
        <div className="route-line">
          <div
            className="route-fill"
            style={{ width: `${clampPercent(oneTime.progress)}%` }}
          />
          <span className="station start">現在</span>
          <span className="station middle">引っ越し</span>
          <span className="station end">お迎え</span>
        </div>
        <div className="fund-grid" aria-label="一時資金の状況">
          <article>
            <span>目標額</span>
            <strong>{yen(oneTime.target)}</strong>
          </article>
          <article>
            <span>現在額</span>
            <strong>{yen(oneTime.current)}</strong>
          </article>
          <article>
            <span>残額</span>
            <strong>{yen(oneTime.remaining)}</strong>
          </article>
        </div>
      </section>

      <section className="editor-grid">
        <div className="panel expense-editor">
          <div className="panel-heading">
            <div>
              <h2>月の生活費 内訳</h2>
              <p>{yen(monthly.monthlyLivingCost)}</p>
            </div>
            <button type="button" onClick={() => setInputs(initialInputs)}>
              初期値に戻す
            </button>
          </div>
          <div className="expense-grid">
            {(Object.keys(expenseLabels) as ExpenseKey[]).map((key) => (
              <NumberField
                key={key}
                label={expenseLabels[key]}
                suffix="円/月"
                value={inputs.expenses[key]}
                onChange={(value) => updateExpense(key, value)}
              />
            ))}
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>月次支出</h2>
            <span>{yen(inputs.rent)}</span>
          </div>
          <div className="field-grid">
            <NumberField
              label="家賃"
              suffix="円/月"
              value={inputs.rent}
              onChange={(value) => updateInput("rent", value)}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>事業外収入</h2>
            <span>{yen(inputs.pension)}</span>
          </div>
          <div className="field-grid">
            <NumberField
              label="年金"
              suffix="円/月"
              value={inputs.pension}
              onChange={(value) => updateInput("pension", value)}
            />
          </div>
        </div>

        <div className="panel">
          <div className="panel-heading">
            <h2>事業収入</h2>
            <span>{yen(monthly.actualBusinessIncome)}</span>
          </div>
          <div className="income-list">
            {(Object.keys(incomeLabels) as IncomeKey[]).map((key) => {
              const percent =
                monthly.requiredBusinessIncome === 0
                  ? 100
                  : (inputs.incomes[key] / monthly.requiredBusinessIncome) *
                    100;
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

        <div className="panel one-time-editor">
          <div className="panel-heading">
            <h2>一時資金</h2>
            <span>{Math.round(oneTime.progress)}%</span>
          </div>
          <div className="field-grid">
            {oneTimeInputLabels.map((item) => (
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
      </section>
    </main>
  );
}
