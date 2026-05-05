//regrade – handles PSA cert lookup and image analysis + manual centering checker

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

const canvas = document.getElementById('centering-canvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('image-input');
const canvasWrapper = document.getElementById('canvas-wrapper');
const canvasPlaceholder = document.getElementById('canvas-placeholder');

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

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function formatPercent(value) {
  return `${value.toFixed(2)}%`;
}

function clearResults() {
  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#888">Results will appear here after analysis.</p>';
}

function getCanvasPoint(event) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

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

function getMeasurements() {
  const g = centeringState.guides;
  const left = Math.max(0, g.leftStart - g.leftEnd);
  const right = Math.max(0, g.rightEnd - g.rightStart);
  const top = Math.max(0, g.topStart - g.topEnd);
  const bottom = Math.max(0, g.bottomEnd - g.bottomStart);

  const horizontalTotal = left + right;
  const verticalTotal = top + bottom;

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


function getCenteringGrade(pairA, pairB) {
  const pairGap = Math.abs(pairA - pairB);
  return pairGap <= 10 ? 'PSA 10 Likely' : 'PSA 9 or lower';
}

function getOverallCenteringGrade(m) {
  const horizontalGap = Math.abs(m.leftPercent - m.rightPercent);
  const verticalGap = Math.abs(m.topPercent - m.bottomPercent);
  return horizontalGap <= 10 && verticalGap <= 10
    ? 'PSA 10 Likely'
    : 'PSA 9 or lower';
}

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

function drawGuideLine(axis, pos, label, color, align = 'center') {
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

  const isVertical = axis === 'vertical';
  let boxX = isVertical ? pos : canvas.width / 2;
  let boxY = isVertical ? 26 : pos;

  if (isVertical && align === 'left') boxX += 28;
  if (isVertical && align === 'right') boxX -= 28;
  if (!isVertical && align === 'top') boxY += 22;
  if (!isVertical && align === 'bottom') boxY -= 22;

  boxX = clamp(boxX, 34, canvas.width - 34);
  boxY = clamp(boxY, 18, canvas.height - 18);

  ctx.font = 'bold 12px Segoe UI';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const paddingX = 10;
  const paddingY = 7;
  const textWidth = ctx.measureText(label).width;
  const boxWidth = textWidth + paddingX * 2;
  const boxHeight = 28;

  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(boxX - boxWidth / 2, boxY - boxHeight / 2, boxWidth, boxHeight, 10);
  ctx.fill();

  ctx.fillStyle = '#ffffff';
  ctx.fillText(label, boxX, boxY + 0.5);
}

function drawHandle(x, y) {
  ctx.fillStyle = '#f4d03f';
  ctx.beginPath();
  ctx.arc(x, y, 7, 0, Math.PI * 2);
  ctx.fill();
}

function drawCanvas() {
  if (!centeringState.ready || !centeringState.image) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(centeringState.image, 0, 0, canvas.width, canvas.height);

  const g = centeringState.guides;

  //inner art rectangle
  ctx.strokeStyle = '#4cc9f0';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(g.leftStart, g.topStart, g.rightStart - g.leftStart, g.bottomStart - g.topStart);

  //measurement bands
  ctx.fillStyle = 'rgba(255, 77, 79, 0.10)';
  ctx.fillRect(g.leftEnd, 0, g.leftStart - g.leftEnd, canvas.height);
  ctx.fillRect(g.rightStart, 0, g.rightEnd - g.rightStart, canvas.height);
  ctx.fillRect(0, g.topEnd, canvas.width, g.topStart - g.topEnd);
  ctx.fillRect(0, g.bottomStart, canvas.width, g.bottomEnd - g.bottomStart);

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

  drawHandle(g.leftStart, canvas.height / 2);
  drawHandle(g.rightStart, canvas.height / 2);
  drawHandle(canvas.width / 2, g.topStart);
  drawHandle(canvas.width / 2, g.bottomStart);

  updateMeasurements();
}

function loadImageForCentering(file) {
  const reader = new FileReader();

  reader.onload = event => {
    const img = new Image();
    img.onload = () => {
      centeringState.image = img;
      centeringState.imageWidth = img.width;
      centeringState.imageHeight = img.height;
      canvas.width = img.width;
      canvas.height = img.height;
      centeringState.ready = true;

      setDefaultGuides();
      canvasWrapper.classList.remove('empty');
      canvasPlaceholder.style.display = 'none';
      drawCanvas();
    };
    img.src = event.target.result;
  };

  reader.readAsDataURL(file);
}

function findGuideTarget(point) {
  const threshold = 14;
  const g = centeringState.guides;
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
  candidates.sort((a, b) => a.distance - b.distance);
  return candidates[0].key;
}

function handlePointerDown(event) {
  if (!centeringState.ready) return;
  const point = getCanvasPoint(event);
  centeringState.dragTarget = findGuideTarget(point);
}

function handlePointerMove(event) {
  if (!centeringState.ready) return;

  const point = getCanvasPoint(event);
  const hoverTarget = findGuideTarget(point);
  canvas.style.cursor = hoverTarget
    ? (hoverTarget.includes('left') || hoverTarget.includes('right') ? 'col-resize' : 'row-resize')
    : 'default';

  if (!centeringState.dragTarget) return;

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

function handlePointerUp() {
  centeringState.dragTarget = null;
}

fileInput.addEventListener('change', event => {
  const file = event.target.files[0];
  if (file) {
    clearResults();
    loadImageForCentering(file);
  }
});

canvas.addEventListener('mousedown', handlePointerDown);
canvas.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);
canvas.addEventListener('mouseleave', () => {
  if (!centeringState.dragTarget) canvas.style.cursor = 'default';
});

canvas.addEventListener('touchstart', event => {
  event.preventDefault();
  handlePointerDown(event.touches[0]);
}, { passive: false });

canvas.addEventListener('touchmove', event => {
  event.preventDefault();
  handlePointerMove(event.touches[0]);
}, { passive: false });

window.addEventListener('touchend', handlePointerUp);

function resetGuides() {
  if (!centeringState.ready) return;
  setDefaultGuides();
  drawCanvas();
}

async function lookupByCert() {
  const certNumber = document.getElementById('cert-input').value.trim();
  if (!certNumber) return alert('Please enter a PSA certification number.');

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Looking up cert #' + certNumber + '...</p>';

  try {
    const res = await fetch(`/api/regrade/psa/${certNumber}`);
    const payload = await res.json();

    if (!res.ok || !payload.success) {
      resultsBox.innerHTML = `<p style="color:#e63946">${payload.error || 'Lookup failed'}</p>`;
      return;
    }

    const d = payload.data;
    const name = d.cardName || d.card_name || 'Unknown Card';
    const set = d.setName || d.card_set || '—';
    const cardNum = d.cardNumber || d.card_number || '—';
    const grade = d.currentGrade || d.current_grade || '—';
    const imageUrl = d.imageUrl || d.image_url || null;

    const imageBlock = imageUrl
      ? `<img src="${imageUrl}" alt="PSA cert ${certNumber}" style="max-width:240px; border-radius:8px; margin-bottom:1rem; display:block;" />`
      : `<p style="color:#666; font-size:0.85rem; margin-bottom:1rem;">No image available for this cert.</p>`;

    resultsBox.innerHTML = `
      <p style="color:#f4d03f; margin-bottom:1rem">Cert #${certNumber}</p>
      ${imageBlock}
      <p class="grade-row"><span class="grade-label">Card</span><span class="grade-value">${name}</span></p>
      <p class="grade-row"><span class="grade-label">Set</span><span class="grade-value">${set}</span></p>
      <p class="grade-row"><span class="grade-label">Card Number</span><span class="grade-value">${cardNum}</span></p>
      <p class="grade-row"><span class="grade-label">Current Grade</span><span class="grade-value">${grade}</span></p>
      <p style="color:#666; margin-top:1rem; font-size:0.85rem">Source: ${payload.source}</p>
    `;
  } catch (err) {
    resultsBox.innerHTML = '<p style="color:#e63946">Error contacting server. Is it running?</p>';
  }
}

async function analyzeImage() {
  if (!fileInput.files.length) return alert('Please select an image file.');

  if (!centeringState.ready) {
    loadImageForCentering(fileInput.files[0]);
  }

  const resultsBox = document.getElementById('results');
  resultsBox.innerHTML = '<p style="color:#aaa">Preparing centering analysis...</p>';

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
