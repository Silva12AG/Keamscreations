import './style.css';

const root = document.documentElement;
const body = document.body;
const themeToggle = document.querySelector('.theme-toggle');
const themeMeta = document.querySelector('meta[name="theme-color"]');
const navToggle = document.querySelector('.nav-toggle');
const nav = document.querySelector('.site-nav');
const modal = document.querySelector('#quote-modal');
const quoteForm = document.querySelector('#quote-form');
const quoteReady = document.querySelector('#quote-ready');
const quotePreview = document.querySelector('#quote-preview');
const formError = document.querySelector('#form-error');
const serviceSelect = quoteForm.elements.service;
const toast = document.querySelector('#toast');
const directSendButton = document.querySelector('#formspree-send');
let currentQuoteData = null;

const savedTheme = localStorage.getItem('kc-theme');
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
setTheme(savedTheme || (prefersDark ? 'dark' : 'light'));

function setTheme(theme) {
  root.dataset.theme = theme;
  localStorage.setItem('kc-theme', theme);
  themeToggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`);
  themeMeta.setAttribute('content', theme === 'dark' ? '#0b0c11' : '#f7f8fb');
}

themeToggle.addEventListener('click', () => {
  setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
});

navToggle.addEventListener('click', () => {
  const open = navToggle.getAttribute('aria-expanded') === 'true';
  navToggle.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('is-open', !open);
  body.classList.toggle('menu-open', !open);
});

document.querySelectorAll('.site-nav a, .nav-quote').forEach((item) => {
  item.addEventListener('click', () => {
    navToggle.setAttribute('aria-expanded', 'false');
    nav.classList.remove('is-open');
    body.classList.remove('menu-open');
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

const slider = document.querySelector('.portfolio-slider');
const portfolioTrack = document.querySelector('.portfolio-track');
const portfolioCards = [...document.querySelectorAll('.portfolio-card')];
const portfolioFilters = [...document.querySelectorAll('.portfolio-filters button')];
const counter = document.querySelector('.slide-counter b');
const counterTotal = document.querySelector('.slide-counter > span');
const lightbox = document.querySelector('#portfolio-lightbox');
const lightboxImage = document.querySelector('#lightbox-image');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxCategory = document.querySelector('#lightbox-category');
let visiblePortfolioCards = [...portfolioCards];
let currentSlide = 0;
let lightboxIndex = 0;
let scrollFrame;

function updatePortfolioCounter() {
  counter.textContent = String(currentSlide + 1).padStart(2, '0');
  counterTotal.textContent = String(visiblePortfolioCards.length).padStart(2, '0');
}

function movePortfolio(index, behavior = 'smooth') {
  if (!visiblePortfolioCards.length) return;
  currentSlide = (index + visiblePortfolioCards.length) % visiblePortfolioCards.length;
  const card = visiblePortfolioCards[currentSlide];
  portfolioTrack.scrollTo({ left: card.offsetLeft - portfolioTrack.offsetLeft, behavior });
  updatePortfolioCounter();
}

document.querySelector('.slider-prev').addEventListener('click', () => movePortfolio(currentSlide - 1));
document.querySelector('.slider-next').addEventListener('click', () => movePortfolio(currentSlide + 1));
slider.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowLeft') movePortfolio(currentSlide - 1);
  if (event.key === 'ArrowRight') movePortfolio(currentSlide + 1);
});

portfolioTrack.addEventListener('scroll', () => {
  window.cancelAnimationFrame(scrollFrame);
  scrollFrame = window.requestAnimationFrame(() => {
    const focusPoint = portfolioTrack.scrollLeft + portfolioTrack.clientWidth * 0.35;
    let nearestDistance = Number.POSITIVE_INFINITY;
    visiblePortfolioCards.forEach((card, index) => {
      const distance = Math.abs(card.offsetLeft + card.offsetWidth / 2 - focusPoint);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        currentSlide = index;
      }
    });
    updatePortfolioCounter();
  });
}, { passive: true });

portfolioFilters.forEach((filter) => {
  filter.addEventListener('click', () => {
    const category = filter.dataset.filter;
    portfolioFilters.forEach((item) => {
      const selected = item === filter;
      item.classList.toggle('is-active', selected);
      item.setAttribute('aria-selected', String(selected));
    });
    portfolioCards.forEach((card) => {
      card.hidden = category !== 'all' && card.dataset.category !== category;
    });
    visiblePortfolioCards = portfolioCards.filter((card) => !card.hidden);
    currentSlide = 0;
    portfolioTrack.scrollTo({ left: 0, behavior: 'smooth' });
    updatePortfolioCounter();
  });
});

function lightboxCards() {
  return visiblePortfolioCards.filter((card) => card.matches('button[data-src]'));
}

function renderLightbox(index) {
  const cards = lightboxCards();
  if (!cards.length) return;
  lightboxIndex = (index + cards.length) % cards.length;
  const card = cards[lightboxIndex];
  lightboxImage.src = card.dataset.src;
  lightboxImage.alt = card.querySelector('img').alt;
  lightboxTitle.textContent = card.dataset.title;
  lightboxCategory.textContent = card.dataset.category;
}

function openLightbox(card) {
  const cards = lightboxCards();
  renderLightbox(cards.indexOf(card));
  lightbox.classList.add('is-open');
  lightbox.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
  document.querySelector('.lightbox-close').focus();
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
}

portfolioCards.filter((card) => card.matches('button[data-src]')).forEach((card) => card.addEventListener('click', () => openLightbox(card)));
document.querySelector('.lightbox-prev').addEventListener('click', () => renderLightbox(lightboxIndex - 1));
document.querySelector('.lightbox-next').addEventListener('click', () => renderLightbox(lightboxIndex + 1));
document.querySelectorAll('[data-close-lightbox]').forEach((button) => button.addEventListener('click', closeLightbox));
updatePortfolioCounter();

document.querySelectorAll('.faq-item button').forEach((button) => {
  button.addEventListener('click', () => {
    const item = button.closest('.faq-item');
    const isOpen = item.classList.contains('is-open');
    document.querySelectorAll('.faq-item').forEach((faq) => {
      faq.classList.remove('is-open');
      faq.querySelector('button').setAttribute('aria-expanded', 'false');
      faq.querySelector('i').textContent = '+';
    });
    if (!isOpen) {
      item.classList.add('is-open');
      button.setAttribute('aria-expanded', 'true');
      button.querySelector('i').textContent = '−';
    }
  });
});

const serviceCards = [...document.querySelectorAll('.service-card')];
const searchInput = document.querySelector('#need-search');
const searchButton = document.querySelector('#find-service');
const suggestionList = document.querySelector('#suggestion-list');
const finderResult = document.querySelector('#finder-result');

function matchesFor(query) {
  const tokens = query.toLowerCase().split(/\s+/).filter((token) => token.length > 2);
  return serviceCards.map((card) => {
    const haystack = `${card.dataset.service} ${card.dataset.keywords} ${card.textContent}`.toLowerCase();
    const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    return { card, score };
  }).filter((item) => item.score > 0).sort((a, b) => b.score - a.score);
}

function renderSuggestions() {
  const query = searchInput.value.trim();
  suggestionList.innerHTML = '';
  if (query.length < 2) {
    suggestionList.classList.remove('is-open');
    return;
  }
  const matches = matchesFor(query).slice(0, 3);
  if (!matches.length) {
    suggestionList.classList.remove('is-open');
    return;
  }
  matches.forEach(({ card }) => {
    const option = document.createElement('button');
    option.type = 'button';
    option.setAttribute('role', 'option');
    option.textContent = card.dataset.service;
    option.addEventListener('click', () => {
      searchInput.value = card.dataset.service;
      suggestionList.classList.remove('is-open');
      findService(card);
    });
    suggestionList.appendChild(option);
  });
  suggestionList.classList.add('is-open');
}

function findService(preselected) {
  const query = searchInput.value.trim();
  const match = preselected || matchesFor(query)[0]?.card;
  serviceCards.forEach((card) => card.classList.remove('is-match'));
  suggestionList.classList.remove('is-open');
  if (!query) {
    finderResult.textContent = 'Tell us what you want to achieve and we’ll point you in the right direction.';
    searchInput.focus();
    return;
  }
  if (!match) {
    finderResult.innerHTML = `Your idea sounds custom — <button type="button" data-custom-open>tell us more in the quote builder →</button>`;
    finderResult.querySelector('button').addEventListener('click', () => openQuote('Something else'));
    return;
  }
  match.classList.add('is-match');
  match.scrollIntoView({ behavior: 'smooth', block: 'center' });
  finderResult.innerHTML = `Best match: <strong>${match.dataset.service}</strong>. We highlighted it for you.`;
  window.setTimeout(() => match.classList.remove('is-match'), 3200);
}

searchInput.addEventListener('input', renderSuggestions);
searchInput.addEventListener('keydown', (event) => { if (event.key === 'Enter') findService(); });
searchButton.addEventListener('click', () => findService());
document.addEventListener('click', (event) => {
  if (!event.target.closest('.need-finder')) suggestionList.classList.remove('is-open');
});

let lastFocused = null;
function openQuote(service = '') {
  lastFocused = document.activeElement;
  modal.classList.add('is-open');
  modal.setAttribute('aria-hidden', 'false');
  body.classList.add('modal-open');
  if (service) serviceSelect.value = service;
  window.setTimeout(() => quoteForm.elements.name.focus(), 80);
}

function closeQuote() {
  modal.classList.remove('is-open');
  modal.setAttribute('aria-hidden', 'true');
  body.classList.remove('modal-open');
  lastFocused?.focus();
}

document.querySelectorAll('[data-open-quote]').forEach((button) => button.addEventListener('click', () => openQuote()));
document.querySelectorAll('[data-close-quote]').forEach((button) => button.addEventListener('click', closeQuote));
document.querySelectorAll('.service-select').forEach((button) => button.addEventListener('click', () => openQuote(button.closest('.service-card').dataset.service)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && modal.classList.contains('is-open')) closeQuote();
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  if (lightbox.classList.contains('is-open') && event.key === 'ArrowLeft') renderLightbox(lightboxIndex - 1);
  if (lightbox.classList.contains('is-open') && event.key === 'ArrowRight') renderLightbox(lightboxIndex + 1);
  if (event.key === 'Tab' && modal.classList.contains('is-open')) {
    const focusable = [...modal.querySelectorAll('button, a[href], input, select, textarea')].filter((el) => !el.hidden);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
    if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
  }
});

quoteForm.addEventListener('submit', (event) => {
  event.preventDefault();
  if (!quoteForm.checkValidity()) {
    formError.textContent = 'Please complete each field so we can build a useful brief.';
    quoteForm.reportValidity();
    return;
  }
  formError.textContent = '';
  const data = new FormData(quoteForm);
  currentQuoteData = data;
  const deadline = new Date(`${data.get('deadline')}T00:00:00`).toLocaleDateString('en-BW', { day: 'numeric', month: 'long', year: 'numeric' });
  const brief = `Hi Keams Creations! 👋\n\nI’d like to request a quote.\n\nName: ${data.get('name')}\nContact: ${data.get('contact')}\nService: ${data.get('service')}\nPreferred deadline: ${deadline}\n\nProject details:\n${data.get('details')}\n\nSent from the Keams Creations website.`;
  quotePreview.textContent = brief;
  document.querySelector('#whatsapp-link').href = `https://wa.me/26773164945?text=${encodeURIComponent(brief)}`;
  document.querySelector('#email-link').href = `mailto:keamscreations@gmail.com?subject=${encodeURIComponent(`Quote request — ${data.get('service')}`)}&body=${encodeURIComponent(brief)}`;
  quoteForm.hidden = true;
  quoteReady.hidden = false;
  quoteReady.querySelector('a').focus();
});

directSendButton.addEventListener('click', async () => {
  if (!currentQuoteData) return;
  directSendButton.disabled = true;
  directSendButton.textContent = 'Sending…';
  const formData = new FormData();
  currentQuoteData.forEach((value, key) => formData.append(key, value));
  formData.append('_subject', `KC website quote — ${currentQuoteData.get('service')}`);
  try {
    const response = await fetch('https://formspree.io/f/xwvnovwa', {
      method: 'POST',
      body: formData,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Request failed');
    directSendButton.textContent = 'Request sent ✓';
    showToast('Your request was sent to Keams Creations');
  } catch {
    directSendButton.disabled = false;
    directSendButton.textContent = 'Try direct send again';
    showToast('Direct send failed — WhatsApp and email are still ready');
  }
});

document.querySelector('#copy-brief').addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(quotePreview.textContent);
    showToast('Project brief copied');
  } catch {
    showToast('Select the brief above to copy it');
  }
});

document.querySelector('#start-over').addEventListener('click', () => {
  quoteReady.hidden = true;
  quoteForm.hidden = false;
  directSendButton.disabled = false;
  directSendButton.textContent = 'Send request directly';
  quoteForm.elements.details.focus();
});

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.setTimeout(() => toast.classList.remove('is-visible'), 2400);
}

document.querySelectorAll('[data-unavailable]').forEach((button) => {
  button.addEventListener('click', () => showToast(button.dataset.unavailable));
});

const reviewsList = document.querySelector('#reviews-list');
const ratingAverage = document.querySelector('#rating-average');
const ratingCount = document.querySelector('#rating-count');
const summaryStars = document.querySelector('#summary-stars');
const reviewForm = document.querySelector('#review-form');
const reviewFormError = document.querySelector('#review-form-error');

function createReviewCard(review) {
  const article = document.createElement('article');
  article.className = 'review-card';

  const head = document.createElement('div');
  head.className = 'review-card-head';
  const person = document.createElement('div');
  person.className = 'review-person';
  const avatar = document.createElement('span');
  avatar.className = 'review-avatar';
  avatar.textContent = review.name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
  const identity = document.createElement('div');
  const name = document.createElement('strong');
  name.textContent = review.name;
  const service = document.createElement('small');
  service.textContent = review.service;
  identity.append(name, service);
  person.append(avatar, identity);
  const badge = document.createElement('span');
  badge.className = 'verified-badge';
  badge.textContent = '✓ Verified client';
  head.append(person, badge);

  const stars = document.createElement('div');
  stars.className = 'review-stars';
  stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
  stars.textContent = `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`;
  const quote = document.createElement('blockquote');
  quote.textContent = `“${review.review}”`;
  const meta = document.createElement('span');
  meta.className = 'review-meta';
  meta.textContent = new Date(`${review.date}T00:00:00`).toLocaleDateString('en-BW', { month: 'long', year: 'numeric' });
  article.append(head, stars, quote, meta);
  return article;
}

async function loadVerifiedReviews() {
  try {
    const response = await fetch('/data/reviews.json', { cache: 'no-store' });
    if (!response.ok) throw new Error('Reviews unavailable');
    const data = await response.json();
    const verified = (Array.isArray(data.reviews) ? data.reviews : []).filter((review) =>
      review.verified === true &&
      typeof review.name === 'string' &&
      typeof review.service === 'string' &&
      typeof review.review === 'string' &&
      Number.isInteger(review.rating) &&
      review.rating >= 1 && review.rating <= 5 &&
      /^\d{4}-\d{2}-\d{2}$/.test(review.date)
    );
    if (!verified.length) return;

    const average = verified.reduce((total, review) => total + review.rating, 0) / verified.length;
    const rounded = Math.round(average);
    ratingAverage.textContent = average.toFixed(1);
    ratingCount.textContent = `${verified.length} verified client review${verified.length === 1 ? '' : 's'}`;
    summaryStars.textContent = `${'★'.repeat(rounded)}${'☆'.repeat(5 - rounded)}`;
    summaryStars.setAttribute('aria-label', `${average.toFixed(1)} out of 5 from ${verified.length} verified reviews`);
    reviewsList.innerHTML = '';
    verified.forEach((review) => reviewsList.appendChild(createReviewCard(review)));
  } catch {
    ratingCount.textContent = 'Verified ratings are temporarily unavailable';
  }
}

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!reviewForm.checkValidity()) {
    reviewFormError.textContent = 'Please complete every field, choose a rating and confirm publication consent.';
    reviewForm.reportValidity();
    return;
  }
  reviewFormError.textContent = '';
  const submitButton = reviewForm.querySelector('button[type="submit"]');
  submitButton.disabled = true;
  submitButton.textContent = 'Submitting for verification…';
  const data = new FormData(reviewForm);
  data.append('_subject', `KC client review — ${data.get('rating')} stars`);
  try {
    const response = await fetch('https://formspree.io/f/xwvnovwa', {
      method: 'POST',
      body: data,
      headers: { Accept: 'application/json' },
    });
    if (!response.ok) throw new Error('Review submission failed');
    reviewForm.classList.add('is-sent');
    const success = document.createElement('div');
    success.className = 'review-success';
    success.innerHTML = '<div><span>✓</span><h4>Review received.</h4><p>Thank you. Keams Creations will verify your project before the review is published or included in the rating.</p></div>';
    reviewForm.appendChild(success);
  } catch {
    submitButton.disabled = false;
    submitButton.innerHTML = 'Try submitting again <span>→</span>';
    reviewFormError.textContent = 'The review could not be submitted. Please check your connection and try again.';
  }
});

loadVerifiedReviews();

document.querySelector('#year').textContent = new Date().getFullYear();
