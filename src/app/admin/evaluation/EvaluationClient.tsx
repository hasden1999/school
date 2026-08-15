"use client";

import React, { useState } from "react";
import { createEvaluationExamAction } from "@/app/actions/evaluationActions";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import {
  ClipboardList,
  Plus,
  Star,
  Lock,
  User,
  BookOpen,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Trash2,
} from "lucide-react";

interface EvaluationClientProps {
  exams: any[];
  teachers: any[];
  classRooms: any[];
  sections: any[];
  subjects: any[];
}

export const EvaluationClient: React.FC<EvaluationClientProps> = ({
  exams: initialExams,
  teachers,
  classRooms,
  sections,
  subjects,
}) => {
  const [exams, setExams] = useState<any[]>(initialExams);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedExamDetails, setSelectedExamDetails] = useState<any>(null);

  // Form state
  const [title, setTitle] = useState("استبيان تقييم أداء مدرس المادة");
  const [description, setDescription] = useState("يرجى الإجابة بموضوعية وصدق. التقييم سري بالكامل ومخصص لإدارة المدرسة فقط.");
  const [targetTeacherId, setTargetTeacherId] = useState(teachers[0]?.id || "");
  const [classRoomId, setClassRoomId] = useState(classRooms[0]?.id || "");
  const [sectionId, setSectionId] = useState(sections[0]?.id || "");
  const [subjectId, setSubjectId] = useState(subjects[0]?.id || "");

  const [questions, setQuestions] = useState<Array<{ id: string; type: "rating" | "text"; text: string }>>([
    { id: "q1", type: "rating", text: "مدى وضوح شرح الأستاذ للمادة وتبسيط المفاهيم (من 1 إلى 5)" },
    { id: "q2", type: "rating", text: "التزام الأستاذ بمواعيد الحصة واستثمار وقت الدرس كاملاً" },
    { id: "q3", type: "rating", text: "حرص الأستاذ على الإجابة عن أسئلة الطلاب ومساعدتهم" },
    { id: "q4", type: "text", text: "ملاحظات أو مقترحات إضافية توجهها للإدارة لتطوير المادة:" },
  ]);
  const [submitting, setSubmitting] = useState(false);

  const handleAddQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: `q_${Date.now()}`,
        type: "rating",
        text: "",
      },
    ]);
  };

  const handleRemoveQuestion = (index: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== index));
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await createEvaluationExamAction({
        title,
        description,
        targetTeacherId,
        classRoomId,
        sectionId,
        subjectId,
        questions,
      });

      if (res.success) {
        alert("تم إنشاء استبيان التقييم السري بنجاح وأصبح متاحاً للطلاب المستهدفين.");
        setIsCreateOpen(false);
        window.location.reload();
      }
    } catch (e: any) {
      alert(e.message || "حدث خطأ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">امتحان وتقييم أداء المعلمين (سري ومعزول)</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            استبيانات سرية للطلاب لتقييم الكادر التدريسي — محجوبة 100% عن المعلم والنتائج الأكاديمية.
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-md"
        >
          <Plus className="w-4 h-4" />
          <span>إنشاء استبيان تقييم جديد</span>
        </button>
      </div>

      {/* Security Architecture Box */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-xs text-amber-950">
        <Lock className="w-5 h-5 text-amber-700 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold">ضمانة العزل الأمني التام (Security Isolation Rule):</h4>
          <p className="text-amber-900 mt-0.5 leading-relaxed">
            وفقاً للبند رقم (7) من وثيقة المواصفات الفنية، تم بناء جدول تقييم المعلمين واستعلاماته بشكل معزول تماماً ومستقل عن سجلات الامتحانات الرسمية، ولا يملك دور المعلم أي صلاحية وصول بالـ API أو بالواجهة لرؤية هذه الاستبيانات أو نتائجها، وتصل إجابات الطلاب مباشرة إلى صندوق المدير فقط.
          </p>
        </div>
      </div>

      {/* Evaluations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لا توجد استبيانات تقييم حالياً.
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="p-2 rounded-xl bg-slate-100 text-slate-800">
                      <ClipboardList className="w-4 h-4" />
                    </span>
                    <div>
                      <h3 className="text-xs font-bold text-slate-900">{exam.title}</h3>
                      <span className="text-[10px] text-slate-400">
                        {exam.classRoom.name} ({exam.section.name}) — {exam.subject.name}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 font-bold border border-rose-200">
                    🔒 سري للمدير
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">المعلم المستهدف:</span>
                    <span className="font-bold text-slate-900">{exam.targetTeacherName}</span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500 font-medium">متوسط التقييم العام:</span>
                    <span className="font-black text-amber-600 text-sm flex items-center gap-1">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {exam.averageScore > 0 ? `${exam.averageScore} / 5` : "بانتظار الإجابات"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200/60 text-[11px] text-slate-400">
                    <span>عدد الطلاب المشاركين:</span>
                    <span className="font-bold text-slate-700">{exam.submissionCount} طالب</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex justify-end">
                <button
                  onClick={() => setSelectedExamDetails(exam)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition-colors"
                >
                  عرض إجابات الطلاب وملاحظاتهم
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Evaluation Modal */}
      <Modal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} title="إنشاء استبيان تقييم أداء المعلم السري" maxWidth="xl">
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">عنوان الاستبيان *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium outline-none focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المعلم المستهدف *</label>
              <select
                value={targetTeacherId}
                onChange={(e) => setTargetTeacherId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fullName}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">المادة *</label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الصف المستهدف *</label>
              <select
                value={classRoomId}
                onChange={(e) => setClassRoomId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
              >
                {classRooms.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">الشعبة *</label>
              <select
                value={sectionId}
                onChange={(e) => setSectionId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-bold outline-none bg-white"
              >
                {sections.map((sec) => (
                  <option key={sec.id} value={sec.id}>
                    شعبة ({sec.name})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-800">أسئلة التقييم:</label>
              <button
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-emerald-600 font-bold hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة سؤال آخر</span>
              </button>
            </div>

            {questions.map((q, idx) => (
              <div key={idx} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex gap-2 items-center">
                <input
                  type="text"
                  required
                  value={q.text}
                  onChange={(e) => {
                    const u = [...questions];
                    u[idx].text = e.target.value;
                    setQuestions(u);
                  }}
                  placeholder="نص سؤال التقييم..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium bg-white"
                />

                <select
                  value={q.type}
                  onChange={(e) => {
                    const u = [...questions];
                    u[idx].type = e.target.value as any;
                    setQuestions(u);
                  }}
                  className="p-2 rounded-xl border border-slate-200 text-xs font-bold bg-white"
                >
                  <option value="rating">تقييم بالنجوم (1-5)</option>
                  <option value="text">نص حر وملاحظات</option>
                </select>

                {questions.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveQuestion(idx)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
            >
              إلغاء
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold"
            >
              {submitting ? "جاري الحفظ..." : "نشر الاستبيان السري"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Submissions Confidential Modal */}
      {selectedExamDetails && (
        <Modal
          isOpen={!!selectedExamDetails}
          onClose={() => setSelectedExamDetails(null)}
          title={`تقرير التقييم السري — ${selectedExamDetails.targetTeacherName}`}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between">
              <div>
                <h4 className="text-sm font-black">{selectedExamDetails.title}</h4>
                <p className="text-xs text-slate-400 mt-0.5">
                  المادة: {selectedExamDetails.subject.name} | الصف: {selectedExamDetails.classRoom.name}
                </p>
              </div>

              <div className="text-left">
                <span className="text-2xl font-black text-amber-400 flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400" />
                  {selectedExamDetails.averageScore}
                </span>
                <span className="text-[10px] text-slate-400">من 5 نجوم</span>
              </div>
            </div>

            {/* Submissions List */}
            <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
              {selectedExamDetails.submissions.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  لم يقم أي طالب بإرسال إجاباته على هذا الاستبيان حتى الآن.
                </div>
              ) : (
                selectedExamDetails.submissions.map((sub: any) => {
                  const answers = JSON.parse(sub.answersJson || "[]");
                  return (
                    <div
                      key={sub.id}
                      className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm space-y-3 text-xs"
                    >
                      <div className="flex items-center justify-between border-b pb-2">
                        <span className="font-bold text-slate-900 flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          الطالب: {sub.student.user.fullName} ({sub.student.studentNumber})
                        </span>
                        <span className="font-bold text-amber-600 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                          التقييم: {sub.overallScore} / 5
                        </span>
                      </div>

                      {/* Answers detail */}
                      <div className="space-y-1.5 text-slate-700">
                        {answers.map((a: any, i: number) => (
                          <div key={i} className="p-2 rounded-xl bg-slate-50">
                            {a.score ? (
                              <span className="font-bold text-slate-800">
                                ⭐ التقييم: {a.score} / 5
                              </span>
                            ) : (
                              <p className="text-slate-700 italic">" {a.text} "</p>
                            )}
                          </div>
                        ))}
                      </div>

                      {sub.feedbackText && (
                        <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-900 text-[11px] border border-indigo-100">
                          <span className="font-bold">ملاحظات الطالب الإضافية:</span> {sub.feedbackText}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
