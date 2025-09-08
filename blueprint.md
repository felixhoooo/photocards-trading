
# 22:22 K-Pop Card Trader - Blueprint

## Overview

A web application for K-Pop photocard enthusiasts to trade and showcase their collections. The application is built with React and Firebase, providing a secure and real-time experience for users.

## Implemented Features

*   **Firebase Authentication:** Users can create an account and log in using email and password.
*   **Database:** Cloud Firestore is used to store card information and user comments.
*   **Storage:** Firebase Storage is used to host card images and videos.
*   **Admin Dashboard:** A protected route for administrators to add, edit, and delete cards.
*   **Card Management:**
    *   Generate unique card IDs with category prefixes.
    *   Upload front and back images, and a video for each card.
    *   Add details, category, and hashtags.
*   **Commenting:**
    *   Authenticated users can add comments to cards.
    *   Users can edit and delete their own comments.
    *   All users can view comments on cards.
*   **UI/UX:**
    *   Modern UI built with Material-UI (MUI).
    *   Responsive layout for mobile and desktop.
    *   Lazy loading for images to improve performance.
    *   Client-side routing with `react-router-dom`.
    *   Page transitions with `framer-motion`.
    *   Dark/Light theme toggle.
*   **Deployment:** The application is deployed to Firebase Hosting and is publicly available at https://photo-card-trader.web.app.

## Recent Changes

*   Implemented a commenting feature on cards.
*   Reverted internationalization (i18n) implementation.
*   Fixed a syntax error in the `Layout.jsx` component.
*   Deployed the application to Firebase Hosting.
