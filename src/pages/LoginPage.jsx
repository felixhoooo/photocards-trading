
import React, { useState, useEffect } from "react";
import { 
    useAuthState,
    useSignInWithEmailAndPassword, 
    useSignInWithGoogle,
    useSendSignInLinkToEmail
} from "react-firebase-hooks/auth";
import { isSignInWithEmailLink, signInWithEmailLink } from "firebase/auth";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import { Google } from "@mui/icons-material";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  Link as MuiLink
} from "@mui/material";
import { doc, setDoc, getDoc } from "firebase/firestore";

const actionCodeSettings = {
    url: window.location.origin + '/login',
    handleCodeInApp: true,
};

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [customError, setCustomError] = useState('');
  const navigate = useNavigate();

  const [user, authLoading] = useAuthState(auth);
  const [signInWithEmailAndPassword, userCred, loading, error] = useSignInWithEmailAndPassword(auth);
  const [sendSignInLinkToEmail, sending, linkError] = useSendSignInLinkToEmail(auth);
  const [signInWithGoogle, googleUserCred, googleLoading, googleError] = useSignInWithGoogle(auth);
  
  const [linkSignInLoading, setLinkSignInLoading] = useState(false);
  const [linkSignInError, setLinkSignInError] = useState(null);

  useEffect(() => {
    if (!authLoading && isSignInWithEmailLink(auth, window.location.href)) {
      let emailForSignIn = window.localStorage.getItem('emailForSignIn');
      if (!emailForSignIn) {
        emailForSignIn = window.prompt('Please provide your email for confirmation');
      }
      if (emailForSignIn) {
        setLinkSignInLoading(true);
        signInWithEmailLink(auth, emailForSignIn, window.location.href)
          .catch((error) => setLinkSignInError(error))
          .finally(() => setLinkSignInLoading(false));
      }
    }
  }, [authLoading]);

  useEffect(() => {
    if (!authLoading && user) {
        const userDocRef = doc(db, "users", user.uid);
        getDoc(userDocRef).then(docSnap => {
            if (!docSnap.exists()) {
                setDoc(userDocRef, {
                    email: user.email,
                    displayName: user.displayName || user.email.split('@')[0],
                    photoURL: user.photoURL || ''
                });
            }
        });

        const hasPassword = user.providerData.some(p => p.providerId === 'password');
        const isGoogle = user.providerData.some(p => p.providerId === 'google.com');

        if (isGoogle || hasPassword) {
            navigate("/");
        } else if (!hasPassword) {
            navigate("/set-password");
        }
    }
  }, [user, authLoading, navigate]);

  const handleLogin = (e) => {
    e.preventDefault();
    setCustomError('');
    signInWithEmailAndPassword(email, password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setCustomError('');
    try {
      await sendSignInLinkToEmail(email, actionCodeSettings);
      window.localStorage.setItem('emailForSignIn', email);
      setLinkSent(true);
    } catch (err) {
        // Error is captured by the linkError hook state
    }
  };

  const authError = error || googleError || linkError || linkSignInError || (customError && { message: customError });
  const isLoading = loading || googleLoading || sending || linkSignInLoading || authLoading;

  return (
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "80vh",
          }}
        >
          <Paper elevation={6} sx={{ p: { xs: 2, sm: 4 }, width: '100%', borderRadius: '16px' }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
              {linkSent ? "Check Your Email" : (isRegister ? "Register" : "Login")}
            </Typography>

            {linkSent ? (
                <Alert severity="success" sx={{ width: '100%', mt: 2, mb: 2 }}>
                    A login link has been sent to your email address ({email}). Please click the link to sign in.
                </Alert>
            ) : (
                <Box component="form" onSubmit={isRegister ? handleRegister : handleLogin} sx={{ mt: 1 }}>
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="email"
                        label="Email Address"
                        name="email"
                        autoComplete="email"
                        autoFocus
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {!isRegister && (
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Password"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    )}
                    
                    {authError && (
                        <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {authError.message}
                        </Alert>
                    )}
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isLoading}
                    >
                        {isLoading ? <CircularProgress size={24} /> : (isRegister ? "Send Login Link" : "Sign In")}
                    </Button>
                    <Button
                        fullWidth
                        variant="outlined"
                        startIcon={<Google />}
                        onClick={() => signInWithGoogle()}
                        disabled={isLoading}
                    >
                        Sign In with Google
                    </Button>
                </Box>
            )}
            <Box sx={{ mt: 2, textAlign: 'center' }}>
                <MuiLink component="button" variant="body2" onClick={() => { setIsRegister(!isRegister); setCustomError(''); setLinkSent(false); }}>
                  {isRegister ? "Already have an account? Sign In" : "Don't have an account? Register"}
                </MuiLink>
            </Box>
          </Paper>
        </Box>
      </Container>
    );
};

export default LoginPage;
