import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { orgSlug } = getQuery(event) as { orgSlug: string }
  if (!orgSlug)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu orgSlug' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: org } = await supabase
    .from('lms_organizations').select('id').eq('slug', orgSlug).single()
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tổ chức' })

  const { data: news, error } = await supabase
    .from('lms_news')
    .select('id, title, slug, cover_url, published_at')
    .eq('org_id', org.id)
    .eq('is_published', true)
    .order('published_at', { ascending: false })

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Không thể tải tin tức' })

  return { news: news || [] }
})
