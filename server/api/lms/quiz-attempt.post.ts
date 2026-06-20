import { serverSupabaseServiceRole } from '#supabase/server'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { sessionToken, lessonId, earnedPoints, totalPoints, scorePercent,
    correctCount, totalQuestions, passed, passingScore, answers, timeTakenSeconds } = body

  if (!sessionToken || !lessonId)
    throw createError({ statusCode: 400, statusMessage: 'Thiếu thông tin' })

  const supabase = await serverSupabaseServiceRole(event)

  const { data: session } = await supabase
    .from('lms_student_sessions').select('student_id')
    .eq('session_token', sessionToken).gt('expires_at', new Date().toISOString()).single()
  if (!session)
    throw createError({ statusCode: 401, statusMessage: 'Session không hợp lệ' })

  const { data: attempt, error } = await supabase
    .from('lms_quiz_attempts')
    .insert({
      student_id: session.student_id, lesson_id: lessonId,
      earned_points: earnedPoints ?? 0, total_points: totalPoints ?? 0,
      score_percent: scorePercent ?? 0, correct_count: correctCount ?? 0,
      total_questions: totalQuestions ?? 0, passed: !!passed,
      passing_score: passingScore ?? 0, answers: answers ?? null,
      time_taken_seconds: timeTakenSeconds ?? null,
    })
    .select('id, passed, score_percent, created_at').single()

  if (error)
    throw createError({ statusCode: 500, statusMessage: 'Không thể lưu kết quả bài tập' })

  return { attempt }
})
