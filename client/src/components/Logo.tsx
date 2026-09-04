type LogoProps = {
  size?: number;
  showText?: boolean;
  textColor?: string;
};

export default function Logo({ size = 90, showText = true, textColor = '#fff' }: LogoProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
      <svg viewBox="0 0 100 100" width={size} height={size}>
        <path
          d="M50 88 C20 65 8 45 8 30 C8 14 22 4 36 8 C44 10.5 50 20 50 20 C50 20 56 10.5 64 8 C78 4 92 14 92 30 C92 45 80 65 50 88 Z"
          fill="#e24b4a"
          opacity="0.18"
        />
        <path
          d="M50 88 C20 65 8 45 8 30 C8 14 22 4 36 8 C44 10.5 50 20 50 20 C50 20 56 10.5 64 8 C78 4 92 14 92 30 C92 45 80 65 50 88 Z"
          fill="none"
          stroke="#e24b4a"
          strokeWidth="3.5"
        />
        <circle cx="38" cy="38" r="6" fill="#f2a341" />
        <circle cx="62" cy="38" r="6" fill="#fff" />
        <path d="M38 47 v15 M62 47 v15" stroke="#f2a341" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M62 47 v15" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" />
        <path d="M29 55 h42" stroke="#f2a341" strokeWidth="3.5" strokeLinecap="round" opacity="0.7" />
      </svg>
      {showText && (
        <div style={{ color: textColor, fontSize: 40, fontWeight: 500, fontFamily: 'Georgia, serif' }}>
          Tandem
        </div>
      )}
    </div>
  );
}