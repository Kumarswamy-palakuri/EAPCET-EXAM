import { Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import { useAuth } from "./context/AuthContext";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import DashboardPage from "./pages/DashboardPage";
import ExamPage from "./pages/ExamPage";
import LoginPage from "./pages/LoginPage";
import NotFoundPage from "./pages/NotFoundPage";
import ResultPage from "./pages/ResultPage";

const HomeRedirect = () => {
  const { isAdmin } = useAuth();
  return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
};

const App = () => (
  <Routes>
    <Route path="/" element={<HomeRedirect />} />
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/dashboard"
      element={<DashboardPage />}
    />
    <Route
      path="/exam/:examId"
      element={
        <ProtectedRoute allowRoles={["student", "admin"]}>
          <ExamPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/result/:attemptId"
      element={
        <ProtectedRoute allowRoles={["student", "admin"]}>
          <ResultPage />
        </ProtectedRoute>
      }
    />
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowRoles={["admin"]}>
          <AdminDashboardPage />
        </ProtectedRoute>
      }
    />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
