/**
 * Utility functions for exporting system data into standalone offline files (CSV, JSON, Offline HTML)
 */

export function downloadFile(filename: string, content: string, contentType: string) {
  const blob = new Blob([content], { type: contentType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(filename: string, headers: string[], rows: (string | number | null | undefined)[][]) {
  const escapeCell = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Add UTF-8 BOM so Excel opens Arabic letters perfectly
  const BOM = "\uFEFF";
  const csvContent =
    BOM +
    headers.map(escapeCell).join(",") +
    "\n" +
    rows.map((row) => row.map(escapeCell).join(",")).join("\n");

  downloadFile(filename, csvContent, "text/csv;charset=utf-8;");
}

export function generateOfflineSchoolHTML(data: any): string {
  const schoolName = data.school?.name || "المدرسة الأهلية";
  const year = data.school?.activeYear || "2024-2025";
  const phone = data.school?.phone || "";
  const currency = data.school?.currency || "د.ع";
  const dateStr = data.generatedAt || new Date().toLocaleString("ar-IQ");

  const students = data.students || [];
  const teachers = data.teachers || [];
  const gradeRecords = data.gradeRecords || [];
  const paymentReceipts = data.paymentReceipts || [];
  const timetableSlots = data.timetableSlots || [];
  const attendanceRecords = data.attendanceRecords || [];

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>حزمة الطوارئ والنسخة الكاملة المستقلة — ${schoolName}</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Cairo', sans-serif; }
    body { background-color: #f8fafc; color: #0f172a; line-height: 1.5; padding: 20px; }
    .header { background: #0f172a; color: #fff; padding: 24px; border-radius: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
    .header h1 { font-size: 22px; font-weight: 900; }
    .header p { font-size: 12px; color: #94a3b8; }
    .badge { background: #10b981; color: #fff; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; }
    .tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; background: #e2e8f0; padding: 6px; border-radius: 16px; }
    .tab-btn { padding: 10px 18px; border: none; background: transparent; font-size: 13px; font-weight: bold; color: #475569; border-radius: 12px; cursor: pointer; transition: all 0.2s; }
    .tab-btn.active { background: #0f172a; color: #fff; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .tab-content { display: none; background: #fff; padding: 24px; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
    .tab-content.active { display: block; }
    .search-box { width: 100%; padding: 12px 16px; border: 2px solid #e2e8f0; border-radius: 12px; font-size: 13px; font-weight: bold; margin-bottom: 16px; outline: none; }
    .search-box:focus { border-color: #10b981; }
    table { width: 100%; border-collapse: collapse; text-align: right; font-size: 12px; }
    th { background: #f1f5f9; padding: 12px; font-weight: 900; color: #1e293b; border-bottom: 2px solid #cbd5e1; }
    td { padding: 10px 12px; border-bottom: 1px solid #f1f5f9; }
    tr:hover { background: #f8fafc; }
    .btn-print { background: #0f172a; color: #fff; padding: 8px 16px; border: none; border-radius: 10px; font-size: 12px; font-weight: bold; cursor: pointer; }
    .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 20px; }
    .card { background: #f8fafc; padding: 16px; border-radius: 14px; border: 1px solid #e2e8f0; }
    .card span { font-size: 11px; color: #64748b; font-weight: bold; display: block; }
    .card h3 { font-size: 20px; font-weight: 900; color: #0f172a; margin-top: 4px; }
    @media print {
      body { padding: 0; background: #fff; }
      .header, .tabs, .search-box, .btn-print { display: none !important; }
      .tab-content { display: block !important; border: none; box-shadow: none; padding: 0; }
      th { background: #000 !important; color: #fff !important; }
      td, th { border: 1px solid #000 !important; }
    }
  </style>
</head>
<body>

  <div class="header">
    <div>
      <h1>${schoolName} — حزمة الطوارئ والنسخة المستقلة الكاملة</h1>
      <p>تاريخ تصدير واستخراج البيانات: <strong>${dateStr}</strong> | العام الدراسي: <strong>${year}</strong> | الهاتف: <strong>${phone}</strong></p>
    </div>
    <div style="display: flex; gap: 8px; align-items: center;">
      <span class="badge">يعمل أوفلاين 100% بدون إنترنت</span>
      <button class="btn-print" onclick="window.print()">🖨️ طباعة الكشف</button>
    </div>
  </div>

  <div class="summary-grid">
    <div class="card">
      <span>إجمالي الطلاب المسجلين</span>
      <h3>${students.length} طالب</h3>
    </div>
    <div class="card">
      <span>كادر المعلمين</span>
      <h3>${teachers.length} مدرس</h3>
    </div>
    <div class="card">
      <span>الوصولات المالية المسجلة</span>
      <h3>${paymentReceipts.length} وصل مالي</h3>
    </div>
    <div class="card">
      <span>سجلات الدرجات</span>
      <h3>${gradeRecords.length} مادة مرصودة</h3>
    </div>
  </div>

  <div class="tabs">
    <button class="tab-btn active" onclick="switchTab('students')">🎓 الطلاب وأولياء الأمور (${students.length})</button>
    <button class="tab-btn" onclick="switchTab('grades')">📊 سجل الدرجات والشهادات (${gradeRecords.length})</button>
    <button class="tab-btn" onclick="switchTab('payments')">💳 الحسابات والوصولات (${paymentReceipts.length})</button>
    <button class="tab-btn" onclick="switchTab('timetable')">📅 الجدول الدراسي الأسبوعي (${timetableSlots.length})</button>
    <button class="tab-btn" onclick="switchTab('teachers')">👨‍🏫 كادر المعلمين (${teachers.length})</button>
    <button class="tab-btn" onclick="switchTab('attendance')">🕒 كشف الحضور والغياب (${attendanceRecords.length})</button>
  </div>

  <!-- 1. STUDENTS TAB -->
  <div id="students" class="tab-content active">
    <input type="text" class="search-box" id="studentSearch" onkeyup="filterTable('studentTable', this.value)" placeholder="🔍 ابحث عن اسم الطالب، الرقم المدرسي، الصف، أو هاتف ولي الأمر...">
    <div style="overflow-x: auto;">
      <table id="studentTable">
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الطالب</th>
            <th>الرقم المدرسي</th>
            <th>الصف والشعبة</th>
            <th>اسم ولي الأمر</th>
            <th>هاتف ولي الأمر</th>
            <th>القسط الكلي</th>
            <th>المسدد</th>
            <th>المتبقي</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>
          ${students
            .map((s: any, idx: number) => {
              const paid =
                (s.paymentReceipts || []).reduce((acc: number, r: any) => acc + r.amount, 0) +
                (s.depositAmount || 0);
              const remaining = (s.totalTuition || 0) - paid;
              return `<tr>
                <td>${idx + 1}</td>
                <td><strong>${s.user?.fullName || ""}</strong></td>
                <td>${s.studentNumber || ""}</td>
                <td>${s.classRoom?.name || ""} - شعبة (${s.section?.name || ""})</td>
                <td>${s.guardianName || ""}</td>
                <td dir="ltr" style="text-align: right;">${s.guardianPhone || ""}</td>
                <td>${Number(s.totalTuition || 0).toLocaleString()} ${currency}</td>
                <td style="color: #059669; font-weight: bold;">${Number(paid).toLocaleString()} ${currency}</td>
                <td style="color: ${remaining > 0 ? "#dc2626" : "#059669"}; font-weight: bold;">${Number(remaining).toLocaleString()} ${currency}</td>
                <td>${s.registrationStatus === "ACTIVE" ? "مستمر بالدوام" : s.registrationStatus}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 2. GRADES TAB -->
  <div id="grades" class="tab-content">
    <input type="text" class="search-box" id="gradeSearch" onkeyup="filterTable('gradeTable', this.value)" placeholder="🔍 ابحث عن اسم الطالب، الصف، أو المادة الدراسية...">
    <div style="overflow-x: auto;">
      <table id="gradeTable">
        <thead>
          <tr>
            <th>#</th>
            <th>اسم الطالب</th>
            <th>الصف والشعبة</th>
            <th>المادة</th>
            <th>ش 1</th>
            <th>ش 2</th>
            <th>سعي ف1</th>
            <th>نصف سنة</th>
            <th>ش 3</th>
            <th>ش 4</th>
            <th>سعي ف2</th>
            <th>السعي السنوي</th>
            <th>الامتحان النهائي</th>
            <th>الدرجة النهائية</th>
          </tr>
        </thead>
        <tbody>
          ${gradeRecords
            .map((g: any, idx: number) => `<tr>
              <td>${idx + 1}</td>
              <td><strong>${g.student?.user?.fullName || ""}</strong></td>
              <td>${g.student?.classRoom?.name || ""} - (${g.student?.section?.name || ""})</td>
              <td>${g.subject?.name || ""}</td>
              <td>${g.month1 ?? "-"}</td>
              <td>${g.month2 ?? "-"}</td>
              <td><strong>${g.term1Average ?? "-"}</strong></td>
              <td style="background: #eff6ff; font-weight: bold;">${g.midYear ?? "-"}</td>
              <td>${g.month3 ?? "-"}</td>
              <td>${g.month4 ?? "-"}</td>
              <td><strong>${g.term2Average ?? "-"}</strong></td>
              <td style="background: #eef2ff; font-weight: bold;">${g.annualAverage ?? "-"}</td>
              <td>${g.finalExam ?? "-"}</td>
              <td style="background: #ecfdf5; color: #065f46; font-weight: 900;">${g.finalGrade ?? "-"}</td>
            </tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 3. PAYMENTS TAB -->
  <div id="payments" class="tab-content">
    <input type="text" class="search-box" id="paymentSearch" onkeyup="filterTable('paymentTable', this.value)" placeholder="🔍 ابحث برقم الوصل، اسم الطالب، التاريخ، أو المبلغ...">
    <div style="overflow-x: auto;">
      <table id="paymentTable">
        <thead>
          <tr>
            <th>#</th>
            <th>رقم الوصل</th>
            <th>اسم الطالب</th>
            <th>الصف والشعبة</th>
            <th>تاريخ القبض</th>
            <th>المبلغ المقبوض</th>
            <th>طريقة الدفع</th>
            <th>ملاحظات والبيان</th>
          </tr>
        </thead>
        <tbody>
          ${paymentReceipts
            .map((r: any, idx: number) => `<tr>
              <td>${idx + 1}</td>
              <td><strong>${r.receiptNumber}</strong></td>
              <td>${r.student?.user?.fullName || ""}</td>
              <td>${r.student?.classRoom?.name || ""} (${r.student?.section?.name || ""})</td>
              <td>${r.paymentDate}</td>
              <td style="color: #059669; font-weight: 900;">${Number(r.amount).toLocaleString()} ${currency}</td>
              <td>${r.paymentMethod}</td>
              <td>${r.notes || "—"}</td>
            </tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 4. TIMETABLE TAB -->
  <div id="timetable" class="tab-content">
    <input type="text" class="search-box" id="ttSearch" onkeyup="filterTable('ttTable', this.value)" placeholder="🔍 ابحث باليوم، الصف، المادة، أو اسم المدرس...">
    <div style="overflow-x: auto;">
      <table id="ttTable">
        <thead>
          <tr>
            <th>اليوم</th>
            <th>الحصة</th>
            <th>الصف والشعبة</th>
            <th>المادة الدراسية</th>
            <th>المدرس المعين</th>
          </tr>
        </thead>
        <tbody>
          ${timetableSlots
            .map((slot: any) => `<tr>
              <td><strong>${slot.dayOfWeek}</strong></td>
              <td>الحصة ${slot.periodNumber}</td>
              <td>${slot.classRoom?.name || ""} - شعبة (${slot.section?.name || ""})</td>
              <td><strong>${slot.subject?.name || ""}</strong></td>
              <td>${slot.teacher?.fullName || ""}</td>
            </tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 5. TEACHERS TAB -->
  <div id="teachers" class="tab-content">
    <input type="text" class="search-box" id="tSearch" onkeyup="filterTable('tTable', this.value)" placeholder="🔍 ابحث باسم المدرس، الهاتف، أو المادة...">
    <div style="overflow-x: auto;">
      <table id="tTable">
        <thead>
          <tr>
            <th>#</th>
            <th>اسم المعلم الكامل</th>
            <th>رقم الهاتف</th>
            <th>المواد والصفوف المسندة</th>
          </tr>
        </thead>
        <tbody>
          ${teachers
            .map((t: any, idx: number) => {
              const assignments = (t.teacherAssignments || [])
                .map((a: any) => `${a.subject?.name} (${a.classRoom?.name} - ${a.section?.name})`)
                .join(" | ");
              return `<tr>
                <td>${idx + 1}</td>
                <td><strong>${t.fullName}</strong></td>
                <td dir="ltr" style="text-align: right;">${t.phone || "—"}</td>
                <td>${assignments || "لم تسند مواد بعد"}</td>
              </tr>`;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <!-- 6. ATTENDANCE TAB -->
  <div id="attendance" class="tab-content">
    <input type="text" class="search-box" id="attSearch" onkeyup="filterTable('attTable', this.value)" placeholder="🔍 ابحث بالتاريخ، اسم الطالب، أو الحالة...">
    <div style="overflow-x: auto;">
      <table id="attTable">
        <thead>
          <tr>
            <th>#</th>
            <th>التاريخ</th>
            <th>اسم الطالب</th>
            <th>الصف والشعبة</th>
            <th>الحالة</th>
            <th>ملاحظات</th>
          </tr>
        </thead>
        <tbody>
          ${attendanceRecords
            .map((att: any, idx: number) => `<tr>
              <td>${idx + 1}</td>
              <td><strong>${att.date}</strong></td>
              <td>${att.student?.user?.fullName || ""}</td>
              <td>${att.student?.classRoom?.name || ""} (${att.student?.section?.name || ""})</td>
              <td><strong>${att.status}</strong></td>
              <td>${att.notes || "—"}</td>
            </tr>`)
            .join("")}
        </tbody>
      </table>
    </div>
  </div>

  <script>
    function switchTab(tabId) {
      document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
      event.target.classList.add('active');
      document.getElementById(tabId).classList.add('active');
    }

    function filterTable(tableId, query) {
      const filter = query.toLowerCase();
      const table = document.getElementById(tableId);
      const trs = table.getElementsByTagName('tr');
      for (let i = 1; i < trs.length; i++) {
        const text = trs[i].textContent || trs[i].innerText;
        trs[i].style.display = text.toLowerCase().indexOf(filter) > -1 ? "" : "none";
      }
    }
  </script>
</body>
</html>`;
}
