type Debt = {
  id: string;
  name: string;
  balance: number;
  apr: number;
  minPayment: number;
};

export type PayoffStep = {
  month: number;
  debtId: string;
  debtName: string;
  payment: number;
  remaining: number;
  interest: number;
};

export type PayoffPlan = {
  totalMonths: number;
  totalInterest: number;
  totalPaid: number;
  payoffDate: Date;
  schedule: PayoffStep[];
  perDebt: { debtId: string; debtName: string; paidOffMonth: number; interestPaid: number }[];
};

export const generatePayoffPlan = (
  debts: Debt[],
  extraPerMonth: number,
  strategy: "avalanche" | "snowball",
): PayoffPlan => {
  // mutable copies
  const state = debts.map((d) => ({
    ...d,
    balance: d.balance,
    interestPaid: 0,
    paidOffMonth: 0,
  }));

  const sortFn =
    strategy === "avalanche"
      ? (a: typeof state[0], b: typeof state[0]) => b.apr - a.apr
      : (a: typeof state[0], b: typeof state[0]) => a.balance - b.balance;

  const schedule: PayoffStep[] = [];
  let month = 0;
  let safety = 0;

  while (state.some((d) => d.balance > 0.01) && safety < 600) {
    month++;
    safety++;

    // accrue interest
    for (const d of state) {
      if (d.balance <= 0) continue;
      const interest = (d.balance * d.apr) / 12;
      d.balance += interest;
      d.interestPaid += interest;
    }

    // base mins
    for (const d of state) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.minPayment, d.balance);
      d.balance -= pay;
      schedule.push({
        month, debtId: d.id, debtName: d.name,
        payment: +pay.toFixed(2),
        remaining: +Math.max(0, d.balance).toFixed(2),
        interest: 0,
      });
    }

    // extra to target debt
    let extra = extraPerMonth;
    const active = state.filter((d) => d.balance > 0.01).sort(sortFn);
    for (const target of active) {
      if (extra <= 0) break;
      const pay = Math.min(extra, target.balance);
      target.balance -= pay;
      extra -= pay;
      const last = schedule[schedule.length - 1];
      if (last && last.debtId === target.id && last.month === month) {
        last.payment += pay;
        last.remaining = +Math.max(0, target.balance).toFixed(2);
      } else {
        schedule.push({
          month, debtId: target.id, debtName: target.name,
          payment: +pay.toFixed(2),
          remaining: +Math.max(0, target.balance).toFixed(2),
          interest: 0,
        });
      }
    }

    for (const d of state) {
      if (d.balance <= 0.01 && d.paidOffMonth === 0) d.paidOffMonth = month;
    }
  }

  const totalInterest = state.reduce((s, d) => s + d.interestPaid, 0);
  const totalPaid =
    debts.reduce((s, d) => s + d.balance, 0) + totalInterest;

  const payoffDate = new Date();
  payoffDate.setMonth(payoffDate.getMonth() + month);

  return {
    totalMonths: month,
    totalInterest: +totalInterest.toFixed(2),
    totalPaid: +totalPaid.toFixed(2),
    payoffDate,
    schedule,
    perDebt: state.map((d) => ({
      debtId: d.id,
      debtName: d.name,
      paidOffMonth: d.paidOffMonth,
      interestPaid: +d.interestPaid.toFixed(2),
    })),
  };
};
