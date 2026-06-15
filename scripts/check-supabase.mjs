import fs from 'node:fs'

const envPath = '.env.local'

if (!fs.existsSync(envPath)) {
  console.error('Erreur : fichier .env.local introuvable.')
  process.exit(1)
}

const env = Object.fromEntries(
  fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .filter((line) => line && !line.startsWith('#'))
    .map((line) => {
      const separator = line.indexOf('=')
      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()]
    }),
)

const url = env.VITE_SUPABASE_URL
const key = env.VITE_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Erreur : variables VITE_SUPABASE_URL ou VITE_SUPABASE_ANON_KEY absentes.')
  process.exit(1)
}

const checks = [
  ['Auth', '/auth/v1/settings'],
  ['products', '/rest/v1/products?select=id&limit=1'],
  ['sales', '/rest/v1/sales?select=id&limit=1'],
  ['expenses', '/rest/v1/expenses?select=id&limit=1'],
  ['platforms', '/rest/v1/platforms?select=id&limit=1'],
  ['categories', '/rest/v1/categories?select=id&limit=1'],
]

console.log(`Projet : ${new URL(url).host}`)

let failed = false
for (const [name, path] of checks) {
  try {
    const response = await fetch(`${url}${path}`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
    })
    const body = await response.clone().json().catch(() => null)
    const permissionMissing =
      response.status === 401 &&
      body?.code === '42501' &&
      String(body?.message).includes('permission denied')
    const marker = response.ok
      ? 'OK'
      : permissionMissing
        ? 'TABLE PRÉSENTE, GRANT MANQUANT'
        : `ERREUR HTTP ${response.status}`
    console.log(`${name.padEnd(12)} ${marker}`)
    failed ||= !response.ok
  } catch (error) {
    console.log(`${name.padEnd(12)} INJOIGNABLE (${error.cause?.code ?? error.message})`)
    failed = true
  }
}

process.exitCode = failed ? 1 : 0
