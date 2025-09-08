import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, Button, TextField, Box, Typography, CircularProgress, Alert } from '@mui/material';
import { updatePassword } from 'firebase/auth';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profile, setProfile] = useState({ displayName: '', bio: '', photoURL: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [cardCount, setCardCount] = useState(0);

  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const profilePromise = getDoc(doc(db, 'users', user.uid));
          const cardsPromise = getDocs(query(collection(db, "cards"), where("userId", "==", user.uid)));

          const [profileSnap, cardsSnap] = await Promise.all([profilePromise, cardsPromise]);

          if (profileSnap.exists()) {
            setProfile(profileSnap.data());
          } else {
            setProfile({ displayName: user.displayName || '', bio: '', photoURL: user.photoURL || '' });
          }
          
          setCardCount(cardsSnap.size);

        } catch (err) {
          console.error("Error fetching profile data:", err);
          setError("Failed to load profile data.");
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const handleInputChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSave = async () => {
    if (user) {
      setIsSaving(true);
      try {
        let photoURL = profile.photoURL;
        if (imageFile) {
          const storageRef = ref(storage, `profile-pictures/${user.uid}`);
          await uploadBytes(storageRef, imageFile);
          photoURL = await getDownloadURL(storageRef);
        }
        const docRef = doc(db, 'users', user.uid);
        await setDoc(docRef, { ...profile, photoURL }, { merge: true });
        alert('Profile updated successfully!');
      } catch (error) {
        alert('Error updating profile.');
        console.error('Error updating profile: ', error);
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleUpdatePassword = async () => {
    if (user && newPassword) {
      try {
        await updatePassword(user, newPassword);
        alert('Password updated successfully!');
        setNewPassword('');
      } catch (error) {
        alert('Error updating password: ' + error.message);
        console.error('Error updating password: ', error);
      }
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
      return <Alert severity="error">{error}</Alert>
  }

  if (!user) {
    return <Typography>Please log in to see your profile.</Typography>
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4 }}>
      <Avatar src={profile.photoURL || 'https://i.pravatar.cc/150'} sx={{ width: 100, height: 100 }} />
      <Typography variant="h5">{profile.displayName}</Typography>
      <Typography variant="body1" color="text.secondary">{user.email}</Typography>
      <Typography variant="body1" color="text.secondary">Cards Uploaded: {cardCount}</Typography>
      <Button variant="contained" component="label" disabled={isSaving}>
        Upload Picture
        <input type="file" hidden onChange={handleFileChange} />
      </Button>
      <TextField
        label="Name"
        name="displayName"
        value={profile.displayName}
        onChange={handleInputChange}
        variant="outlined"
        sx={{ width: '300px' }}
        disabled={isSaving}
      />
      <TextField
        label="Bio"
        name="bio"
        value={profile.bio}
        onChange={handleInputChange}
        variant="outlined"
        multiline
        rows={4}
        sx={{ width: '300px' }}
        disabled={isSaving}
      />
      <Button variant="contained" color="primary" onClick={handleSave} disabled={isSaving}>
        {isSaving ? <CircularProgress size={24} /> : 'Save Profile'}
      </Button>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '300px', mt: 2 }}>
        <TextField
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          variant="outlined"
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleUpdatePassword} sx={{ mt: 1 }}>
          Update Password
        </Button>
      </Box>
    </Box>
  );
};

export default Profile;
