# Database Schema

MyBookQuest uses Supabase as its database. This document outlines the main tables in the database schema.

## Users Table

**Table Name**: `auth.users`

This table is managed by Supabase Auth and stores user authentication information.

**Columns**:
- `id`: UUID (Primary Key)
- `email`: VARCHAR(255)
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## Profiles Table

**Table Name**: `public.profiles`

This table stores additional user information and is linked to the `auth.users` table.

**Columns**:
- `id`: UUID (Primary Key, Foreign Key referencing `auth.users.id`)
- `customer_id`: VARCHAR (Stripe customer ID)
- `price_id`: VARCHAR (Stripe price ID)
- `has_access`: BOOLEAN
- `email`: VARCHAR(255)

## Reading List Table

**Table Name**: `public.reading_list`

This table stores the user's reading list entries.

**Columns**:
- `id`: SERIAL (Primary Key)
- `user_id`: UUID (Foreign Key referencing `auth.users.id`)
- `book_id`: VARCHAR(20) (ISBN or other book identifier)
- `status`: VARCHAR(50) (CHECK constraint: 'To Read', 'Reading', 'Finished')
- `rating`: NUMERIC(3,1)
- `review`: TEXT
- `progress`: INTEGER
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

## User Preferences Table

**Table Name**: `public.user_preferences`

This table stores user preferences, including preferred book categories.

**Columns**:
- `user_id`: UUID (Primary Key, Foreign Key referencing `auth.users.id`)
- `preferred_categories`: TEXT[]

## Reading Stats Table

**Table Name**: `public.reading_stats`

This table stores aggregated reading statistics for each user.

**Columns**:
- `user_id`: UUID (Primary Key, Foreign Key referencing `auth.users.id`)
- `books_read`: INTEGER
- `pages_read`: INTEGER
- `reading_time_minutes`: INTEGER

## User Points Table

**Table Name**: `public.user_points`

This table tracks the points earned and redeemed by users.

**Columns**:
- `user_id`: UUID (Primary Key, Foreign Key referencing `auth.users.id`)
- `points`: INTEGER
- `points_earned`: INTEGER
- `points_redeemed`: INTEGER

## Point Transactions Table

**Table Name**: `public.point_transactions`

This table logs individual point transactions.

**Columns**:
- `id`: SERIAL (Primary Key)
- `user_id`: UUID (Foreign Key referencing `auth.users.id`)
- `points`: INTEGER
- `type`: VARCHAR(50) (CHECK constraint: 'earned', 'redeemed')
- `description`: TEXT
- `created_at`: TIMESTAMP

## User Activity Table

**Table Name**: `public.user_activity`

This table logs user activities.

**Columns**:
- `id`: SERIAL (Primary Key)
- `user_id`: UUID (Foreign Key referencing `auth.users.id`)
- `activity_type`: VARCHAR(50) (CHECK constraint: 'book_started', 'book_finished', 'points_earned')
- `details`: JSONB
- `created_at`: TIMESTAMP
- `updated_at`: TIMESTAMP

This schema design allows for efficient storage and retrieval of user data, reading lists, preferences, and activity logs. The use of foreign keys ensures data integrity across tables.
