import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';

const html = readFileSync(resolve('index.html'), 'utf8');
const javascript = readFileSync(resolve('src/main.js'), 'utf8');
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
];

const failures = checks.filter(([passed]) => !passed).map(([, message]) => message);
if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log(`Static audit passed: ${portfolioCount} portfolio items, ${new Set(localAssets).size} verified assets, official booking destinations present.`);
