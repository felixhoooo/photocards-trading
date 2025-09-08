import React, { useState, useEffect } from "react";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Container,
  Typography,
  TextField,
  Grid,
  Card as MuiCard,
  CardContent,
  CardActions,
  Box,
  Snackbar,
  Alert,
  AlertTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
  Modal,
  Backdrop,
  Fade,
  Pagination,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, where, getDoc } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable, deleteObject } from "firebase/storage";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const categories = ["K-Pop", "Anime", "Gaming", "Misc"];
const CARDS_PER_PAGE = 10;

// Function to generate a unique card ID with a category prefix
const generateCardId = (category) => {
  const prefixMap = {
    "K-Pop": "KPO",
    "Anime": "ANM",
    "Gaming": "GAM",
    "Misc": "MSC",
  };
  const prefix = prefixMap[category] || "MSC";
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(1000 + Math.random() * 9000).toString();
  return `${prefix}-${timestamp}${random}`;
};

const CardForm = ({ onSave, onCancel, isEditing, card, onInputChange, onCategoryChange, onFileChange, imagePreview, backImagePreview, videoPreview, isUploading }) => (
  <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
    <Typography variant="h6" gutterBottom align="center">{isEditing ? "Edit Card" : "Add New Card"}</Typography>
    <Box component="form" onSubmit={onSave}>
      <Grid container spacing={2} direction="column">
        {isEditing && (
            <Grid item xs={12}>
                <TextField
                    fullWidth
                    required
                    label="Card ID"
                    name="cardId"
                    value={card.cardId}
                    disabled
                />
            </Grid>
        )}
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Card Details"
            name="details"
            multiline
            rows={4}
            value={card.details}
            onChange={onInputChange}
          />
        </Grid>
        <Grid item xs={12}>
          <FormControl fullWidth required>
            <InputLabel>Category</InputLabel>
            <Select
              name="category"
              value={card.category}
              onChange={onCategoryChange}
              label="Category"
              disabled={isEditing}
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Hashtags (comma-separated)"
            name="hashtags"
            value={card.hashtags}
            onChange={onInputChange}
          />
        </Grid>
        <Grid item container spacing={2} xs={12} sx={{ textAlign: "center" }}>
          <Grid item xs={6}>
            <Button variant="contained" component="label">
                Upload Front Image
                <input type="file" hidden name="frontImage" onChange={onFileChange} />
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button variant="contained" component="label">
                Upload Back Image
                <input type="file" hidden name="backImage" onChange={onFileChange} />
            </Button>
          </Grid>
        </Grid>
        <Grid item container spacing={2} xs={12}>
            <Grid item xs={6} sx={{ textAlign: "center" }}>
                {imagePreview && (
                    <Box sx={{ mt: 2 }}>
                        <img src={imagePreview} alt="Front Preview" style={{ maxHeight: 200, maxWidth: "100%" }} />
                    </Box>
                )}
            </Grid>
            <Grid item xs={6} sx={{ textAlign: "center" }}>
                {backImagePreview && (
                    <Box sx={{ mt: 2 }}>
                        <img src={backImagePreview} alt="Back Preview" style={{ maxHeight: 200, maxWidth: "100%" }} />
                    </Box>
                )}
            </Grid>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: "left" }}>
            <Button variant="contained" component="label">
                Upload Video
                <input type="file" hidden name="video" onChange={onFileChange} />
            </Button>
          </Grid>
        <Grid item xs={12} sx={{ textAlign: "left" }}>
          {videoPreview && (
            <Box sx={{ mt: 2 }}>
              <video src={videoPreview} controls style={{ maxHeight: 200, maxWidth: "100%" }} />
            </Box>
          )}
        </Grid>
        <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
          {isEditing && <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>}
          <Button type="submit" variant="contained" color="primary" disabled={isUploading}>
            {isUploading ? <CircularProgress size={24} /> : (isEditing ? "Update" : "Add")}
          </Button>
        </Grid>
      </Grid>
    </Box>
  </Paper>
);

const CardsPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [user, setUser] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCard, setNewCard] = useState({ details: "", category: "", hashtags: "" });
  const [imageFile, setImageFile] = useState(null);
  const [backImageFile, setBackImageFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [imagePreview, setImagePreview] = useState(null);
  const [backImagePreview, setBackImagePreview] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [openOverlay, setOpenOverlay] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [page, setPage] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [openDeleteConfirm, setOpenDeleteConfirm] = useState(false);
  const [cardToDelete, setCardToDelete] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null);
        navigate("/login");
      }
    });
    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    if (user) {
      const q = query(collection(db, "cards"), where("userId", "==", user.uid));
      const unsubscribe = onSnapshot(q,
        (snapshot) => {
          const cardsData = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id }));
          setCards(cardsData);
          setLoading(false);
        },
        (err) => {
          console.error("Firestore snapshot error:", err);
          setError(err);
          setLoading(false);
        }
      );
      return () => unsubscribe();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const paginatedCards = cards?.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (editingCard) {
      setEditingCard({ ...editingCard, [name]: value });
    } else {
      setNewCard({ ...newCard, [name]: value });
    }
  };

  const handleCategoryChange = (e) => {
    const { value } = e.target;
    if (editingCard) {
      setEditingCard({ ...editingCard, category: value });
    } else {
      setNewCard({ ...newCard, category: value });
    }
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    if (files[0]) {
        const file = files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            if (name === 'frontImage') {
                setImageFile(file);
                setImagePreview(reader.result);
            } else if (name === 'backImage') {
                setBackImageFile(file);
                setBackImagePreview(reader.result);
            } else if (name === 'video') {
                setVideoFile(file);
                setVideoPreview(reader.result);
            }
        };
        reader.readAsDataURL(file);
    } else {
        if (name === 'frontImage') {
            setImageFile(null);
            setImagePreview(null);
        } else if (name === 'backImage') {
            setBackImageFile(null);
            setBackImagePreview(null);
        } else if (name === 'video') {
            setVideoFile(null);
            setVideoPreview(null);
        }
    }
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    setIsUploading(true);
    if (editingCard) {
      handleUpdateCard();
    } else {
      handleAddCard();
    }
  };

  const uploadFile = (file, path) => {
    const fileRef = ref(storage, path);
    const uploadTask = uploadBytesResumable(fileRef, file);
    return new Promise((resolve, reject) => {
      uploadTask.on("state_changed",
        () => {},
        (error) => {
          setSnackbar({ open: true, message: `Error uploading file: ${error.message}`, severity: "error" });
          setIsUploading(false);
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  }

  const handleAddCard = async () => {
    if (!user) {
      setSnackbar({ open: true, message: "You must be logged in to add a card.", severity: "error" });
      setIsUploading(false);
      return;
    }

    if (!newCard.details || !newCard.category || !imageFile) {
      setSnackbar({ open: true, message: "Please fill out all fields, select a category, and select an image.", severity: "error" });
      setIsUploading(false);
      return;
    }

    try {
        const cardId = generateCardId(newCard.category);
        const frontImageUrl = await uploadFile(imageFile, `images/${cardId}_front`);
        let backImageUrl = null;
        if (backImageFile) {
            backImageUrl = await uploadFile(backImageFile, `images/${cardId}_back`);
        }
        let videoUrl = null;
        if (videoFile) {
            videoUrl = await uploadFile(videoFile, `videos/${cardId}_video`);
        }
        
        const hashtags = typeof newCard.hashtags === 'string' ? newCard.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : newCard.hashtags;
        await addDoc(collection(db, "cards"), { ...newCard, cardId, hashtags, imageUrl: frontImageUrl, backImageUrl: backImageUrl, videoUrl: videoUrl, dateUploaded: new Date(), userId: user.uid, userEmail: user.email });
        setNewCard({ details: "", category: "", hashtags: "" });
        setImageFile(null);
        setBackImageFile(null);
        setVideoFile(null);
        setImagePreview(null);
        setBackImagePreview(null);
        setVideoPreview(null);
        setSnackbar({ open: true, message: "Card added successfully!", severity: "success" });
    } catch (error) {
        console.error("Error adding card:", error);
        setSnackbar({ open: true, message: `An unexpected error occurred: ${error.message}`, severity: "error" });
    } finally {
        setIsUploading(false);
    }
  };

  const handleUpdateCard = async () => {
    if (!user) {
        setSnackbar({ open: true, message: "You must be logged in to update a card.", severity: "error" });
        setIsUploading(false);
        return;
    }
    if (!editingCard.details || !editingCard.category) {
      setSnackbar({ open: true, message: "Please fill out all fields and select a category.", severity: "error" });
      setIsUploading(false);
      return;
    }

    try {
        const cardRef = doc(db, "cards", editingCard.id);
        const hashtags = typeof editingCard.hashtags === 'string' ? editingCard.hashtags.split(',').map(tag => tag.trim()).filter(tag => tag !== '') : editingCard.hashtags;
        let frontImageUrl = editingCard.imageUrl;
        let backImageUrl = editingCard.backImageUrl || null;
        let videoUrl = editingCard.videoUrl || null;

        if (imageFile) {
          frontImageUrl = await uploadFile(imageFile, `images/${editingCard.cardId}_front`);
        }

        if (backImageFile) {
            backImageUrl = await uploadFile(backImageFile, `images/${editingCard.cardId}_back`);
        }

        if (videoFile) {
            videoUrl = await uploadFile(videoFile, `videos/${editingCard.cardId}_video`);
        }

        await updateDoc(cardRef, { ...editingCard, hashtags, imageUrl: frontImageUrl, backImageUrl: backImageUrl, videoUrl: videoUrl, dateUploaded: new Date() });
        setEditingCard(null);
        setImageFile(null);
        setBackImageFile(null);
        setVideoFile(null);
        setImagePreview(null);
        setBackImagePreview(null);
        setVideoPreview(null);
        setSnackbar({ open: true, message: "Card updated successfully!", severity: "success" });
    } catch (error) {
        console.error("Error updating card:", error);
        setSnackbar({ open: true, message: `An unexpected error occurred: ${error.message}`, severity: "error" });
    } finally {
        setIsUploading(false);
    }
  };

  const handleDeleteCard = async () => {
    if (!user || !cardToDelete) {
      setSnackbar({ open: true, message: "You must be logged in to delete a card.", severity: "error" });
      return;
    }
  
    try {
      const cardDoc = await getDoc(doc(db, "cards", cardToDelete.id));
      if (!cardDoc.exists()) {
        setSnackbar({ open: true, message: "Card not found.", severity: "error" });
        return;
      }
  
      const cardData = cardDoc.data();
  
      // Delete front image
      if (cardData.imageUrl) {
        const frontImageRef = ref(storage, `images/${cardData.cardId}_front`);
        await deleteObject(frontImageRef);
      }
  
      // Delete back image
      if (cardData.backImageUrl) {
        const backImageRef = ref(storage, `images/${cardData.cardId}_back`);
        await deleteObject(backImageRef);
      }
  
      // Delete video
      if (cardData.videoUrl) {
        const videoRef = ref(storage, `videos/${cardData.cardId}_video`);
        await deleteObject(videoRef);
      }
  
      // Delete Firestore document
      await deleteDoc(doc(db, "cards", cardToDelete.id));
  
      setSnackbar({ open: true, message: "Card and associated files deleted successfully!", severity: "success" });
    } catch (error) {
      console.error("Error deleting card:", error);
      setSnackbar({ open: true, message: `Error deleting card: ${error.message}`, severity: "error" });
    } finally {
      setOpenDeleteConfirm(false);
      setCardToDelete(null);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };
  
  const handleOpenOverlay = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenOverlay(true);
  };

  const handleCloseOverlay = () => {
    setOpenOverlay(false);
    setSelectedImage(null);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };
  
  const handleEdit = (card) => {
    setEditingCard(card);
    setImagePreview(card.imageUrl);
    setBackImagePreview(card.backImageUrl || null);
    setVideoPreview(card.videoUrl || null);
  }

  const confirmDelete = (card) => {
    setCardToDelete(card);
    setOpenDeleteConfirm(true);
  };

  const handleCloseDeleteConfirm = () => {
    setOpenDeleteConfirm(false);
    setCardToDelete(null);
  };

  return (
    <Container maxWidth="lg">
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Dialog
        open={openDeleteConfirm}
        onClose={handleCloseDeleteConfirm}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this card and all its associated files? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm}>Cancel</Button>
          <Button onClick={handleDeleteCard} color="error">Delete</Button>
        </DialogActions>
      </Dialog>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ flexGrow: 1 }}>
          Manage Cards
        </Typography>
        <Button variant="contained" onClick={handleLogout}>Logout</Button>
      </Box>

      {editingCard ? (
        <CardForm
          isEditing
          onSave={handleSaveCard}
          onCancel={() => { setEditingCard(null); setImagePreview(null); setBackImagePreview(null); setVideoPreview(null); }}
          card={{...editingCard, hashtags: Array.isArray(editingCard.hashtags) ? editingCard.hashtags.join(', ') : ''}}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onFileChange={handleFileChange}
          imagePreview={imagePreview}
          backImagePreview={backImagePreview}
          videoPreview={videoPreview}
          isUploading={isUploading}
        />
      ) : (
        <CardForm
          onSave={handleSaveCard}
          card={newCard}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onFileChange={handleFileChange}
          imagePreview={imagePreview}
          backImagePreview={backImagePreview}
          videoPreview={videoPreview}
          isUploading={isUploading}
        />
      )}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>My Cards</Typography>

      {loading && <CircularProgress />}
      {error && <Alert severity="error"><AlertTitle>Error</AlertTitle>{error.message}</Alert>}

      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {paginatedCards.map((card) => (
          <Box key={card.id} sx={{ width: 'calc(50% - 8px)', marginBottom: '16px' }}>
            <MuiCard
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                width: "100%"
              }}
            >
              <LazyLoadImage
                alt={card.cardId}
                effect="blur"
                src={card.imageUrl || 'https://via.placeholder.com/350x350'}
                height="350"
                width="100%"
                style={{ objectFit: 'cover', cursor: 'pointer', height: { xs: 175, sm: 350 } }}
                onClick={() => handleOpenOverlay(card.imageUrl)} 
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{card.cardId}</Typography>
                <Typography color="text.secondary" noWrap>{card.details}</Typography>
                {card.hashtags && Array.isArray(card.hashtags) && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                    {card.hashtags.map((tag, index) => (
                      <Typography key={index} variant="body2" color="primary">
                        #{tag}
                      </Typography>
                    ))}
                  </Box>
                )}
                {card.dateUploaded && (
                  <Typography color="text.secondary" sx={{ mt: 1 }}>
                    Uploaded: {card.dateUploaded.toDate().toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => handleEdit(card)}>Edit</Button>
                <Button size="small" onClick={() => confirmDelete(card)}>Delete</Button>
              </CardActions>
            </MuiCard>
          </Box>
        ))}
      </Box>
        <Modal
            open={openOverlay}
            onClose={handleCloseOverlay}
            closeAfterTransition
            BackdropComponent={Backdrop}
            BackdropProps={{
              timeout: 500,
            }}
        >
            <Fade in={openOverlay}>
                <Box
                    onClick={handleCloseOverlay}
                    sx={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: { xs: '100vw', sm: 'auto' },
                        height: { xs: '100vh', sm: 'auto' },
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        bgcolor: 'background.paper',
                        boxShadow: 24,
                        p: { xs: 0, sm: 1 },
                        outline: 'none',
                        cursor: 'pointer'
                    }}
                >
                    <img
                        src={selectedImage}
                        alt="Full size"
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'contain',
                        }}
                    />
                </Box>
            </Fade>
      </Modal>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={Math.ceil((cards?.length || 0) / CARDS_PER_PAGE)} page={page} onChange={handlePageChange} />
      </Box>
    </Container>
  );
};

export default CardsPage;
