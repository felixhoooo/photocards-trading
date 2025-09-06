
# K-Pop Trading Card App Blueprint

## Overview

This document outlines the plan for building a full-stack web application for showcasing and managing K-pop trading cards. The application will feature a public portal for browsing cards and a secure admin portal for managing the collection.

## Core Features

*   **Public Portal:** A visually appealing, responsive grid displaying K-pop trading cards with images, names, and details.
*   **Admin Portal:** A secure section for administrators to perform CRUD (Create, Read, Update, Delete) operations on the trading cards.
*   **Authentication:** The admin portal is protected by Firebase Authentication, requiring email and password login.
*   **Database:** Card information (name, details, image URL) is stored in Cloud Firestore.
*   **File Storage:** Card images are uploaded to and served from Firebase Cloud Storage.
*   **Routing:** `react-router-dom` is used for navigation between the public and admin portals.

## Implemented Features

*   **Firebase Integration:**
    *   Firebase dependencies have been added to the project.
    *   A Firebase configuration file (`src/firebase.js`) has been created.
    *   The MCP server for Firebase has been configured.

*   **Dependencies Installed:**
    *   `firebase`, `react-router-dom`, `@mui/material`, `@emotion/react`, `@emotion/styled`, `react-firebase-hooks` and `uuid` have been installed and are in use.

*   **Project Structure:**
    *   A `src/pages` directory has been created containing `HomePage.jsx`, `AdminPage.jsx`, `LoginPage.jsx`, and `CardDetailsPage.jsx`.
    *   A `src/components` directory has been created with `Card.jsx` and `Layout.jsx` components.
    *   Routing has been set up in `src/App.jsx` to handle navigation between pages and protect the admin route.

*   **Public Portal:**
    *   `HomePage.jsx` fetches and displays trading cards from Firestore in a responsive grid. It now features a circular progress indicator while loading and a user-friendly message when no cards are available.
    *   The `Card.jsx` component renders individual cards with their image, name, and details.
    *   **Search and Filter Functionality:** Search and category filter functionalities have been added to the `HomePage`, allowing users to filter cards by name and category.

*   **Card Details Page:**
    *   A dedicated page (`CardDetailsPage.jsx`) has been created to display the full details of a selected card.
    *   The `Card.jsx` component now links to this details page, passing the card's unique ID in the URL.
    *   The details page fetches the specific card's data from Firestore using the `useDocumentData` hook.

*   **Admin Portal:**
    *   `LoginPage.jsx` provides a form for administrators to log in with their email and password.
    *   `AdminPage.jsx` is a protected route that allows authenticated users to:
        *   View a list of existing cards.
        *   Add new cards with a name, details, and an image.
        *   Edit the details of existing cards.
        *   Delete cards from the collection.
        *   Upload card images to Firebase Cloud Storage.
    *   User feedback on the `AdminPage` is now provided through Material-UI's `Snackbar` component, replacing the native browser alerts.

*   **Styling and Responsiveness:**
    *   The application has been restyled for a more modern and cohesive user interface, moving away from a complete Material-UI solution.
    *   `HomePage.jsx`, `Card.jsx`, and `CardDetailsPage.jsx` now use custom CSS (`HomePage.css`, `Card.css`, `CardDetailsPage.css`) for a unique and visually appealing design.
    *   The new design includes a hero section on the homepage, custom search and filter inputs, and restyled card and card detail views.
    *   The `Layout.jsx` component still utilizes Material-UI for the main navigation bar (`AppBar`) to provide consistent navigation.
    *   The layout is responsive and works well on both mobile and desktop screen sizes.

*   **Testing:**
    *   Vitest and React Testing Library are set up for unit and component testing.
    *   A test for the `Card` component has been created to ensure it renders correctly.

## Next Steps

Now that the application has a more modern and consistent design, the next step is to improve the user experience by adding more features and functionality. I propose the following:

*   **User Authentication:** Allow users to create accounts and log in to the application. This will enable personalized features like saving favorite cards and creating wishlists.
*   **Wishlist Functionality:** Once users are authenticated, they should be able to add and remove cards from their personal wishlist.
*   **Trading System:** Implement a basic trading system where users can propose and accept trades with other users.
