import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const { orgSlug, slug } = getQuery(event) as { orgSlug: string; slug: string }
  if (!orgSlug || !slug)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu tham số' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: org } = await supabase
    .from('lms_organizations').select('id').eq('slug', orgSlug).single()
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy tổ chức' })

  const { data: article, error } = await supabase
    .from('lms_news')
    .select('id, title, slug, cover_url, content, published_at')
    .eq('org_id', org.id)
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article)
    throw createError({ statusCode: 404, statusMessage: 'Không tìm thấy bài viết' })

  return { article }
})
