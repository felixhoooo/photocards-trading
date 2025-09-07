
import React, { useState } from 'react';
import { Box, Card, CardMedia } from '@mui/material';
import './FlipCard.css';

const FlipCard = ({ frontImage, backImage }) => {
  console.log("FlipCard: Received 'frontImage' prop:", frontImage);
  console.log("FlipCard: Received 'backImage' prop:", backImage);

  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  // Bulletproof check: If frontImage or backImage are falsy (null, undefined, ""), use a placeholder.
  const placeholder = "https://via.placeholder.com/400x560.png/000000/FFFFFF/%20?text=No+Image";
  const frontImageUrl = frontImage || placeholder;
  const backImageUrl = backImage || placeholder;

  console.log("FlipCard: Final frontImageUrl:", frontImageUrl);
  console.log("FlipCard: Final backImageUrl:", backImageUrl);

  return (
    <Box className={`flip-card ${isFlipped ? 'flipped' : ''}`} onClick={handleFlip}>
      <Box className="flip-card-inner">
        <Box className="flip-card-front">
          <Card>
            <CardMedia
              component="img"
              image={frontImageUrl}
              alt="Card Front"
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Card>
        </Box>
        <Box className="flip-card-back">
          <Card>
            <CardMedia
              component="img"
              image={backImageUrl}
              alt="Card Back"
              sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </Card>
        </Box>
      </Box>
    </Box>
  );
};

export default FlipCard;
