import React, { useState, useEffect, useCallback } from 'react';
import Header from './components/Header';
import DualCardView from './components/DualCardView';
import ImageCropModal from './components/ImageCropModal';
import ExportActions from './components/ExportActions';
import LandingPage from './components/LandingPage';
import TemplatePicker from './components/TemplatePicker';
import ThankYouPage from './components/ThankYouPage';
import { TEMPLATES } from './config/templates';
import { playRetroClickSound } from './utils/soundUtils';
import { ArrowLeft } from 'lucide-react';

/* ── Map URL hash → screen & templateId ── */
function parseHash() {
  const hash = window.location.hash.replace('#', '');
  if (!hash) return { screen: 'landing', templateId: 'oscorp-staff' };
  if (hash === 'templates') return { screen: 'templates', templateId: 'oscorp-staff' };
  if (hash === 'thankyou') return { screen: 'thankyou', templateId: localStorage.getItem('selectedTemplateId') || 'oscorp-staff' };

  if (hash.startsWith('editor')) {
    let templateId = 'oscorp-staff';
    if (hash.includes('/')) {
      templateId = hash.split('/')[1];
    } else if (hash.includes('template=')) {
      templateId = hash.split('template=')[1].split('&')[0];
    } else {
      templateId = localStorage.getItem('selectedTemplateId') || 'oscorp-staff';
    }
    const valid = TEMPLATES.some((t) => t.id === templateId);
    return { screen: 'editor', templateId: valid ? templateId : 'oscorp-staff' };
  }

  return { screen: 'landing', templateId: 'oscorp-staff' };
}

export default function App() {
  const initialRoute = parseHash();
  const [selectedTemplateId, setSelectedTemplateId] = useState(initialRoute.templateId);
  const [currentScreen, setCurrentScreen] = useState(initialRoute.screen);

  const activeTemplate = TEMPLATES.find((t) => t.id === selectedTemplateId) || TEMPLATES[0];

  const [userData, setUserData] = useState(() => activeTemplate.defaultValues);
  const [croppedPhotoUrl, setCroppedPhotoUrl] = useState(null);
  const [isCustomMode, setIsCustomMode] = useState(false);

  // New Editor Toggles: Back Panel Version, Cutting Guides & TVA Photo Filter
  const [backVersion, setBackVersion] = useState('oscorp-symbol'); // 'oscorp-symbol' | 'custom-qr'
  const [showCuttingGuides, setShowCuttingGuides] = useState(false);
  const [applyTvaFilter, setApplyTvaFilter] = useState(true);
  const [tvaFilterIntensity, setTvaFilterIntensity] = useState(45); // 0 to 100%

  // Photo crop modal state
  const [rawPhotoSrc, setRawPhotoSrc] = useState(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);

  /* ── Navigate with history ── */
  const navigateTo = useCallback((screen, templateId = selectedTemplateId) => {
    setCurrentScreen(screen);
    setSelectedTemplateId(templateId);
    localStorage.setItem('selectedTemplateId', templateId);

    let hash = '';
    if (screen === 'editor') {
      hash = `#editor/${templateId}`;
    } else if (screen === 'templates') {
      hash = '#templates';
    } else if (screen === 'thankyou') {
      hash = '#thankyou';
    }

    window.history.pushState({ screen, templateId }, '', `/${hash}`);
  }, [selectedTemplateId]);

  /* ── Pre-cache template images for instant rendering ── */
  useEffect(() => {
    const urls = [
      '/richard-parker-default-front.png',
      '/richard-parker-default-front-notch.png',
      '/oscorp-custom-front-clean.png',
      '/oscorp-custom-front-clean-notch.png',
      '/oscorp-back-symbol.png',
      '/oscorp-back-symbol-notch.png',
      '/oscorp-custom-back.png',
      '/richard-parker-default-back.png',
      '/oscorp-back-qr-notch.png',
      '/tva-loki-card-stacked.png',
      '/tva-loki-default-front.png',
      '/tva-loki-back.png',
      '/tva-loki-custom-front.png'
    ];
    urls.forEach((url) => {
      const img = new Image();
      img.src = url;
    });
  }, []);

  /* ── Listen for browser back / forward ── */
  useEffect(() => {
    const onPopState = () => {
      const route = parseHash();
      setCurrentScreen(route.screen);
      if (route.templateId && route.templateId !== selectedTemplateId) {
        setSelectedTemplateId(route.templateId);
        const t = TEMPLATES.find((item) => item.id === route.templateId) || TEMPLATES[0];
        setUserData(t.defaultValues);
        setCroppedPhotoUrl(null);
        setIsCustomMode(false);
      }
    };
    window.addEventListener('popstate', onPopState);

    // Set initial history state if none exists
    if (!window.history.state?.screen) {
      const route = parseHash();
      const hash = route.screen === 'landing' ? '' : (route.screen === 'editor' ? `#editor/${route.templateId}` : `#${route.screen}`);
      window.history.replaceState({ screen: route.screen, templateId: route.templateId }, '', `/${hash}`);
    }

    return () => window.removeEventListener('popstate', onPopState);
  }, [selectedTemplateId]);

  const handleOpenCropModal = (photoDataUrl) => {
    setRawPhotoSrc(photoDataUrl);
    setIsCropModalOpen(true);
  };

  const handleCropComplete = (croppedDataUrl) => {
    setCroppedPhotoUrl(croppedDataUrl);
  };

  const handleBackToTemplates = () => {
    playRetroClickSound();
    navigateTo('templates');
  };

  const handleSelectTemplate = (templateId) => {
    setSelectedTemplateId(templateId);
    const t = TEMPLATES.find((item) => item.id === templateId) || TEMPLATES[0];
    setUserData(t.defaultValues);
    setCroppedPhotoUrl(null);
    setIsCustomMode(false);
    localStorage.setItem('selectedTemplateId', templateId);
    navigateTo('editor', templateId);
  };

  const handleCreateYourOwn = () => {
    setUserData((prev) => ({
      ...prev,
      name: activeTemplate.id === 'loki-tva-id' ? 'Loki' : ''
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
        onSelectTemplate={(templateId) => {
          handleSelectTemplate(templateId);
        }}
        onBack={() => navigateTo('landing')}
      />
    );
  }

  // Screen 4: Thank You Page (Shown after download)
  if (currentScreen === 'thankyou') {
    return (
      <ThankYouPage
        onBackToTemplates={() => navigateTo('templates')}
        onMakeAnother={() => navigateTo('editor')}
      />
    );
  }

  // Screen 3: Card Editor Page (Fits completely in 100vh window on desktop, scrollable on mobile)
  return (
    <div className="min-h-screen sm:h-screen sm:max-h-screen overflow-y-auto sm:overflow-hidden bg-wireframe text-slate-900 flex flex-col justify-between items-center py-2 px-4 font-sans selection:bg-slate-900 selection:text-white">
      {/* Top Header Title */}
      <div className="w-full relative max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-center pt-3 pb-1 px-4">
        <button
          onClick={handleBackToTemplates}
          className="self-start sm:absolute sm:left-6 sm:top-6 inline-flex items-center gap-2 text-[clamp(18px,2vw,26px)] font-normal text-black hover:opacity-75 transition cursor-pointer select-none border-none bg-transparent p-0 z-20 mb-2 sm:mb-0"
          style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
          title="Back to Templates"
        >
          <span style={{ fontSize: '1.2em', lineHeight: 1 }}>←</span> templates
        </button>
        <Header template={activeTemplate} isCustomMode={isCustomMode} />
      </div>

      {/* Main Dual-Card Display & Controls */}
      <main className="flex-1 w-full max-w-6xl mx-auto flex flex-col items-center justify-center overflow-hidden py-1">
        <DualCardView
          template={activeTemplate}
          userData={userData}
          setUserData={setUserData}
          croppedPhotoUrl={croppedPhotoUrl}
          onOpenCropModal={handleOpenCropModal}
          isCustomMode={isCustomMode}
          backVersion={backVersion}
          setBackVersion={setBackVersion}
          showCuttingGuides={showCuttingGuides}
          setShowCuttingGuides={setShowCuttingGuides}
          applyTvaFilter={applyTvaFilter}
          setApplyTvaFilter={setApplyTvaFilter}
          tvaFilterIntensity={tvaFilterIntensity}
          setTvaFilterIntensity={setTvaFilterIntensity}
        />

        {/* Wireframe Bottom Action Buttons */}
        <ExportActions
          template={activeTemplate}
          userData={userData}
          croppedPhotoUrl={croppedPhotoUrl}
          isCustomMode={isCustomMode}
          setIsCustomMode={setIsCustomMode}
          onCustomModeTrigger={handleCreateYourOwn}
          backVersion={backVersion}
          showCuttingGuides={showCuttingGuides}
          applyTvaFilter={applyTvaFilter}
          tvaFilterIntensity={tvaFilterIntensity}
          onDownloadComplete={() => navigateTo('thankyou')}
        />
      </main>

      {/* Image Crop Modal */}
      <ImageCropModal
        isOpen={isCropModalOpen}
        imageSrc={rawPhotoSrc}
        aspectRatio={activeTemplate.id === 'loki-tva-id' ? (260 / 338) : (752 / 940)}
        onClose={() => setIsCropModalOpen(false)}
        onCropComplete={handleCropComplete}
      />
    </div>
  );
}
