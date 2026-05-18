// Fail closed in production: all bot IDs must be set or it's a misconfiguration
if (process.env.NODE_ENV === 'production') {
  for (const key of ['BOT_CTO_FANATIC_ID', 'BOT_UX_CRITIC_ID', 'BOT_BUILDINPUBLIC_ID'] as const) {
    if (!process.env[key]) throw new Error(`Missing required env var: ${key}`)
  }
}

export const BOT_IDS: string[] = [
  process.env.BOT_CTO_FANATIC_ID,
  process.env.BOT_UX_CRITIC_ID,
  process.env.BOT_BUILDINPUBLIC_ID,
].filter(Boolean) as string[]
