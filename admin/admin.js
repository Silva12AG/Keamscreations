import { KC_SUPABASE_URL, KC_SUPABASE_ANON_KEY, kcBackendConfigured } from '../kc-config.js';

const state = {
  client: null,
  user: null,
  reviews: [],
  bookings: [],
  services: [],
  reviewFilter: 'pending',
  bookingFilter: 'all',
};

const authView = document.querySelector('#auth-view');
const dashboardView = document.querySelector('#dashboard-view');
const loginForm = document.querySelector('#login-form');
const loginMessage = document.querySelector('#login-message');
const setupNotice = document.querySelector('#setup-notice');
const dashboardAlert = document.querySelector('#dashboard-alert');
const confirmDialog = document.querySelector('#confirm-dialog');
let pendingConfirmation = null;

function initials(name = 'KC') {
  return name.trim().split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase();
}

function formatDate(value, options = { day: 'numeric', month: 'short', year: 'numeric' }) {
  if (!value) return 'Not supplied';
  return new Intl.DateTimeFormat('en-BW', options).format(new Date(value));
}

function createElement(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function emptyState(message) {
  const empty = createElement('div', 'empty-state');
  const paragraph = createElement('p', '', message);
  empty.appendChild(paragraph);
  return empty;
}

function showAlert(message, error = false) {
  dashboardAlert.textContent = message;
  dashboardAlert.classList.add('is-visible');
  dashboardAlert.classList.toggle('is-error', error);
  window.clearTimeout(showAlert.timeout);
  showAlert.timeout = window.setTimeout(() => dashboardAlert.classList.remove('is-visible'), 4200);
}

function showAuth() {
  authView.hidden = false;
  dashboardView.hidden = true;
}

function showDashboard() {
  authView.hidden = true;
  dashboardView.hidden = false;
  document.querySelector('#owner-email').textContent = state.user?.email || '';
  document.querySelector('#owner-name').textContent = 'KC Owner';
}

function setLoading(button, loading, label) {
  if (!button) return;
  if (loading) {
    button.dataset.originalText = button.textContent;
    button.disabled = true;
    button.textContent = label;
  } else {
    button.disabled = false;
    button.textContent = button.dataset.originalText || button.textContent;
  }
}

async function verifyOwner() {
  const { data, error } = await state.client.rpc('is_kc_admin');
  if (error) throw error;
  if (!data) {
    await state.client.auth.signOut();
    throw new Error('This account is not approved for the KC dashboard.');
  }
}

async function loadDashboardData(announce = false) {
  const [reviewsResult, bookingsResult, servicesResult] = await Promise.all([
    state.client.from('reviews').select('*').order('submitted_at', { ascending: false }),
    state.client.from('bookings').select('*').order('created_at', { ascending: false }),
    state.client.from('services').select('*').order('sort_order', { ascending: true }),
  ]);

  const error = reviewsResult.error || bookingsResult.error || servicesResult.error;
  if (error) throw error;
  state.reviews = reviewsResult.data || [];
  state.bookings = bookingsResult.data || [];
  state.services = servicesResult.data || [];
  renderEverything();
  if (announce) showAlert('Dashboard data refreshed.');
}

function renderStats() {
  const pendingReviews = state.reviews.filter((review) => review.status === 'pending');
  const approvedReviews = state.reviews.filter((review) => review.status === 'approved');
  const newBookings = state.bookings.filter((booking) => booking.status === 'new');
  const activeServices = state.services.filter((service) => service.active);
  const average = approvedReviews.length
    ? approvedReviews.reduce((total, review) => total + review.rating, 0) / approvedReviews.length
    : null;

  document.querySelector('#stat-pending-reviews').textContent = pendingReviews.length;
  document.querySelector('#stat-rating').textContent = average ? average.toFixed(1) : '—';
  document.querySelector('#stat-review-total').textContent = approvedReviews.length
    ? `${approvedReviews.length} verified review${approvedReviews.length === 1 ? '' : 's'}`
    : 'No published reviews';
  document.querySelector('#stat-new-bookings').textContent = newBookings.length;
  document.querySelector('#stat-services').textContent = activeServices.length;
  document.querySelector('#pending-review-badge').textContent = pendingReviews.length;
  document.querySelector('#new-booking-badge').textContent = newBookings.length;

  renderOverviewList('#overview-reviews', pendingReviews.slice(0, 4), 'No reviews are waiting for approval.', (review) => ({
    title: review.name,
    subtitle: `${review.service} • ${review.rating} stars`,
    badge: 'Pending',
  }));
  renderOverviewList('#overview-bookings', state.bookings.slice(0, 4), 'No booking enquiries yet.', (booking) => ({
    title: booking.name,
    subtitle: `${booking.service} • due ${formatDate(`${booking.deadline}T00:00:00`, { day: 'numeric', month: 'short' })}`,
    badge: booking.status,
  }));
}

function renderOverviewList(selector, items, emptyMessage, mapItem) {
  const container = document.querySelector(selector);
  container.replaceChildren();
  if (!items.length) {
    container.appendChild(emptyState(emptyMessage));
    return;
  }
  items.forEach((item) => {
    const mapped = mapItem(item);
    const row = createElement('div', 'mini-item');
    const copy = createElement('div');
    copy.append(createElement('strong', '', mapped.title), createElement('span', '', mapped.subtitle));
    row.append(copy, createElement('b', '', mapped.badge));
    container.appendChild(row);
  });
}

function metadataItem(label, value) {
  const item = createElement('div');
  item.append(createElement('span', '', label), createElement('strong', '', value));
  return item;
}

function actionButton(label, className, onClick) {
  const button = createElement('button', className, label);
  button.type = 'button';
  button.addEventListener('click', onClick);
  return button;
}

function renderReviews() {
  const container = document.querySelector('#reviews-list-admin');
  const reviews = state.reviewFilter === 'all'
    ? state.reviews
    : state.reviews.filter((review) => review.status === state.reviewFilter);
  container.replaceChildren();
  if (!reviews.length) {
    container.appendChild(emptyState(`No ${state.reviewFilter === 'all' ? '' : `${state.reviewFilter} `}reviews found.`));
    return;
  }

  reviews.forEach((review) => {
    const card = createElement('article', 'data-card');
    const head = createElement('div', 'data-card-head');
    const person = createElement('div', 'data-person');
    const avatar = createElement('span', 'avatar', initials(review.name));
    const identity = createElement('div');
    identity.append(createElement('strong', '', review.name), createElement('small', '', review.service));
    person.append(avatar, identity);
    head.append(person, createElement('span', `status-pill ${review.status}`, review.status));

    const stars = createElement('div', 'review-stars', `${'★'.repeat(review.rating)}${'☆'.repeat(5 - review.rating)}`);
    stars.setAttribute('aria-label', `${review.rating} out of 5 stars`);
    const quote = createElement('blockquote', '', `“${review.review_text}”`);
    const metadata = createElement('div', 'metadata-grid');
    metadata.append(
      metadataItem('Verification contact', review.verification_contact),
      metadataItem('Submitted', formatDate(review.submitted_at)),
      metadataItem('Consent', review.publication_consent ? 'Confirmed' : 'Missing'),
    );
    const actions = createElement('div', 'data-actions');

    if (review.status !== 'approved') {
      actions.appendChild(actionButton('Approve review', 'approve', () => updateReviewStatus(review, 'approved')));
    }
    if (review.status !== 'rejected') {
      actions.appendChild(actionButton('Reject', 'reject', () => requestConfirmation(
        'Reject this review?',
        'It will remain in the dashboard but will never appear publicly or affect the rating.',
        () => updateReviewStatus(review, 'rejected'),
      )));
    }
    if (review.status !== 'pending') {
      actions.appendChild(actionButton('Move back to pending', '', () => updateReviewStatus(review, 'pending')));
    }

    card.append(head, stars, quote, metadata, actions);
    container.appendChild(card);
  });
}

async function updateReviewStatus(review, status) {
  const patch = {
    status,
    published_at: status === 'approved' ? new Date().toISOString() : null,
  };
  const { error } = await state.client.from('reviews').update(patch).eq('id', review.id);
  if (error) {
    showAlert(error.message, true);
    return;
  }
  review.status = status;
  review.published_at = patch.published_at;
  renderEverything();
  showAlert(status === 'approved' ? `${review.name}'s review is now public.` : `Review moved to ${status}.`);
}

function contactHref(contact) {
  if (contact.includes('@')) return `mailto:${contact}`;
  const digits = contact.replace(/\D/g, '');
  return digits ? `https://wa.me/${digits.startsWith('267') ? digits : `267${digits}`}` : '#';
}

function renderBookings() {
  const container = document.querySelector('#bookings-list-admin');
  const bookings = state.bookingFilter === 'all'
    ? state.bookings
    : state.bookings.filter((booking) => booking.status === state.bookingFilter);
  container.replaceChildren();
  if (!bookings.length) {
    container.appendChild(emptyState('No bookings match this filter.'));
    return;
  }

  bookings.forEach((booking) => {
    const card = createElement('article', 'data-card');
    const head = createElement('div', 'data-card-head');
    const person = createElement('div', 'data-person');
    const avatar = createElement('span', 'avatar', initials(booking.name));
    const identity = createElement('div');
    identity.append(createElement('strong', '', booking.name), createElement('small', '', booking.service));
    person.append(avatar, identity);
    head.append(person, createElement('span', `status-pill ${booking.status}`, booking.status));
    const metadata = createElement('div', 'metadata-grid');
    metadata.append(
      metadataItem('Contact', booking.contact),
      metadataItem('Preferred deadline', formatDate(`${booking.deadline}T00:00:00`)),
      metadataItem('Received', formatDate(booking.created_at)),
    );
    const details = createElement('p', 'booking-details', booking.details);
    const actions = createElement('div', 'data-actions');
    const contact = createElement('a', '', booking.contact.includes('@') ? 'Open email' : 'Open WhatsApp');
    contact.href = contactHref(booking.contact);
    if (!booking.contact.includes('@')) {
      contact.target = '_blank';
      contact.rel = 'noopener';
    }
    const statusSelect = createElement('select', 'booking-status-select');
    ['new', 'contacted', 'quoted', 'booked', 'completed', 'closed'].forEach((status) => {
      const option = createElement('option', '', status[0].toUpperCase() + status.slice(1));
      option.value = status;
      option.selected = booking.status === status;
      statusSelect.appendChild(option);
    });
    statusSelect.setAttribute('aria-label', `Update ${booking.name}'s booking status`);
    statusSelect.addEventListener('change', () => updateBookingStatus(booking, statusSelect.value));
    actions.append(contact, statusSelect);
    card.append(head, metadata, details, actions);
    container.appendChild(card);
  });
}

async function updateBookingStatus(booking, status) {
  const { error } = await state.client.from('bookings').update({ status }).eq('id', booking.id);
  if (error) {
    showAlert(error.message, true);
    renderBookings();
    return;
  }
  booking.status = status;
  renderEverything();
  showAlert(`${booking.name}'s enquiry is now marked ${status}.`);
}

function renderServices() {
  const container = document.querySelector('#services-list-admin');
  container.replaceChildren();
  if (!state.services.length) {
    container.appendChild(emptyState('No services found. Run the database setup script to add the starting services.'));
    return;
  }

  state.services.forEach((service) => {
    const card = createElement('article', 'service-editor');
    card.dataset.id = service.id;
    const head = createElement('div', 'service-editor-head');
    const title = createElement('h2', '', service.name);
    const activeLabel = createElement('label', '', 'Visible');
    const active = document.createElement('input');
    active.type = 'checkbox';
    active.name = 'active';
    active.checked = service.active;
    activeLabel.appendChild(active);
    head.append(title, activeLabel);

    const fields = createElement('div', 'service-editor-fields');
    const inputs = [
      ['name', 'Service name', service.name, 'wide', 'input'],
      ['description', 'Description', service.description, 'wide', 'textarea'],
      ['primary_price', 'Main price', service.primary_price, '', 'input'],
      ['secondary_price', 'Price detail', service.secondary_price, '', 'input'],
    ];
    inputs.forEach(([name, labelText, value, className, type]) => {
      const label = createElement('label', className, labelText);
      const input = document.createElement(type);
      input.name = name;
      input.value = value || '';
      label.appendChild(input);
      fields.appendChild(label);
    });
    card.append(head, fields);
    container.appendChild(card);
  });
}

async function saveServices() {
  const button = document.querySelector('#save-services');
  setLoading(button, true, 'Saving…');
  const changes = [...document.querySelectorAll('.service-editor')].map((card) => ({
    id: card.dataset.id,
    name: card.querySelector('[name="name"]').value.trim(),
    description: card.querySelector('[name="description"]').value.trim(),
    primary_price: card.querySelector('[name="primary_price"]').value.trim(),
    secondary_price: card.querySelector('[name="secondary_price"]').value.trim(),
    active: card.querySelector('[name="active"]').checked,
  }));

  try {
    const results = await Promise.all(changes.map(({ id, ...patch }) => state.client.from('services').update(patch).eq('id', id)));
    const failed = results.find((result) => result.error);
    if (failed) throw failed.error;
    await loadDashboardData();
    showAlert('Service details and prices saved.');
  } catch (error) {
    showAlert(error.message, true);
  } finally {
    setLoading(button, false);
  }
}

function renderEverything() {
  renderStats();
  renderReviews();
  renderBookings();
  renderServices();
}

function openView(view) {
  const titles = { overview: 'Overview', reviews: 'Reviews & ratings', bookings: 'Bookings & enquiries', services: 'Services & prices' };
  document.querySelectorAll('.nav-item').forEach((item) => item.classList.toggle('is-active', item.dataset.view === view));
  document.querySelectorAll('.dashboard-view').forEach((panel) => {
    const selected = panel.dataset.panel === view;
    panel.hidden = !selected;
    panel.classList.toggle('is-active', selected);
  });
  document.querySelector('#view-title').textContent = titles[view];
  document.querySelector('#sidebar').classList.remove('is-open');
  document.querySelector('#mobile-menu').setAttribute('aria-expanded', 'false');
}

function requestConfirmation(title, message, action) {
  document.querySelector('#confirm-title').textContent = title;
  document.querySelector('#confirm-message').textContent = message;
  pendingConfirmation = action;
  confirmDialog.hidden = false;
  document.querySelector('#confirm-action').focus();
}

function closeConfirmation() {
  confirmDialog.hidden = true;
  pendingConfirmation = null;
}

async function initialize() {
  if (!kcBackendConfigured) {
    setupNotice.hidden = false;
    loginForm.querySelectorAll('input, button').forEach((control) => { control.disabled = true; });
    return;
  }

  if (!window.supabase?.createClient) {
    setupNotice.hidden = false;
    setupNotice.querySelector('p').textContent = 'The secure dashboard library did not load. Check the connection and refresh.';
    return;
  }

  state.client = window.supabase.createClient(KC_SUPABASE_URL, KC_SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
  });
  const { data } = await state.client.auth.getSession();
  if (!data.session) return;

  state.user = data.session.user;
  try {
    await verifyOwner();
    showDashboard();
    await loadDashboardData();
  } catch (error) {
    loginMessage.textContent = error.message;
    showAuth();
  }
}

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!loginForm.checkValidity()) {
    loginForm.reportValidity();
    return;
  }
  const button = loginForm.querySelector('button[type="submit"]');
  const data = new FormData(loginForm);
  loginMessage.textContent = '';
  setLoading(button, true, 'Checking access…');
  try {
    const { data: authData, error } = await state.client.auth.signInWithPassword({
      email: data.get('email'),
      password: data.get('password'),
    });
    if (error) throw error;
    state.user = authData.user;
    await verifyOwner();
    showDashboard();
    await loadDashboardData();
  } catch (error) {
    loginMessage.textContent = error.message === 'Invalid login credentials'
      ? 'The email or password is incorrect.'
      : error.message;
  } finally {
    setLoading(button, false);
  }
});

document.querySelector('#sign-out').addEventListener('click', async () => {
  await state.client?.auth.signOut();
  state.user = null;
  showAuth();
  loginForm.reset();
});
document.querySelector('#refresh-dashboard').addEventListener('click', () => loadDashboardData(true).catch((error) => showAlert(error.message, true)));
document.querySelector('#save-services').addEventListener('click', saveServices);
document.querySelectorAll('.nav-item').forEach((item) => item.addEventListener('click', () => openView(item.dataset.view)));
document.querySelectorAll('[data-jump]').forEach((item) => item.addEventListener('click', () => openView(item.dataset.jump)));
document.querySelectorAll('[data-review-filter]').forEach((button) => button.addEventListener('click', () => {
  state.reviewFilter = button.dataset.reviewFilter;
  document.querySelectorAll('[data-review-filter]').forEach((item) => item.classList.toggle('is-active', item === button));
  renderReviews();
}));
document.querySelector('#booking-filter').addEventListener('change', (event) => {
  state.bookingFilter = event.target.value;
  renderBookings();
});
document.querySelector('#mobile-menu').addEventListener('click', (event) => {
  const open = event.currentTarget.getAttribute('aria-expanded') === 'true';
  event.currentTarget.setAttribute('aria-expanded', String(!open));
  document.querySelector('#sidebar').classList.toggle('is-open', !open);
});
document.querySelectorAll('[data-close-confirm]').forEach((button) => button.addEventListener('click', closeConfirmation));
document.querySelector('#confirm-action').addEventListener('click', async () => {
  const action = pendingConfirmation;
  closeConfirmation();
  await action?.();
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && !confirmDialog.hidden) closeConfirmation();
});

window.addEventListener('load', initialize, { once: true });
