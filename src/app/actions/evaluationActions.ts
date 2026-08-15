"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createEvaluationExamAction(data: {
  title: string;
  description?: string;
  targetTeacherId: string;
  classRoomId: string;
  sectionId: string;
  subjectId: string;
  questions: Array<{
    id: string;
    type: "rating" | "text";
    text: string;
  }>;
}) {
  const session = await requireAuth(["ADMIN"]);
  const tenantId = session.tenantId;

  const exam = await prisma.teacherEvaluationExam.create({
    data: {
      tenantId,
      title: data.title.trim(),
      description: data.description?.trim(),
      targetTeacherId: data.targetTeacherId,
      classRoomId: data.classRoomId,
      sectionId: data.sectionId,
      subjectId: data.subjectId,
      questionsJson: JSON.stringify(data.questions),
      createdByAdminId: session.id,
      isActive: true,
    },
  });

  revalidatePath("/admin/evaluation");
  return { success: true, exam };
}

export async function submitEvaluationAction(data: {
  examId: string;
  answers: Array<{
    questionId: string;
    score?: number;
    text?: string;
  }>;
  feedbackText?: string;
}) {
  const session = await requireAuth(["STUDENT"]);
  const tenantId = session.tenantId;

  const profile = await prisma.studentProfile.findUnique({
    where: { userId: session.id },
  });

  if (!profile) return { error: "الطالب غير موجود" };

  const exam = await prisma.teacherEvaluationExam.findUnique({
    where: { id: data.examId, tenantId },
  });

  if (!exam) return { error: "الاستبيان غير موجود" };

  // Calculate overall rating score
  const ratingAnswers = data.answers.filter((a) => a.score !== undefined && a.score > 0);
  const avgScore =
    ratingAnswers.length > 0
      ? ratingAnswers.reduce((sum, a) => sum + (a.score || 0), 0) / ratingAnswers.length
      : 0;

  const submission = await prisma.teacherEvaluationSubmission.create({
    data: {
      tenantId,
      examId: data.examId,
      studentId: profile.id,
      targetTeacherId: exam.targetTeacherId,
      answersJson: JSON.stringify(data.answers),
      overallScore: Math.round(avgScore * 10) / 10,
      feedbackText: data.feedbackText?.trim(),
    },
  });

  revalidatePath("/student/evaluation");
  revalidatePath("/admin/evaluation");
  return { success: true, submission };
}

export async function getAdminEvaluationReports() {
  const session = await requireAuth(["ADMIN"]); // STRICT ADMIN ONLY
  const tenantId = session.tenantId;

  const exams = await prisma.teacherEvaluationExam.findMany({
    where: { tenantId },
    include: {
      classRoom: true,
      section: true,
      subject: true,
      submissions: {
        include: {
          student: { include: { user: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch teacher names manually to preserve isolation
  const teachers = await prisma.user.findMany({
    where: { tenantId, role: "TEACHER" },
    select: { id: true, fullName: true },
  });
  const teacherMap = new Map(teachers.map((t) => [t.id, t.fullName]));

  return exams.map((exam) => ({
    ...exam,
    targetTeacherName: teacherMap.get(exam.targetTeacherId) || "المعلم المستهدف",
    submissionCount: exam.submissions.length,
    averageScore:
      exam.submissions.length > 0
        ? Math.round(
            (exam.submissions.reduce((acc, s) => acc + s.overallScore, 0) /
              exam.submissions.length) *
              10
          ) / 10
        : 0,
  }));
}
