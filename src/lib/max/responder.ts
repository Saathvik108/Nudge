import type { MaxUserContext } from "./system-prompt";
import { canAccess, type Feature, type Plan } from "../plan";

export type SessionType =
  | "daily_checkin"
  | "weekly_report"
  | "goal"
  | "debt"
  | "spend"
  | "stress"
  | "paycheck"
  | "general";

export type MaxReply = {
  content: string;
  sessionType: SessionType;
  upsellTriggered: boolean;
  upsellFeature?: Feature;
};

const STRESS_WORDS = [
  "stressed", "stress", "anxious", "anxiety", "overwhelmed", "panic",
  "scared", "broke", "can't afford", "cant afford", "rent", "evict",
  "lost my job", "fired", "behind on", "drowning",
];

const DEBT_WORDS = ["debt", "credit card", "loan", "owe", "payoff", "pay off"];
const GOAL_WORDS = ["goal", "save for", "saving for", "vacation", "emergency fund", "down payment"];
const SPEND_WORDS = ["spending", "spend", "transactions", "categories", "where my money", "where did my money"];
const PAYCHECK_WORDS = ["paycheck", "got paid", "just got paid", "allocate"];
const REPORT_WORDS = ["weekly report", "week recap", "week report", "weekly summary"];
const CHECKIN_WORDS = ["check in", "checkin", "good morning", "morning max"];

const includesAny = (s: string, words: string[]) => {
  const lower = s.toLowerCase();
  return words.some((w) => lower.includes(w));
};

export const detectSessionType = (text: string): SessionType => {
  if (includesAny(text, STRESS_WORDS)) return "stress";
  if (includesAny(text, PAYCHECK_WORDS)) return "paycheck";
  if (includesAny(text, DEBT_WORDS)) return "debt";
  if (includesAny(text, GOAL_WORDS)) return "goal";
  if (includesAny(text, REPORT_WORDS)) return "weekly_report";
  if (includesAny(text, CHECKIN_WORDS)) return "daily_checkin";
  if (includesAny(text, SPEND_WORDS)) return "spend";
  return "general";
};

const usd = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

// ---- Upsell scripts (from the system prompt) ----------------------------

const upsellSecondGoal = (newGoal: string, existingGoal: string) =>
  `Love that you're thinking about ${newGoal}! 🎯
You're already crushing ${existingGoal} — adding another goal is a Plus thing though.

For **$7/month** you get unlimited goals, a full debt payoff plan, and tools to find hidden money you're already wasting. Most people save way more than $7 in the first week.

Want to upgrade? It takes 30 seconds. Or I can keep focusing on ${existingGoal} for now — totally your call.`;

const upsellDebt = () =>
  `Okay so I LOVE that you want to tackle this — that's the move. 💪

The full debt destroyer with your custom payoff timeline and month-by-month plan is a **Plus feature ($7/month)**.

Here's what I can tell you right now for free: list your debts highest interest to lowest, pay minimums on all of them, and throw every extra dollar at the top one. That's the **avalanche method** and it works.

Want the full automated plan? Upgrading takes 30 seconds and honestly the debt planner alone is worth it.`;

const upsellAutoSave = () =>
  `Auto-save is honestly the feature that changes everything — it's the difference between trying to save and actually saving. 🤖

It's part of **Premium ($15/month)**. Every time money hits your account, I automatically move a calculated amount to savings before you even see it. You literally can't spend it.

Most Premium users save 40% more than they did manually. Want to try it?`;

const upsellHistory = () =>
  `I can see your last 30 days right now — that's what's available on the free plan.

To unlock your full history (90+ days) and see real patterns in your spending, that's **Plus at $7/month**.

Honestly the spending pattern insights alone have helped people find $200–$400/month they didn't know they were wasting. Worth it?`;

const upsellInvest = () =>
  `Love that you're thinking about investing — that's next level. 📈

Investment tracking and portfolio overview is a **Premium feature ($15/month)**. It connects to your brokerage accounts and gives you a full picture of your net worth alongside your budget.

You're already doing great on Plus — Premium just adds the wealth-building layer on top. Want to make the jump?`;

const upsellPaycheck = () =>
  `Paycheck Planner allocates every dollar the second it lands — needs, wants, goals — all automatic. 💵

It's a **Premium feature ($15/month)**. Until then, here's the rule of thumb: 50% needs, 30% wants, 20% goals. Do it manually the day you get paid before you spend a cent.

Want me to set up the auto version?`;

const upsellSubscriptions = () =>
  `The Subscription Killer scans your transactions, flags anything you haven't used, and gives you one-tap cancel links. 🗡️

It's a **Plus feature ($7/month)** — most users find $30–$80/month they were leaking. The tool literally pays for itself in week one.

Want to upgrade and run the scan?`;

const upsellBill = () =>
  `Bill Negotiator gives you the exact scripts (and prices) to call Comcast, Verizon, your insurance — and pay less.

It's a **Plus feature ($7/month)**. Average user knocks **$40+/month** off their bills with one phone call. Want in?`;

// ---- Session responses --------------------------------------------------

const checkin = (ctx: MaxUserContext) => {
  const streakEmoji = ctx.currentStreak >= 30 ? "🏆" : ctx.currentStreak >= 7 ? "🔥" : "✨";
  const top = ctx.topCategories?.[0];
  const insight = top
    ? `Yesterday's biggest category was **${top.category}** at ${usd(top.amount)}. Totally fine — just noting it.`
    : `Quiet day yesterday. Sometimes that's the win.`;
  return `Morning ${ctx.name}! ${streakEmoji} Day ${ctx.currentStreak} streak — you're building something real here.

${insight}

Today's move: keep an eye on small spends. The little ones add up faster than the big ones.

Let's get it. 💪`;
};

const weeklyReport = (ctx: MaxUserContext, plan: Plan) => {
  const detail = canAccess(plan, "weekly_report_detailed");
  const top = ctx.topCategories?.slice(0, 3) ?? [];
  const topLines = top
    .map((c, i) => `${i + 1}. **${c.category}** — ${usd(c.amount)}`)
    .join("\n");

  if (!detail) {
    return `Here's your week, ${ctx.name} — quick version. 📊

**Top 3 categories**
${topLines || "_(no data yet)_"}

You're at a ${ctx.currentStreak}-day streak. One tip: pick a single category to trim 10% next week. That's the whole move.

Want the full detailed report with anomalies and a custom action item? That's a Plus feature.`;
  }

  return `Full week report, ${ctx.name} — let's go. 📊

**Top categories**
${topLines || "_(no data yet)_"}

**Anomaly**: dining spend looks 2.1x your usual. Not a problem, just a flag.

**This week's action**: cap dining at ${usd((top[0]?.amount ?? 200) * 0.7)} — that's a soft 30% trim, no diet vibes. Want me to nudge you when you're close?`;
};

const debt = (ctx: MaxUserContext, plan: Plan) => {
  if (!canAccess(plan, "debt_destroyer")) {
    return upsellDebt();
  }
  const total = ctx.recentDebtTotal ?? 0;
  return `Okay ${ctx.name}, here's the plan. 💪

Total debt: **${usd(total)}**. We're going **avalanche** — pay minimums everywhere, throw extra at the highest APR. That saves you the most in interest.

I built you a month-by-month payoff timeline on the Debts page. Want me to find an extra $50–$100/month from your spending to accelerate it?`;
};

const goal = (ctx: MaxUserContext, plan: Plan, userText: string) => {
  const isAddingNew =
    /\b(new|another|second|add a goal|add another)\b/i.test(userText) ||
    (canAccess(plan, "goal_unlimited") === false && /\bsave for\b/i.test(userText));

  if (isAddingNew && !canAccess(plan, "goal_unlimited") && ctx.primaryGoal) {
    return upsellSecondGoal("that new goal", ctx.primaryGoal.name);
  }

  if (ctx.primaryGoal) {
    const pct = Math.round(
      (ctx.primaryGoal.current / Math.max(1, ctx.primaryGoal.target)) * 100,
    );
    return `Goal check-in: **${ctx.primaryGoal.name}** is at ${pct}%. ${usd(ctx.primaryGoal.current)} of ${usd(ctx.primaryGoal.target)}. 🎯

You're closer than you think. At your current pace you'll hit it — let's just make sure nothing knocks you off track.

Want me to bump the weekly target by $25 to finish earlier?`;
  }

  return `Let's set a goal, ${ctx.name}. 🎯

What's the one thing you want money to make easier in the next 6 months? Emergency fund, a trip, a couch — anything counts. Pick one and tell me the amount, and I'll break it into weekly bites.`;
};

const spend = (ctx: MaxUserContext, plan: Plan) => {
  const top = ctx.topCategories?.[0];
  if (!canAccess(plan, "spending_history_90") && /\b(90|three months|3 months|patterns)\b/i.test("")) {
    return upsellHistory();
  }
  return `Here's the read on your spending. 🔍

Biggest category right now: **${top?.category ?? "Food"}** at ${usd(top?.amount ?? 0)}.

I noticed a few small recurring charges that might be worth a second look. Want me to flag the top 3?`;
};

const stress = (ctx: MaxUserContext) => {
  // Never upsell during stress sessions.
  return `Hey ${ctx.name}, I hear you. Money stress is real and it's exhausting. Let's slow down and figure this out together. 💙

Let's just handle the next 7 days. What MUST get paid this week? Tell me the top one or two things and we'll triage from there.

You're not behind. You're just here, with me, figuring it out. That's already the move.`;
};

const paycheck = (ctx: MaxUserContext, plan: Plan) => {
  if (!canAccess(plan, "paycheck_planner")) {
    return upsellPaycheck();
  }
  const amount = (ctx.monthlyIncome ?? 0) / 2;
  const needs = amount * 0.5;
  const wants = amount * 0.3;
  const goals = amount * 0.2;
  return `💵 Paycheck plan, ${ctx.name}:

- ✅ Bills & needs: **${usd(needs)}**
- 🎉 Fun money: **${usd(wants)}**
- 🚀 Future you: **${usd(goals)}**

Auto-save of ${usd(goals * 0.6)} is scheduled. You don't have to do anything. Daily spend is about ${usd(wants / 14)} until next paycheck.`;
};

const general = (ctx: MaxUserContext) => {
  return `Hey ${ctx.name} — I'm here. 👋

I can help with: a daily check-in, your weekly money report, savings goals, debt payoff, spending patterns, or just talking through a money decision.

What's on your mind?`;
};

// ---- Entrypoint ---------------------------------------------------------

export const generateMaxReply = (
  userText: string,
  ctx: MaxUserContext,
): MaxReply => {
  const plan = ctx.plan;
  const sessionType = detectSessionType(userText);

  let content = "";
  let upsellTriggered = false;
  let upsellFeature: Feature | undefined;

  switch (sessionType) {
    case "stress":
      content = stress(ctx);
      break;
    case "daily_checkin":
      content = checkin(ctx);
      break;
    case "weekly_report":
      content = weeklyReport(ctx, plan);
      if (!canAccess(plan, "weekly_report_detailed")) {
        upsellTriggered = true;
        upsellFeature = "weekly_report_detailed";
      }
      break;
    case "debt":
      content = debt(ctx, plan);
      if (!canAccess(plan, "debt_destroyer")) {
        upsellTriggered = true;
        upsellFeature = "debt_destroyer";
      }
      break;
    case "goal":
      content = goal(ctx, plan, userText);
      if (content.includes("Plus thing")) {
        upsellTriggered = true;
        upsellFeature = "goal_unlimited";
      }
      break;
    case "spend":
      content = spend(ctx, plan);
      break;
    case "paycheck":
      content = paycheck(ctx, plan);
      if (!canAccess(plan, "paycheck_planner")) {
        upsellTriggered = true;
        upsellFeature = "paycheck_planner";
      }
      break;
    default:
      // generic intent helpers
      if (/auto.?save/i.test(userText) && !canAccess(plan, "auto_save")) {
        content = upsellAutoSave();
        upsellTriggered = true;
        upsellFeature = "auto_save";
        break;
      }
      if (/invest/i.test(userText) && !canAccess(plan, "investment_tracker")) {
        content = upsellInvest();
        upsellTriggered = true;
        upsellFeature = "investment_tracker";
        break;
      }
      if (/subscription/i.test(userText) && !canAccess(plan, "subscription_killer")) {
        content = upsellSubscriptions();
        upsellTriggered = true;
        upsellFeature = "subscription_killer";
        break;
      }
      if (/(bill|negotiat)/i.test(userText) && !canAccess(plan, "bill_negotiator")) {
        content = upsellBill();
        upsellTriggered = true;
        upsellFeature = "bill_negotiator";
        break;
      }
      content = general(ctx);
  }

  return { content, sessionType, upsellTriggered, upsellFeature };
};
