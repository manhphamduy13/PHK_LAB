# Kế Hoạch Rà Soát & Hoàn Thiện Toàn Diện Dự Án PHK_LAB

Tài liệu này chi tiết hoá toàn bộ giải pháp kỹ thuật, cấu trúc cơ sở dữ liệu, API endpoints và giao diện frontend cần điều chỉnh để hoàn thiện 100% các tính năng hiện có của dự án **PHK_LAB**, loại bỏ hoàn toàn các nút bấm "ảo" và dữ liệu giả lập, đồng thời bổ sung module **Liên kết Teacher ↔ Student** xuyên suốt.

---

## User Review Required

> [!IMPORTANT]
> - **Cơ sở dữ liệu**: Bổ sung cột `join_code` vào bảng `classes` và bổ sung `submission_content`, `submitted_at` vào bảng `student_assignments` trên cả hai file schema (`schema.sqlite.ts` và `schema.pg.ts`).
> - **Hệ thống Thông báo**: Tích hợp component `NotificationBell` vào cả `StudentLayout.tsx` và `AdminLayout.tsx`, kết nối API `GET /api/notifications` và `POST /api/notifications/:id/read`.
> - **LessonBuilder**: Loại bỏ UI tĩnh giả lập "Version History" (3 phiên bản hardcoded với nút Rollback chết) để tránh đánh lừa người dùng, tập trung hoàn thiện menu block (Nhân đôi / Xoá / Di chuyển lên xuống), selector câu hỏi thật từ Ngân hàng câu hỏi và Preview bài học thật.

---

## Đề Xuất Chi Tiết Theo Từng Module

### 1. Hệ thống Gamification (XP / Level / Streak / Bài học hoàn thành)

#### [MODIFY] [schema.sqlite.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/db/schema.sqlite.ts) & [schema.pg.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/db/schema.pg.ts)
- Đảm bảo `learnerProfiles`, `xpTransactions`, `progress` đồng bộ đầy đủ các trường.

#### [MODIFY] [gamification.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/gamification.ts)
- Sửa `GET /api/gamification/profile`:
  - Thêm `desc(xpTransactions.timestamp)` cho `recentActivity`.
  - Trả về `lessonsCompleted` tính bằng `count(*)` từ bảng `progress` (với status = `completed`).
  - Trả về `badgesCount` đếm từ `studentAchievements`.
  - Tự động khởi tạo `learnerProfiles` mặc định nếu học sinh chưa có profile trong database.
- Thêm `POST /api/gamification/award-xp`:
  - Nhận `{ amount, action, sourceType, sourceId }`.
  - Ghi vào `xpTransactions`, cập nhật `learnerProfiles.totalXp`, `lastActiveAt`, cập nhật streak qua `GamificationEngine`.
  - Trả về thông số level mới nhất (`level`, `currentLevelXp`, `nextLevelXp`, `progress`).
- Thêm `POST /api/gamification/complete-lesson`:
  - Nhận `{ lessonId }`.
  - Upsert vào bảng `progress` với status = `completed`.
  - Tự động gọi `GamificationEngine.awardXP` (50 XP cho bài học).
  - Trả về `lessonsCompleted` mới và thông số XP cập nhật.

#### [MODIFY] [GamificationEngine.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/services/gamification/GamificationEngine.ts)
- Tự động insert bản ghi `learnerProfiles` nếu chưa tồn tại khi cộng XP.

#### [MODIFY] [studentStore.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/store/studentStore.ts)
- Chuyển đổi `addXP` và `incrementLessons` thành async function gọi API thật (`/api/gamification/award-xp` và `/api/gamification/complete-lesson`).
- Thêm action `completeLesson: (lessonId: string) => Promise<void>`.
- Đồng bộ state từ API response thật thay vì chỉ optimistic local.

#### [MODIFY] [LessonPlayer.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/student/LessonPlayer.tsx), [VirtualLabPlayer.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/student/VirtualLabPlayer.tsx), [Exercises.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/student/Exercises.tsx)
- Cập nhật các lệnh gọi `completeLesson(lessonId)` và `addXP(amount, action, sourceType, sourceId)` để lưu DB thật.

---

### 2. Liên Kết Teacher ↔ Student (Quản lý lớp, Tham gia lớp, Giao bài, Nộp bài, Chấm điểm)

#### [MODIFY] [schema.sqlite.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/db/schema.sqlite.ts) & [schema.pg.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/db/schema.pg.ts)
- `classes`: Thêm cột `joinCode: text("join_code")`.
- `studentAssignments`: Thêm cột `submissionContent: text("submission_content")`, `submittedAt: integer/timestamp`.

#### [MODIFY] [classes.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/classes.ts)
- Khi tạo lớp (`POST /api/classes`): sinh tự động mã `joinCode` (ví dụ `PHK-XXXXX`).
- Thêm `POST /api/classes/join` (role `STUDENT`): nhận `joinCode`, tìm lớp tương ứng và insert bản ghi vào bảng `enrollments`.
- Thêm `GET /api/classes/my-enrolled` (role `STUDENT`): danh sách lớp học sinh đã tham gia.
- Cập nhật `GET /api/classes/:classId/students`: join với `learnerProfiles` và `progress` để trả về danh sách học sinh kèm XP, Level, số bài đã hoàn thành.
- Thêm `POST /api/classes/:classId/students` (role `TEACHER`/`SUPER_ADMIN`): thêm học sinh vào lớp theo email.
- Thêm `DELETE /api/classes/:classId/students/:studentId` (role `TEACHER`/`SUPER_ADMIN`): xoá học sinh khỏi lớp.

#### [MODIFY] [assignments.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/assignments.ts)
- Sửa lỗi TypeScript (Map typing) gây fail `tsc --noEmit`.
- Khi `POST /api/assignments`: tạo bài tập và bắn `notifications` cho tất cả học sinh trong lớp.
- Thêm/hoàn thiện endpoint `GET /api/assignments/:id/submissions` và `POST /api/assignments/:id/submissions/:studentId/grade` (hoặc alias `/student-submissions/:studentAssignmentId/grade`): lưu điểm + feedback, tạo `notifications` gửi cho học sinh được chấm.
- Hoàn thiện `POST /api/assignments/:id/submit`: nhận `submissionContent` (text/JSON) và file nộp tùy chọn, cập nhật `status = 'SUBMITTED'`, `submittedAt = now()`.

#### [NEW] [NotificationBell.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/components/NotificationBell.tsx)
- Component chuông thông báo hiển thị số lượng chưa đọc, dropdown xem danh sách thông báo, bấm vào đánh dấu đã đọc và điều hướng đến bài tập/kết quả.
- Tích hợp vào [StudentLayout.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/layouts/StudentLayout.tsx) và [AdminLayout.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/layouts/AdminLayout.tsx).

#### [MODIFY] [ClassManagement.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/ClassManagement.tsx)
- Thêm tab / khu vực "Danh sách học sinh":
  - Hiển thị mã lớp (`joinCode`) nổi bật để giáo viên copy chia sẻ.
  - Hiển thị danh sách học sinh (Avatar, Tên, Email, XP, Bài học hoàn thành, Ngày tham gia).
  - Form thêm học sinh bằng email và nút xoá học sinh khỏi lớp.
- Khu vực "Bài tập đã giao":
  - Bấm vào bài tập mở modal xem chi tiết bài nộp của học sinh (`GET /submissions`).
  - Giáo viên xem nội dung nộp / tải file nộp, nhập điểm, nhập lời nhận xét và bấm "Lưu điểm".

#### [MODIFY] [Assignments.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/student/Assignments.tsx)
- Phân loại tab: Tất cả / Chưa nộp / Đã nộp / Đã có điểm.
- Nút "Làm bài" điều hướng đúng: bài giảng mở `LessonPlayer`, bài tập mở `Exercises`, thí nghiệm mở `VirtualLabPlayer`.
- Modal "Nộp bài trực tiếp": học sinh có thể nhập ghi chú/lời giải văn bản hoặc đính kèm file, gọi `POST /api/assignments/:id/submit`.
- Hiển thị điểm số và nhận xét của giáo viên sau khi đã chấm.

---

### 3. Chuẩn Hoá Toàn Diện Các Trang Admin & Student (Xoá Nút Chết, Dữ Liệu Thật)

#### [MODIFY] [Profile.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/student/Profile.tsx)
- Bổ sung ô nhập mã lớp + nút "Tham gia lớp" (`POST /api/classes/join`) và danh sách các lớp đã tham gia.
- Nút Đổi mật khẩu rõ ràng (thay thế nút bánh răng chết).
- Hiển thị số huy hiệu thật từ `studentAchievements`.
- Tỷ lệ chính xác thật từ các bài tập / câu trả lời đã làm (hiển thị `—` nếu chưa có bài nào).
- Thời gian học: hiển thị số ngày streak liên tục có thật từ DB thay vì số giả `45h`.
- Khối lớp: hiển thị tên lớp thật hoặc grade thật từ profile.

#### [MODIFY] [AdminProfile.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/AdminProfile.tsx)
- Thống kê cá nhân: gọi API `/api/admin/stats` hiển thị số bài giảng, số khoá học, số bài tập, số lớp học và học sinh thật.
- Hoạt động gần đây: gọi API `/api/audit-logs` lọc theo `userId` của tài khoản hiện tại.
- Nút "Đổi mật khẩu" hoạt động thật với modal/prompt an toàn.

#### [MODIFY] [teacherAI.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/teacherAI.ts) & [TeacherAIAssistant.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/TeacherAIAssistant.tsx)
- Cho phép cả `TEACHER` và `SUPER_ADMIN` truy cập route `/api/teacher/ai`.
- `TeacherAIAssistant.tsx`: bắt `useLocation().state?.prefill` để tự động điền câu hỏi khi được điều hướng từ trang khác.

#### [MODIFY] [EarlyWarning.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/EarlyWarning.tsx)
- Nút "Can thiệp": điều hướng sang `/admin/teacher-ai` kèm state chứa tên học sinh, mức độ nguy cơ và lý do cảnh báo để trợ lý AI lập kế hoạch can thiệp.

#### [NEW] [AuditLogger.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/services/audit/AuditLogger.ts) & [MODIFY] [auditLogs.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/auditLogs.ts) & [AuditLog.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/AuditLog.tsx)
- Tạo service `AuditLogger.logAudit(db, { userId, userName, action, resource, resourceType, metadata })`.
- Ghi audit log tại: tạo lớp, thêm/xoá học sinh, tạo/xoá khoá học, xoá tài liệu, xuất bản bài học, chấm điểm bài tập.
- API `GET /api/audit-logs?search=` hỗ trợ tìm kiếm theo resource, userName, action.
- UI `AuditLog.tsx`: nối API thật, tìm kiếm với debounce, nút "Chi tiết" mở modal xem metadata của log.

#### [MODIFY] [questions.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/questions.ts) & [QuestionBank.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/QuestionBank.tsx)
- `questions.ts`: Cho phép `exerciseId` là optional hoặc liên kết mặc định; cập nhật cả `answers` khi `PUT /:id`.
- `QuestionBank.tsx`: Đầy đủ tính năng tạo câu hỏi trắc nghiệm (thêm/xoá lựa chọn, đánh dấu đáp án đúng), sửa, xoá, tìm kiếm.

#### [MODIFY] [LessonBuilder.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/LessonBuilder.tsx)
- Nút "Preview": mở modal preview bài học mô phỏng trải nghiệm học sinh.
- Nút `MoreVertical` trên mỗi block: mở menu Thao tác thật (Xoá block, Nhân đôi block, Di chuyển lên, Di chuyển xuống).
- Khối "Kéo thả khối vào đây" ở cuối: bấm vào mở nhanh menu thêm block.
- Xoá UI Version History giả.
- Dropdown cấp độ heading: lưu đúng vào `block.level`.
- Block quiz: thay text input tự do bằng `<select>` danh sách câu hỏi từ API Ngân hàng câu hỏi.

---

### 4. Ổn Định Hoá AI & PDF Pipeline

#### [MODIFY] [ai.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/routes/ai.ts)
- Bắt lỗi `MulterError` (`LIMIT_FILE_SIZE`) trả về JSON lỗi 400 rõ ràng tiếng Việt.
- Bổ sung `POST /api/ai/lessons/:id/regenerate-concepts`: gọi `GeminiProvider` trích xuất lại concepts từ PDF nguồn.
- Bổ sung `PATCH /api/ai/lessons/:id/sections`: cho phép sửa trực tiếp nội dung section hoặc regenerate từng section.
- Sửa `GET /api/ai/lessons/:id`: join `aiJobs` lấy `documentId` để luôn trả về `sourceDocumentId`.
- Đảm bảo `DELETE /api/ai/documents/:id` gọi `storageProvider.delete(doc.path)`.

#### [MODIFY] [PipelineManager.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/services/ai/PipelineManager.ts)
- Lưu `aiJobs.lessonId` khi job `COMPLETED`.
- Bọc từng bước với try/catch riêng và đặt timeout 3 phút tránh tình trạng kẹt trạng thái `PROCESSING`.

#### [MODIFY] [DocumentAnalyzer.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/services/ai/generators/DocumentAnalyzer.ts)
- Bổ sung `type: { type: "STRING", enum: ["text", "heading"] }` vào schema sections.

#### [MODIFY] [AIPipelineDashboard.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/AIPipelineDashboard.tsx)
- Sửa text dung lượng khớp với `maxPdfSize` cấu hình.
- Dừng polling khi tất cả job đã ở trạng thái `COMPLETED` hoặc `FAILED`.

#### [MODIFY] [AIPipelineReview.tsx](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/pages/admin/AIPipelineReview.tsx)
- Hiển thị PDF thật trong iframe từ blob download.
- Nút "Regenerate" concepts hoạt động thật.
- Cho phép inline edit nội dung section và lưu qua API.
- Nút "Tạo mô phỏng": kiểm tra khớp từ khoá với `VIRTUAL_LABS` thật; nếu không khớp thì disable kèm tooltip thông báo.

---

### 5. Dữ Liệu Mẫu (Seed) & Kiểm Thử End-to-End

#### [MODIFY] [seed.ts](file:///c:/Users/DELL/OneDrive/Desktop/PHK_LAB/PHK_LAB/src/db/seed.ts)
- Thêm 2 tài khoản học sinh (`student1@phk.edu`, `student2@phk.edu`), 1 lớp học mẫu của thầy Khê kèm mã lớp, 1 bài tập đã giao.

---

## Kế Hoạch Nghiệm Thu (Verification Plan)

### Automated Checks
1. Kiểm tra biên dịch TypeScript toàn dự án:
   ```bash
   cmd /c npx tsc --noEmit
   ```
2. Kiểm tra đóng gói build Vite:
   ```bash
   cmd /c npx vite build
   ```
3. Quét toàn bộ mã nguồn tìm nút chết và dữ liệu hardcoded:
   - Quét tìm `onClick={() => {}}`, `href="#"`, các nút bấm không có `onClick`/`type="submit"`.

### Manual / Flow Checks
1. **Luồng Gamification**: Hoàn thành bài học / thí nghiệm ảo -> XP và số bài hoàn thành lưu vào DB -> F5 tải lại trang số liệu không bị mất.
2. **Luồng Lớp học & Giao bài**:
   - Thầy Khê tạo lớp -> thấy mã lớp `PHK-XXXXX`.
   - Học sinh đăng nhập -> nhập mã lớp -> tham gia thành công.
   - Thầy Khê giao bài tập cho lớp -> Học sinh thấy thông báo chuông (đỏ) -> bấm vào thông báo mở bài tập -> nộp bài.
   - Thầy Khê vào lớp -> xem bài nộp -> chấm điểm -> Học sinh nhận thông báo điểm số.
3. **Luồng AI Pipeline**: Upload PDF -> kiểm tra tiến trình -> xem review (PDF hiển thị trong iframe, inline edit section) -> xuất bản.
