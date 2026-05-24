export type Plan = "free" | "plus" | "premium";

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  plus: "Plus",
  premium: "Premium",
};

export const PLAN_PRICES: Record<Plan, string> = {
  free: "$0/mo",
  plus: "$7/mo",
  premium: "$15/mo",
};

export type Feature =
  | "spend_analyzer"
  | "goal_single"
  | "goal_unlimited"
  | "weekly_report_basic"
  | "weekly_report_detailed"
  | "streak"
  | "daily_checkin"
  | "spending_history_30"
  | "spending_history_90"
  | "debt_destroyer"
  | "bill_negotiator"
  | "subscription_killer"
  | "auto_save"
  | "paycheck_planner"
  | "refund_hunter"
  | "investment_tracker"
  | "unlimited_accounts";

const FREE_FEATURES: Feature[] = [
  "spend_analyzer",
  "goal_single",
  "weekly_report_basic",
  "streak",
  "daily_checkin",
  "spending_history_30",
];

const PLUS_FEATURES: Feature[] = [
  ...FREE_FEATURES,
  "goal_unlimited",
  "weekly_report_detailed",
  "spending_history_90",
  "debt_destroyer",
  "bill_negotiator",
  "subscription_killer",
];

const PREMIUM_FEATURES: Feature[] = [
  ...PLUS_FEATURES,
  "auto_save",
  "paycheck_planner",
  "refund_hunter",
  "investment_tracker",
  "unlimited_accounts",
];

export const PLAN_FEATURES: Record<Plan, Feature[]> = {
  free: FREE_FEATURES,
  plus: PLUS_FEATURES,
  premium: PREMIUM_FEATURES,
};

export const canAccess = (plan: Plan, feature: Feature) =>
  PLAN_FEATURES[plan].includes(feature);

export const requiredPlan = (feature: Feature): Plan => {
  if (FREE_FEATURES.includes(feature)) return "free";
  if (PLUS_FEATURES.includes(feature)) return "plus";
  return "premium";
};

export const FEATURE_INFO: Record<
  Feature,
  { name: string; description: string; requires: Plan }
> = {
  spend_analyzer: {
    name: "Spend Analyzer",
    description: "Reviews transactions and finds patterns.",
    requires: "free",
  },
  goal_single: {
    name: "Single Savings Goal",
    description: "Track 1 active savings goal.",
    requires: "free",
  },
  goal_unlimited: {
    name: "Unlimited Goals",
    description: "Track every dream, separately.",
    requires: "plus",
  },
  weekly_report_basic: {
    name: "Weekly Report (Basic)",
    description: "Income vs spending, top 3 categories, tip.",
    requires: "free",
  },
  weekly_report_detailed: {
    name: "Weekly Report (Detailed)",
    description: "Full breakdown, anomalies, action item.",
    requires: "plus",
  },
  streak: {
    name: "Streak Tracker",
    description: "Daily and weekly money habits.",
    requires: "free",
  },
  daily_checkin: {
    name: "Daily Check-In",
    description: "One-minute morning money brief.",
    requires: "free",
  },
  spending_history_30: {
    name: "30-Day History",
    description: "See your last month of spending.",
    requires: "free",
  },
  spending_history_90: {
    name: "90-Day History",
    description: "Unlock 3 months of patterns.",
    requires: "plus",
  },
  debt_destroyer: {
    name: "Debt Destroyer",
    description: "Avalanche or snowball, month-by-month payoff plan.",
    requires: "plus",
  },
  bill_negotiator: {
    name: "Bill Negotiator",
    description: "Scripts to lower your monthly bills.",
    requires: "plus",
  },
  subscription_killer: {
    name: "Subscription Killer",
    description: "Find and cancel unused subscriptions.",
    requires: "plus",
  },
  auto_save: {
    name: "Auto-Save",
    description: "Automatic transfers before you can spend.",
    requires: "premium",
  },
  paycheck_planner: {
    name: "Paycheck Planner",
    description: "Allocate every paycheck on arrival.",
    requires: "premium",
  },
  refund_hunter: {
    name: "Refund Hunter",
    description: "Get money back when prices drop.",
    requires: "premium",
  },
  investment_tracker: {
    name: "Investment Tracker",
    description: "Portfolio and net worth overview.",
    requires: "premium",
  },
  unlimited_accounts: {
    name: "Unlimited Accounts",
    description: "Connect as many accounts as you want.",
    requires: "premium",
  },
};
