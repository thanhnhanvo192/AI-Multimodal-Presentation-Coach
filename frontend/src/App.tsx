import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./LoginPage";
import SignUpPage from "./SignUpPage";
import DashboardPage from "./DashboardPage";
import StudioPage from "./StudioPage";
import AnalyzingPage from "./AnalyzingPage";
import ReportPage from "./ReportPage";
import HistoryPage from "./HistoryPage";
import AdminPage from "./AdminPage";
import UploadPage from "./UploadPage";
import SettingsPage from "./SettingsPage";
import UsersPage from "./UsersPage";
import AdminSettingsPage from "./AdminSettingsPage";
import AdminDashboardPage from "./AdminDashboardPage";
import AdminLogsPage from "./AdminLogsPage";

/* ── Route Guard Components ──────────────────────────────── */
function StudentRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== "student") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (userRole !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function GuestRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole } = useAuth();
  if (isAuthenticated) {
    return <Navigate to={userRole === "admin" ? "/admin/dashboard" : "/dashboard"} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const navigate = useNavigate();
  const { userRole, logout } = useAuth();

  const handleNav = (destination: string) => {
    if (destination === "settings" && userRole === "admin") {
      navigate("/admin/settings");
      return;
    }
    if (destination === "users") {
      navigate("/admin/users");
      return;
    }
    if (destination === "config") {
      navigate("/admin/config");
      return;
    }
    if (destination === "logs") {
      navigate("/admin/logs");
      return;
    }
    const destinationMap: Record<string, string> = {
      dashboard: userRole === "admin" ? "/admin/dashboard" : "/dashboard",
      studio: "/studio",
      upload: "/upload",
      history: "/history",
      settings: "/settings",
      admin: "/admin/dashboard",
    };
    navigate(destinationMap[destination] || `/${destination}`);
  };

  return (
    <Routes>
      {/* Public Landing Page */}
      <Route
        path="/"
        element={
          <LandingPage
            onLogin={() => navigate("/login")}
            onSignUp={() => navigate("/signup")}
            onAdmin={() => navigate("/login")}
          />
        }
      />

      {/* Guest-only routes */}
      <Route
        path="/login"
        element={
          <GuestRoute>
            <LoginPage
              onBack={() => navigate("/")}
              onSignUp={() => navigate("/signup")}
              onLoginSuccess={(role) => {
                navigate(role === "admin" ? "/admin/dashboard" : "/dashboard");
              }}
            />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <SignUpPage
              onBack={() => navigate("/")}
              onLogin={() => navigate("/login")}
            />
          </GuestRoute>
        }
      />

      {/* Student Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <StudentRoute>
            <DashboardPage
              onNav={handleNav}
              onViewReport={(id) => navigate(`/report/${id}`)}
              userRole="student"
            />
          </StudentRoute>
        }
      />
      <Route
        path="/studio"
        element={
          <StudentRoute>
            <StudioPage onNav={handleNav} onAnalyze={() => navigate("/analyzing")} userRole="student" />
          </StudentRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <StudentRoute>
            <UploadPage onNav={handleNav} onAnalyze={() => navigate("/analyzing")} userRole="student" />
          </StudentRoute>
        }
      />
      <Route
        path="/analyzing"
        element={
          <StudentRoute>
            <AnalyzingPage
              onNav={handleNav}
              onDone={(newId) => navigate(`/report/${newId}`)}
              userRole="student"
            />
          </StudentRoute>
        }
      />
      <Route
        path="/report/:sessionId"
        element={
          <StudentRoute>
            <ReportPage onNav={handleNav} userRole="student" />
          </StudentRoute>
        }
      />
      {/* Fallback khi truy cập /report không kèm ID */}
      <Route
        path="/report"
        element={<Navigate to="/history" replace />}
      />
      <Route
        path="/history"
        element={
          <StudentRoute>
            <HistoryPage
              onNav={handleNav}
              onViewReport={(id) => navigate(`/report/${id}`)}
              userRole="student"
            />
          </StudentRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <StudentRoute>
            <SettingsPage onNav={handleNav} userRole="student" />
          </StudentRoute>
        }
      />

      {/* Admin Protected Routes */}
      <Route
        path="/admin"
        element={<Navigate to="/admin/dashboard" replace />}
      />
      <Route
        path="/admin/dashboard"
        element={
          <AdminRoute>
            <AdminDashboardPage onNav={handleNav} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminRoute>
            <UsersPage onNav={handleNav} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/config"
        element={
          <AdminRoute>
            <AdminPage onNav={handleNav} userRole="admin" />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/logs"
        element={
          <AdminRoute>
            <AdminLogsPage onNav={handleNav} />
          </AdminRoute>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminRoute>
            <AdminSettingsPage
              onNav={handleNav}
              onLogout={() => {
                logout();
                navigate("/login");
              }}
            />
          </AdminRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
