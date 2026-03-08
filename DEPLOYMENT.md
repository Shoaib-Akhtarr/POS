# Deploying Karobar Sahulat Web POS to Vercel

Follow these steps to deploy your application to Vercel and make it live.

## Step 1: Push to GitHub/GitLab/Bitbucket

Ensure all your changes are committed and pushed to your remote repository.

```bash
git add .
git commit -m "chore: make production ready"
git push origin main
```

## Step 2: Import Project to Vercel

1. Log in to [Vercel](https://vercel.com).
2. Click **Add New** > **Project**.
3. Import your repository.

## Step 3: Configure Environment Variables

During the "Configure Project" step, open the **Environment Variables** section and add the following:

| Name | Value | Description |
| :--- | :--- | :--- |
| `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string. |
| `JWT_SECRET` | `your-random-secret` | A strong, random string for auth tokens. |
| `NEXT_PUBLIC_API_URL` | `/api` | (Optional) Defaults to /api in code. |

## Step 4: Deploy

Click **Deploy**. Vercel will build your application. Once finished, you will receive a public URL (e.g., `karobar-sahulat-web-pos.vercel.app`).

## Troubleshooting

- **Database Connection**: If you see connection errors, ensure your MongoDB Atlas IP Whitelist allows access from `0.0.0.0/0` (Vercel uses dynamic IPs).
- **Build Errors**: Check the build logs in the Vercel dashboard for specific errors.
