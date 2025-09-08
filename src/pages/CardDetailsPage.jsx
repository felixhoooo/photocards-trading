import React from 'react';
import { useParams } from 'react-router-dom';
import { doc } from 'firebase/firestore';
import { useDocumentData } from 'react-firebase-hooks/firestore';
import { db } from '../firebase';
import {
  CircularProgress,
  Container,
  Grid,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import FlipCard from '../components/FlipCard';

const CardDetailsPage = () => {
  const { id } = useParams();
  const [card, loading, error] = useDocumentData(id ? doc(db, 'cards', id) : null);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    console.error("CardDetailsPage: Error fetching document:", error);
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  if (!card) {
    return <Typography>Card not found!</Typography>;
  }

  console.log("CardDetailsPage: Full card data object from Firestore:", card);

  const backImage = typeof card.backImageUrl === 'string' && card.backImageUrl.length > 0 
    ? card.backImageUrl 
    : null;

  console.log("CardDetailsPage: Prop being passed to FlipCard as 'backImage':", backImage);

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
              <FlipCard frontImage={card.imageUrl} backImage={backImage} />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {card.cardId}
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                {card.details}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                Category: {card.category}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {card.videoUrl && (
        <Paper elevation={3} sx={{ mt: 4, p: 2 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Card Video
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <video src={card.videoUrl} controls style={{ maxWidth: '100%', maxHeight: '400px' }} />
          </Box>
        </Paper>
      )}
    </Container>
  );
};

export default CardDetailsPage;
