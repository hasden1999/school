"use client";

import React, { useState } from "react";
import { submitEvaluationAction } from "@/app/actions/evaluationActions";
import { Modal } from "@/components/ui/Modal";
import {
  MessageSquareHeart,
  Star,
  ShieldCheck,
  CheckCircle2,
  BookOpen,
  Send,
} from "lucide-react";

interface StudentEvaluationClientProps {
  exams: any[];
}

export const StudentEvaluationClient: React.FC<StudentEvaluationClientProps> = ({
  exams,
}) => {
  const [selectedExam, setSelectedExam] = useState<any>(null);
  const [answersState, setAnswersState] = useState<Record<string, { score?: number; text?: string }>>({});
  const [generalFeedback, setGeneralFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleOpenSurvey = (exam: any) => {
    setSelectedExam(exam);
    const questions = JSON.parse(exam.questionsJson || "[]");
    const map: Record<string, any> = {};
    for (const q of questions) {
      map[q.id] = q.type === "rating" ? { score: 5 } : { text: "" };
    }
    setAnswersState(map);
    setGeneralFeedback("");
  };

  const handleRatingChange = (qId: string, score: number) => {
    setAnswersState((prev) => ({ ...prev, [qId]: { ...prev[qId], score } }));
  };

  const handleTextChange = (qId: string, text: string) => {
    setAnswersState((prev) => ({ ...prev, [qId]: { ...prev[qId], text } }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExam) return;
    setSubmitting(true);
    try {
      const answers = Object.entries(answersState).map(([qId, val]) => ({
        questionId: qId,
        score: val.score,
        text: val.text,
      }));

      const res = await submitEvaluationAction({
        examId: selectedExam.id,
        answers,
        feedbackText: generalFeedback,
      });

      if (res.success) {
        alert("شكراً لك! تم إرسال تقييمك السري بنجاح ووصل مباشرة إلى إدارة المدرسة.");
        setSelectedExam(null);
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
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">استبيان تقييم أداء الأساتذة (سري)</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          مشاركتك الصادقة تساهم في تطوير جودة التدريس — إجاباتك مشفرة ومتاحة لإدارة المدرسة فقط.
        </p>
      </div>

      {/* Security Guarantee Card */}
      <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3 text-xs text-indigo-950">
        <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
        <div>
          <h4 className="font-bold">خصوصية التقييم مضمونة بالكامل:</h4>
          <p className="text-indigo-800 mt-0.5 leading-relaxed">
            لا يمكن لأي أستاذ الاطلاع على إجاباتك أو درجات التقييم إطلاقاً. تُجمع الإحصائيات لدى إدارة المدرسة فقط لتحسين الأداء التعليمي.
          </p>
        </div>
      </div>

      {/* Surveys List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {exams.length === 0 ? (
          <div className="col-span-2 text-center py-16 bg-white rounded-3xl border border-slate-100 text-slate-400 text-xs">
            لا توجد استبيانات تقييم نشطة لصفك حالياً.
          </div>
        ) : (
          exams.map((exam) => (
            <div
              key={exam.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
                      <MessageSquareHeart className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{exam.title}</h4>
                      <span className="text-[10px] text-slate-400">{exam.subject.name}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  {exam.description || "استبيان تقييم أداء المعلم للفصل الدراسي."}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-50 flex justify-end">
                <button
                  onClick={() => handleOpenSurvey(exam)}
                  className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span>بدء التقييم السري</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Survey Modal */}
      {selectedExam && (
        <Modal
          isOpen={!!selectedExam}
          onClose={() => setSelectedExam(null)}
          title={selectedExam.title}
          maxWidth="lg"
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-xs text-slate-500">
              يرجى تقييم كل بند من 1 إلى 5 نجوم (5 = ممتاز، 1 = ضعيف):
            </p>

            <div className="space-y-4">
              {JSON.parse(selectedExam.questionsJson || "[]").map((q: any, idx: number) => {
                const isRating = q.type === "rating";
                const currentScore = answersState[q.id]?.score || 5;

                return (
                  <div key={q.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                    <label className="block text-xs font-bold text-slate-800">
                      {idx + 1}. {q.text}
                    </label>

                    {isRating ? (
                      <div className="flex items-center gap-2 pt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleRatingChange(q.id, star)}
                            className="p-1 text-slate-300 hover:text-amber-400 transition-colors"
                          >
                            <Star
                              className={`w-7 h-7 ${
                                star <= currentScore
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-slate-300"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="text-xs font-black text-amber-600 mr-2 font-mono">
                          ({currentScore} / 5)
                        </span>
                      </div>
                    ) : (
                      <textarea
                        rows={2}
                        value={answersState[q.id]?.text || ""}
                        onChange={(e) => handleTextChange(q.id, e.target.value)}
                        placeholder="اكتب إجابتك أو ملاحظتك هنا..."
                        className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white outline-none focus:border-blue-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                ملاحظات أو مقترحات سرية عامة للإدارة:
              </label>
              <textarea
                rows={2}
                value={generalFeedback}
                onChange={(e) => setGeneralFeedback(e.target.value)}
                placeholder="اكتب أي ملاحظة أخرى تريد إيصالها لمدير المدرسة حصراً..."
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
              >
                إلغاء
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black transition-all shadow-md flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? "جاري الإرسال..." : "إرسال التقييم السري"}</span>
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
