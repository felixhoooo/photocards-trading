import React from "react";
import { Card as MuiCard, CardContent, Typography, Box, IconButton } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

const Card = ({ card }) => {
  const navigate = useNavigate();

  const handleProfileClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    e.preventDefault();
    navigate(`/profile/${card.userId}`);
  };

  return (
    <Link to={`/card/${card.id}`} style={{ textDecoration: 'none' }}>
      <MuiCard sx={{ width: "100%" }}>
        <LazyLoadImage
          alt={card.cardId}
          effect="blur"
          src={card.imageUrl || 'https://via.placeholder.com/350x350'}
          width="100%"
          style={{ 
            objectFit: 'cover', 
            width: '100%', 
            height: 'auto',
            aspectRatio: '1 / 1' 
          }}
        />
        <CardContent>
          <Typography gutterBottom variant="body2" component="div" noWrap>
            {card.cardId}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
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
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 1 }}>
            {card.dateUploaded && (
              <Typography variant="body2" color="text.secondary">
                Uploaded: {new Date(card.dateUploaded.seconds * 1000).toLocaleDateString()}
              </Typography>
            )}
            {card.userId && (
              <IconButton onClick={handleProfileClick} size="small" aria-label="view owner profile">
                <AccountCircleIcon />
              </IconButton>
            )}
          </Box>
        </CardContent>
      </MuiCard>
    </Link>
  );
};

export default Card;