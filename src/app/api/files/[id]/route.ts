import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Log the incoming request
    console.log(`[File Request] Attempting to fetch file with ID: ${id}`);

    // Get file data from database
    const fileData = await prisma.fileUpload.findUnique({
      where: {
        id: id,
      },
    });

    if (!fileData) {
      console.warn(`[File Not Found] File with ID ${id} was not found in the database`);
      return Response.json({ error: 'File not found' }, { status: 404 });
    }

    console.log(`[File Served] Successfully served file: ${id}, type: ${fileData.fileType}`);

    // Return the base64 data directly
    return new Response(fileData.fileData, {
      headers: {
        'Content-Type': fileData.fileType,
        'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
      }
    });
  } catch (error) {
    // Enhanced error logging
    console.error('[File Service Error]', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fileId: params.id,
      timestamp: new Date().toISOString()
    });
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 