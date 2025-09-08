import React, { useState, useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db, storage } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Avatar, Button, TextField, Box, Typography, CircularProgress } from '@mui/material';

const Profile = () => {
  const [user] = useAuthState(auth);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState({ displayName: '', bio: '', photoURL: '' });
  const [imageFile, setImageFile] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        } else {
          setProfile({ displayName: user.displayName || '', bio: '', photoURL: user.photoURL || '' });
        }
        setLoading(false);
      };
      fetchProfile();
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

  if (loading) {
    return <CircularProgress />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, mt: 4 }}>
      <Avatar src={profile.photoURL} sx={{ width: 100, height: 100 }} />
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
    </Box>
  );
};

export default Profile;
