/**
 * Iraqi Ministry of Education Phased Grading Rules & Decision Marks (درجات القرار الوزارية)
 * 
 * Rules:
 * 1. Month 1 (الشهر الأول) & Month 2 (الشهر الثاني)
 * 2. Term 1 Average (سعي الفصل الأول) = (Month 1 + Month 2) / 2
 * 3. Mid-Year Exam (نصف السنة)
 * 4. Month 3 (الشهر الثالث) & Month 4 (الشهر الرابع)
 * 5. Term 2 Average (سعي الفصل الثاني) = (Month 3 + Month 4) / 2
 * 6. Annual Average (السعي السنوي) = (Term 1 Average + Term 2 Average + Mid-Year) / 3
 * 7. Final Exam (امتحان نهاية السنة)
 * 8. Final Grade (الدرجة النهائية) = (Annual Average + Final Exam) / 2
 * 9. Ministry Decision Marks (درجات القرار الـ 5 درجات): تُضاف لرفع الدرجات من (45-49) إلى 50 (ناجح بالقرار).
 */

export interface GradeInputs {
  month1?: number | null;
  month2?: number | null;
  midYear?: number | null;
  month3?: number | null;
  month4?: number | null;
  finalExam?: number | null;
}

export interface CalculatedGrades {
  term1Average: number | null;
  term2Average: number | null;
  annualAverage: number | null;
  finalGrade: number | null;
  adjustedFinalGrade: number | null; // After applying decision marks if needed
  decisionMarksUsed: number; // 0 to 5 marks
  isPassedWithDecision: boolean;
  isPassing: boolean | null; // Grade >= 50
  statusText: string;
  descriptor: string; // التقدير الوصفي (ممتاز، جيد جداً، ...)
}

export function calculateGrades(inputs: GradeInputs, enableDecisionMarks = true): CalculatedGrades {
  const { month1, month2, midYear, month3, month4, finalExam } = inputs;

  // 1. Term 1 Average
  let term1Average: number | null = null;
  if (month1 !== null && month1 !== undefined && month2 !== null && month2 !== undefined) {
    term1Average = Math.round(((month1 + month2) / 2) * 10) / 10;
  }

  // 2. Term 2 Average
  let term2Average: number | null = null;
  if (month3 !== null && month3 !== undefined && month4 !== null && month4 !== undefined) {
    term2Average = Math.round(((month3 + month4) / 2) * 10) / 10;
  }

  // 3. Annual Average (السعي السنوي) = (Term 1 Average + Term 2 Average + Mid-Year) / 3
  let annualAverage: number | null = null;
  if (
    term1Average !== null &&
    term2Average !== null &&
    midYear !== null &&
    midYear !== undefined
  ) {
    annualAverage = Math.round(((term1Average + term2Average + midYear) / 3) * 10) / 10;
  }

  // 4. Final Grade = (Annual Average + Final Exam) / 2
  let finalGrade: number | null = null;
  let adjustedFinalGrade: number | null = null;
  let decisionMarksUsed = 0;
  let isPassedWithDecision = false;
  let isPassing: boolean | null = null;
  let statusText = "قيد الدراسة";

  if (annualAverage !== null && finalExam !== null && finalExam !== undefined) {
    finalGrade = Math.round(((annualAverage + finalExam) / 2) * 10) / 10;
    adjustedFinalGrade = finalGrade;

    // Apply Ministry Decision Marks (45 to 49 -> 50)
    if (enableDecisionMarks && finalGrade >= 45 && finalGrade < 50) {
      decisionMarksUsed = 50 - Math.floor(finalGrade);
      if (decisionMarksUsed <= 5) {
        adjustedFinalGrade = 50;
        isPassedWithDecision = true;
      }
    }

    isPassing = (adjustedFinalGrade ?? finalGrade) >= 50;
    if (isPassedWithDecision) {
      statusText = `ناجح بالقرار (+${decisionMarksUsed})`;
    } else {
      statusText = isPassing ? "ناجح" : "راسب / دور ثانٍ";
    }
  } else if (annualAverage !== null) {
    statusText = annualAverage >= 50 ? "مؤهل للامتحان النهائي" : "سعي حرج";
  }

  const effectiveGrade = adjustedFinalGrade ?? finalGrade ?? annualAverage ?? midYear ?? term1Average;
  const descriptor = getPrimaryDescriptor(effectiveGrade);

  return {
    term1Average,
    term2Average,
    annualAverage,
    finalGrade,
    adjustedFinalGrade,
    decisionMarksUsed,
    isPassedWithDecision,
    isPassing,
    statusText,
    descriptor,
  };
}

/**
 * Iraqi Primary Stage Official Descriptors (التقدير الوصفي المعتمد وزارياً)
 */
export function getPrimaryDescriptor(score?: number | null): string {
  if (score === null || score === undefined) return "—";
  if (score >= 90) return "ممتاز 🌟";
  if (score >= 80) return "جيد جداً ⭐";
  if (score >= 70) return "جيد 👍";
  if (score >= 60) return "متوسط 📘";
  if (score >= 50) return "مقبول ✔️";
  return "دون المستوى (راسب) ⚠️";
}

export function getGradeBadgeClass(score?: number | null): string {
  if (score === null || score === undefined) return "bg-gray-100 text-gray-500";
  if (score >= 90) return "bg-emerald-100 text-emerald-800 font-bold";
  if (score >= 75) return "bg-blue-100 text-blue-800 font-semibold";
  if (score >= 50) return "bg-amber-100 text-amber-800";
  return "bg-rose-100 text-rose-800 font-bold";
}
