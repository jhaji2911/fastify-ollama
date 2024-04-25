import { isEmpty } from './check'

export function getPort (): number {
  return !isEmpty(process.env.PORT) ? Number(process.env.PORT) : 3000
}

export function getHost (): string {
  return !isEmpty(process.env.HOST) ? String(process.env.HOST) : '0.0.0.0'
}