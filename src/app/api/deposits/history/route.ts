import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, AuthRequest } from '../../auth/middleware';

// Handler for GET requests (protected by auth)
async function getDepositHistory(request: AuthRequest) {
  try {
    // User is already authenticated via middleware
    const userId = request.user?.id;
    
    // Get URL params
    const url = new URL(request.url);
    const queryUserId = url.searchParams.get('userId');
    
    // Ensure the user is only accessing their own deposits
    // or is an admin (for future admin functionality)
    if (queryUserId && Number(queryUserId) !== userId && request.user?.email !== 'admin@gmail.com') {
      return NextResponse.json(
        { message: 'Unauthorized access' },
        { status: 403 }
      );
    }
    
    // Use the query user ID if provided, otherwise use the authenticated user's ID
    const targetUserId = queryUserId ? Number(queryUserId) : userId;
    
    // Get user deposits from database
    const deposits = await prisma.deposit.findMany({
      where: {
        userId: targetUserId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json({
      deposits
    }, { status: 200 });
  } catch (error) {
    console.error('Deposit history fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export the handler wrapped with authentication middleware
export const GET = requireAuth(getDepositHistory);
