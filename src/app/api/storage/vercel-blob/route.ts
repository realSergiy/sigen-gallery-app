import { auth } from '@/auth';
import { revalidateAdminPaths, revalidatePhotosKey } from '@/photo/cache';
import { ACCEPTED_PHOTO_FILE_TYPES, MAX_PHOTO_UPLOAD_SIZE_IN_BYTES } from '@/photo';
import { isPhotoUploadPathnameValid, isVideoUploadPathnameValid } from '@/services/storage';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';
import { ACCEPTED_VIDEO_FILE_TYPES, MAX_VIDEO_UPLOAD_SIZE_IN_BYTES } from '@/video';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async pathname => {
        const session = await auth();
        if (session?.user) {
          if (isPhotoUploadPathnameValid(pathname)) {
            return {
              maximumSizeInBytes: MAX_PHOTO_UPLOAD_SIZE_IN_BYTES,
              allowedContentTypes: ACCEPTED_PHOTO_FILE_TYPES,
            };
          } else if (isVideoUploadPathnameValid(pathname)) {
            return {
              maximumSizeInBytes: MAX_VIDEO_UPLOAD_SIZE_IN_BYTES,
              allowedContentTypes: ACCEPTED_VIDEO_FILE_TYPES,
            };
          } else {
            throw new Error('Invalid upload path: ' + pathname);
          }
        } else {
          throw new Error('Unauthenticated upload');
        }
      },
      // This argument is required, but doesn't seem to fire
      onUploadCompleted: async () => {
        revalidatePhotosKey();
        revalidateAdminPaths();
      },
    });
    revalidatePhotosKey();
    revalidateAdminPaths();

    console.log('Upload completed:', jsonResponse);
    return NextResponse.json(jsonResponse);
  } catch (e) {
    console.error('Error uploading file:', e);
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
