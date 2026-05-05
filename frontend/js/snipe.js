// snipe page logic
// fetches /api/snipe and renders listings into #results
// auto-loads on page open so user sees content immediately

// triggered by Search button or DOMContentLoaded
// empty input is allowed and returns full listing set
async function searchCards() {
  // read user query, trim whitespace
  const cardName = document.getElementById('card-input').value.trim();

  // loading state, distinguishes empty-query auto-load from explicit search
  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = cardName
    ? `<p style="color:#aaa">Searching eBay for "${cardName}"...</p>`
    : '<p style="color:#aaa">Loading recent PSA 9 listings...</p>';

  try {
    // backend filters by substring match against listing title
    const res = await fetch(`${window.API_BASE_URL}/api/snipe?card=${encodeURIComponent(cardName)}`);
    const { data, message } = await res.json();

    // empty result, show backend's friendly message verbatim
    if (!data || !data.length) {
      resultsBox.innerHTML = `<p style="color:#888">${message || 'No listings found.'}</p>`;
      return;
    }

    // count summary above listings
    const summary = `<p style="color:#888; margin-bottom:1rem;">${message}</p>`;

    // each listing row: image, title/meta/price, two action buttons
    // Analyze deep-links to regrade page with cert pre-filled
    // View on eBay opens external in new tab, rel=noopener for safety
    // onerror hides broken images instead of leaving alt-text box
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
    // network or json parse error, server likely not running
    resultsBox.innerHTML = '<p style="color:#e63946">Error contacting server. Is it running?</p>';
  }
}

// auto-load on page open so page is never blank
// passing function reference, fires once with empty query
document.addEventListener('DOMContentLoaded', searchCards);
