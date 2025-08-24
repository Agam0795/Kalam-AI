Auth setup (NextAuth + Google)

Environment variables (create .env.local):

- NEXTAUTH_URL=http://localhost:3000
- NEXTAUTH_SECRET=your-random-secret
- GOOGLE_CLIENT_ID=your-google-client-id
- GOOGLE_CLIENT_SECRET=your-google-client-secret

Create Google OAuth credentials:
- In Google Cloud Console, create OAuth 2.0 Client ID (Web Application)
- Authorized redirect URI: http://localhost:3000/api/auth/callback/google

Run dev and sign in via the header button.
