
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Divider,
  TextField,
  Button,
  Pagination,
} from '@mui/material';

const COMMENTS_PER_PAGE = 5;

const isEmail = (str) => {
    if (typeof str !== 'string') {
        return false;
    }
    // A simple regex to check for email format
    return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(str);
}

const CommentSection = ({ cardId }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (cardId) {
      const q = query(
        collection(db, 'cards', cardId, 'comments'),
        orderBy('createdAt', 'desc')
      );
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const commentsData = [];
        querySnapshot.forEach((doc) => {
          commentsData.push({ ...doc.data(), id: doc.id });
        });
        setComments(commentsData);
      });
      return unsubscribe;
    }
  }, [cardId]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (newComment.trim() === '' || !user) return;

    await addDoc(collection(db, 'cards', cardId, 'comments'), {
      text: newComment,
      createdAt: serverTimestamp(),
      userId: user.uid,
      userName: !isEmail(user.displayName) ? user.displayName : null,
      userPhotoURL: user.photoURL,
    });

    setNewComment('');
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const paginatedComments = comments.slice((page - 1) * COMMENTS_PER_PAGE, page * COMMENTS_PER_PAGE);

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Comments
      </Typography>
      {user && (
        <Box component="form" onSubmit={handleCommentSubmit} sx={{ mt: 2 }}>
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            label="Leave a comment"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 1 }}
          >
            Leave a Comment
          </Button>
        </Box>
      )}
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {paginatedComments.map((comment, index) => (
          <React.Fragment key={comment.id}>
            <ListItem alignItems="flex-start">
              <ListItemAvatar>
                <Link to={`/user/${comment.userId}`}>
                  <Avatar alt={comment.userName || ''} src={comment.userPhotoURL} />
                </Link>
              </ListItemAvatar>
              <ListItemText
                primary={
                  comment.userName && !isEmail(comment.userName) ? (
                    <Link to={`/user/${comment.userId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      {comment.userName}
                    </Link>
                  ) : null
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'inline' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {comment.text}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < paginatedComments.length - 1 && (
              <Divider variant="inset" component="li" />
            )}
          </React.Fragment>
        ))}
      </List>
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Pagination 
          count={Math.ceil(comments.length / COMMENTS_PER_PAGE)} 
          page={page} 
          onChange={handlePageChange} 
        />
      </Box>
    </Box>
  );
};

export default CommentSection;
