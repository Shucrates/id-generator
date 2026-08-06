import React from 'react';
import { TEMPLATES } from '../config/templates';
import { X, Check, Layers, Sparkles } from 'lucide-react';

export default function TemplatePicker({ isOpen, onClose, currentTemplateId, onSelectTemplate }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-100">Select Template Design</h2>
              <p className="text-xs text-slate-400">Pick a badge style to customize. Form data is preserved!</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Template Grid */}
        <div className="p-6 overflow-y-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {TEMPLATES.map((tmpl) => {
            const isSelected = tmpl.id === currentTemplateId;
            return (
              <div
                key={tmpl.id}
                onClick={() => {
                  onSelectTemplate(tmpl.id);
                  onClose();
                }}
                className={`group relative cursor-pointer rounded-xl border p-4 transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'border-sky-500 bg-sky-500/10 ring-2 ring-sky-500/30'
                    : 'border-slate-800 bg-slate-950/60 hover:border-slate-700 hover:bg-slate-800/50'
                }`}
              >
                <div>
                  {/* Category Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {tmpl.category}
                    </span>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-xs font-bold text-sky-400 bg-sky-500/20 px-2 py-0.5 rounded-md">
                        <Check className="w-3.5 h-3.5" /> Active
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Art Mockup */}
                  <div className="aspect-[638/1000] w-full rounded-lg overflow-hidden border border-slate-700/60 relative bg-slate-900 group-hover:scale-[1.02] transition-transform duration-300">
                    <img
                      src={tmpl.backgroundFront}
                      alt={tmpl.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-transparent to-transparent flex items-end p-4">
                      <img src={tmpl.backgroundFront} className="hidden" alt="preload" />
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h3 className="mt-4 font-bold text-slate-100 text-base group-hover:text-sky-400 transition">
                    {tmpl.name}
                  </h3>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    {tmpl.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span>Aspect: Vertical 638x1000</span>
                  <span className="text-sky-400 font-semibold group-hover:underline">
                    {isSelected ? 'Currently Selected' : 'Use Template →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
