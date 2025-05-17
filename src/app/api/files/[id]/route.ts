import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(
  req: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = context.params;

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
      fileId: context.params.id,
      timestamp: new Date().toISOString()
    });
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 