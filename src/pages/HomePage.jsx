import React, { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import {
  Container,
  TextField,
  Typography,
  Box,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  AlertTitle,
  Modal,
  Backdrop,
  Fade,
  Pagination,
  Paper
} from "@mui/material";
import Card from "../components/Card";

const categories = ["All", "K-Pop", "Anime", "Gaming", "Misc"];
const CARDS_PER_PAGE = 10;

const HomePage = () => {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [openOverlay, setOpenOverlay] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [page, setPage] = useState(1);

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
      });

    return () => unsubscribe();
  }, []);

  const filteredCards = cards.filter(card => {
    const lowercasedSearchTerm = searchTerm.toLowerCase();
    const cardIdMatch = card.cardId?.toLowerCase().includes(lowercasedSearchTerm);
    const hashtagMatch = Array.isArray(card.hashtags) && card.hashtags.some(tag => tag.toLowerCase().includes(lowercasedSearchTerm));
    const searchTermMatch = cardIdMatch || hashtagMatch;
    const categoryMatch = selectedCategory === 'All' || card.category === selectedCategory;
    return searchTermMatch && categoryMatch;
  });

  const paginatedCards = filteredCards.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE);

  const handleOpenOverlay = (imageUrl) => {
    setSelectedImage(imageUrl);
    setOpenOverlay(true);
  };

  const handleCloseOverlay = () => {
    setOpenOverlay(false);
    setSelectedImage('');
  };
  
  const handlePageChange = (event, value) => {
    setPage(value);
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (error) {
    return (
      <Alert severity="error">
        <AlertTitle>Error</AlertTitle>
        {error.message}
      </Alert>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper elevation={4} sx={{ my: 4, p: { xs: 2, sm: 3, md: 4 }, borderRadius: '16px' }}>
        <Typography variant="h4" component="h1" gutterBottom align="center" sx={{ mb: 4 }}>
          Photo Card Marketplace
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 4, flexDirection: { xs: 'column', sm: 'row' } }}>
          <TextField
            fullWidth
            label="Search by card ID or hashtag"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <FormControl fullWidth>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              label="Category"
            >
              {categories.map(category => (
                <MenuItem key={category} value={category}>{category}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr 1fr', sm: '1fr 1fr 1fr', md: '1fr 1fr 1fr 1fr 1fr' }, gap: '16px' }}>
        {paginatedCards.map((card) => (
          <div key={card.id}>
            <Card card={card} onImageClick={handleOpenOverlay} />
          </div>
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
        <Pagination count={Math.ceil(filteredCards.length / CARDS_PER_PAGE)} page={page} onChange={handlePageChange} />
      </Box>
    </Container>
  );
};

export default HomePage;
