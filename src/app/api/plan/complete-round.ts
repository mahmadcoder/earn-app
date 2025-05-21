import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Replace this with your actual authentication/session logic
async function getUserId(): Promise<number | null> {
  // Example: extract userId from session/cookie
  // return req.session?.userId || null;
  return 1; // <-- Replace with real user ID
}

// Plans array (should match frontend)
const plans = [
  { priceUSD: 50, profitUSD: 2 },
  { priceUSD: 100, profitUSD: 4 },
  { priceUSD: 150, profitUSD: 6 },
  { priceUSD: 250, profitUSD: 10 },
  { priceUSD: 500, profitUSD: 20 },
  { priceUSD: 1000, profitUSD: 40 },
  { priceUSD: 1500, profitUSD: 60 },
  { priceUSD: 2500, profitUSD: 100 },
];

export async function POST(req: NextRequest) {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { planAmount } = await req.json();
  if (!planAmount) {
    return NextResponse.json(
      { error: "planAmount is required" },
      { status: 400 }
    );
  }

  const plan = plans.find((p) => p.priceUSD === planAmount);
  if (!plan) {
    return NextResponse.json({ error: "Invalid planAmount" }, { status: 400 });
  }

  const progress = await prisma.userPlanProgress.findUnique({
    where: { userId_planAmount: { userId, planAmount } },
  });
  if (!progress) {
    return NextResponse.json({ error: "Plan not selected" }, { status: 400 });
  }

  const now = new Date();
  if (progress.lastRoundDate) {
    const diff = now.getTime() - new Date(progress.lastRoundDate).getTime();
    if (diff < 24 * 60 * 60 * 1000) {
      const hoursLeft = 24 - Math.floor(diff / (60 * 60 * 1000));
      return NextResponse.json(
        { error: `Next round available in ${hoursLeft} hours` },
        { status: 403 }
      );
    }
  }

  const updated = await prisma.userPlanProgress.update({
    where: { userId_planAmount: { userId, planAmount } },
    data: {
      profit: progress.profit + plan.profitUSD,
      roundCount: progress.roundCount + 1,
      lastRoundDate: now,
      canWithdraw: true,
    },
  });

  return NextResponse.json({ success: true, progress: updated });
}
