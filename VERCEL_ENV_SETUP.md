# Vercel Environment Variables Setup

To fix the MongoDB connection error during Vercel build, you need to set these environment variables in your Vercel dashboard:

## Required Environment Variables

1. **MONGO_URI** - Your MongoDB connection string
   ```
   mongodb://admin:admin123...@45.117.179.39:27017/CountingLove?authSource=admin
   ```

2. **MONGO_DB** - Your MongoDB database name
   ```
   CountingLove
   ```

3. **NEXTAUTH_URL** - Your app URL (for production)
   ```
   https://your-app.vercel.app
   ```

## How to Set Environment Variables in Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable:
   - **Name**: `MONGO_URI`
   - **Value**: `mongodb://admin:admin123...@45.117.179.39:27017/CountingLove?authSource=admin`
   - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

   - **Name**: `MONGO_DB`
   - **Value**: `CountingLove`
   - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

   - **Name**: `NEXTAUTH_URL`
   - **Value**: `https://your-app.vercel.app`
   - **Environment**: Production, Preview, Development (select all)
   - Click "Save"

5. After adding all variables, redeploy your project

## Alternative: Using .env.local

You can also create a `.env.local` file in your project root (but don't commit it to git):

```env
MONGO_URI=mongodb://admin:admin123...@45.117.179.39:27017/CountingLove?authSource=admin
MONGO_DB=CountingLove
NEXTAUTH_URL=http://localhost:3000
```

## Troubleshooting

- Make sure all environment variables are set for all environments (Production, Preview, Development)
- After setting variables, trigger a new deployment
- Check the Vercel function logs if you still get connection errors
