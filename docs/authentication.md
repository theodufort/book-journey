# Authentication

MyBookQu est uses Supabase Auth for user authentication. This document outlines the authentication flow and implementation details.

## Authentication Flow

1. **Sign Up**: Users can create an account using their email and password or through OAuth providers like Google.

2. **Sign In**: Existing users can sign in using their email and password or through OAuth providers.

3. **Session Management**: Once authenticated, a session is created and managed by Supabase Auth.

4. **Protected Routes**: Certain routes and API endpoints are protected and require authentication to access.

## Implementation Details

### Sign Up and Sign In

The sign-up and sign-in functionality is implemented in the `app/signin/page.tsx` file. This page provides options for both email/password authentication and OAuth (Google) authentication.

Key components:
- `ButtonSignin`: A reusable component for initiating the sign-in process.
- `createClientComponentClient`: Used to create a Supabase client for authentication operations.

Example of sign-in implementation:

```typescript
const handleSignup = async (e: any, options: { type: string; provider?: Provider }) => {
  e?.preventDefault();
  setIsLoading(true);

  try {
    const { type, provider } = options;
    const redirectURL = window.location.origin + "/api/auth/callback";

    if (type === "oauth") {
      await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: redirectURL,
        },
      });
    } else if (type === "magic_link") {
      await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectURL,
        },
      });
      toast.success("Check your emails!");
      setIsDisabled(true);
    }
  } catch (error) {
    console.log(error);
  } finally {
    setIsLoading(false);
  }
};
```

### Session Management

Session management is handled by Supabase Auth. The application checks for an active session on protected routes and redirects unauthenticated users to the sign-in page.

This is implemented in the `app/dashboard/layout.tsx` file:

```typescript
export default async function LayoutPrivate({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (!session) {
    redirect(config.auth.loginUrl);
  }

  return <>{children}</>;
}
```

### Protected API Routes

API routes that require authentication check for a valid session before processing requests. This is typically done using the `createRouteHandlerClient` from Supabase Auth helpers.

Example from `app/api/recommendations/route.ts`:

```typescript
export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // ... rest of the API logic
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
```

### Logout

Logout functionality is typically implemented in the `ButtonAccount` component (`components/ButtonAccount.tsx`):

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
  window.location.href = "/";
};
```

## Security Considerations

- HTTPS is used for all communications to ensure data privacy.
- Passwords are never stored in plain text. Supabase Auth handles password hashing and storage securely.
- OAuth tokens are securely managed by Supabase Auth.
- API routes validate the user's session for each request to prevent unauthorized access.

By leveraging Supabase Auth, MyBookQuest ensures a secure and streamlined authentication process for its users.
