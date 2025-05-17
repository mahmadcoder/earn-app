import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Get file data from database
    const fileData = await prisma.fileUpload.findUnique({
      where: {
        id: id,
      },
    });

    if (!fileData) {
      return new NextResponse('File not found', { status: 404 });
    }

    // Return the base64 data directly
    return new NextResponse(fileData.fileData, {
      headers: {
        'Content-Type': fileData.fileType,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 