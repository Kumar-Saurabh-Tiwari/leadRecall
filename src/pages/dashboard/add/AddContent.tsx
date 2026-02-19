import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MediaUploadDialog } from '@/components/dashboard/MediaUploadDialog';
import { useAuth } from '@/contexts/AuthContext';
import { exhibitorService } from '@/services/exhibitorService';
import { attendeeService } from '@/services/attendeeService';

export default function AddContent() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleMediaUpload = (mediaUrl: string) => {
    // Navigate to content editor with uploaded media
    navigate('/dashboard/add/content/editor', { state: { mediaUrl } });
  };

  const handleScanChoice = (mode: 'text' | 'card') => {
    // Reuse ScanOCR page — pass scanMode + returnTo so ScanOCR can route back correctly
    navigate('/dashboard/add/scan-ocr', { state: { scanMode: mode, returnTo: '/dashboard/add/content/editor' } });
  };

  const getMediaUploadService = () => {
    return user?.role === 'exhibitor' ? exhibitorService : attendeeService;
  };

  return (
    <>
      <MediaUploadDialog
        open={true}
        onClose={() => navigate('/dashboard')}
        onMediaUpload={handleMediaUpload}
        onScanChoice={(mode) => handleScanChoice(mode)}
        title="Upload Content Image"
        description="Take a photo or upload an image for your content"
        getDirectURL={getMediaUploadService().getDirectURL.bind(getMediaUploadService())}
      />
    </>
  );
}
