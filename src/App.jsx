import React, { useState } from 'react';
import Header from './components/Header';
import DualCardView from './components/DualCardView';
import ImageCropModal from './components/ImageCropModal';
import ExportActions from './components/ExportActions';
import { TEMPLATES } from './config/templates';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const activeTemplate = TEMPLATES[0];

  const [userData, setUserData] = useState(activeTemplate.defaultValues);
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Photo crop modal state
  const [rawPhotoSrc, setRawPhotoSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  const handleOpenCropModal = (photoDataUrl) => {
    setRawPhotoSrc(photoDataUrl);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedDataUrl) => {
    setCroppedPhotoUrl(croppedDataUrl);
  };

  const handleBackToDefault = () => {
    setIsCustomMode(false);
  };

  const handleCreateYourOwn = () => {
    setUserData((prev) => ({
      ...prev,
      name: ''
    }));
    setIsCustomMode(true);
  };

  return (
    <div className="min-h-screen bg-wireframe text-slate-900 flex flex-col items-center justify-between font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header Title */}
      <div className="w-full relative max-w-6xl mx-auto flex items-center justify-center">
        {isCustomMode && (
          <button
            onClick={handleBackToDefault}
            className="absolute left-6 top-8 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black transition"
            title="Back to Default View"
          >
            <ArrowLeft className="w-4 h-4" /> Default
          </button>
        )}
        <Header isCustomMode={isCustomMode} />
      </div>

      {/* Main Dual-Card Display (Front & Back Side-by-Side) */}
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 flex flex-col items-center justify-center">
        <DualCardView
          template={activeTemplate}
          userData={userData}
          setUserData={setUserData}
          croppedPhotoUrl={croppedPhotoUrl}
          onOpenCropModal={handleOpenCropModal}
          isCustomMode={isCustomMode}
        />

        {/* Wireframe Bottom Action Buttons */}
        <ExportActions
          template={activeTemplate}
          userData={userData}
          croppedPhotoUrl={croppedPhotoUrl}
          isCustomMode={isCustomMode}
          setIsCustomMode={setIsCustomMode}
          onCustomModeTrigger={handleCreateYourOwn}
        />
      </main>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawPhotoSrc}
        aspectRatio={752 / 940} // Aspect ratio for the card photo area
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
