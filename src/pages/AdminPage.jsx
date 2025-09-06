
import React, { useState, useEffect } from "react";
import { getAuth, signOut } from "firebase/auth";
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
  CardMedia,
  Box,
  Snackbar,
  Alert,
  AlertTitle,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import { db, storage } from "../firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from "firebase/firestore";
import { ref, getDownloadURL, uploadBytesResumable } from "firebase/storage";
import { v4 as uuidv4 } from "uuid";

const categories = ["K-Pop", "Anime", "Gaming", "Misc"];

const CardForm = ({ onSave, onCancel, isEditing, card, onInputChange, onCategoryChange, onFileChange, imagePreview }) => (
  <Paper elevation={3} sx={{ p: { xs: 2, sm: 3 }, mb: 4 }}>
    <Typography variant="h6" gutterBottom align="center">{isEditing ? "Edit Card" : "Add New Card"}</Typography>
    <Box component="form" onSubmit={onSave}>
      <Grid container spacing={2} direction="column">
        <Grid item xs={12}>
          <TextField
            fullWidth
            required
            label="Card Name"
            name="name"
            value={card.name}
            onChange={onInputChange}
          />
        </Grid>
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
            >
              {categories.map((category) => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ textAlign: "center" }}>
          <Button variant="contained" component="label">
            Upload Image
            <input type="file" hidden onChange={onFileChange} />
          </Button>
        </Grid>
        {imagePreview && (
          <Grid item xs={12} sx={{ textAlign: "center" }}>
            <Box sx={{ mt: 2 }}>
              <img src={imagePreview} alt="Preview" style={{ maxHeight: 200, maxWidth: "100%" }} />
            </Box>
          </Grid>
        )}
        <Grid item xs={12} sx={{ textAlign: "center", mt: 2 }}>
          {isEditing && <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>}
          <Button type="submit" variant="contained" color="primary">
            {isEditing ? "Update" : "Add"}
          </Button>
        </Grid>
      </Grid>
    </Box>
  </Paper>
);

const AdminPage = () => {
  const navigate = useNavigate();
  const auth = getAuth();
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCard, setNewCard] = useState({ name: "", details: "", category: "" });
  const [imageFile, setImageFile] = useState(null);
  const [editingCard, setEditingCard] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "cards"),
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
  }, []);

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
    if (e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const handleSaveCard = (e) => {
    e.preventDefault();
    if (editingCard) {
      handleUpdateCard();
    } else {
      handleAddCard();
    }
  };

  const handleAddCard = () => {
    if (!newCard.name || !newCard.details || !newCard.category || !imageFile) {
      setSnackbar({ open: true, message: "Please fill out all fields, select a category, and select an image.", severity: "error" });
      return;
    }

    const imageId = uuidv4();
    const imageRef = ref(storage, `images/${imageId}`);
    const uploadTask = uploadBytesResumable(imageRef, imageFile);

    uploadTask.on("state_changed",
      (snapshot) => {},
      (error) => {
        setSnackbar({ open: true, message: `Error uploading image: ${error.message}`, severity: "error" });
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
          await addDoc(collection(db, "cards"), { ...newCard, imageUrl: downloadURL, dateUploaded: new Date() });
          setNewCard({ name: "", details: "", category: "" });
          setImageFile(null);
          setImagePreview(null);
          setSnackbar({ open: true, message: "Card added successfully!", severity: "success" });
        });
      }
    );
  };

  const handleUpdateCard = () => {
    if (!editingCard.name || !editingCard.details || !editingCard.category) {
      setSnackbar({ open: true, message: "Please fill out all fields and select a category.", severity: "error" });
      return;
    }

    const cardRef = doc(db, "cards", editingCard.id);

    if (imageFile) {
      const imageId = uuidv4();
      const imageRef = ref(storage, `images/${imageId}`);
      const uploadTask = uploadBytesResumable(imageRef, imageFile);

      uploadTask.on("state_changed",
        (snapshot) => {},
        (error) => {
          setSnackbar({ open: true, message: `Error uploading image: ${error.message}`, severity: "error" });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then(async (downloadURL) => {
            await updateDoc(cardRef, { ...editingCard, imageUrl: downloadURL, dateUploaded: new Date() });
            setEditingCard(null);
            setImageFile(null);
            setImagePreview(null);
            setSnackbar({ open: true, message: "Card updated successfully!", severity: "success" });
          });
        }
      );
    } else {
      updateDoc(cardRef, { ...editingCard, dateUploaded: new Date() });
      setEditingCard(null);
      setSnackbar({ open: true, message: "Card updated successfully!", severity: "success" });
    }
  };

  const handleDeleteCard = async (id) => {
    try {
      await deleteDoc(doc(db, "cards", id));
      setSnackbar({ open: true, message: "Card deleted successfully!", severity: "success" });
    } catch (error) {
      setSnackbar({ open: true, message: `Error deleting card: ${error.message}`, severity: "error" });
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <Container maxWidth="lg">
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ flexGrow: 1 }}>
          Admin Dashboard
        </Typography>
        <Button variant="contained" onClick={handleLogout}>Logout</Button>
      </Box>

      {editingCard ? (
        <CardForm
          isEditing
          onSave={handleSaveCard}
          onCancel={() => { setEditingCard(null); setImagePreview(null); }}
          card={editingCard}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onFileChange={handleFileChange}
          imagePreview={imagePreview || editingCard.imageUrl}
        />
      ) : (
        <CardForm
          onSave={handleSaveCard}
          card={newCard}
          onInputChange={handleInputChange}
          onCategoryChange={handleCategoryChange}
          onFileChange={handleFileChange}
          imagePreview={imagePreview}
        />
      )}

      <Typography variant="h5" sx={{ mt: 4, mb: 2 }}>Existing Cards</Typography>

      {loading && <Typography>Loading...</Typography>}
      {error && <Alert severity="error"><AlertTitle>Error</AlertTitle>{error.message}</Alert>}

      <Grid container spacing={{ xs: 2, md: 3 }}>
        {cards.map((card) => (
          <Grid item key={card.id} xs={12} sm={6} md={4} lg={3}>
            <MuiCard
              sx={{
                width: { xs: "90%", sm: 280 },
                margin: "auto",
                height: "100%",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <CardMedia
                component="img"
                height="250"
                image={card.imageUrl}
                alt={card.name}
                sx={{ objectFit: "cover" }}
              />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h6" gutterBottom>{card.name}</Typography>
                <Typography color="text.secondary" noWrap>{card.details}</Typography>
                <Typography color="text.secondary">Category: {card.category}</Typography>
                {card.dateUploaded && (
                  <Typography color="text.secondary">
                    Uploaded: {card.dateUploaded.toDate().toLocaleDateString()}
                  </Typography>
                )}
              </CardContent>
              <CardActions>
                <Button size="small" onClick={() => { setEditingCard(card); setImagePreview(card.imageUrl); }}>Edit</Button>
                <Button size="small" onClick={() => handleDeleteCard(card.id)}>Delete</Button>
              </CardActions>
            </MuiCard>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default AdminPage;
