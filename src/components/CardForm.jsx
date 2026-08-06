import React from 'react';
import { generateRandomID } from '../utils/idGenerator';
import { Upload, Dices, Sparkles, User, Briefcase, Building, Hash, Calendar, Shield } from 'lucide-react';

export default function CardForm({
  userData,
  setUserData,
  onOpenCropModal,
  croppedPhotoUrl,
  template,
  onFillSampleData
}) {
  const handleChange = (field, value) => {
    setUserData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegenerateId = () => {
    const prefix = template.id === 'template-2' ? 'PX' : template.id === 'template-3' ? 'PRESS' : 'EMP';
    handleChange('idNumber', generateRandomID(prefix));
  };

  const handlePhotoSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        onOpenCropModal(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col gap-6">
      {/* Form Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400" /> Card Details
          </h2>
          <p className="text-xs text-slate-400">Fill in the fields to update your badge in real-time.</p>
        </div>

        <button
          onClick={onFillSampleData}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 text-xs font-semibold rounded-lg border border-sky-500/20 transition active:scale-95"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Fill Sample
        </button>
      </div>

      {/* Photo Upload Box */}
      <div>
        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
          Badge Photo
        </label>
        <div className="flex items-center gap-4">
          {/* Photo Thumbnail */}
          <div className="w-20 h-24 rounded-xl border border-slate-700 bg-slate-950 overflow-hidden relative group flex-shrink-0 shadow-inner">
            {croppedPhotoUrl ? (
              <img src={croppedPhotoUrl} alt="Badge Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] p-2 text-center">
                <User className="w-6 h-6 mb-1 opacity-50" />
                No Photo
              </div>
            )}
          </div>

          {/* Upload Button */}
          <div className="flex-1 flex flex-col gap-2">
            <label className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 cursor-pointer transition shadow-sm">
              <Upload className="w-4 h-4 text-sky-400" />
              <span>{croppedPhotoUrl ? 'Change / Crop Photo' : 'Upload Photo'}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="hidden"
              />
            </label>
            <p className="text-[11px] text-slate-400">
              Supports JPG, PNG, WEBP. Drag/zoom photo cropping opens automatically.
            </p>
          </div>
        </div>
      </div>

      {/* Input Fields Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Full Name
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. SARAH JENNINGS"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>
        </div>

        {/* Job Title / Role */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Title / Role
          </label>
          <div className="relative">
            <Briefcase className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userData.title || ''}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Senior Product Designer"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>
        </div>

        {/* Department */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Department
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userData.department || ''}
              onChange={(e) => handleChange('department', e.target.value)}
              placeholder="ENGINEERING & UX"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>
        </div>

        {/* ID Number + Regenerate */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            ID Number
          </label>
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Hash className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={userData.idNumber || ''}
                onChange={(e) => handleChange('idNumber', e.target.value)}
                placeholder="EMP-849201"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 font-mono placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
              />
            </div>
            <button
              onClick={handleRegenerateId}
              title="Regenerate Random ID"
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-sky-400 rounded-xl border border-slate-700 transition active:scale-95"
            >
              <Dices className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Issue Date */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Issue Date / Validity
          </label>
          <div className="relative">
            <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userData.issueDate || ''}
              onChange={(e) => handleChange('issueDate', e.target.value)}
              placeholder="2026.01.15"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>
        </div>

        {/* Access Clearance Level */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
            Access Clearance Level (Back Side)
          </label>
          <div className="relative">
            <Shield className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={userData.accessLevel || ''}
              onChange={(e) => handleChange('accessLevel', e.target.value)}
              placeholder="LEVEL 4 — FULL ACCESS"
              className="w-full pl-9 pr-3 py-2.5 bg-slate-950/80 border border-slate-800 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
