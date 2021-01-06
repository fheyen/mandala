COLOR = 'white';
IS_DRAWING = false;
N_AXES = 6;

/**
 * Main draw function
 */
function draw() {
    const canvas = document.getElementById('canvas');
    const canvas2 = document.getElementById('guideCanvas');
    prepareCanvas(canvas);
    prepareCanvas(canvas2);
    // Background
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = 'white';
    drawGuides();
}

function resize() {
    if (confirm('Page has been resized, resize and RESET image?')) {
        draw();
    }
}

function prepareCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    // Get and set sizes
    canvas.style.width = '100%';
    canvas.style.height = `${window.innerHeight}px`;
    // Rescale canvas
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);
}

function hideInfo() {
    const info = document.getElementById('info');
    info.remove();
}



/**
 * For a point px, py at angle 0, returns all other points at rotated positions.
 *
 *                                (px, py)
 *                                   |
 *    (cx, xy) -----------------------
 *
 * @param {*} px
 * @param {*} py
 * @param {*} cx
 * @param {*} cy
 * @param {*} radius
 */
function getRotatedPositions(px, py, cx, cy, nAxes) {
    const points = [];
    // Start angle between hypotenuse and horizontal
    let startAngle = 0;
    if (py !== cy) {
        const dx = px - cx;
        const dy = py - cy;
        startAngle = Math.atan(dy / dx);
    }
    // Radius
    const r = Math.hypot((px - cx), (py - cy));
    // Get positions
    const baseAngle = 360 / nAxes;
    for (let i = 0; i < nAxes; i++) {
        const angle = (baseAngle * i) / 180 * Math.PI + startAngle;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        points.push({ x, y });
        // Mirror if startangle !== 0
        if (startAngle !== 0) {
            const y2 = cy - Math.sin(angle) * r;
            points.push({ x, y: y2 });
        }
    }
    return points;
}

/**
 * Draws a hexagon with all 6 symmetrical positions
 */
function drawWithSymmetry(ctx, px, py, cx, cy) {
    const positions = getRotatedPositions(px, py, cx, cy, N_AXES);
    for (let { x, y } of positions) {
        ctx.fillRect(x, y, 1.5, 1.5);
    }
}

function drawGuides() {
    const canvas = document.getElementById('guideCanvas');
    const ctx = canvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const positions = getRotatedPositions(Math.min(w, h), cy, cx, cy, N_AXES);
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;
    for (let { x, y } of positions) {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
    }
}

function reset() {
    if (confirm('Are you sure?')) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const w = window.innerWidth;
        const h = window.innerHeight;
        ctx.save();
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, w, h);
        ctx.restore();
    }
}

function toggleGuides() {
    const canvas = document.getElementById('guideCanvas');
    canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
}

function axesInputChange(e) {
    N_AXES = +e.target.value;
    drawGuides();
}

function colorInputChange(e) {
    const color = e.target.value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    const preview = document.getElementById('colorPreview');
    preview.style.backgroundColor = color;
}


function handleMouseDown(e) {
    IS_DRAWING = true;
    handleMouseMove(e);
}

function handleMouseUp(e) {
    IS_DRAWING = false;
}

function handleMouseMove(e) {
    if (IS_DRAWING) {
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        const w = window.innerWidth;
        const h = window.innerHeight;
        drawWithSymmetry(ctx, e.offsetX, e.offsetY, w / 2, h / 2);
    }
}
