# Directory Structure

This document provides an overview of the project's directory structure and the purpose of each main directory.

## Root Directory

```
/
├── app/
├── components/
├── hooks/
├── interfaces/
├── libs/
├── public/
├── types/
└── ...
```

### app/

This directory contains the main application code, following Next.js 13's app directory structure.

```
app/
├── api/
│   ├── auth/
│   ├── books/
│   ├── points/
│   ├── recommendations/
│   ├── stripe/
│   └── webhook/
├── dashboard/
│   ├── profile/
│   ├── reading-list/
│   ├── reading-rewards/
│   └── recommendations/
├── signin/
├── privacy-policy/
├── tos/
└── ...
```

- `api/`: Contains API routes for server-side operations
- `dashboard/`: Contains pages for the user dashboard and its subpages
- `signin/`: Contains the sign-in page
- `privacy-policy/` and `tos/`: Contains the privacy policy and terms of service pages

### components/

This directory contains reusable React components used throughout the application.

```
components/
├── BookAvatar.tsx
├── BookFinder.tsx
├── BookListItem.tsx
├── ButtonAccount.tsx
├── ButtonCheckout.tsx
├── CongratulationsModal.tsx
├── DashboardHeader.tsx
├── FAQ.tsx
├── Footer.tsx
├── Header.tsx
├── Hero.tsx
└── ...
```

### hooks/

This directory contains custom React hooks used in the application.

```
hooks/
└── useBookDetails.ts
```

### interfaces/

This directory contains TypeScript interfaces used throughout the application.

```
interfaces/
├── BookFinder.ts
├── BookSearch.ts
├── Dashboard.ts
├── GoogleAPI.ts
└── ReadingList.ts
```

### libs/

This directory contains utility functions and libraries used in the application.

```
libs/
├── api.ts
├── gpt.ts
├── mailgun.ts
├── next-auth.ts
├── seo.tsx
└── stripe.ts
```

### public/

This directory contains static assets used in the application.

```
public/
└── blog/
    └── introducing-supabase/
        └── header.png
```

### types/

This directory contains additional TypeScript type definitions.

```
types/
├── config.ts
├── index.ts
└── next-auth.d.ts
```

## Configuration Files

The root directory also contains several configuration files:

- `next.config.js`: Next.js configuration
- `tailwind.config.js`: Tailwind CSS configuration
- `tsconfig.json`: TypeScript configuration
- `package.json`: Node.js package configuration
- `.gitignore`: Git ignore file
- `.eslintrc.json`: ESLint configuration

This structure allows for a clean separation of concerns and makes it easy to locate and manage different parts of the application.
