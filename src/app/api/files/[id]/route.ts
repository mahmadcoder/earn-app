import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(request: NextRequest, { params }: Props) {
  try {
    const { id } = params;

    // Get file data from database
    const fileData = await prisma.fileUpload.findUnique({
      where: {
        id: id,
      },
    });

    if (!fileData) {
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    // Return the base64 data directly
    return new Response(fileData.fileData, {
      headers: {
        'Content-Type': fileData.fileType,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    console.error('Error serving file:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 