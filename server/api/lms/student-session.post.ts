import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sessionToken } = body

  if (!sessionToken)
    throw createError({ statusCode: 401, statusMessage: 'Không có session token' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session, error } = await supabase
    .from('lms_student_sessions')
    .select('student_id, org_id, expires_at, lms_students(id, full_name, username, avatar_url, is_active)')
    .eq('session_token', sessionToken)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !session)
    throw createError({ statusCode: 401, statusMessage: 'Session không hợp lệ hoặc đã hết hạn' })

  const student = session.lms_students as any
  if (!student?.is_active)
    throw createError({ statusCode: 401, statusMessage: 'Tài khoản đã bị vô hiệu hóa' })

  return {
    student: {
      id: student.id,
      fullName: student.full_name,
      username: student.username,
      avatarUrl: student.avatar_url,
      orgId: session.org_id,
    },
  }
})
