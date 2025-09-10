
import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider, CssBaseline, CircularProgress, Box } from "@mui/material";
import Layout from "./components/Layout";
import { auth } from "./firebase";
import { useAuthState } from "react-firebase-hooks/auth";
import theme from "./theme";

const HomePage = lazy(() => import("./pages/HomePage"));
const CardsPage = lazy(() => import("./pages/CardsPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const CardDetailsPage = lazy(() => import("./pages/CardDetailsPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const SetPasswordPage = lazy(() => import("./pages/SetPasswordPage"));

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

const PrivateRoute = ({ children }) => {
    const [user, loading] = useAuthState(auth);
  
    if (loading) {
      return <LoadingFallback />;
    }

    if (!user) {
        return <Navigate to="/login" />;
    }

    const hasPassword = user.providerData.some(p => p.providerId === 'password');
    if (!hasPassword && user.providerData[0].providerId !== 'google.com') {
        return <Navigate to="/set-password" />;
    }
  
    return children;
  };

function App() {
  const [user, loading] = useAuthState(auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/set-password" element={!loading && user ? <SetPasswordPage /> : <Navigate to="/login" />} />
              <Route path="/cards" element={<PrivateRoute><CardsPage /></PrivateRoute>} />
              <Route path="/admin" element={<Navigate to="/cards" />} />
              <Route path="/card/:id" element={<PrivateRoute><CardDetailsPage /></PrivateRoute>} />
              <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/profile/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
              <Route path="/user/:userId" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
