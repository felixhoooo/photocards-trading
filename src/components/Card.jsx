
import React from "react";
import { Link } from "react-router-dom";
import {
  Card as MuiCard,
  CardActionArea,
  CardContent,
  CardMedia,
  Typography,
  Box,
} from "@mui/material";

const Card = ({ card }) => {
  const imageUrl = card.imageUrl || "https://via.placeholder.com/300x400.png?text=Card+Not+Found";

  return (
    <MuiCard sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardActionArea component={Link} to={`/card/${card.id}`} sx={{ flexGrow: 1 }}>
        <CardMedia
          component="img"
          sx={{
            height: 250,
            objectFit: "cover",
          }}
          image={imageUrl}
          alt={card.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography gutterBottom variant="h5" component="div" sx={{ fontWeight: "bold" }}>
            {card.name || "Unnamed Card"}
          </Typography>
          <Typography variant="body2" color="text.secondary" noWrap>
            {card.details || "No details available."}
          </Typography>
          {card.dateUploaded && (
            <Typography variant="body2" color="text.secondary">
              Uploaded: {card.dateUploaded.toDate().toLocaleDateString()}
            </Typography>
          )}
        </CardContent>
      </CardActionArea>
    </MuiCard>
  );
};

export default Card;
