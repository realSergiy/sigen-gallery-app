import { useState } from 'react';
import { VideoFormData, formHasTextContent } from '.';

const useVideoFormParent = ({ videoForm }: { videoForm?: Partial<VideoFormData> }) => {
  const [pending, setIsPending] = useState(false);
  const [updatedTitle, setUpdatedTitle] = useState('');
  const [hasTextContent, setHasTextContent] = useState(
    videoForm ? formHasTextContent(videoForm) : false,
  );

  return {
    pending,
    setIsPending,
    updatedTitle,
    setUpdatedTitle,
    hasTextContent,
    setHasTextContent,
  };
};

export default useVideoFormParent;
