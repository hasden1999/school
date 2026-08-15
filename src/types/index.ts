export type UserRole = "ADMIN" | "TEACHER" | "STUDENT";

export interface SessionUser {
  id: string;
  tenantId: string;
  username: string;
  fullName: string;
  role: UserRole;
  phone?: string | null;
  mustChangePassword: boolean;
  schoolName?: string;
}

export interface StudentWithRelations {
  id: string;
  tenantId: string;
  userId: string;
  studentNumber: string;
  guardianName: string;
  guardianPhone: string;
  totalTuition: number;
  depositAmount: number;
  registrationStatus: string;
  user: {
    id: string;
    username: string;
    fullName: string;
    phone?: string | null;
    active: boolean;
  };
  classRoom: {
    id: string;
    name: string;
    code: string;
  };
  section: {
    id: string;
    name: string;
  };
  paymentReceipts?: Array<{
    id: string;
    receiptNumber: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    notes?: string | null;
  }>;
  documents?: Array<{
    id: string;
    documentReqId: string;
    status: string;
    fileUrl?: string | null;
    notes?: string | null;
    requirement: {
      id: string;
      title: string;
      isRequired: boolean;
    };
  }>;
  gradeRecords?: Array<{
    id: string;
    subjectId: string;
    subject: {
      id: string;
      name: string;
    };
    month1?: number | null;
    month2?: number | null;
    term1Average?: number | null;
    midYear?: number | null;
    month3?: number | null;
    month4?: number | null;
    term2Average?: number | null;
    annualAverage?: number | null;
    finalExam?: number | null;
    finalGrade?: number | null;
    isMonth1Locked: boolean;
    isMonth2Locked: boolean;
    isMidYearLocked: boolean;
    isMonth3Locked: boolean;
    isMonth4Locked: boolean;
    isFinalExamLocked: boolean;
  }>;
}

export interface TeacherWithAssignments {
  id: string;
  username: string;
  fullName: string;
  phone?: string | null;
  active: boolean;
  teacherAssignments: Array<{
    id: string;
    classRoom: {
      id: string;
      name: string;
      code: string;
    };
    section: {
      id: string;
      name: string;
    };
    subject: {
      id: string;
      name: string;
      code: string;
    };
  }>;
}
