export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateProviderEnv } = await import('./lib/providers/env')
    validateProviderEnv()
  }
}
