// snipe.js: searches eBay for PSA 9 cards

async function searchCards() {
  const cardName = document.getElementById('card-input').value.trim();

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = cardName
    ? `<p style="color:#aaa">Searching eBay for "${cardName}"...</p>`
    : '<p style="color:#aaa">Loading recent PSA 9 listings...</p>';

  try {
    const res = await fetch(`/api/snipe?card=${encodeURIComponent(cardName)}`);
    const { data, message } = await res.json();

    if (!data || !data.length) {
      resultsBox.innerHTML = `<p style="color:#888">${message || 'No listings found.'}</p>`;
      return;
    }

    const summary = `<p style="color:#888; margin-bottom:1rem;">${message}</p>`;

    const listingsHtml = data.map(listing => `
      <div class="listing-row">
        <img class="listing-image" src="${listing.imageUrl}" alt="${listing.title}" onerror="this.style.visibility='hidden'"/>
        <div class="listing-body">
          <p class="listing-title">${listing.title}</p>
          <p class="listing-meta">Seller: ${listing.seller} · Listed ${listing.listedDate}</p>
          <p class="listing-price">${listing.price}</p>
        </div>
        <div class="listing-actions">
          <a href="regrade.html?cert=${encodeURIComponent(listing.certNumber)}" class="btn btn-primary listing-btn">Analyze</a>
          <a href="${listing.url}" target="_blank" rel="noopener" class="btn btn-secondary listing-btn">View on eBay</a>
        </div>
      </div>
    `).join('');

    resultsBox.innerHTML = summary + listingsHtml;
  } catch (err) {
    resultsBox.innerHTML = '<p style="color:#e63946">Error contacting server. Is it running?</p>';
  }
}

// Auto-load all listings on page open so the page isn't blank.
document.addEventListener('DOMContentLoaded', searchCards);
