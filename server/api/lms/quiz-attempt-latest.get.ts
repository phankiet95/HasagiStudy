import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const sessionToken = getHeader(event, 'x-lms-session')
  const lessonId = getQuery(event).lessonId as string

  if (!sessionToken || !lessonId)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session } = await supabase
    .from('lms_student_sessions').select('student_id')
    .eq('session_token', sessionToken).gt('expires_at', new Date().toISOString()).single()
  if (!session)
    throw createError({ statusCode: 401, statusMessage: 'Session không hợp lệ' })

  const { data: attempt } = await supabase
    .from('lms_quiz_attempts')
    .select('id, earned_points, total_points, score_percent, correct_count, total_questions, passed, passing_score, answers, created_at')
    .eq('student_id', session.student_id).eq('lesson_id', lessonId)
    .order('created_at', { ascending: false }).limit(1).maybeSingle()

  return { attempt: attempt ?? null }
})
