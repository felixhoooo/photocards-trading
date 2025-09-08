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

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)', md: 'repeat(4, 1fr)', lg: 'repeat(5, 1fr)' }, gap: '16px' }}>
        {paginatedCards.map((card) => (
          <div key={card.id}>
            <Card card={card} />
          </div>
        ))}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <Pagination count={Math.ceil(filteredCards.length / CARDS_PER_PAGE)} page={page} onChange={handlePageChange} />
      </Box>
    </Container>
  );
};

export default HomePage;
