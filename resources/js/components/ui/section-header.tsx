import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  center?: boolean;
  light?: boolean;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, center = false, light = false }) => {
  return (
    <div className={`mb-12 ${center ? 'text-center' : 'text-left'}`}>
      <h2 className={`font-serif text-4xl md:text-5xl mb-4 ${light ? 'text-white' : 'text-zinc-900'}`}>
        {title}
      </h2>
      {subtitle && (
        <p className={`font-sans text-sm md:text-base max-w-2xl ${center ? 'mx-auto' : ''} ${light ? 'text-zinc-300' : 'text-zinc-500'}`}>
          {subtitle}
        </p>
      )}
    </div>
  );
};