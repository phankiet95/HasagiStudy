import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sessionToken, lessonId } = body

  if (!sessionToken || !lessonId)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session } = await supabase
    .from('lms_student_sessions').select('student_id')
    .eq('session_token', sessionToken).gt('expires_at', new Date().toISOString()).single()
  if (!session)
    throw createError({ statusCode: 401, statusMessage: 'Session không hợp lệ' })

  const { error } = await supabase
    .from('lms_lesson_progress')
    .upsert({ lesson_id: lessonId, student_id: session.student_id }, { onConflict: 'lesson_id,student_id' })

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Không thể lưu tiến độ học tập' })

  return { success: true }
})
