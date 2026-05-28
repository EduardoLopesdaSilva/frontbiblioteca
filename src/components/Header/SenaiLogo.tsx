const senaiLogoUrl = 'https://ava.sesisenai.org.br/pluginfile.php/1/theme_senai/logocompact/300x300/1779135132/logo-nova.png'

export default function SenaiLogo({ className = 'h-8 w-auto' }: { className?: string }) {
  return <img className={className} src={senaiLogoUrl} alt="AVA SESI/SC SENAI/SC" />
}
