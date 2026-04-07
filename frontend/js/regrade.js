// regrade.js – handles PSA cert lookup and image analysis

async function lookupByCert() {
  const certNumber = document.getElementById('cert-input').value.trim();
  if (!certNumber) return alert('Please enter a PSA certification number.');

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Looking up cert #' + certNumber + '...</p>';

  try {
    const res = await fetch(`/api/regrade/psa/${certNumber}`);
    const { data, message } = await res.json();

    // TODO: Display actual card image and grade breakdown when API is implemented
    resultsBox.innerHTML = `
      <p style="color:#f4d03f; margin-bottom:1rem">Cert #${certNumber}</p>
      <p style="color:#888">${message}</p>
    `;
  } catch (err) {
    resultsBox.innerHTML = '<p style="color:#e63946">Error contacting server. Is it running?</p>';
  }
}

async function analyzeImage() {
  const fileInput = document.getElementById('image-input');
  if (!fileInput.files.length) return alert('Please select an image file.');

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Analyzing image...</p>';

  // TODO: Send image to /api/regrade and display breakdown
  // Placeholder UI for Scrum 1
  setTimeout(() => {
    resultsBox.innerHTML = `
      <p class="grade-row"><span class="grade-label">Estimated Grade</span><span class="grade-value">— (coming soon)</span></p>
      <p class="grade-row"><span class="grade-label">Centering</span><span class="grade-value">—</span></p>
      <p class="grade-row"><span class="grade-label">Corners</span><span class="grade-value">—</span></p>
      <p class="grade-row"><span class="grade-label">Edges</span><span class="grade-value">—</span></p>
      <p class="grade-row"><span class="grade-label">Surface</span><span class="grade-value">—</span></p>
      <p style="color:#888; margin-top:1rem; font-size:0.9rem">Image analysis is under development.</p>
    `;
  }, 800);
}
