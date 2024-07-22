# Key Components

This document provides an overview of the key components in the MyBookQuest application.

## Dashboard

The dashboard is the main interface for users after logging in. It's implemented in `app/dashboard/page.tsx`.

Key features:
- Displays user's reading stats (books read, pages read, reading time)
- Shows currently reading books
- Displays user's points

## Reading List

The reading list component allows users to manage their books. It's implemented in `app/dashboard/reading-list/page.tsx`.

Key features:
- Displays books in different categories (To Read, Currently Reading, Finished)
- Allows users to update book status
- Provides a progress tracker for currently reading books

## Book Search

The book search component allows users to find and add new books to their reading list. It's implemented in `app/dashboard/reading-list/add/page.tsx`.

Key features:
- Search books by title or ISBN
- Display search results with book details
- Add books to reading list with selected status

## Recommendations

The recommendations component provides book suggestions to users based on their reading history and preferences. It's implemented in `app/dashboard/recommendations/page.tsx`.

Key features:
- Fetches personalized book recommendations
- Displays recommended books with details
- Allows adding recommended books to reading list

## User Profile

The user profile component allows users to manage their account settings and preferences. It's implemented in `app/dashboard/profile/page.tsx`.

Key features:
- Displays user information
- Allows users to update their preferred book categories

## BookAvatar

The BookAvatar component (`components/BookAvatar.tsx`) is used to display book information in a card format.

Key features:
- Displays book cover image
- Shows book title, author, and other details
- Provides a button to add the book to the reading list

## BookFinder

The BookFinder component (`components/BookFinder.tsx`) provides an interface for users to search for books based on various criteria.

Key features:
- Allows users to specify genre, format, page count, author, and language
- Sends search request to the Google Books API
- Displays search results

## DashboardHeader

The DashboardHeader component (`components/DashboardHeader.tsx`) provides navigation for the dashboard area.

Key features:
- Links to different sections of the dashboard
- Includes a user account button

## PointsSection

The PointsSection component (`components/PointsSection.tsx`) displays the user's current points.

Key features:
- Shows total points
- Displays loading state while fetching points

## RecentActivitySection

The RecentActivitySection component (`components/RecentActivitySection.tsx`) shows the user's recent reading activities.

Key features:
- Displays recent activities like starting or finishing a book
- Shows timestamp for each activity

These components work together to provide a comprehensive reading tracking and discovery experience for users of MyBookQuest.
