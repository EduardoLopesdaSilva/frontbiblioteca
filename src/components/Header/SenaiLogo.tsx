/**
 * Logo SENAI em SVG (fallback quando não há arquivo PNG no projeto).
 * Mantém identidade visual: azul institucional + tipografia limpa.
 */
export default function SenaiLogo({ className = 'h-8' }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 32"
      role="img"
      aria-label="SENAI"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="120" height="32" rx="4" fill="#ffffff" fillOpacity="0.12" />
      <text
        x="60"
        y="21"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="14"
        fontWeight="800"
        fill="#ffffff"
        letterSpacing="1"
      >
        SENAI
      </text>
    </svg>
  )
}
