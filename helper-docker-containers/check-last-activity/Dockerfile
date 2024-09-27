# Use the Bun.js official image
FROM oven/bun:alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the current directory content into the container
COPY . .

# Install dependencies (Supabase SDK)
RUN bun install

# Set environment variables for Supabase
ENV RESEND_API_KEY=re_DpYeDgGZ_Q4nZMFbEAVqv8PJ2iGGNLHVu
ENV SUPABASE_URL=https://supabase.mybookquest.com
ENV SUPABASE_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJzdXBhYmFzZSIsImlhdCI6MTcyNjY5MzMyMCwiZXhwIjo0ODgyMzY2OTIwLCJyb2xlIjoic2VydmljZV9yb2xlIn0.pppnBvPjWWArQll_mmlEd2Z06S6QpyRYuUjv9y1PFug

# Run the Bun.js script
CMD ["bun", "index.js"]
