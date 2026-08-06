import React from 'react';

export default function Header({ isCustomMode }) {
  return (
    <header className="w-full py-8 px-4 flex items-center justify-center text-center">
      <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 tracking-tight">
        {isCustomMode
          ? "Richard Parker ID from TASM"
          : "CUSTOM ID CARD GENERATOR V1 (more layouts soon!)"}
      </h1>
    </header>
  );
}
