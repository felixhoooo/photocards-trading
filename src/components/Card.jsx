import React from "react";
import { Card as MuiCard, CardContent, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';

const Card = ({ card }) => {
  return (
    <Link to={`/card/${card.id}`} style={{ textDecoration: 'none' }}>
      <MuiCard sx={{ width: "100%" }}>
        <LazyLoadImage
          alt={card.cardId}
          effect="blur"
          src={card.imageUrl || 'https://via.placeholder.com/350x350'}
          height="350px"
          width="100%"
          style={{ objectFit: 'cover', height: { xs: 175, sm: 350 } }}
        />
        <CardContent>
          <Typography gutterBottom variant="body2" component="div">
            {card.cardId}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {card.details}
          </Typography>
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
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Uploaded: {new Date(card.dateUploaded.seconds * 1000).toLocaleDateString()}
            </Typography>
          )}
          {card.userEmail && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              By: {card.userEmail}
            </Typography>
          )}
        </CardContent>
      </MuiCard>
    </Link>
  );
};

export default Card;