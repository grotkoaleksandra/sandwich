# Sandwich Popup

## Project Overview
A website for a sandwich popup restaurant, inspired by the bold, playful design of Rocky's Hot Honey.

## Tech Stack
- **Frontend**: GitHub Pages (static HTML/CSS/JS)
- **Backend**: Supabase (database, storage, auth, edge functions)
- **Email**: Resend
- **AI**: Google Gemini

## Development Rules
- Push immediately after every meaningful change
- Test all connections before marking setup complete

## GitHub
- **Repo**: https://github.com/grotkoaleksandra/sandwich
- **Live site**: https://grotkoaleksandra.github.io/sandwich/

## Supabase
- **Project ref**: pvkbwpdxtaaetzwdyazy
- **Project URL**: https://pvkbwpdxtaaetzwdyazy.supabase.co
- **Anon key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a2J3cGR4dGFhZXR6d2R5YXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzI0NTMsImV4cCI6MjA4NjIwODQ1M30.0WC3c6RvjrvKmz6a-uhsIeOBwdf2k-6ZVSN9OENXc4Y
- **Session pooler**: postgres://postgres.pvkbwpdxtaaetzwdyazy:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
- **CLI**: `npx supabase` (linked to project)

### Database Tables
- `menu_items` — sandwiches, sides, drinks (public read, auth write)
- `popup_events` — schedule and locations (public read, auth write)
- `mailing_list` — newsletter signups (public insert, auth read)
- `contact_messages` — contact form submissions (public insert, auth read/update)

### Storage Buckets
- `images` — public read, authenticated upload/update/delete

### RLS
- Enabled on ALL tables
- Public: read menu_items, popup_events; insert mailing_list, contact_messages
- Authenticated: full access to all tables

## Resend (Email)
- **Edge function**: `send-email` — deployed at https://pvkbwpdxtaaetzwdyazy.supabase.co/functions/v1/send-email
- **Shared service**: `shared/email-service.js`
- **Secret**: `RESEND_API_KEY` (set in Supabase secrets)
- **Note**: Verify a custom domain at https://resend.com/domains to send to any recipient. Currently limited to owner email only.

## Google Gemini (AI)
- **Secret**: `GEMINI_API_KEY` (set in Supabase secrets)
- **Usage**: Available in edge functions via `Deno.env.get("GEMINI_API_KEY")`
