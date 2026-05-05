// regrade page logic
// two features share this file:
//   1. psa cert lookup, fetches /api/regrade/psa/:cert and renders card details
//   2. centering checker, canvas-based tool with 8 draggable guide lines
// also handles ?cert=X url param for handoff from snipe / homepage cards

// shared state for centering checker
// guides hold pixel positions of 8 lines (4 outer "end", 4 inner "start")
// dragTarget tracks which line is currently grabbed during pointer drag
// ready flag gates drawing and analysis until image loads
const centeringState = {
  image: null,
  imageWidth: 0,
  imageHeight: 0,
  guides: {
    leftEnd: 8,
    leftStart: 40,
    rightStart: 0,
    rightEnd: 0,
    topEnd: 8,
    topStart: 40,
    bottomStart: 0,
    bottomEnd: 0
  },
  dragTarget: null,
  ready: false
};

// dom refs cached on script load
// elements exist because regrade.html defines them before this script runs
const canvas = document.getElementById('centering-canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('image-input');
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvasPlaceholder = document.getElementById('canvas-placeholder');

// measurement panel output cells
// keys mirror the readout layout, ids defined in regrade.html
const outputEls = {
  leftLength: document.getElementById('left-length'),
  rightLength: document.getElementById('right-length'),
  topLength: document.getElementById('top-length'),
  bottomLength: document.getElementById('bottom-length'),
  leftPercent: document.getElementById('left-percent'),
  rightPercent: document.getElementById('right-percent'),
  topPercent: document.getElementById('top-percent'),
  bottomPercent: document.getElementById('bottom-percent'),
  horizontalSummary: document.getElementById('horizontal-summary'),
  verticalSummary: document.getElementById('vertical-summary')
};

// generic min/max bound, used to keep guide drags inside legal range
function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// 2-decimal percent string for measurement readouts
function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

// resets results panel to neutral placeholder
// called when user picks a new file via upload box
function clearResults() {
  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#888">Results will appear here after analysis.</p>';
}

// converts pointer event to canvas-space coordinates
// canvas is css-scaled, so multiply by ratio of internal:displayed size
function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

// resets guides to default positions based on image dimensions
// outer at 3% inset, inner at 8% inset
// works as starting point, user adjusts from here
function setDefaultGuides() {
  const outerInsetX = centeringState.imageWidth * 0.03;
  const innerInsetX = centeringState.imageWidth * 0.08;
  const outerInsetY = centeringState.imageHeight * 0.03;
  const innerInsetY = centeringState.imageHeight * 0.08;

  centeringState.guides.leftEnd = outerInsetX;
  centeringState.guides.leftStart = innerInsetX;
  centeringState.guides.rightStart = centeringState.imageWidth - innerInsetX;
  centeringState.guides.rightEnd = centeringState.imageWidth - outerInsetX;

  centeringState.guides.topEnd = outerInsetY;
  centeringState.guides.topStart = innerInsetY;
  centeringState.guides.bottomStart = centeringState.imageHeight - innerInsetY;
  centeringState.guides.bottomEnd = centeringState.imageHeight - outerInsetY;
}

// derives border widths and centering percentages from current guide positions
// border = distance between outer ("end") and inner ("start") line
// percent = each side's share of total horizontal or vertical border
// 50/50 is perfect centering, 55/45 is psa 10 threshold
function getMeasurements() {
  const g = centeringState.guides;
  const left = Math.max(0, g.leftStart - g.leftEnd);
  const right = Math.max(0, g.rightEnd - g.rightStart);
  const top = Math.max(0, g.topStart - g.topEnd);
  const bottom = Math.max(0, g.bottomEnd - g.bottomStart);

  const horizontalTotal = left + right;
  const verticalTotal = top + bottom;

  // ternary guards divide-by-zero when guides collapse onto same point
  return {
    left,
    right,
    top,
    bottom,
    leftPercent: horizontalTotal ? (left / horizontalTotal) * 100 : 0,
    rightPercent: horizontalTotal ? (right / horizontalTotal) * 100 : 0,
    topPercent: verticalTotal ? (top / verticalTotal) * 100 : 0,
    bottomPercent: verticalTotal ? (bottom / verticalTotal) * 100 : 0
  };
}


// per-axis centering grade based on percent gap
// gap <= 10 means split is between 55/45 and 50/50
// currently unused, kept in case ui wants per-axis verdict separately
function getCenteringGrade(pairA, pairB) {
  const pairGap = Math.abs(pairA - pairB);
  return pairGap <= 10 ? 'PSA 10 Likely' : 'PSA 9 or lower';
}

// overall verdict, requires BOTH axes to pass the 55/45 test
// shown by analyzeImage() in results panel
function getOverallCenteringGrade(m) {
  const horizontalGap = Math.abs(m.leftPercent - m.rightPercent);
  const verticalGap = Math.abs(m.topPercent - m.bottomPercent);
  return horizontalGap <= 10 && verticalGap <= 10
    ? 'PSA 10 Likely'
    : 'PSA 9 or lower';
}

// updates measurement panel from current guide positions
// called every drawCanvas, so panel stays in sync during drag
function updateMeasurements() {
  if (!centeringState.ready) return;

  const m = getMeasurements();

  outputEls.leftLength.textContent = `${m.left.toFixed(1)} px`;
  outputEls.rightLength.textContent = `${m.right.toFixed(1)} px`;
  outputEls.topLength.textContent = `${m.top.toFixed(1)} px`;
  outputEls.bottomLength.textContent = `${m.bottom.toFixed(1)} px`;

  outputEls.leftPercent.textContent = formatPercent(m.leftPercent);
  outputEls.rightPercent.textContent = formatPercent(m.rightPercent);
  outputEls.topPercent.textContent = formatPercent(m.topPercent);
  outputEls.bottomPercent.textContent = formatPercent(m.bottomPercent);

  outputEls.horizontalSummary.textContent = `${m.leftPercent.toFixed(2)} / ${m.rightPercent.toFixed(2)}`;
  outputEls.verticalSummary.textContent = `${m.topPercent.toFixed(2)} / ${m.bottomPercent.toFixed(2)}`;
}

// draws single guide line plus its labeled pill
// axis: 'vertical' or 'horizontal'
// pos: pixel coord along the perpendicular axis
// align: which side to nudge label toward, prevents overlap at edges
function drawGuideLine(axis, pos, label, color, align = 'center') {
  // line stroke
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.beginPath();

  if (axis === 'vertical') {
    ctx.moveTo(pos, 0);
    ctx.lineTo(pos, canvas.height);
  } else {
    ctx.moveTo(0, pos);
    ctx.lineTo(canvas.width, pos);
  }
  ctx.stroke();

  // label position math
  // vertical lines: label sits near top, optionally nudged left/right
  // horizontal lines: label sits in horizontal center, optionally nudged up/down
  const isVertical = axis === 'vertical';
  let boxX = isVertical ? pos : canvas.width / 2;
  let boxY = isVertical ? 26 : pos;

  if (isVertical && align === 'left') boxX += 28;
  if (isVertical && align === 'right') boxX -= 28;
  if (!isVertical && align === 'top') boxY += 22;
  if (!isVertical && align === 'bottom') boxY -= 22;

  // keep label inside canvas bounds
  boxX = clamp(boxX, 34, canvas.width - 34);
  boxY = clamp(boxY, 18, canvas.height - 18);

  // text style for label
  ctx.font = 'bold 12px Segoe UI';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  // pill background, sized to text width
  const paddingX = 10;
  const paddingY = 7;
  const textWidth = ctx.measureText(label).width;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 28;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(boxX - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight, 10);
  ctx.fill();

  // label text on top
  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, boxX, boxY + 0.5);
}

// draws yellow circle handle, visual hint for draggable inner lines
function drawHandle(x, y) {
  ctx.fillStyle = '#f4d03f';
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
}

// full canvas redraw, called after any guide change
// order matters: image -> bands -> rectangle -> guide lines -> handles
function drawCanvas() {
  if (!centeringState.ready || !centeringState.image) return;

  // wipe and re-render image base layer
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(centeringState.image, 0, 0, canvas.width, canvas.height);

  const g = centeringState.guides;

  // inner art rectangle, blue stroke around region inside all 4 inner guides
  ctx.strokeStyle = '#4cc9f0';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(g.leftStart, g.topStart, g.rightStart - g.leftStart, g.bottomStart - g.topStart);

  // measurement bands, red-tinted strips between outer and inner lines on each side
  // visualizes the border width being measured
  ctx.fillStyle = 'rgba(255, 77, 79, 0.10)';
  ctx.fillRect(g.leftEnd, 0, g.leftStart - g.leftEnd, canvas.height);
  ctx.fillRect(g.rightStart, 0, g.rightEnd - g.rightStart, canvas.height);
  ctx.fillRect(0, g.topEnd, canvas.width, g.topStart - g.topEnd);
  ctx.fillRect(0, g.bottomStart, canvas.width, g.bottomEnd - g.bottomStart);

  // 8 guide lines: blue for outer ("end"), red for inner ("start")
  const red = '#ff4d4f';
  const blue = '#3b82f6';

  drawGuideLine('vertical', g.leftEnd, 'L end', blue, 'left');
  drawGuideLine('vertical', g.leftStart, 'L start', red, 'left');
  drawGuideLine('vertical', g.rightStart, 'R start', red, 'right');
  drawGuideLine('vertical', g.rightEnd, 'R end', blue, 'right');

  drawGuideLine('horizontal', g.topEnd, 'T end', blue, 'top');
  drawGuideLine('horizontal', g.topStart, 'T start', red, 'top');
  drawGuideLine('horizontal', g.bottomStart, 'B start', red, 'bottom');
  drawGuideLine('horizontal', g.bottomEnd, 'B end', blue, 'bottom');

  // yellow handles on inner guides only, mid-axis
  // outer guides are still draggable but unmarked
  drawHandle(g.leftStart, canvas.height / 2);
  drawHandle(g.rightStart, canvas.height / 2);
  drawHandle(canvas.width / 2, g.topStart);
  drawHandle(canvas.width / 2, g.bottomStart);

  // refresh side panel readout
  updateMeasurements();
}

// shared image -> canvas adoption, used by both file upload and url load paths
// resizes canvas to image's natural size, computes default guides, redraws
function applyImageToCanvas(img) {
  centeringState.image = img;
  centeringState.imageWidth = img.width;
  centeringState.imageHeight = img.height;
  canvas.width = img.width;
  canvas.height = img.height;
  centeringState.ready = true;

  setDefaultGuides();
  // remove placeholder, show canvas
  canvasWrapper.classList.remove('empty');
  canvasPlaceholder.style.display = 'none';
  drawCanvas();
}

// loads image from file input via FileReader
// FileReader gives data url that bypasses CORS since same-origin
function loadImageForCentering(file) {
  const reader = new FileReader();
  reader.onload = event => {
    const img = new Image();
    img.onload = () => applyImageToCanvas(img);
    img.src = event.target.result;
  };
  reader.readAsDataURL(file);
}

// loads image from remote url (e.g. psa cdn or pokemontcg.io)
// canvas will be CORS-tainted but draws still work, no pixel reads needed
// onerror fallback prompts manual upload if remote load fails
function loadImageForCenteringFromUrl(url) {
  if (!url) return;
  const img = new Image();
  img.onload = () => applyImageToCanvas(img);
  img.onerror = () => {
    canvasPlaceholder.textContent = 'Could not load card image into the centering tool. Try uploading manually.';
  };
  img.src = url;
}

// returns nearest guide key within threshold pixels of point, or null
// used by both pointerdown (start drag) and pointermove (cursor styling)
function findGuideTarget(point) {
  const threshold = 14;
  const g = centeringState.guides;
  // distance is along perpendicular axis: vertical guides measured by x, horizontal by y
  const candidates = [
    { key: 'leftEnd', distance: Math.abs(point.x - g.leftEnd) },
    { key: 'leftStart', distance: Math.abs(point.x - g.leftStart) },
    { key: 'rightStart', distance: Math.abs(point.x - g.rightStart) },
    { key: 'rightEnd', distance: Math.abs(point.x - g.rightEnd) },
    { key: 'topEnd', distance: Math.abs(point.y - g.topEnd) },
    { key: 'topStart', distance: Math.abs(point.y - g.topStart) },
    { key: 'bottomStart', distance: Math.abs(point.y - g.bottomStart) },
    { key: 'bottomEnd', distance: Math.abs(point.y - g.bottomEnd) }
  ].filter(item => item.distance <= threshold);

  if (!candidates.length) return null;
  // closest wins when multiple lines overlap (e.g. near corner)
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0].key;
}

// pointer/touch down: start drag if click landed near a guide
function handlePointerDown(event) {
  if (!centeringState.ready) return;
  const point = getCanvasPoint(event);
  centeringState.dragTarget = findGuideTarget(point);
}

// pointer/touch move: update cursor for hover, update guide position if dragging
function handlePointerMove(event) {
  if (!centeringState.ready) return;

  const point = getCanvasPoint(event);
  // hover styling: col-resize for vertical lines, row-resize for horizontal
  const hoverTarget = findGuideTarget(point);
  canvas.style.cursor = hoverTarget
    ? (hoverTarget.includes('left') || hoverTarget.includes('right') ? 'col-resize' : 'row-resize')
    : 'default';

  if (!centeringState.dragTarget) return;

  // clamp guide to legal range, prevents overlap with neighbor lines
  // minGap keeps lines visually distinct and measurements positive
  const g = centeringState.guides;
  const minGap = 10;

  switch (centeringState.dragTarget) {
    case 'leftEnd':
      g.leftEnd = clamp(point.x, 0, g.leftStart - minGap);
      break;
    case 'leftStart':
      g.leftStart = clamp(point.x, g.leftEnd + minGap, g.rightStart - minGap);
      break;
    case 'rightStart':
      g.rightStart = clamp(point.x, g.leftStart + minGap, g.rightEnd - minGap);
      break;
    case 'rightEnd':
      g.rightEnd = clamp(point.x, g.rightStart + minGap, centeringState.imageWidth);
      break;
    case 'topEnd':
      g.topEnd = clamp(point.y, 0, g.topStart - minGap);
      break;
    case 'topStart':
      g.topStart = clamp(point.y, g.topEnd + minGap, g.bottomStart - minGap);
      break;
    case 'bottomStart':
      g.bottomStart = clamp(point.y, g.topStart + minGap, g.bottomEnd - minGap);
      break;
    case 'bottomEnd':
      g.bottomEnd = clamp(point.y, g.bottomStart + minGap, centeringState.imageHeight);
      break;
  }

  drawCanvas();
}

// pointer/touch up: clear drag target so subsequent moves don't drag
function handlePointerUp() {
  centeringState.dragTarget = null;
}

// file picker change handler, resets results and loads new image
fileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (file) {
    clearResults();
    loadImageForCentering(file);
  }
});

// pointer wiring for mouse, listens on canvas for down/move and window for up
// window-level up catches release outside canvas, prevents stuck drags
canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('mouseleave', () => {
  if (!centeringState.dragTarget) canvas.style.cursor = 'default';
});

// touch wiring mirrors mouse, normalizes touch[0] into pointer-shaped event
// preventDefault stops page scroll while dragging on mobile
canvas.addEventListener('touchstart', event => {
  event.preventDefault();
  handlePointerDown(event.touches[0]);
}, { passive: false });

canvas.addEventListener('touchmove', event => {
  event.preventDefault();
  handlePointerMove(event.touches[0]);
}, { passive: false });

window.addEventListener('touchend', handlePointerUp);

// reset button handler, restores default guide positions
function resetGuides() {
  if (!centeringState.ready) return;
  setDefaultGuides();
  drawCanvas();
}

// fetches card by psa cert and renders details into #results
// also auto-loads card image into centering canvas as bonus
async function lookupByCert() {
  // empty input bails with alert, also catches whitespace-only
  const certNumber = document.getElementById('cert-input').value.trim();
  if (!certNumber) return alert('Please enter a PSA certification number.');

  // optimistic loading state in results panel
  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Looking up cert #' + certNumber + '...</p>';

  try {
    const res = await fetch(`/api/regrade/psa/${certNumber}`);
    const payload = await res.json();

    // backend signals failure via either http status or success=false
    if (!res.ok || !payload.success) {
      resultsBox.innerHTML = `<p style="color:#e63946">${payload.error || 'Lookup failed'}</p>`;
      return;
    }

    // accept either camelCase (psa source) or snake_case (db source)
    // db cache returns raw column names, psa pipeline normalizes to camelCase
    const d = payload.data;
    const name = d.cardName || d.card_name || 'Unknown Card';
    const set = d.setName || d.card_set || '-';
    const cardNum = d.cardNumber || d.card_number || '-';
    const grade = d.currentGrade || d.current_grade || '-';
    const imageUrl = d.imageUrl || d.image_url || null;

    // image block falls back to "no image" message if cert has no scan
    const imageBlock = imageUrl
      ? `<img src="${imageUrl}" alt="PSA cert ${certNumber}" style="max-width:240px; border-radius:8px; margin-bottom:1rem; display:block;" />`
      : `<p style="color:#666; font-size:0.85rem; margin-bottom:1rem;">No image available for this cert.</p>`;

    // render details into results panel
    resultsBox.innerHTML = `
      <p style="color:#f4d03f; margin-bottom:1rem">Cert #${certNumber}</p>
      ${imageBlock}
      <p class="grade-row"><span class="grade-label">Card</span><span class="grade-value">${name}</span></p>
      <p class="grade-row"><span class="grade-label">Set</span><span class="grade-value">${set}</span></p>
      <p class="grade-row"><span class="grade-label">Card Number</span><span class="grade-value">${cardNum}</span></p>
      <p class="grade-row"><span class="grade-label">Current Grade</span><span class="grade-value">${grade}</span></p>
      <p style="color:#666; margin-top:1rem; font-size:0.85rem">Source: ${payload.source}. Card image loaded into the centering checker above.</p>
    `;

    // pipe image into centering canvas for one-shot regrade flow
    loadImageForCenteringFromUrl(imageUrl);
  } catch (err) {
    // network or json parse error, server likely down
    resultsBox.innerHTML = '<p style="color:#e63946">Error contacting server. Is it running?</p>';
  }
}

// renders centering verdict into results panel
// works for either upload or psa-lookup image, gated on centeringState.ready
async function analyzeImage() {
  // canvas not ready: try fallback to file picker, else prompt user
  if (!centeringState.ready) {
    if (fileInput.files.length) {
      loadImageForCentering(fileInput.files[0]);
    } else {
      return alert('Look up a PSA cert or upload an image first.');
    }
  }

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Preparing centering analysis...</p>';

  // small delay so loading state is visible, also lets canvas finish redraw
  setTimeout(() => {
    const m = getMeasurements();
    const overallGrade = getOverallCenteringGrade(m);

    resultsBox.innerHTML = `
      <p class="grade-row"><span class="grade-label">Overall Centering Call</span><span class="grade-value">${overallGrade}</span></p>
      <p class="grade-row"><span class="grade-label">Left / Right Centering</span><span class="grade-value">${m.leftPercent.toFixed(2)}% / ${m.rightPercent.toFixed(2)}%</span></p>
      <p class="grade-row"><span class="grade-label">Top / Bottom Centering</span><span class="grade-value">${m.topPercent.toFixed(2)}% / ${m.bottomPercent.toFixed(2)}%</span></p>
      <p class="grade-row"><span class="grade-label">Left Border Width</span><span class="grade-value">${m.left.toFixed(1)} px</span></p>
      <p class="grade-row"><span class="grade-label">Right Border Width</span><span class="grade-value">${m.right.toFixed(1)} px</span></p>
      <p class="grade-row"><span class="grade-label">Top Border Width</span><span class="grade-value">${m.top.toFixed(1)} px</span></p>
      <p class="grade-row"><span class="grade-label">Bottom Border Width</span><span class="grade-value">${m.bottom.toFixed(1)} px</span></p>
      <p style="color:#888; margin-top:1rem; font-size:0.9rem">PSA 10 Likely is shown when left/right and top/bottom are each within a 55/45 split or closer to 50/50. Otherwise it shows PSA 9 or lower.</p>
    `;
  }, 250);
}

// page load handler for ?cert=X deep link
// supports handoff from snipe page Analyze button and homepage card clicks
// pre-fills input, runs lookup, scrolls result into view for seamless demo flow
document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const cert = params.get('cert');
  if (!cert) return;

  document.getElementById('cert-input').value = cert;
  await lookupByCert();
  // smooth scroll, results panel sits below centering tool
  document.getElementById('results').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
