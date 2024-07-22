# MyBookQuest Documentation

This documentation provides an overview of the MyBookQuest application, its structure, and key components.

## Table of Contents

1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Key Components](#key-components)
4. [API Routes](#api-routes)
5. [Database Schema](#database-schema)
6. [Authentication](#authentication)
7. [Third-party Integrations](#third-party-integrations)
8. [Deployment](#deployment)

## Project Overview

MyBookQuest is a web application designed to help users track their reading habits, discover new books, and engage with a community of readers. The application is built using Next.js, React, and Supabase for backend services.

## Directory Structure

The project follows a standard Next.js structure with additional directories for components, interfaces, and utilities:

```
/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── signin/
│   └── ...
├── components/
├── hooks/
├── interfaces/
├── libs/
├── public/
├── types/
└── ...
```

For more details on each directory, see [Directory Structure](./directory-structure.md).

## Key Components

The application is composed of several key components:

- Dashboard
- Reading List
- Book Search
- Recommendations
- User Profile

For more information on each component, see [Key Components](./key-components.md).

## API Routes

The application uses several API routes to handle server-side logic:

- Book Search
- Recommendations
- User Points
- Stripe Integration

For more details on the API routes, see [API Routes](./api-routes.md).

## Database Schema

The application uses Supabase as its database. The main tables include:

- users
- reading_list
- user_preferences
- reading_stats
- user_points

For more information on the database schema, see [Database Schema](./database-schema.md).

## Authentication

Authentication is handled using Supabase Auth. Users can sign in using email/password or OAuth providers like Google.

For more details on authentication, see [Authentication](./authentication.md).

## Third-party Integrations

The application integrates with several third-party services:

- Google Books API
- Stripe for payments
- Mailgun for email services

For more information on these integrations, see [Third-party Integrations](./third-party-integrations.md).

## Deployment

The application is designed to be deployed on Vercel, which integrates well with Next.js applications.

For deployment instructions, see [Deployment](./deployment.md).
