import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const fileUpload = await prisma.fileUpload.findUnique({
      where: { id: params.id }
    });

    if (!fileUpload) {
      return NextResponse.json(
        { message: 'File not found' },
        { status: 404 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(fileUpload.fileData, 'base64');

    // Create response with appropriate headers
    return new NextResponse(buffer, {
      headers: {
        'Content-Type': fileUpload.fileType,
        'Content-Disposition': `inline; filename="${fileUpload.fileName}"`,
      },
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 