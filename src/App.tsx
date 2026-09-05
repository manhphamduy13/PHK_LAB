/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { AdminLayout } from "./layouts/AdminLayout";
import { StudentLayout } from "./layouts/StudentLayout";

// Pages
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import StudentDashboard from "./pages/student/Dashboard";
import CourseExplorer from "./pages/student/CourseExplorer";
import CourseDetails from "./pages/student/CourseDetails";
import LessonPlayer from "./pages/student/LessonPlayer";
import Exercises from "./pages/student/Exercises";
import Assignments from "./pages/student/Assignments";
import Flashcards from "./pages/student/Flashcards";
import AITutor from "./pages/student/AITutor";
import ExamPrep from "./pages/student/ExamPrep";
import VirtualLab from "./pages/student/VirtualLab";
import VirtualLabPlayer from "./pages/student/VirtualLabPlayer";
import Achievements from "./pages/student/Achievements";
import Profile from "./pages/student/Profile";
import AdminDashboard from "./pages/admin/Dashboard";
import LessonBuilder from "./pages/admin/LessonBuilder";
import CourseManagement from "./pages/admin/CourseManagement";
import ClassManagement from "./pages/admin/ClassManagement";
import ExerciseBank from "./pages/admin/ExerciseBank";
import MediaLibrary from "./pages/admin/MediaLibrary";
import UserManagement from "./pages/admin/UserManagement";
import AuditLog from "./pages/admin/AuditLog";
import AdminProfile from "./pages/admin/AdminProfile";
import QuestionBank from "./pages/admin/QuestionBank";
import ExperimentLibrary from "./pages/admin/ExperimentLibrary";
import AIPipelineDashboard from "./pages/admin/AIPipelineDashboard";
import AIPipelineReview from "./pages/admin/AIPipelineReview";
import TeacherAIAssistant from "./pages/admin/TeacherAIAssistant";
import EarlyWarning from "./pages/admin/EarlyWarning";

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-center">
      <h2 className="text-2xl font-bold text-slate-400 mb-2">{title}</h2>
      <p className="text-slate-500">Page is under construction (Phase 1)</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Student Routes */}
        <Route element={<ProtectedRoute allowedRoles={["STUDENT"]} />}>
          <Route element={<StudentLayout />}>
            <Route path="/student" element={<StudentDashboard />} />
            <Route path="/student/courses" element={<CourseExplorer />} />
            <Route path="/student/courses/:id" element={<CourseDetails />} />
            <Route path="/student/lessons/:id" element={<LessonPlayer />} />
            <Route path="/student/exercises" element={<Exercises />} />
            <Route path="/student/assignments" element={<Assignments />} />
            <Route path="/student/flashcards" element={<Flashcards />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route
              path="/student/progress"
              element={<PlaceholderPage title="Tiến độ" />}
            />
            <Route path="/student/achievements" element={<Achievements />} />
            <Route path="/student/ai-tutor" element={<AITutor />} />
            <Route path="/student/exam-prep" element={<ExamPrep />} />
            <Route path="/student/labs" element={<VirtualLab />} />
            <Route path="/student/labs/:labId" element={<VirtualLabPlayer />} />
          </Route>
        </Route>

        {/* Admin/Teacher Routes */}
        <Route
          element={<ProtectedRoute allowedRoles={["SUPER_ADMIN", "TEACHER"]} />}
        >
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/courses" element={<CourseManagement />} />
            <Route path="/admin/classes" element={<ClassManagement />} />
            <Route
              path="/admin/lessons/:id/editor"
              element={<LessonBuilder />}
            />
            <Route path="/admin/exercises" element={<ExerciseBank />} />
            <Route path="/admin/questions" element={<QuestionBank />} />
            <Route path="/admin/media" element={<MediaLibrary />} />
            <Route path="/admin/ai-content" element={<AIPipelineDashboard />} />
            <Route
              path="/admin/ai-content/:id/review"
              element={<AIPipelineReview />}
            />
            <Route path="/admin/teacher-ai" element={<TeacherAIAssistant />} />
            <Route path="/admin/early-warning" element={<EarlyWarning />} />
            <Route path="/admin/experiments" element={<ExperimentLibrary />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/audit-log" element={<AuditLog />} />
            <Route path="/admin/profile" element={<AdminProfile />} />
          </Route>
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
