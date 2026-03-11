import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, CircularProgress } from "@mui/material";
import { AuthProvider, useAuth } from "./context/AuthContext";
import theme from "./theme";

// Layouts
import MainLayout from "./layouts/MainLayout";

// Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Rooms from "./pages/Rooms";
import Complaints from "./pages/Complaints";
import Fees from "./pages/Fees";
import MessManagement from "./pages/MessManagement";
import NotificationSystem from "./pages/NotificationSystem";
import ChatbotAnalytics from "./pages/ChatbotAnalytics";
import Settings from "./pages/Settings";

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #1976D2 0%, #64b5f6 100%)",
        }}
      >
        <CircularProgress size={60} sx={{ color: "white" }} />
      </Box>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  return children;
};

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />

            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <MainLayout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="rooms" element={<Rooms />} />
              <Route path="complaints" element={<Complaints />} />
              <Route path="fees" element={<Fees />} />
              <Route path="mess" element={<MessManagement />} />
              <Route path="notifications" element={<NotificationSystem />} />
              <Route path="chatbot" element={<ChatbotAnalytics />} />

              <Route path="settings" element={<Settings />} />
            </Route>

            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
