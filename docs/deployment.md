# Deployment

This document outlines the deployment process for MyBookQuest. The application is designed to be deployed on Vercel, which provides excellent integration with Next.js applications.

## Prerequisites

Before deploying, ensure you have:

1. A Vercel account
2. A GitHub repository with your MyBookQuest code
3. All necessary environment variables ready

## Environment Variables

Ensure the following environment variables are set in your Vercel project:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `GOOGLE_BOOKS_API_KEY`: Your Google Books API key
- `STRIPE_SECRET_KEY`: Your Stripe secret key
- `STRIPE_WEBHOOK_SECRET`: Your Stripe webhook secret
- `MAILGUN_API_KEY`: Your Mailgun API key
- `NEXTAUTH_SECRET`: A secret for NextAuth (can be any random string)
- `NEXTAUTH_URL`: The URL of your deployed application

## Deployment Steps

1. **Connect Your Repository**:
   - Log in to your Vercel account
   - Click "Import Project"
   - Select your GitHub repository containing the MyBookQuest code

2. **Configure Your Project**:
   - Vercel will automatically detect that it's a Next.js project
   - Set the root directory to `/` if not already set
   - Set the build command to `next build` if not already set
   - Set the output directory to `.next` if not already set

3. **Environment Variables**:
   - In the Vercel dashboard, go to your project settings
   - Navigate to the "Environment Variables" section
   - Add all the required environment variables listed above

4. **Deploy**:
   - Click "Deploy" in the Vercel dashboard
   - Vercel will build and deploy your application

5. **Verify Deployment**:
   - Once deployment is complete, Vercel will provide you with a URL
   - Visit the URL to ensure your application is working correctly

## Post-Deployment Steps

1. **Set Up Custom Domain** (Optional):
   - In the Vercel dashboard, go to your project settings
   - Navigate to the "Domains" section
   - Add your custom domain and follow the instructions to set up DNS

2. **Configure Stripe Webhook**:
   - In your Stripe dashboard, set up a webhook pointing to `https://your-domain.com/api/webhook/stripe`
   - Ensure you're using the correct Stripe webhook secret in your environment variables

3. **Configure Mailgun Webhook** (if using):
   - In your Mailgun dashboard, set up a webhook pointing to `https://your-domain.com/api/webhook/mailgun`

4. **Update OAuth Redirect URIs**:
   - If you're using OAuth (e.g., Google Sign-In), update the redirect URIs in your OAuth provider's dashboard to include your new domain

## Continuous Deployment

Vercel automatically sets up continuous deployment from your connected GitHub repository. Any pushes to the main branch will trigger a new deployment.

## Monitoring and Logs

- Use the Vercel dashboard to monitor your application's performance and view logs
- Set up error tracking services like Sentry for more detailed error reporting

## Scaling

Vercel automatically handles scaling for most applications. If you need additional resources:

1. Upgrade your Vercel plan as needed
2. Consider using Vercel's Edge Network for improved global performance
3. Optimize your Supabase queries and indexes for better database performance

By following these steps, you should have a successfully deployed and running instance of MyBookQuest on Vercel.
