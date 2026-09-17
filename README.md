# Keams Creations — Portfolio & Booking Upgrade

This review build combines the new white-first neon/glass website with the official Keams Creations logo, uploaded portfolio and direct booking flow.

## Preview locally

1. Open this folder in Visual Studio Code.
2. Open the terminal and run `npm install`.
3. Run `npm run dev`.
4. Open the local URL shown in the terminal.

Create a production build with `npm run build`. The finished static website is generated in `dist/`.

## Main source files

- `index.html` — page structure and portfolio content
- `src/style.css` — responsive white-first neon/glass styling
- `src/main.js` — navigation, themes, service search, portfolio filters/lightbox, FAQs and booking flow
- `public/brand/` — official KC logo assets
- `public/portfolio/` — optimized portfolio images

## Working contact flow

- WhatsApp: `+267 73 164 945`
- Email: `keamscreations@gmail.com`
- Facebook: `https://www.facebook.com/keamscreations`
- Existing Formspree endpoint remains the direct form option until the dashboard backend is activated.
- The quote builder validates the project details, creates a reviewable brief and opens an addressed WhatsApp or email draft.
- The visitor reviews the brief and explicitly chooses WhatsApp, direct submission or email.

## Portfolio order

Posters → Flyers → Logos → Merchandise → Branding → Website.

The Fortitude Initiative website is linked as the website project.

Existing listed prices, deposit terms, revision policy, turnaround guidance and file-delivery information were retained from the running site.

## Owner dashboard

The private-access dashboard is available at `/admin/` and manages:

- Booking and enquiry status from new request through completion
- Review verification, approval and rejection
- Public service descriptions, visibility and pricing

The dashboard has no public registration. Supabase Authentication and database row-level security restrict all business records to the email listed in `admin_users`. The dashboard page itself uses `noindex`; its data remains protected even if someone discovers the URL.

### Activate the secure backend

1. Create a Supabase project.
2. In Supabase SQL Editor, open `supabase/schema.sql` and run the script. It permits only `keamscreations@gmail.com` as the dashboard owner.
3. In Supabase Authentication, create `keamscreations@gmail.com` with a strong password. Disable public sign-ups in the project's Authentication settings.
4. From the Supabase Connect dialog or Settings → API Keys, copy the Project URL and publishable key into `kc-config.js`.
5. Run `npm run audit`, then merge and deploy the dashboard branch.

The publishable key is designed for browser use; never add a Supabase secret or legacy service-role key to this repository. The row-level security policies in `supabase/schema.sql` are the access boundary.

Until these steps are completed, the public website keeps using Formspree and `public/data/reviews.json`, and the dashboard login stays disabled.

## Verified reviews and ratings

- Before backend activation, the public rating is calculated only from entries in `public/data/reviews.json` where `verified` is exactly `true`.
- After activation, customers submit reviews into a pending queue. Only owner-approved reviews are exposed through the safe `public_reviews` view and included in the rating.
- The site begins with zero ratings rather than displaying invented testimonials.
- New review submissions include a 1–5 star rating, service, written feedback, verification contact and publication consent.
- Submissions never appear automatically. They remain pending until the owner approves them in the dashboard.
- An approved review entry uses this structure:

```json
{
  "name": "Client name",
  "service": "Brand identity",
  "rating": 5,
  "review": "The client's exact approved feedback.",
  "date": "2026-09-16",
  "verified": true
}
```

Add only reviews backed by a genuine submission, client confirmation, screenshot or public source.

## Deployment

Pushing to `main` runs the audit and deploys the production build to GitHub Pages. Dashboard development should remain on a feature branch until Supabase is configured and the owner login has been tested.
