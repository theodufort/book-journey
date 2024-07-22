# API Routes

This document provides an overview of the API routes used in the MyBookQuest application.

## Book Search

**Route**: `/api/books/search`

**File**: `app/api/books/search/route.ts`

**Method**: GET

**Description**: This route handles book searches using the Google Books API.

**Query Parameters**:
- `q`: The search query string

**Response**:
- Success: Returns a JSON object with `items` (array of book objects) and `totalItems` (number of results)
- Error: Returns a JSON object with an `error` message

## Book Details

**Route**: `/api/books/[id]`

**File**: `app/api/books/[id]/route.ts`

**Method**: GET

**Description**: This route fetches details for a specific book using its ISBN.

**Path Parameters**:
- `id`: The ISBN of the book

**Response**:
- Success: Returns a JSON object with book details
- Error: Returns a JSON object with an `error` message

## Recommendations

**Route**: `/api/recommendations`

**File**: `app/api/recommendations/route.ts`

**Method**: GET

**Description**: This route generates book recommendations for the authenticated user.

**Response**:
- Success: Returns a JSON object with an array of recommended books
- Error: Returns a JSON object with an `error` message

## User Points

**Route**: `/api/points/earn`

**File**: `app/api/points/earn/route.ts`

**Method**: POST

**Description**: This route handles awarding points to users for various actions.

**Request Body**:
- `points`: Number of points to award
- `reason`: Reason for awarding points

**Response**:
- Success: Returns a JSON object confirming points awarded
- Error: Returns a JSON object with an `error` message

**Route**: `/api/points/redeem`

**File**: `app/api/points/redeem/route.ts`

**Method**: POST

**Description**: This route handles redeeming user points for rewards.

**Request Body**:
- `points`: Number of points to redeem
- `rewardId`: ID of the reward being redeemed

**Response**:
- Success: Returns a JSON object confirming points redeemed
- Error: Returns a JSON object with an `error` message

## Stripe Integration

**Route**: `/api/stripe/create-checkout`

**File**: `app/api/stripe/create-checkout/route.ts`

**Method**: POST

**Description**: This route creates a Stripe checkout session for purchases.

**Request Body**:
- `priceId`: Stripe price ID
- `mode`: 'payment' or 'subscription'
- `successUrl`: URL to redirect after successful payment
- `cancelUrl`: URL to redirect if payment is cancelled

**Response**:
- Success: Returns a JSON object with the Stripe checkout session URL
- Error: Returns a JSON object with an `error` message

**Route**: `/api/stripe/create-portal`

**File**: `app/api/stripe/create-portal/route.ts`

**Method**: POST

**Description**: This route creates a Stripe customer portal session.

**Request Body**:
- `returnUrl`: URL to return to after leaving the customer portal

**Response**:
- Success: Returns a JSON object with the Stripe customer portal URL
- Error: Returns a JSON object with an `error` message

## Webhooks

**Route**: `/api/webhook/stripe`

**File**: `app/api/webhook/stripe/route.ts`

**Method**: POST

**Description**: This route handles Stripe webhook events.

**Response**:
- Success: Returns an empty JSON object
- Error: Returns a JSON object with an `error` message

**Route**: `/api/webhook/mailgun`

**File**: `app/api/webhook/mailgun/route.ts`

**Method**: POST

**Description**: This route handles Mailgun webhook events for email forwarding.

**Response**:
- Success: Returns an empty JSON object
- Error: Returns a JSON object with an `error` message

These API routes form the backbone of the server-side functionality in MyBookQuest, handling everything from book searches and recommendations to payment processing and email management.
