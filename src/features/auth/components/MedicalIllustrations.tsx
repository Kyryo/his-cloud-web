type MedicalIllustrationsProps = {
  isDark: boolean;
};

export function MedicalIllustrations({ isDark }: MedicalIllustrationsProps) {
  const strokeColor = isDark ? "#6B7280" : "#6B7280";
  const fillColor = isDark ? "#374151" : "#E5E7EB";

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-4 top-4 h-20 w-20 opacity-40">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M30 40C30 35 35 30 40 30H60C65 30 70 35 70 40V60C70 65 65 70 60 70H40C35 70 30 65 30 60V40Z"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
          />
          <circle cx="35" cy="45" r="3" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
          <circle cx="65" cy="45" r="3" fill={fillColor} stroke={strokeColor} strokeWidth="1" />
        </svg>
      </div>
      <div className="absolute right-4 top-4 h-16 w-16 opacity-40">
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="45" y="20" width="10" height="60" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
          <rect x="20" y="45" width="60" height="10" fill={fillColor} stroke={strokeColor} strokeWidth="2" />
        </svg>
      </div>
      <div className="absolute bottom-4 left-4 h-12 w-24 opacity-40">
        <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M10 25L20 15L30 25L40 10L50 25L60 15L70 25L80 20L90 25"
            stroke={strokeColor}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}
