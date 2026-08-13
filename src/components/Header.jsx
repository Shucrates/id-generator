import React from 'react';

export default function Header({ template }) {
  const displayName = template?.name ? template.name.toLowerCase() : 'tasm: oscorp staff id';
  return (
    <header className="w-full py-2 sm:py-4 px-4 flex items-center justify-center text-center">
      <h1
        className="text-[clamp(24px,3.2vw,36px)] font-normal text-[#1d19ea] tracking-tight leading-none my-1 sm:my-0"
        style={{ fontFamily: "'Arial Narrow', 'Arial', sans-serif" }}
      >
        {displayName}
      </h1>
    </header>
  );
}
