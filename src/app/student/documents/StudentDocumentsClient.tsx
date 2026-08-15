"use client";

import React, { useState } from "react";
import { updateStudentDocumentStatusAction } from "@/app/actions/documentActions";
import { Badge } from "@/components/ui/Badge";
import {
  FolderLock,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  FileText,
  Camera,
  RefreshCw,
} from "lucide-react";

interface StudentDocumentsClientProps {
  documents: any[];
}

export const StudentDocumentsClient: React.FC<StudentDocumentsClientProps> = ({
  documents: initialDocuments,
}) => {
  const [documents, setDocuments] = useState<any[]>(initialDocuments);
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  const handleUploadSimulate = async (docId: string) => {
    setUploadingId(docId);
    try {
      await updateStudentDocumentStatusAction({
        studentDocId: docId,
        status: "UPLOADED",
        fileUrl: "/uploads/simulated_document.jpg",
        notes: "تم الرفع من قبل الطالب بنجاح عبر الكاميرا/الملف",
      });
      alert("تم رفع المستمسك بنجاح وجاري مراجعته وتدقيقه من قبل إدارة المدرسة.");
      window.location.reload();
    } catch (e: any) {
      alert(e.message || "خطأ أثناء الرفع");
    } finally {
      setUploadingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">المستمسكات والوثائق الرسمية</h1>
        <p className="text-xs text-slate-500 font-medium mt-0.5">
          قائمة المستندات المطلوبة لملف الطالب وإمكانية الرفع أو الالتقاط المباشر بالكاميرا.
        </p>
      </div>

      {/* Documents Checklist */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {documents.map((d) => {
          const isCompleted = d.status === "VERIFIED" || d.status === "UPLOADED";

          return (
            <div
              key={d.id}
              className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold ${
                        isCompleted ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{d.requirement.title}</h4>
                      <span className="text-[10px] text-slate-400">
                        {d.requirement.isRequired ? "مستند إلزامي" : "مستند اختياري"}
                      </span>
                    </div>
                  </div>

                  <Badge
                    variant={
                      d.status === "VERIFIED"
                        ? "success"
                        : d.status === "UPLOADED"
                        ? "info"
                        : "danger"
                    }
                  >
                    {d.status === "VERIFIED"
                      ? "موثق ومطابق ✅"
                      : d.status === "UPLOADED"
                      ? "قيد التدقيق ⏳"
                      : "غير مكتمل ❌"}
                  </Badge>
                </div>

                {d.notes && (
                  <p className="text-xs text-slate-500 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    {d.notes}
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  {isCompleted ? "المستند مرفوع بالملف" : "مطلوب تسليمه أو رفعه"}
                </span>

                <button
                  onClick={() => handleUploadSimulate(d.id)}
                  disabled={uploadingId === d.id}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm"
                >
                  {uploadingId === d.id ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Camera className="w-3.5 h-3.5" />
                  )}
                  <span>{isCompleted ? "إعادة رفع / تصوير" : "رفع المستند الآن"}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
