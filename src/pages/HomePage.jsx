
import React, { useState } from "react";
import { collection } from "firebase/firestore";
import { db } from "../firebase";
import { useCollection } from "react-firebase-hooks/firestore";
import {
  Grid,
  CircularProgress,
  Typography,
  Container,
  Box,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Stack,
} from "@mui/material";
import Card from "../components/Card";

const categories = ["All", "K-Pop", "Anime", "Gaming", "Misc"];

const HomePage = () => {
  const [snapshot, loading, error] = useCollection(collection(db, "cards"));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const cards = snapshot?.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

  const filteredCards = cards
    ?.filter((card) =>
      card.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((card) =>
      selectedCategory === "All" ? true : card.category === selectedCategory
    );

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          py: { xs: 4, sm: 6, md: 8 },
          textAlign: "center",
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: "bold",
            fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
          }}
        >
          K-Pop Trading Cards
        </Typography>
        <Typography
          variant="h5"
          color="text.secondary"
          paragraph
          sx={{
            fontSize: { xs: "1rem", sm: "1.25rem" },
          }}
        >
          Your one-stop shop for collecting and trading your favorite K-Pop photocards.
        </Typography>
      </Box>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        sx={{ mb: 4 }}
      >
        <TextField
          fullWidth
          label="Search by card name"
          variant="outlined"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <FormControl fullWidth>
          <InputLabel>Category</InputLabel>
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            label="Category"
          >
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}
      {error && <Typography color="error">Error: {error.message}</Typography>}
      {!loading && !error && filteredCards && filteredCards.length === 0 && (
        <Typography align="center" sx={{ mt: 4 }}>
          No matching cards found.
        </Typography>
      )}
      {!loading && !error && filteredCards && (
        <Grid container spacing={3} justifyContent="center">
          {filteredCards.map((card) => (
            <Grid item key={card.id}>
              <Box sx={{ width: 300 }}>
                <Card card={card} />
              </Box>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default HomePage;
