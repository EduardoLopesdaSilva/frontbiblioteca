import { Link, NavLink, useNavigate } from 'react-router-dom'
import { FaChartBar, FaHome, FaSignInAlt, FaSignOutAlt, FaThLarge, FaTools, FaUserPlus } from 'react-icons/fa'
import { useAuth } from '../../hooks/useAuth'
import SenaiLogo from './SenaiLogo'
import Button from '../Button'

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold transition',
          isActive ? 'bg-white/15 text-white' : 'text-white/90 hover:bg-white/10 hover:text-white',
        ].join(' ')
      }
    >
      <span aria-hidden="true">{icon}</span>
      <span className="hidden md:inline">{label}</span>
    </NavLink>
  )
}

export default function Header() {
  const { session, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-senai-blue">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <nav className="flex flex-1 items-center gap-1">
          <NavItem to="/" icon={<FaHome />} label="Landing" />
          {session ? <NavItem to="/dashboard" icon={<FaThLarge />} label="Dashboard" /> : null}
          {session?.user.role === 'admin' ? (
            <>
              <NavItem to="/relatorios" icon={<FaChartBar />} label="Relatórios" />
              <NavItem to="/admin" icon={<FaTools />} label="Admin" />
            </>
          ) : null}
        </nav>

        <Link to="/" className="flex flex-none items-center justify-center" aria-label="SENAI">
          <SenaiLogo className="h-8 w-auto" />
        </Link>

        <div className="flex flex-1 items-center justify-end gap-2">
          {!session ? (
            <>
              <NavLink
                to="/login"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white md:inline-flex md:items-center md:gap-2"
              >
                <FaSignInAlt aria-hidden="true" /> Login
              </NavLink>
              <NavLink
                to="/cadastro"
                className="hidden rounded-md px-3 py-2 text-sm font-semibold text-white/90 hover:bg-white/10 hover:text-white md:inline-flex md:items-center md:gap-2"
              >
                <FaUserPlus aria-hidden="true" /> Cadastro
              </NavLink>
              <Button
                variant="secondary"
                className="md:hidden"
                onClick={() => navigate('/login')}
              >
                <FaSignInAlt aria-hidden="true" />
                <span className="sr-only">Login</span>
              </Button>
            </>
          ) : (
            <>
              <span className="hidden text-sm font-semibold text-white/90 md:inline">
                {session.user.name} ({session.user.role === 'admin' ? 'Bibliotecária' : 'Usuário'})
              </span>
              <Button
                variant="secondary"
                onClick={() => {
                  logout()
                  navigate('/')
                }}
              >
                <FaSignOutAlt aria-hidden="true" /> Sair
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

