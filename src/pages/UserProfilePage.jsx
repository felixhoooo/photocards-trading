import React, { useState } from 'react';
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Grid,
  TextField,
  Typography,
} from '@mui/material';

const mockUser = {
  displayName: 'K-Pop Fan',
  email: 'kpopfan@example.com',
  photoURL: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  instagram: '@kpopfan',
};

const UserProfilePage = () => {
  const [user, setUser] = useState(mockUser);
  const [isEditing, setIsEditing] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  return (
    <Container maxWidth="sm">
      <Card sx={{ mt: 4, p: 2, borderRadius: 2, boxShadow: 3 }}>
        <CardContent>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Avatar
              alt={user.displayName}
              src={user.photoURL}
              sx={{ width: 120, height: 120, m: 'auto', mb: 2 }}
            />
            <Typography variant="h4" component="h1">
              {user.displayName}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {user.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Instagram: {user.instagram}
            </Typography>
          </Box>

          {isEditing ? (
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Display Name"
                  name="displayName"
                  value={user.displayName}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={user.email}
                  onChange={handleInputChange}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Instagram"
                  name="instagram"
                  value={user.instagram}
                  onChange={handleInputChange}
                />
              </Grid>
            </Grid>
          ) : null}

          <Box sx={{ mt: 3, textAlign: 'center' }}>
            <Button
              variant="contained"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? 'Save' : 'Edit Profile'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default UserProfilePage;
