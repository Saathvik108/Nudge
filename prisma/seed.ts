import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const days = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(12, 0, 0, 0);
  return d;
};

const BADGES = [
  { code: "sub_slayer", name: "Subscription Slayer", emoji: "🛡️", description: "Cancelled 3+ subscriptions." },
  { code: "goal_getter", name: "Goal Getter", emoji: "🎯", description: "Hit your first savings goal." },
  { code: "ice_cold", name: "Ice Cold", emoji: "🧊", description: "Resisted an impulse purchase." },
  { code: "investor", name: "Investor", emoji: "📈", description: "Made your first investment." },
  { code: "debt_climber", name: "Debt Climber", emoji: "🏔️", description: "Paid off your first debt." },
  { code: "on_fire", name: "On Fire", emoji: "🔥", description: "Hit a 30-day streak." },
  { code: "diamond_hands", name: "Diamond Hands", emoji: "💎", description: "Didn't touch emergency fund for 6 months." },
  { code: "big_brain", name: "Big Brain", emoji: "🧠", description: "Saved $10,000+." },
  { code: "upgraded", name: "Upgraded", emoji: "⭐", description: "Moved from free to a paid plan." },
  { code: "premium", name: "Premium", emoji: "👑", description: "Reached Premium tier." },
];

const TRANSACTION_PRESETS: Array<{
  merchant: string;
  category: string;
  amount: number;
  emotional?: boolean;
}> = [
  { merchant: "Trader Joe's", category: "Groceries", amount: -64.21 },
  { merchant: "Whole Foods", category: "Groceries", amount: -42.18 },
  { merchant: "Chipotle", category: "Dining", amount: -14.85 },
  { merchant: "DoorDash", category: "Dining", amount: -23.4, emotional: true },
  { merchant: "Uber Eats", category: "Dining", amount: -31.12, emotional: true },
  { merchant: "Sweetgreen", category: "Dining", amount: -17.5 },
  { merchant: "Lyft", category: "Transport", amount: -12.4 },
  { merchant: "Shell Gas", category: "Transport", amount: -48.7 },
  { merchant: "Equinox", category: "Fitness", amount: -195.0 },
  { merchant: "Amazon", category: "Shopping", amount: -28.99 },
  { merchant: "Amazon", category: "Shopping", amount: -54.13, emotional: true },
  { merchant: "Target", category: "Shopping", amount: -71.06 },
  { merchant: "Spotify", category: "Subscriptions", amount: -10.99 },
  { merchant: "Netflix", category: "Subscriptions", amount: -15.49 },
  { merchant: "Hulu", category: "Subscriptions", amount: -7.99 },
  { merchant: "Apple iCloud+", category: "Subscriptions", amount: -2.99 },
  { merchant: "Verizon", category: "Bills", amount: -85.0 },
  { merchant: "ConEd", category: "Bills", amount: -78.4 },
  { merchant: "Spectrum Internet", category: "Bills", amount: -64.99 },
  { merchant: "Rent", category: "Rent", amount: -1850.0 },
  { merchant: "Starbucks", category: "Coffee", amount: -6.75 },
  { merchant: "Blue Bottle", category: "Coffee", amount: -5.5 },
  { merchant: "CVS", category: "Health", amount: -22.41 },
  { merchant: "AMC Theaters", category: "Entertainment", amount: -19.5 },
];

async function main() {
  console.log("→ Resetting...");
  await prisma.chatMessage.deleteMany();
  await prisma.streakEvent.deleteMany();
  await prisma.userBadge.deleteMany();
  await prisma.badge.deleteMany();
  await prisma.weeklyReport.deleteMany();
  await prisma.refund.deleteMany();
  await prisma.paycheck.deleteMany();
  await prisma.investment.deleteMany();
  await prisma.bill.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.debtPayment.deleteMany();
  await prisma.debt.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  console.log("→ Seeding badges...");
  for (const b of BADGES) {
    await prisma.badge.create({ data: b });
  }

  console.log("→ Seeding demo user 'Jess'...");
  const user = await prisma.user.create({
    data: {
      name: "Jess",
      email: "jess@nudge.demo",
      age: 29,
      plan: "free",
      monthlyIncome: 5400,
      currentSavings: 2840,
      currentStreak: 12,
      longestStreak: 21,
      xp: 470,
      memberSince: days(58),
      lastCheckInAt: days(0),
    },
  });

  console.log("→ Connecting demo accounts...");
  const checking = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Chase Checking",
      type: "checking",
      institution: "Chase",
      balance: 1432.18,
      last4: "4421",
    },
  });
  const savings = await prisma.account.create({
    data: {
      userId: user.id,
      name: "Ally Savings",
      type: "savings",
      institution: "Ally",
      balance: 2840.0,
      last4: "9988",
    },
  });
  await prisma.account.create({
    data: {
      userId: user.id,
      name: "Chase Sapphire",
      type: "credit",
      institution: "Chase",
      balance: -1284.55,
      last4: "1180",
    },
  });
  await prisma.account.create({
    data: {
      userId: user.id,
      name: "Fidelity Brokerage",
      type: "brokerage",
      institution: "Fidelity",
      balance: 8240.12,
      last4: "5500",
    },
  });

  console.log("→ Seeding 60 days of transactions...");
  for (let d = 0; d < 60; d++) {
    // 1-3 transactions/day
    const count = 1 + Math.floor((d * 13) % 3);
    for (let i = 0; i < count; i++) {
      const preset =
        TRANSACTION_PRESETS[
          (d * 7 + i * 11) % TRANSACTION_PRESETS.length
        ];
      // wiggle the amount a bit
      const wiggle = 1 + (((d + i) % 7) - 3) * 0.04;
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: checking.id,
          merchant: preset.merchant,
          category: preset.category,
          amount: +(preset.amount * wiggle).toFixed(2),
          date: days(d),
          emotional: preset.emotional ?? false,
        },
      });
    }
    // bi-monthly paycheck
    if (d % 14 === 0) {
      await prisma.transaction.create({
        data: {
          userId: user.id,
          accountId: checking.id,
          merchant: "Bright Labs Inc — Payroll",
          category: "Income",
          amount: 2700.0,
          date: days(d),
        },
      });
      await prisma.paycheck.create({
        data: {
          userId: user.id,
          amount: 2700.0,
          date: days(d),
          autoSaved: 400,
        },
      });
    }
  }

  console.log("→ Seeding goal (free users get 1)...");
  const goal = await prisma.goal.create({
    data: {
      userId: user.id,
      name: "Emergency Fund",
      type: "emergency",
      targetAmount: 8000,
      currentAmount: 2840,
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 270),
      monthlyTarget: 520,
      weeklyTarget: 130,
    },
  });
  await prisma.user.update({
    where: { id: user.id },
    data: { primaryGoalId: goal.id },
  });

  console.log("→ Seeding debts...");
  await prisma.debt.createMany({
    data: [
      {
        userId: user.id,
        name: "Chase Sapphire",
        balance: 1284.55,
        apr: 0.2399,
        minPayment: 40,
        type: "credit_card",
      },
      {
        userId: user.id,
        name: "Discover It",
        balance: 720.0,
        apr: 0.1899,
        minPayment: 25,
        type: "credit_card",
      },
      {
        userId: user.id,
        name: "Sallie Mae Student Loan",
        balance: 8420.0,
        apr: 0.0625,
        minPayment: 110,
        type: "student_loan",
      },
    ],
  });

  console.log("→ Seeding subscriptions...");
  await prisma.subscription.createMany({
    data: [
      { userId: user.id, name: "Netflix", amount: 15.49, frequency: "monthly", category: "streaming", usedRecently: true, lastCharged: days(4) },
      { userId: user.id, name: "Spotify", amount: 10.99, frequency: "monthly", category: "streaming", usedRecently: true, lastCharged: days(6) },
      { userId: user.id, name: "Hulu", amount: 7.99, frequency: "monthly", category: "streaming", usedRecently: false, lastCharged: days(2) },
      { userId: user.id, name: "Apple iCloud+", amount: 2.99, frequency: "monthly", category: "software", usedRecently: true, lastCharged: days(9) },
      { userId: user.id, name: "Equinox", amount: 195.0, frequency: "monthly", category: "fitness", usedRecently: false, lastCharged: days(7) },
      { userId: user.id, name: "NYT Cooking", amount: 5.0, frequency: "monthly", category: "news", usedRecently: false, lastCharged: days(11) },
      { userId: user.id, name: "Audible", amount: 14.95, frequency: "monthly", category: "other", usedRecently: false, lastCharged: days(12) },
      { userId: user.id, name: "MasterClass", amount: 15.0, frequency: "monthly", category: "other", usedRecently: false, lastCharged: days(20) },
    ],
  });

  console.log("→ Seeding bills...");
  await prisma.bill.createMany({
    data: [
      { userId: user.id, name: "Spectrum Internet", category: "internet", monthlyCost: 64.99, negotiable: true },
      { userId: user.id, name: "Verizon Wireless", category: "phone", monthlyCost: 85.0, negotiable: true },
      { userId: user.id, name: "Geico Auto", category: "insurance", monthlyCost: 142.0, negotiable: true },
      { userId: user.id, name: "ConEd Electric", category: "utility", monthlyCost: 78.4, negotiable: false },
    ],
  });

  console.log("→ Seeding investments...");
  await prisma.investment.createMany({
    data: [
      { userId: user.id, ticker: "VTI", name: "Vanguard Total Stock Market", shares: 18.4, costBasis: 4200, currentValue: 5240.10, accountName: "Fidelity Brokerage" },
      { userId: user.id, ticker: "VXUS", name: "Vanguard Total International Stock", shares: 22.1, costBasis: 1450, currentValue: 1620.00, accountName: "Fidelity Brokerage" },
      { userId: user.id, ticker: "BND", name: "Vanguard Total Bond Market", shares: 14.0, costBasis: 1080, currentValue: 1090.02, accountName: "Fidelity Brokerage" },
      { userId: user.id, ticker: "AAPL", name: "Apple Inc.", shares: 2, costBasis: 320, currentValue: 290.00, accountName: "Fidelity Brokerage" },
    ],
  });

  console.log("→ Seeding refunds...");
  await prisma.refund.createMany({
    data: [
      { userId: user.id, merchant: "Amazon", item: "Sony WH-1000XM5 Headphones", originalPrice: 399.0, newPrice: 329.0, amount: 70.0, status: "found", foundAt: days(2) },
      { userId: user.id, merchant: "Best Buy", item: "Logitech MX Keys", originalPrice: 119.99, newPrice: 99.99, amount: 20.0, status: "claimed", foundAt: days(6) },
      { userId: user.id, merchant: "Target", item: "Dyson V8 Vacuum", originalPrice: 449.99, newPrice: 399.99, amount: 50.0, status: "received", foundAt: days(14) },
    ],
  });

  console.log("→ Seeding badges earned...");
  const badge = (code: string) =>
    prisma.badge.findUniqueOrThrow({ where: { code } });

  for (const code of ["on_fire", "goal_getter", "ice_cold"]) {
    const b = await badge(code);
    await prisma.userBadge.create({
      data: { userId: user.id, badgeId: b.id },
    });
  }

  console.log("→ Seeding 12 days of streak events...");
  for (let d = 0; d < 12; d++) {
    await prisma.streakEvent.create({
      data: { userId: user.id, type: "checkin", date: days(d), xp: 10 },
    });
  }

  console.log("→ Seeding weekly report...");
  await prisma.weeklyReport.create({
    data: {
      userId: user.id,
      weekStart: days(7),
      income: 2700,
      totalSpent: 1485.32,
      totalSaved: 260,
      savingsRate: 0.096,
      topCategories: JSON.stringify([
        { category: "Rent", amount: 925, change: 0 },
        { category: "Dining", amount: 184.5, change: 0.42 },
        { category: "Groceries", amount: 162.4, change: -0.12 },
      ]),
      anomalies: JSON.stringify(["Dining spend was 42% higher than last week."]),
      insight:
        "Three DoorDash orders this week. Probably stress orders — totally understandable. Want to set a $20/day soft cap to keep it from creeping?",
      actionItem:
        "Cap dining at $130 next week (down ~30%). I'll nudge you when you hit $100.",
    },
  });

  console.log("→ Seeding initial chat message...");
  await prisma.chatMessage.create({
    data: {
      userId: user.id,
      role: "assistant",
      sessionType: "general",
      content:
        "Hey Jess! 👋 I'm Max — your money coach. I'll keep things simple, never preachy. Type 'check in' for your daily brief, or ask me anything.",
    },
  });

  console.log("✓ Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
