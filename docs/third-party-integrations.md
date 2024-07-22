# Third-party Integrations

MyBookQuest integrates with several third-party services to provide its functionality. This document outlines the main integrations and how they are used in the application.

## Google Books API

The Google Books API is used to search for books and retrieve book details.

**Integration Points**:
- Book search functionality
- Fetching book details

**Key Files**:
- `app/api/books/search/route.ts`
- `app/api/books/[id]/route.ts`

**Usage Example**:
```typescript
const response = await fetch(
  `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
    query
  )}&maxResults=40&key=${process.env.GOOGLE_BOOKS_API_KEY}`
);
```

**Configuration**:
The Google Books API key is stored in the environment variable `GOOGLE_BOOKS_API_KEY`.

## Stripe

Stripe is used for handling payments and subscriptions.

**Integration Points**:
- Creating checkout sessions
- Managing customer portals
- Handling webhook events

**Key Files**:
- `app/api/stripe/create-checkout/route.ts`
- `app/api/stripe/create-portal/route.ts`
- `app/api/webhook/stripe/route.ts`
- `libs/stripe.ts`

**Usage Example**:
```typescript
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-08-16",
  typescript: true,
});

const session = await stripe.checkout.sessions.create({
  mode,
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  success_url: successUrl,
  cancel_url: cancelUrl,
});
```

**Configuration**:
Stripe configuration is stored in environment variables:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Mailgun

Mailgun is used for sending transactional emails.

**Integration Points**:
- Sending confirmation emails
- Handling email forwarding

**Key Files**:
- `libs/mailgun.ts`
- `app/api/webhook/mailgun/route.ts`

**Usage Example**:
```typescript
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY || "dummy",
});

await mg.messages.create(
  (config.mailgun.subdomain ? `${config.mailgun.subdomain}.` : "") +
    config.domainName,
  data
);
```

**Configuration**:
Mailgun configuration is stored in environment variables and the `config.js` file:
- `MAILGUN_API_KEY`
- `config.mailgun.subdomain`
- `config.mailgun.fromNoReply`
- `config.mailgun.fromAdmin`

## Supabase

Supabase is used as the main backend service, providing authentication and database services.

**Integration Points**:
- User authentication
- Database operations

**Key Files**:
- `app/api/auth/callback/route.ts`
- Various API routes and components that interact with the database

**Usage Example**:
```typescript
const supabase = createClientComponentClient();

const { data, error } = await supabase
  .from("reading_list")
  .select("*")
  .eq("user_id", user.id);
```

**Configuration**:
Supabase configuration is stored in environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Next.js

While not a third-party service in the traditional sense, Next.js is the core framework used for building the application.

**Integration Points**:
- Routing
- Server-side rendering
- API routes

**Key Files**:
- `next.config.js`
- Various pages and components throughout the application

**Configuration**:
Next.js configuration is primarily handled in the `next.config.js` file.

These integrations work together to provide a comprehensive set of features for MyBookQuest, handling everything from book data retrieval to payment processing and email communications.
