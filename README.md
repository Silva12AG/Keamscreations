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
- Existing Formspree endpoint retained as the direct form option.
- The quote builder validates the project details, creates a reviewable brief and opens an addressed WhatsApp or email draft.
- Nothing is submitted automatically. The visitor reviews the brief and explicitly chooses WhatsApp, direct form submission or email.

## Portfolio order

Posters → Flyers → Logos → Merchandise → Branding → Website.

The Fortitude Initiative website is linked as the website project.

Existing listed prices, deposit terms, revision policy, turnaround guidance and file-delivery information were retained from the running site.

## Verified reviews and ratings

- The public rating is calculated only from entries in `public/data/reviews.json` where `verified` is exactly `true`.
- The site begins with zero ratings rather than displaying invented testimonials.
- New review submissions include a 1–5 star rating, service, written feedback, verification contact and publication consent.
- Submissions go to the existing Formspree inbox for manual verification and do not appear automatically.
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

## Pending before publishing

- Add the user's GitHub repository remote after its URL is provided.

The supplied URL was missing the `s` in “keams.” The working existing site is `https://keamscreations.netlify.app`; its Facebook profile and Formspree endpoint were recovered and preserved.
