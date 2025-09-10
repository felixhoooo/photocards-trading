
import React, { useState } from 'react';
import { useAuthState, useUpdatePassword } from 'react-firebase-hooks/auth';
import { auth } from '../firebase';
import { useNavigate } from 'react-router-dom';
import { Box, TextField, Button, Typography, Container, Paper, CircularProgress, Alert } from '@mui/material';

const SetPasswordPage = () => {
  const [user] = useAuthState(auth);
  const [updatePassword, updating, error] = useUpdatePassword(auth);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [customError, setCustomError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setCustomError('');
    if (password !== confirmPassword) {
      setCustomError('Passwords do not match.');
      return;
    }
    const success = await updatePassword(password);
    if (success) {
      navigate('/');
    } 
  };

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
        <Paper elevation={6} sx={{ p: 4, width: '100%', borderRadius: '16px' }}>
            <Typography component="h1" variant="h5" align="center" gutterBottom>
                Set Your Password
            </Typography>
            <Typography variant="body2" align="center" sx={{ mb: 2 }}>
                Welcome! Please create a password to secure your account.
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="password"
                    label="New Password"
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="confirmPassword"
                    label="Confirm New Password"
                    type="password"
                    id="confirmPassword"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />
                {(error || customError) && (
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                    {error?.message || customError}
                    </Alert>
                )}
                <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{ mt: 3, mb: 2 }}
                    disabled={updating}
                >
                    {updating ? <CircularProgress size={24} /> : 'Save Password and Continue'}
                </Button>
            </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default SetPasswordPage;
