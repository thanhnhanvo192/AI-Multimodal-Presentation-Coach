/* ── Common Icons for AI Multimodal Presentation Coach ─────────────────── */

export function GeminiIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <path d="M8 2C8 5.314 5.314 8 2 8c3.314 0 6 2.686 6 6 0-3.314 2.686-6 6-6-3.314 0-6-2.686-6-6z" fill="currentColor" />
    </svg>
  );
}

export function IconDashboard({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="1.5" y="1.5" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
      <rect x="10.5" y="1.5" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
      <rect x="1.5" y="10.5" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
      <rect x="10.5" y="10.5" width="6" height="6" rx="1.5" stroke={c} strokeWidth="1.5" />
    </svg>
  );
}

export function IconStudio({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="7" stroke={c} strokeWidth="1.5" />
      <circle cx="9" cy="9" r="3" fill={c} fillOpacity="0.3" stroke={c} strokeWidth="1.5" />
      <circle cx="9" cy="9" r="1" fill={c} />
    </svg>
  );
}

export function IconUpload({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 2v10M5 6l4-4 4 4M2 14h14" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconHistory({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <path d="M9 4.5V9l3 2" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3.5 9A5.5 5.5 0 1 1 9 14.5" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <path d="M3.5 5.5V9H7" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function IconUsers({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="6" r="3" stroke={c} strokeWidth="1.5" />
      <path d="M3 15c0-3.314 2.686-6 6-6s6 2.686 6 6" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="14" cy="5.5" r="2" stroke={c} strokeWidth="1.3" />
      <path d="M16.5 12c0-1.657-1.12-3-2.5-3" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconConfig({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke={c} strokeWidth="1.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.697 3.697l1.414 1.414M12.889 12.889l1.414 1.414M3.697 14.303l1.414-1.414M12.889 5.111l1.414-1.414" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function IconLogs({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <rect x="3" y="2" width="12" height="14" rx="2" stroke={c} strokeWidth="1.5" />
      <path d="M6 6h6M6 9h6M6 12h4" stroke={c} strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  );
}

export function IconSettings({ active, size = 18 }: { active?: boolean; size?: number }) {
  const c = active ? "#276749" : "#69766F";
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" fill="none">
      <circle cx="9" cy="9" r="2.5" stroke={c} strokeWidth="1.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.697 3.697l1.414 1.414M12.889 12.889l1.414 1.414M3.697 14.303l1.414-1.414M12.889 5.111l1.414-1.414" stroke={c} strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
