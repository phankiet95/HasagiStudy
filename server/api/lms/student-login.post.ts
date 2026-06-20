import { serverSupabaseServiceRole } from '#supabase/server'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { orgSlug, username, password } = body

  if (!orgSlug || !username || !password)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin đăng nhập' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: org } = await supabase
    .from('lms_organizations').select('id').eq('slug', orgSlug).single()
  if (!org)
    throw createError({ statusCode: 404, statusMessage: 'Tổ chức không tồn tại' })

  const { data: student } = await supabase
    .from('lms_students')
    .select('id, full_name, username, password_hash, avatar_url, is_active')
    .eq('org_id', org.id).eq('username', username).single()

  if (!student || !student.is_active)
    throw createError({ statusCode: 401, statusMessage: 'Tài khoản không tồn tại hoặc đã bị vô hiệu hóa' })

  const valid = await bcrypt.compare(password, student.password_hash)
  if (!valid)
    throw createError({ statusCode: 401, statusMessage: 'Mật khẩu không chính xác' })

  const sessionToken = crypto.randomUUID()
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()

  await supabase.from('lms_student_sessions').insert({
    student_id: student.id,
    org_id: org.id,
    session_token: sessionToken,
    expires_at: expiresAt,
  })

  return {
    sessionToken,
    student: {
      id: student.id,
      fullName: student.full_name,
      username: student.username,
      avatarUrl: student.avatar_url,
      orgId: org.id,
    },
  }
})
