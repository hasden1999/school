export interface PresetClassRoom {
  name: string;
  code: string;
  tuition: number;
  orderIndex: number;
  isGraduatingClass?: boolean;
}

export interface PresetSubject {
  name: string;
  code: string;
  orderIndex: number;
}

export interface CurriculumPreset {
  stageKey: "PRIMARY" | "INTERMEDIATE" | "PREPARATORY" | "SECONDARY_FULL" | "COMPREHENSIVE" | "KINDERGARTEN";
  stageTitle: string;
  description: string;
  classRooms: PresetClassRoom[];
  subjects: PresetSubject[];
}

export const CURRICULUM_PRESETS: Record<string, CurriculumPreset> = {
  PRIMARY: {
    stageKey: "PRIMARY",
    stageTitle: "المرحلة الابتدائية (من الأول إلى السادس الابتدائي)",
    description: "المنهاج والصفوف المعتمدة للمدارس الابتدائية الأهلية وفق وزارة التربية العراقية",
    classRooms: [
      { name: "الأول الابتدائي", code: "1-PRI", tuition: 1200000, orderIndex: 1 },
      { name: "الثاني الابتدائي", code: "2-PRI", tuition: 1200000, orderIndex: 2 },
      { name: "الثالث الابتدائي", code: "3-PRI", tuition: 1200000, orderIndex: 3 },
      { name: "الرابع الابتدائي", code: "4-PRI", tuition: 1300000, orderIndex: 4 },
      { name: "الخامس الابتدائي", code: "5-PRI", tuition: 1400000, orderIndex: 5 },
      { name: "السادس الابتدائي", code: "6-PRI", tuition: 1500000, orderIndex: 6, isGraduatingClass: true },
    ],
    subjects: [
      { name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
      { name: "اللغة العربية (القراءة والقواعد)", code: "ARABIC", orderIndex: 2 },
      { name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
      { name: "الرياضيات", code: "MATH", orderIndex: 4 },
      { name: "العلوم", code: "SCI", orderIndex: 5 },
      { name: "الاجتماعيات", code: "SOC", orderIndex: 6 },
      { name: "التربية الفنية والنشيد", code: "ART", orderIndex: 7 },
      { name: "التربية الرياضية", code: "PE", orderIndex: 8 },
    ],
  },

  INTERMEDIATE: {
    stageKey: "INTERMEDIATE",
    stageTitle: "المرحلة المتوسطة (من الأول إلى الثالث متوسط)",
    description: "المنهاج والصفوف المعتمدة للمدارس المتوسطة الأهلية",
    classRooms: [
      { name: "الأول متوسط", code: "1-INT", tuition: 1500000, orderIndex: 1 },
      { name: "الثاني متوسط", code: "2-INT", tuition: 1500000, orderIndex: 2 },
      { name: "الثالث متوسط", code: "3-INT", tuition: 1650000, orderIndex: 3, isGraduatingClass: true },
    ],
    subjects: [
      { name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
      { name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
      { name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
      { name: "الرياضيات", code: "MATH", orderIndex: 4 },
      { name: "العلوم العامة", code: "SCI", orderIndex: 5 },
      { name: "الاجتماعيات", code: "SOC", orderIndex: 6 },
      { name: "الحاسوب وتكنولوجيا المعلومات", code: "CS", orderIndex: 7 },
      { name: "التربية الفنية", code: "ART", orderIndex: 8 },
      { name: "التربية الرياضية", code: "PE", orderIndex: 9 },
    ],
  },

  PREPARATORY: {
    stageKey: "PREPARATORY",
    stageTitle: "المرحلة الإعدادية (علمي وأدبي)",
    description: "المنهاج والصفوف المعتمدة للإعداديات الأهلية (الرابع، الخامس، السادس الإعدادي)",
    classRooms: [
      { name: "الرابع الإعدادي (العلمي)", code: "4-SCI", tuition: 1800000, orderIndex: 1 },
      { name: "الرابع الإعدادي (الأدبي)", code: "4-LIT", tuition: 1800000, orderIndex: 2 },
      { name: "الخامس الإعدادي (العلمي)", code: "5-SCI", tuition: 1950000, orderIndex: 3 },
      { name: "الخامس الإعدادي (الأدبي)", code: "5-LIT", tuition: 1950000, orderIndex: 4 },
      { name: "السادس الإعدادي (العلمي)", code: "6-SCI", tuition: 2300000, orderIndex: 5, isGraduatingClass: true },
      { name: "السادس الإعدادي (الأدبي)", code: "6-LIT", tuition: 2300000, orderIndex: 6, isGraduatingClass: true },
    ],
    subjects: [
      { name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
      { name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
      { name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
      { name: "الرياضيات", code: "MATH", orderIndex: 4 },
      { name: "الفيزياء", code: "PHYS", orderIndex: 5 },
      { name: "الكيمياء", code: "CHEM", orderIndex: 6 },
      { name: "الأحياء", code: "BIO", orderIndex: 7 },
      { name: "الحاسوب", code: "CS", orderIndex: 8 },
      { name: "التاريخ", code: "HIST", orderIndex: 9 },
      { name: "الجغرافيا", code: "GEOG", orderIndex: 10 },
      { name: "الاقتصاد", code: "ECON", orderIndex: 11 },
    ],
  },

  SECONDARY_FULL: {
    stageKey: "SECONDARY_FULL",
    stageTitle: "الثانوية الكاملة (متوسط + إعدادي)",
    description: "الصفوف من الأول متوسط حتى السادس الإعدادي للمدارس الثانوية الأهلية الكاملة",
    classRooms: [
      { name: "الأول متوسط", code: "1-INT", tuition: 1500000, orderIndex: 1 },
      { name: "الثاني متوسط", code: "2-INT", tuition: 1500000, orderIndex: 2 },
      { name: "الثالث متوسط", code: "3-INT", tuition: 1650000, orderIndex: 3 },
      { name: "الرابع الإعدادي (العلمي)", code: "4-SCI", tuition: 1800000, orderIndex: 4 },
      { name: "الخامس الإعدادي (العلمي)", code: "5-SCI", tuition: 1950000, orderIndex: 5 },
      { name: "السادس الإعدادي (العلمي)", code: "6-SCI", tuition: 2300000, orderIndex: 6, isGraduatingClass: true },
    ],
    subjects: [
      { name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
      { name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
      { name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
      { name: "الرياضيات", code: "MATH", orderIndex: 4 },
      { name: "العلوم العامة", code: "SCI", orderIndex: 5 },
      { name: "الفيزياء", code: "PHYS", orderIndex: 6 },
      { name: "الكيمياء", code: "CHEM", orderIndex: 7 },
      { name: "الأحياء", code: "BIO", orderIndex: 8 },
      { name: "الاجتماعيات", code: "SOC", orderIndex: 9 },
      { name: "الحاسوب", code: "CS", orderIndex: 10 },
    ],
  },

  COMPREHENSIVE: {
    stageKey: "COMPREHENSIVE",
    stageTitle: "مجمع تعليمي شامل (ابتدائي + متوسط + إعدادي)",
    description: "تغطية شاملة لجميع الصفوف الدراسية الـ 12 من الأول ابتدائي إلى السادس الإعدادي",
    classRooms: [
      { name: "الأول الابتدائي", code: "1-PRI", tuition: 1200000, orderIndex: 1 },
      { name: "الثاني الابتدائي", code: "2-PRI", tuition: 1200000, orderIndex: 2 },
      { name: "الثالث الابتدائي", code: "3-PRI", tuition: 1200000, orderIndex: 3 },
      { name: "الرابع الابتدائي", code: "4-PRI", tuition: 1300000, orderIndex: 4 },
      { name: "الخامس الابتدائي", code: "5-PRI", tuition: 1400000, orderIndex: 5 },
      { name: "السادس الابتدائي", code: "6-PRI", tuition: 1500000, orderIndex: 6 },
      { name: "الأول متوسط", code: "1-INT", tuition: 1500000, orderIndex: 7 },
      { name: "الثاني متوسط", code: "2-INT", tuition: 1500000, orderIndex: 8 },
      { name: "الثالث متوسط", code: "3-INT", tuition: 1650000, orderIndex: 9 },
      { name: "الرابع الإعدادي (العلمي)", code: "4-SCI", tuition: 1800000, orderIndex: 10 },
      { name: "الخامس الإعدادي (العلمي)", code: "5-SCI", tuition: 1950000, orderIndex: 11 },
      { name: "السادس الإعدادي (العلمي)", code: "6-SCI", tuition: 2300000, orderIndex: 12, isGraduatingClass: true },
    ],
    subjects: [
      { name: "التربية الإسلامية", code: "ISLAMIC", orderIndex: 1 },
      { name: "اللغة العربية", code: "ARABIC", orderIndex: 2 },
      { name: "اللغة الإنكليزية", code: "ENG", orderIndex: 3 },
      { name: "الرياضيات", code: "MATH", orderIndex: 4 },
      { name: "العلوم", code: "SCI", orderIndex: 5 },
      { name: "الفيزياء", code: "PHYS", orderIndex: 6 },
      { name: "الكيمياء", code: "CHEM", orderIndex: 7 },
      { name: "الأحياء", code: "BIO", orderIndex: 8 },
      { name: "الاجتماعيات", code: "SOC", orderIndex: 9 },
      { name: "الحاسوب", code: "CS", orderIndex: 10 },
    ],
  },

  KINDERGARTEN: {
    stageKey: "KINDERGARTEN",
    stageTitle: "رياض أطفال وحضانة (تمهيدي)",
    description: "صفوف ومواد مرحلة الطفولة المبكرة والروضة والتمهيدي",
    classRooms: [
      { name: "الروضة (KG1)", code: "KG1", tuition: 1000000, orderIndex: 1 },
      { name: "التمهيدي (KG2)", code: "KG2", tuition: 1100000, orderIndex: 2, isGraduatingClass: true },
    ],
    subjects: [
      { name: "مبادئ اللغة العربية والتهجئة", code: "KG-AR", orderIndex: 1 },
      { name: "مبادئ اللغة الإنكليزية والأصوات", code: "KG-EN", orderIndex: 2 },
      { name: "الحساب والأرقام والأشكال", code: "KG-MATH", orderIndex: 3 },
      { name: "التربية الأخلاقية والسلوكية", code: "KG-ETHIC", orderIndex: 4 },
      { name: "الأنشطة الفنية والأشغال اليدوية", code: "KG-ART", orderIndex: 5 },
      { name: "النشاط الرياضي والحركي", code: "KG-PE", orderIndex: 6 },
    ],
  },
};

/**
 * Resolves appropriate curriculum preset based on school type string
 */
export function getPresetForSchoolType(schoolType: string): CurriculumPreset {
  const normalized = (schoolType || "").toLowerCase();

  if (normalized.includes("ابتدائ") || normalized.includes("ابتدائي")) {
    return CURRICULUM_PRESETS.PRIMARY;
  }
  if (normalized.includes("روض") || normalized.includes("تمهيد") || normalized.includes("حضان")) {
    return CURRICULUM_PRESETS.KINDERGARTEN;
  }
  if (normalized.includes("مجمع") || normalized.includes("شامل") || normalized.includes("كاملة ومختلط")) {
    return CURRICULUM_PRESETS.COMPREHENSIVE;
  }
  if (normalized.includes("إعداد") || normalized.includes("اعداد")) {
    return CURRICULUM_PRESETS.PREPARATORY;
  }
  if (normalized.includes("متوسط")) {
    return CURRICULUM_PRESETS.INTERMEDIATE;
  }

  // Default to Full Secondary
  return CURRICULUM_PRESETS.SECONDARY_FULL;
}
