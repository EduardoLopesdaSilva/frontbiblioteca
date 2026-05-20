import { useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { FaSignInAlt } from 'react-icons/fa'
import Alert from '../components/Alert'
import Button from '../components/Button'
import Card from '../components/Card'
import Input from '../components/Input'
import { useAuth } from '../hooks/useAuth'
import { isValidEmail } from '../utils/validateForms'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = useMemo(() => (location.state as any)?.from ?? '/dashboard', [location.state])

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  return (
    <div className="container-page py-10">
      <div className="mx-auto max-w-lg">
        <Card title="Login">
          <div className="space-y-4">
            {error ? <Alert variant="danger">{error}</Alert> : null}
            <Input
              label="E-mail"
              type="email"
              value={email}
              onValueChange={setEmail}
              placeholder="nome@dominio.com"
            />
            <Input
              label="Senha"
              type="password"
              value={password}
              onValueChange={setPassword}
              placeholder="••••••••"
            />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <Link to="/cadastro" className="text-sm">
                Não tem cadastro? Criar agora
              </Link>
              <Button
                onClick={() => {
                  void (async () => {
                    setError(null)
                    if (!isValidEmail(email)) return setError('Informe um e-mail válido.')
                    if (!password.trim()) return setError('Informe sua senha.')
                    setLoading(true)
                    const result = await login(email, password)
                    setLoading(false)
                    if (result.ok === false) {
                      setError(result.message)
                      return
                    }
                    navigate(from, { replace: true })
                  })()
                }}
                loading={loading}
              >
                <FaSignInAlt aria-hidden="true" /> Entrar
              </Button>
            </div>

            <Alert title="Acesso demo (API)">
              Bibliotecária: <strong>admin@senai.edu.br</strong> / <strong>Admin123!</strong> — requer backend em{' '}
              <strong>http://localhost:8080</strong>
            </Alert>
          </div>
        </Card>
      </div>
    </div>
  )
}
