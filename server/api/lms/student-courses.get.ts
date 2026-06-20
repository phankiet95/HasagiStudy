import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, 'x-lms-session')
  if (!sessionToken)
    throw createError({ statusCode: 401, statusMessage: 'Không có session token' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session } = await supabase
    .from('lms_student_sessions').select('student_id, org_id')
    .eq('session_token', sessionToken).gt('expires_at', new Date().toISOString()).single()
  if (!session)
    throw createError({ statusCode: 401, statusMessage: 'Session không hợp lệ' })

  const { data: enrollments, error } = await supabase
    .from('lms_course_enrollments')
    .select('course_id, enrolled_at, lms_courses!inner(id, slug, title, description, cover_url, sort_order, is_published, lms_lessons(id))')
    .eq('student_id', session.student_id)

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Không thể tải khóa học' })

  const { data: progress } = await supabase
    .from('lms_lesson_progress').select('lesson_id').eq('student_id', session.student_id)

  const completedIds = new Set((progress || []).map((p: any) => p.lesson_id))

  const courses = (enrollments || []).map((e: any) => {
    const c = e.lms_courses
    const total = c.lms_lessons?.length || 0
    const completed = c.lms_lessons?.filter((l: any) => completedIds.has(l.id)).length || 0
    return {
      id: c.id, slug: c.slug, title: c.title, description: c.description,
      coverUrl: c.cover_url, sortOrder: c.sort_order,
      totalLessons: total, completedLessons: completed, enrolledAt: e.enrolled_at,
    }
  })

  courses.sort((a: any, b: any) => a.sortOrder - b.sortOrder)
  return { courses }
})
