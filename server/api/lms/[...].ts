import { joinURL } from 'ufo'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const apiBase = config.apiBase as string
  if (!apiBase) throw createError({ statusCode: 500, message: 'NUXT_API_BASE not configured' })
  const target = joinURL(apiBase, event.path)
  return proxyRequest(event, target)
})
