// static/core/js/api.js

function getCookie(name) {
  const v = document.cookie.match('(^|;)\\s*' + name + '\\s*=\\s*([^;]+)');
  return v ? v.pop() : '';
}

async function apiFetch(path, options = {}) {
  const res = await fetch('' + path, {
    headers: {
      'Content-Type': 'application/json',
      'X-CSRFToken': getCookie('csrftoken'),
      ...options.headers,
    },
    credentials: 'include',
    ...options,
  });
  if (res.status === 429) {
    return { ok: false, status: 429, error: 'Previše pokušaja. Sačekaj nekoliko minuta pa pokušaj ponovo.' };
  }
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, ...data };
}

async function apiAuthStatus() {
  return apiFetch('/auth/status/');
}

async function apiLogin(username, password) {
  return apiFetch('/auth/login/', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

async function apiRegister(username, email, password) {
  return apiFetch('/auth/register/', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

async function apiLogout() {
  return apiFetch('/auth/logout/', { method: 'POST' });
}

async function apiListings(params = {}) {
  const qs = new URLSearchParams(params).toString();
  return apiFetch('/listings/' + (qs ? '?' + qs : ''));
}

async function apiCreateListing(data) {
  return apiFetch('/listings/create/', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

async function apiUpdateListing(id, data) {
  return apiFetch('/listings/' + id + '/update/', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

async function apiDeleteListing(id) {
  return apiFetch('/listings/' + id + '/delete/', {
    method: 'DELETE',
  });
}

async function apiUploadImages(listingId, files) {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  const res = await fetch('/listings/' + listingId + '/images/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
    credentials: 'include',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, ...data };
}

async function apiListingDetail(id) {
  return apiFetch('/listings/' + id + '/');
}

async function apiCategories() {
  return apiFetch('/categories/');
}

async function apiInbox() {
  return apiFetch('/inbox/');
}

async function apiChatMessages(conversationId) {
  return apiFetch('/inbox/' + conversationId + '/');
}

async function apiSendMessage(conversationId, body) {
  return apiFetch('/inbox/' + conversationId + '/', {
    method: 'POST',
    body: JSON.stringify({ body }),
  });
}

async function apiNotifications() {
  return apiFetch('/notifications/');
}

async function apiMarkNotificationsRead() {
  return apiFetch('/notifications/read/', { method: 'POST' });
}

async function apiToggleWishlist(listingId) {
  return apiFetch('/listings/' + listingId + '/wishlist/', { method: 'POST' });
}

async function apiWishlist() {
  return apiFetch('/listings/wishlist/');
}

async function apiWishlistIds() {
  return apiFetch('/listings/wishlist/ids/');
}

async function apiCreateOffer(listingId, offeredListingId, message, cashOffer) {
  return apiFetch('/listings/' + listingId + '/offer/', {
    method: 'POST',
    body: JSON.stringify({ offered_listing_id: offeredListingId, message, cash_offer: cashOffer || null }),
  });
}

async function apiReportListing(listingId, reason, details) {
  return apiFetch('/listings/' + listingId + '/report/', {
    method: 'POST',
    body: JSON.stringify({ reason, details }),
  });
}

async function apiStartThread(listingId) {
  return apiFetch('/listings/' + listingId + '/thread/', { method: 'POST' });
}

async function apiMyListings(includeExpired = false) {
  return apiFetch('/listings/mine/' + (includeExpired ? '?include_expired=1' : ''));
}

async function apiRenewListing(id) {
  return apiFetch('/listings/' + id + '/renew/', { method: 'POST' });
}

async function apiRespondToOffer(offerId, action) {
  return apiFetch('/offers/' + offerId + '/respond/', {
    method: 'POST',
    body: JSON.stringify({ action }),
  });
}

async function apiMyOffers() {
  return apiFetch('/offers/mine/');
}

async function apiCompleteOffer(offerId) {
  return apiFetch('/offers/' + offerId + '/complete/', { method: 'POST' });
}

async function apiReviewOffer(offerId, rating, comment) {
  return apiFetch('/offers/' + offerId + '/review/', {
    method: 'POST',
    body: JSON.stringify({ rating, comment }),
  });
}

async function apiMyReviews() {
  return apiFetch('/profile/reviews/');
}

async function apiUserProfile(username) {
  return apiFetch('/profile/' + username + '/');
}

async function apiSavePhone(phone) {
  return apiFetch('/profile/', {
    method: 'PUT',
    body: JSON.stringify({ phone }),
  });
}

async function apiUpdateProfile(data) {
  return apiFetch('/profile/', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

async function apiChangePassword(oldPassword, newPassword) {
  return apiFetch('/auth/password/', {
    method: 'POST',
    body: JSON.stringify({ old_password: oldPassword, new_password: newPassword }),
  });
}

async function apiUploadAvatar(file) {
  const formData = new FormData();
  formData.append('avatar', file);
  const res = await fetch('/profile/avatar/', {
    method: 'POST',
    headers: { 'X-CSRFToken': getCookie('csrftoken') },
    credentials: 'include',
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, ...data };
}
async function apiResendVerification() {
  return apiFetch('/auth/resend-verification/', { method: 'POST' });
}

async function apiDeleteMessage(conversationId, messageId) {
  return apiFetch('/inbox/' + conversationId + '/messages/' + messageId + '/delete/', { method: 'DELETE' });
}

async function apiDeleteConversation(conversationId) {
  return apiFetch('/inbox/' + conversationId + '/delete/', { method: 'DELETE' });
}

async function apiReserveListing(id) {
  return apiFetch('/listings/' + id + '/reserve/', { method: 'POST' });
}

async function apiPushSubscribe(subscriptionJson) {
  return apiFetch('/push/subscribe/', {
    method: 'POST',
    body: JSON.stringify(subscriptionJson),
  });
}

async function apiPushUnsubscribe(endpoint) {
  return apiFetch('/push/unsubscribe/', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
}
