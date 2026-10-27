import React from 'react';

/**
 * ParcelProof Custom Brand SVG Logo
 * Combines a geometric parcel isometric form with an integrated verification shield.
 * 
 * @param {string} variant - 'light' (white text for dark backgrounds) or 'dark' (charcoal text for light backgrounds)
 * @param {boolean} iconOnly - whether to display only the emblem or include the wordmark
 * @param {string} size - 'sm' | 'md' | 'lg'
 * @param {string} className - extra CSS classes
 */
export const ParcelProofLogo = ({
  variant = 'dark',
  iconOnly = false,
  size = 'md',
  className = '',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const isLight = variant === 'light';
  const textColor = isLight ? 'text-white' : 'text-[#202329]';
  const subtextColor = isLight ? 'text-gray-400' : 'text-[#667085]';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* SVG Emblem Mark */}
      <div className={`relative flex-shrink-0 ${iconSizes[size] || iconSizes.md}`}>
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-sm"
        >
          {/* Subtle Outer Shield Protection Contour */}
          <path
            d="M24 2.5L7 8.5V22C7 33.2 14.3 43.5 24 46.5C33.7 43.5 41 33.2 41 22V8.5L24 2.5Z"
            fill={isLight ? '#1F2228' : '#17191D'}
            stroke={isLight ? '#323741' : '#2A2E37'}
            strokeWidth="1.5"
          />

          {/* Isometric Parcel Top Flap - Primary Red */}
          <polygon
            points="24,9.5 35,15.5 24,21.5 13,15.5"
            fill="#DC161F"
          />

          {/* Left Parcel Facet - Red Hover Shadow */}
          <polygon
            points="13,16.5 23,22 23,34.5 13,29"
            fill="#B90F18"
          />

          {/* Right Parcel Facet - Crisp Clean Grey/White */}
          <polygon
            points="25,22 35,16.5 35,29 25,34.5"
            fill="#FFFFFF"
            fillOpacity="0.95"
          />

          {/* Central Verification Joint Node */}
          <circle cx="24" cy="22" r="2.2" fill="#FFFFFF" />

          {/* Cryptographic Checkmark Vector */}
          <path
            d="M20 28.5L23 31.5L28.5 25.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* Wordmark */}
      {!iconOnly && (
        <div className="flex flex-col leading-none">
          <div className={`font-heading font-extrabold tracking-tight ${textColor} ${textSizes[size] || textSizes.md}`}>
            <span>Parcel</span>
            <span className="text-brand-red">Proof</span>
          </div>
          <span className={`text-[9px] uppercase tracking-widest font-semibold mt-0.5 ${subtextColor}`}>
            Dispute Evidence System
          </span>
        </div>
      )}
    </div>
  );
};

export default ParcelProofLogo;
