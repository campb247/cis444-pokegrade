// snipe.js – searches eBay for PSA 9 cards

async function searchCards() {
  const cardName = document.getElementById('card-input').value.trim();
  if (!cardName) return alert('Please enter a card name.');

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Searching eBay for "' + cardName + '"...</p>';

  try {
    const res = await fetch(`/api/snipe?card=${encodeURIComponent(cardName)}`);
    const { data, message } = await res.json();

    if (!data.length) {
      resultsBox.innerHTML = `<p style="color:#888">${message}</p>`;
      return;
    }

    // TODO: Render actual eBay listings when API is implemented
    resultsBox.innerHTML = data.map(listing => `
      <div style="display:flex; gap:1rem; align-items:center; padding:1rem 0; border-bottom:1px solid #0f3460;">
        <div style="width:60px; height:80px; background:#0f3460; border-radius:4px; flex-shrink:0;"></div>
        <div style="flex:1;">
          <p style="font-weight:600;">${listing.title}</p>
          <p style="color:#888; font-size:0.9rem;">${listing.price}</p>
        </div>
        <a href="${listing.url}" target="_blank" class="btn btn-secondary" style="font-size:0.85rem; padding:0.5rem 1rem;">
          View on eBay
        </a>
      </div>
    `).join('');
  } catch (err) {
    resultsBox.innerHTML = '<p style="color:#e63946">Error contacting server. Is it running?</p>';
  }
}
