import { Link } from 'react-router-dom'
import { FaCalendarCheck, FaChartBar, FaLock, FaThLarge, FaUserShield } from 'react-icons/fa'
import Button from '../components/Button'
import Card from '../components/Card'
import Alert from '../components/Alert'
import { useAuth } from '../hooks/useAuth'

export default function Landing() {
  const { session, authReady } = useAuth()
  const isLoggedIn = authReady && !!session

  return (
    <div className="container-page py-10">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-card">
          <div className="text-xs font-bold uppercase tracking-wider text-senai-blue">
            Padrão Institucional SENAI
          </div>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight text-slate-900 sm:text-4xl">
            Sistema de Gestão de Biblioteca e Salas de Estudo
          </h1>
          <p className="mt-3 text-slate-700">
            Reserve salas e computadores com regras de capacidade, termo obrigatório, check-in/check-out e fluxo de
            aprovação para períodos longos/fixos — com UI profissional e permissões por perfil.
          </p>

          {isLoggedIn ? (
            <div className="mt-6 space-y-3">
              <Alert title={`Olá, ${session!.user.name}`}>
                Você está autenticado como{' '}
                <strong>{session!.user.role === 'admin' ? 'Bibliotecária/Admin' : 'Usuário'}</strong>. Acesse o painel
                para reservar horários ou gerenciar a biblioteca.
              </Alert>
              <div className="flex flex-wrap gap-3">
                <Link to="/dashboard">
                  <Button variant="primary">
                    <FaThLarge aria-hidden="true" /> Ir para o painel
                  </Button>
                </Link>
                {session!.user.role === 'admin' ? (
                  <Link to="/admin">
                    <Button variant="secondary">Área administrativa</Button>
                  </Link>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/login">
                <Button variant="primary">Entrar</Button>
              </Link>
              <Link to="/cadastro">
                <Button variant="secondary">Criar cadastro</Button>
              </Link>
            </div>
          )}

          <div className="mt-6">
            <Alert title="Integração com API">
              Login e reservas usam o backend Spring Boot. Inicie a API na porta <strong>8080</strong> e o frontend com{' '}
              <strong>npm run dev</strong>. Bibliotecária demo: <strong>admin@senai.edu.br</strong> /{' '}
              <strong>Admin123!</strong>
            </Alert>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Agenda profissional">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <FaCalendarCheck className="mt-0.5 text-senai-blue" aria-hidden="true" />
              <p>Interface estilo agenda para escolher data, horário e duração com bloqueio de conflitos.</p>
            </div>
          </Card>
          <Card title="Regras e validações">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <FaLock className="mt-0.5 text-senai-blue" aria-hidden="true" />
              <p>Capacidade por tipo, mínimo de 1h e termo obrigatório antes de confirmar reserva.</p>
            </div>
          </Card>
          <Card title="Permissões por perfil">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <FaUserShield className="mt-0.5 text-senai-blue" aria-hidden="true" />
              <p>Usuário comum acessa apenas suas reservas; bibliotecária/admin controla aprovações e CRUD.</p>
            </div>
          </Card>
          <Card title="Relatórios e estatísticas">
            <div className="flex items-start gap-3 text-sm text-slate-700">
              <FaChartBar className="mt-0.5 text-senai-blue" aria-hidden="true" />
              <p>Indicadores por período, tipo, status e usuário, com cards e filtros no front.</p>
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-card">
        <h2 className="text-base font-bold text-slate-900">Regras (resumo)</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>Salas: até 5 pessoas. Computadores: até 2 pessoas.</li>
          <li>Duração mínima de 1 hora.</li>
          <li>Período longo/fixo (duração acima de 3h ou recorrência semanal) gera status <strong>Pendente</strong>.</li>
          <li>Check-in habilita somente 5 minutos antes do início; check-out manual apenas durante “Em uso”.</li>
          <li>Ao terminar o horário, reservas “Em uso” aparecem como <strong>Finalizada</strong> no calendário (visual).</li>
        </ul>
      </div>
    </div>
  )
}
