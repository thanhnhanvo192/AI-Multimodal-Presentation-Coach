import React from "react";

export interface BrandLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
  height?: number | string;
  width?: number | string;
  inlineSvg?: boolean;
  alt?: string;
}

export function BrandLogo({
  className = "",
  height = 36,
  width,
  inlineSvg = false,
  alt = "AI Coach Logo",
  style,
  ...props
}: BrandLogoProps) {
  const computedHeight = typeof height === "number" ? `${height}px` : height;
  const computedWidth = width !== undefined ? (typeof width === "number" ? `${width}px` : width) : "auto";

  if (inlineSvg) {
    return (
      <div
        className={`inline-flex items-center select-none ${className}`}
        style={{
          height: computedHeight,
          width: computedWidth,
          aspectRatio: "250 / 64",
          ...style,
        }}
        {...props}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 250 64"
          className="w-full h-full"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="gb" x1="0" y1="1" x2="0.4" y2="0">
              <stop offset="0" stopColor="#1F8A5B" />
              <stop offset="0.55" stopColor="#2DD4A0" />
              <stop offset="1" stopColor="#22C3E6" />
            </linearGradient>
            <linearGradient
              id="gt2"
              gradientUnits="userSpaceOnUse"
              x1="128"
              y1="50"
              x2="240"
              y2="16"
            >
              <stop offset="0" stopColor="#1F8A5B" />
              <stop offset="0.6" stopColor="#27C79A" />
              <stop offset="1" stopColor="#22C3E6" />
            </linearGradient>
          </defs>
          <g transform="translate(6 0) skewX(-8)" fill="url(#gb)">
            <rect x="4" y="44" width="10" height="14" rx="5" />
            <rect x="18" y="34" width="10" height="24" rx="5" />
            <rect x="32" y="22" width="10" height="36" rx="5" />
            <rect x="46" y="16" width="10" height="42" rx="5" />
            <circle cx="51" cy="6" r="5" />
          </g>
          <text
            x="78"
            y="43"
            fontFamily="Poppins, Nunito, 'Segoe UI', Arial, sans-serif"
            fontSize="30"
            fontWeight="800"
            fill="#14352A"
            letterSpacing="-0.5"
          >
            AI <tspan fill="url(#gt2)">Coach</tspan>
          </text>
        </svg>
      </div>
    );
  }

  return (
    <img
      src="/logo.svg"
      alt={alt}
      className={`select-none object-contain ${className}`}
      style={{
        height: computedHeight,
        width: computedWidth,
        aspectRatio: "250 / 64",
        maxWidth: "100%",
        ...style,
      }}
      {...(props as React.ImgHTMLAttributes<HTMLImageElement>)}
    />
  );
}

export default BrandLogo;
