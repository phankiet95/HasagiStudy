import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const orgSlug = query.orgSlug as string
  const courseSlug = query.courseSlug as string
  const lessonSlug = query.lessonSlug as string
  const sessionToken = getHeader(event, 'x-lms-session')

  if (!orgSlug || !courseSlug || !lessonSlug || !sessionToken) {
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

  const { data: org } = await supabase.from('lms_organizations').select('id').eq('slug', orgSlug).single()
  if (!org) throw createError({ statusCode: 404, message: 'Organization not found' })

  const isCourseUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(courseSlug)
  const { data: courseRows } = await supabase
    .from('lms_courses')
    .select('id, title, slug')
    .eq('org_id', org.id)
    .eq(isCourseUuid ? 'id' : 'slug', courseSlug)
    .limit(1)

  const course = courseRows?.[0] ?? null
  if (!course) throw createError({ statusCode: 404, message: 'Course not found' })

  const isLessonUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(lessonSlug)
  const { data: lessonRows } = await supabase
    .from('lms_lessons')
    .select('id, slug, title, content, metadata, course_id, sort_order, chapter_id')
    .eq('course_id', course.id)
    .eq(isLessonUuid ? 'id' : 'slug', lessonSlug)
    .limit(1)

  const lesson = lessonRows?.[0] ?? null
  if (!lesson) throw createError({ statusCode: 404, message: 'Lesson not found' })

  const [{ data: allLessons }, { data: chapters }] = await Promise.all([
    supabase
      .from('lms_lessons')
      .select('id, slug, title, sort_order, chapter_id, metadata, lms_chapters(sort_order)')
      .eq('course_id', course.id),
    supabase
      .from('lms_chapters')
      .select('id, title, sort_order')
      .eq('course_id', course.id)
      .order('sort_order'),
  ])

  const sortedLessons = (allLessons || []).sort((a: any, b: any) => {
    const cA = (a.lms_chapters as any)?.sort_order ?? 0
    const cB = (b.lms_chapters as any)?.sort_order ?? 0
    return cA !== cB ? cA - cB : a.sort_order - b.sort_order
  })

  return {
    lesson,
    course: { id: course.id, title: course.title, slug: course.slug },
    allLessons: sortedLessons,
    chapters: chapters || [],
  }
})
