import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, AuthRequest } from "../../auth/middleware";

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

export const POST = requireAuth(async (req: AuthRequest) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      console.log("[COMPLETE ROUND API] No userId in request");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { planAmount } = await req.json();
    console.log(
      `[COMPLETE ROUND API] userId: ${userId}, planAmount: ${planAmount}`
    );
    if (!planAmount) {
      return NextResponse.json(
        { error: "planAmount is required" },
        { status: 400 }
      );
    }
    const plan = plans.find((p) => p.priceUSD === planAmount);
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    // Check if user has an active deposit for this plan
    const activeDeposit = await prisma.deposit.findFirst({
      where: {
        userId: userId,
        status: { in: ["pending", "confirmed"] },
        amount: {
          gte: planAmount,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    console.log("[COMPLETE ROUND API] activeDeposit:", activeDeposit);
    if (!activeDeposit) {
      return NextResponse.json(
        { error: "No active deposit found for this plan" },
        { status: 400 }
      );
    }
    // Find or create user plan progress
    let progress = await prisma.userPlanProgress.findUnique({
      where: {
        userId_planAmount: {
          userId: userId,
          planAmount,
        },
      },
    });
    console.log("[COMPLETE ROUND API] Existing progress:", progress);
    if (!progress) {
      progress = await prisma.userPlanProgress.create({
        data: {
          userId: userId,
          planAmount,
          profit: 0,
          roundCount: 0,
          canWithdraw: false,
        },
      });
      console.log("[COMPLETE ROUND API] Created new progress:", progress);
    }
    // Check if user can start a new round (next midnight cooldown)
    const now = new Date();
    if (progress.lastRoundDate) {
      const lastRound = new Date(progress.lastRoundDate);
      // Compare only the date part (YYYY-MM-DD) in UTC
      const nowDate = now.toISOString().slice(0, 10);
      const lastRoundDate = lastRound.toISOString().slice(0, 10);
      if (nowDate === lastRoundDate) {
        return NextResponse.json(
          {
            error:
              "You can only complete one round per day. Please try again tomorrow.",
            canTryAgainIn: 24 * 60 * 60 * 1000, // 24 hours in ms
          },
          { status: 400 }
        );
      }
    }
    // Calculate profit for this round
    const profitForThisRound = plan.profitUSD;
    // Update progress with new round
    const updatedProgress = await prisma.userPlanProgress.update({
      where: {
        userId_planAmount: {
          userId: userId,
          planAmount,
        },
      },
      data: {
        profit: {
          increment: profitForThisRound,
        },
        roundCount: {
          increment: 1,
        },
        lastRoundDate: now,
        canWithdraw: true, // Always set to true after completing a round
      },
    });
    // Update user's daily streak in User table
    const user = await prisma.user.findUnique({ where: { id: userId } });
    let newStreak = 1;
    if (user?.lastStreakDate) {
      const lastStreakDate = new Date(user.lastStreakDate);
      const lastStreakDateStr = lastStreakDate.toISOString().slice(0, 10);
      const todayStr = now.toISOString().slice(0, 10);
      const diffDays = Math.floor(
        (new Date(todayStr).getTime() - new Date(lastStreakDateStr).getTime()) /
          (1000 * 60 * 60 * 24)
      );
      if (lastStreakDateStr === todayStr) {
        newStreak = user.dailyStreak || 1;
      } else if (diffDays === 1) {
        newStreak = (user.dailyStreak || 0) + 1;
      } else {
        newStreak = 1;
      }
    }
    await prisma.user.update({
      where: { id: userId },
      data: {
        dailyStreak: newStreak,
        lastStreakDate: now,
      },
    });
    console.log("[COMPLETE ROUND API] Updated progress:", updatedProgress);
    // Calculate total profit for all plans for this user
    const allProgresses = await prisma.userPlanProgress.findMany({
      where: { userId: userId },
    });
    const totalProfit = allProgresses.reduce(
      (sum, p) => sum + (p.profit || 0),
      0
    );
    const responseObj = {
      success: true,
      progress: {
        ...updatedProgress,
        canWithdraw: true,
        profit: updatedProgress.profit,
        roundCount: updatedProgress.roundCount,
      },
      profitEarned: profitForThisRound,
      totalProfit,
      canWithdrawNow: true,
    };
    console.log("[COMPLETE ROUND API] Response:", responseObj);
    return NextResponse.json(responseObj);
  } catch (error) {
    console.error("[COMPLETE ROUND API] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
});
