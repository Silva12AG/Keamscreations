import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve('index.html'), 'utf8');
const javascript = readFileSync(resolve('src/main.js'), 'utf8');
const adminHtml = readFileSync(resolve('admin/index.html'), 'utf8');
const adminJavascript = readFileSync(resolve('admin/admin.js'), 'utf8');
const dashboardSchema = readFileSync(resolve('supabase/schema.sql'), 'utf8');
const backendConfig = readFileSync(resolve('kc-config.js'), 'utf8');
const reviewData = JSON.parse(readFileSync(resolve('public/data/reviews.json'), 'utf8'));
const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1]);
const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
const localAssets = [...html.matchAll(/(?:src|data-src)="\/(brand|portfolio)\/([^"]+)"/g)]
  .map((match) => resolve('public', match[1], match[2]));
const missingAssets = localAssets.filter((asset) => !existsSync(asset));
const portfolioCount = (html.match(/class="portfolio-card/g) || []).length;

const checks = [
  [duplicateIds.length === 0, `Duplicate element IDs: ${[...new Set(duplicateIds)].join(', ')}`],
  [missingAssets.length === 0, `Missing local assets: ${missingAssets.join(', ')}`],
  [portfolioCount === 24, `Expected 24 portfolio items, found ${portfolioCount}`],
  [javascript.includes('https://wa.me/26773164945?text='), 'Official WhatsApp booking destination is missing'],
  [javascript.includes('mailto:keamscreations@gmail.com?subject='), 'Official email booking destination is missing'],
  [javascript.includes('https://formspree.io/f/xwvnovwa'), 'Existing Formspree destination is missing'],
  [html.includes('https://www.facebook.com/keamscreations'), 'Official Facebook profile is missing'],
  [html.includes('https://fortitudeinitiative.netlify.app'), 'Fortitude Initiative portfolio link is missing'],
  [html.includes('id="review-form"'), 'Verified review submission form is missing'],
  [Array.isArray(reviewData.reviews), 'Review data must contain a reviews array'],
  [(reviewData.reviews || []).every((review) => review.verified === true), 'Unverified reviews must never be present in the published review data'],
  [javascript.includes("from '../kc-config.js'"), 'Public website is not connected to the dashboard configuration'],
  [javascript.includes("kcApi('bookings'"), 'Booking submissions are not connected to the dashboard'],
  [javascript.includes("kcApi('reviews'"), 'Review submissions are not connected to the dashboard'],
  [javascript.includes("kcApi('public_reviews"), 'Approved public reviews are not loaded from the secure review view'],
  [adminHtml.includes('name="robots" content="noindex, nofollow"'), 'Dashboard must be excluded from search indexing'],
  [adminHtml.includes('id="login-form"'), 'Dashboard owner login is missing'],
  [adminJavascript.includes("signInWithPassword"), 'Dashboard password login is missing'],
  [adminJavascript.includes("rpc('is_kc_admin')"), 'Dashboard owner authorization check is missing'],
  [adminJavascript.includes("from('reviews')"), 'Dashboard review management is missing'],
  [adminJavascript.includes("from('bookings')"), 'Dashboard booking management is missing'],
  [adminJavascript.includes("from('services')"), 'Dashboard service management is missing'],
  [dashboardSchema.includes('enable row level security'), 'Dashboard database row-level security is missing'],
  [dashboardSchema.includes('create or replace view public.public_reviews'), 'Safe public review view is missing'],
  [dashboardSchema.includes("values ('keamscreations@gmail.com')"), 'Database setup must restrict access to the selected owner email'],
  [backendConfig.includes("KC_SUPABASE_URL = 'https://avawxzfjocqibntihgrf.supabase.co'"), 'Configured Supabase Project URL is missing or incorrect'],
  [/KC_SUPABASE_PUBLISHABLE_KEY = '(?:|sb_publishable_[^']+)'/.test(backendConfig), 'Supabase publishable key must be blank or use the browser-safe sb_publishable_ format'],
  [!/(?:sb_secret_|service_role)/i.test(backendConfig), 'A private Supabase key must never be committed to the repository'],
];

const failures = checks.filter(([passed]) => !passed).map(([, message]) => message);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Static audit passed: ${portfolioCount} portfolio items, ${new Set(localAssets).size} verified assets, owner dashboard safeguards present.`);
