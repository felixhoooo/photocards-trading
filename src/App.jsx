
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

const LoadingFallback = () => (
  <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
    <CircularProgress />
  </Box>
);

function App() {
  const [user] = useAuthState(auth);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/cards" element={user ? <CardsPage /> : <LoginPage />} />
              <Route path="/admin" element={<Navigate to="/cards" />} />
              <Route path="/card/:id" element={<CardDetailsPage />} />
              <Route path="/profile" element={user ? <ProfilePage /> : <LoginPage />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
