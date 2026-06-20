import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orgSlug = query.orgSlug as string
  const courseSlug = query.courseSlug as string
  const sessionToken = getHeader(event, 'x-lms-session')

  if (!orgSlug || !courseSlug || !sessionToken) {
    throw createError({ statusCode: 400, message: 'Missing required parameters' })
  }

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session } = await supabase
    .from('lms_student_sessions')
    .select('student_id, org_id')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!session) throw createError({ statusCode: 401, message: 'Invalid session' })

  const { data: org } = await supabase
    .from('lms_organizations')
    .select('id')
    .eq('slug', orgSlug)
    .single()

  if (!org) throw createError({ statusCode: 404, message: 'Organization not found' })

  const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseSlug)
  const { data: course, error: courseError } = await supabase
    .from('lms_courses')
    .select('id, slug, title, description, cover_url')
    .eq('org_id', org.id)
    .eq(isUuid ? 'id' : 'slug', courseSlug)
    .single()

  if (courseError || !course) throw createError({ statusCode: 404, message: 'Course not found' })

  const [{ data: chapters }, { data: lessons }] = await Promise.all([
    supabase.from('lms_chapters').select('id, title, slug, sort_order').eq('course_id', course.id).order('sort_order'),
    supabase.from('lms_lessons').select('id, slug, title, sort_order, chapter_id, metadata').eq('course_id', course.id).order('sort_order'),
  ])

  return {
    course,
    chapters: chapters || [],
    lessons: lessons || [],
  }
})
