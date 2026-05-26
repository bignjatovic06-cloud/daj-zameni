// static/core/js/data.jsx

async function apiListingDetail(id) {
  const res = await fetch(`/listings/${id}/`, {
    credentials: 'same-origin'
  });
  return res.json();
}
async function apiChatMessages(conversationId) {
  const res = await fetch(`/inbox/${conversationId}/`, {
    credentials: 'same-origin'
  });
  return res.json();
}
async function apiSendMessage(conversationId, body) {
  return apiFetch(`/inbox/${conversationId}/`, {
    method: 'POST',
    body: JSON.stringify({
      body
    })
  });
}