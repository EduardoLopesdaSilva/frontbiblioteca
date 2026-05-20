import { onlyDigits } from './maskCPF'

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function validateCPF(cpfMasked: string) {
  const cpf = onlyDigits(cpfMasked)
  if (cpf.length !== 11) return false
  if (/^(\d)\1{10}$/.test(cpf)) return false

  const calcCheck = (base: string, factor: number) => {
    let total = 0
    for (let i = 0; i < base.length; i++) {
      total += Number(base[i]) * (factor - i)
    }
    const mod = (total * 10) % 11
    return mod === 10 ? 0 : mod
  }

  const d1 = calcCheck(cpf.slice(0, 9), 10)
  const d2 = calcCheck(cpf.slice(0, 10), 11)
  return d1 === Number(cpf[9]) && d2 === Number(cpf[10])
}

export type FieldErrors<T extends string> = Partial<Record<T, string>>

export function required(value: string) {
  return value.trim().length > 0
}

