'use client';

import { PATH_ADMIN_PHOTOS } from '@/site/paths';
import { useAppState } from '@/state/AppState';
import VideoUpload from '@/video/VideoUpload';
import Link from 'next/link';
import { FaArrowRight } from 'react-icons/fa';

export default function AdminCTA() {
  const { isUserSignedIn } = useAppState();

  return (
    <div className="flex justify-center pt-4">
      {isUserSignedIn ? (
        <VideoUpload />
      ) : (
        <Link href={PATH_ADMIN_PHOTOS} className="button primary">
          <span>Admin Dashboard</span>
          <FaArrowRight size={10} />
        </Link>
      )}
    </div>
  );
}
