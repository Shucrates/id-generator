import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DualCardView from './components/DualCardView';
import ImageCropModal from './components/ImageCropModal';
import ExportActions from './components/ExportActions';
import LandingPage from './components/LandingPage';
import TemplatePicker from './components/TemplatePicker';
import { TEMPLATES } from './config/templates';
import { ArrowLeft } from 'lucide-react';

/* ── Map URL hash → screen name ── */
function screenFromHash() {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'templates') return 'templates';
  if (hash === 'editor') return 'editor';
  return 'landing';
}

export default function App() {
  const activeTemplate = TEMPLATES[0];

  // Initialise from current URL hash so refreshes stay on the right page
  const [currentScreen, setCurrentScreen] = useState(screenFromHash);

  const [userData, setUserData] = useState(activeTemplate.defaultValues);
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // Photo crop modal state
  const [rawPhotoSrc, setRawPhotoSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  /* ── Navigate with history ── */
  const navigateTo = useCallback((screen) => {
    setCurrentScreen(screen);
    const hash = screen === 'landing' ? '' : `#${screen}`;
    window.history.pushState({ screen }, '', `/${hash}`);
  }, []);

  /* ── Listen for browser back / forward ── */
  useEffect(() => {
    const onPopState = () => {
      setCurrentScreen(screenFromHash());
    };
    window.addEventListener('popstate', onPopState);

    // Set initial history state if none exists
    if (!window.history.state?.screen) {
      const initial = screenFromHash();
      const hash = initial === 'landing' ? '' : `#${initial}`;
      window.history.replaceState({ screen: initial }, '', `/${hash}`);
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const handleOpenCropModal = (photoDataUrl) => {
    setRawPhotoSrc(photoDataUrl);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedDataUrl) => {
    setCroppedPhotoUrl(croppedDataUrl);
  };

  const handleBackToDefault = () => {
    if (isCustomMode) {
      setIsCustomMode(false);
    } else {
      navigateTo('templates');
    }
  };

  const handleCreateYourOwn = () => {
    setUserData((prev) => ({
      ...prev,
      name: ''
    }));
    setIsCustomMode(true);
  };

  // Screen 1: Initial Dashboard Landing Page
  if (currentScreen === 'landing') {
    return <LandingPage onBrowseTemplates={() => navigateTo('templates')} />;
  }

  // Screen 2: Templates Picker Page
  if (currentScreen === 'templates') {
    return (
      <TemplatePicker
        onSelectTemplate={() => {
          setIsCustomMode(false);
          navigateTo('editor');
        }}
        onBack={() => navigateTo('landing')}
      />
    );
  }

  // Screen 3: Card Editor Page (Current Editor View)
  return (
    <div className="min-h-screen bg-wireframe text-slate-900 flex flex-col items-center justify-between font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header Title */}
      <div className="w-full relative max-w-6xl mx-auto flex items-center justify-center">
        <button
          onClick={handleBackToDefault}
          className="absolute left-6 top-8 flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-black transition cursor-pointer"
          title={isCustomMode ? "Back to Default View" : "Back to Templates"}
        >
          <ArrowLeft className="w-4 h-4" /> {isCustomMode ? "Default" : "Templates"}
        </button>
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
