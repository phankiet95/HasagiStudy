import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, 'x-lms-session')
  if (!sessionToken)
    throw createError({ statusCode: 401, statusMessage: 'Không có session token' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session } = await supabase
    .from('lms_student_sessions').select('student_id')
    .eq('session_token', sessionToken).gt('expires_at', new Date().toISOString()).single()
  if (!session)
    throw createError({ statusCode: 401, statusMessage: 'Session không hợp lệ' })

  const [{ data: progress }, { data: quizAttempts }] = await Promise.all([
    supabase.from('lms_lesson_progress').select('lesson_id').eq('student_id', session.student_id),
    supabase.from('lms_quiz_attempts').select('lesson_id')
      .eq('student_id', session.student_id).eq('passed', true),
  ])

  return {
    completedLessonIds: (progress || []).map((p: any) => p.lesson_id),
    passedQuizLessonIds: [...new Set((quizAttempts || []).map((a: any) => a.lesson_id))],
  }
})
