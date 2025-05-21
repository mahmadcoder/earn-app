import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Replace this with your actual authentication/session logic
async function getUserId(): Promise<number | null> {
  // Example: extract userId from session/cookie
  // return req.session?.userId || null;
  return 1; // <-- Replace with real user ID
}

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

  // Upsert UserPlanProgress
  const progress = await prisma.userPlanProgress.upsert({
    where: { userId_planAmount: { userId, planAmount } },
    update: {},
    create: {
      userId,
      planAmount,
    },
  });

  return NextResponse.json({ success: true, progress });
}
