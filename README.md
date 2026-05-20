# Sistema de Gestão de Biblioteca e Salas de Estudo (Padrão Institucional SENAI)

Projeto **React + TypeScript + Tailwind CSS** com UI institucional SENAI, componentização, validações, regras de reserva e perfis com permissões (Usuário x Bibliotecária/Admin).

## Como rodar

No terminal, dentro da pasta do projeto:

```bash
npm install
npm run dev
```

## Acesso (demo)

Para testar o perfil **Bibliotecária/Admin**:

- **E-mail:** `admin@senai.edu.br`
- **Senha:** `Admin123!`

> Observação: o “backend” é simulado com **localStorage**.

## Rotas principais

- `/` Landing
- `/login` Login
- `/cadastro` Cadastro (abas para Usuário e Bibliotecária)
- `/dashboard` Dashboard (reservas/agenda)
- `/relatorios` Relatórios (somente Admin)
- `/admin` Área administrativa (somente Admin)

## Regras de negócio (front)

- **Capacidade**: Salas (máx. 5 pessoas), Computadores (máx. 2 pessoas)
- **Duração mínima**: 1 hora
- **Período longo/fixo**: duração **> 3 horas** ou **recorrência semanal** → status **Pendente**
- **Check-in**: habilita somente **5 minutos antes** do horário inicial
- **Check-out manual**: somente durante “Em uso”
- **Finalização automática (visual)**: ao ultrapassar o horário final, reserva “Em uso” vai para **Finalizada**

