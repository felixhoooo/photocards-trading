
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

const CardDetailsPage = () => {
  const { cardId } = useParams();
  const [card, loading, error] = useDocumentData(doc(db, 'cards', cardId));

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return <Typography color="error">Error: {error.message}</Typography>;
  }

  if (!card) {
    return <Typography>Card not found!</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ my: 4 }}>
      <Paper elevation={3}>
        <Grid container>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: 2 }}>
              <img
                src={card.imageUrl}
                alt={card.name}
                style={{ width: '100%', height: 'auto', borderRadius: '8px' }}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {card.name}
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
    </Container>
  );
};

export default CardDetailsPage;
