import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// TODO: Replace this with your actual authentication/session logic
async function getUserId(): Promise<number | null> {
  // Example: extract userId from session/cookie
  // return req.session?.userId || null;
  return 1; // <-- Replace with real user ID
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const progresses = await prisma.userPlanProgress.findMany({
    where: { userId },
  });

  return NextResponse.json({ success: true, progresses });
}
