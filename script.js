COLOR = 'white';
IS_DRAWING = false;
N_AXES = 6;
LAST_X = null;
LAST_Y = null;


/**
 * Main draw function
 */
function draw() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    // Prepare canvas dpi
    const canvas = document.getElementById('canvas');
    const guideCanvas = document.getElementById('guideCanvas');
    const pointerCanvas = document.getElementById('pointerCanvas');
    prepareCanvas(canvas);
    prepareCanvas(guideCanvas);
    prepareCanvas(pointerCanvas);
    // Background
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, w, h);
    // Prepare foreground
    setCanvasColor(canvas, 'white');
    ctx.lineCap = 'round';
    // Prepare guides
    drawGuides();
    // Prepare pointer canvas
    const pointerCtx = pointerCanvas.getContext('2d');
    setCanvasColor(pointerCanvas, 'white');
    pointerCtx.lineCap = 'round';


}

function resize() {
    if (confirm('Page has been resized, resize and RESET image?')) {
        draw();
    }
}

/**
 * Rescale canvas to device DPI
 */
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
        const y2 = cy - Math.sin(angle) * r;
        points.push({ x, y: y2 });
    }
    return points;
}

/**
 * Draws a hexagon with all 6 symmetrical positions
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} px x coordinate of current point
 * @param {number} py y coordinate of current point
 * @param {number} lx x coordinate of the last point
 * @param {number} ly y coordinate of the last point
 * @param {number} cx x coordinate of the center
 * @param {number} cy y coordinate of the center
 */
function drawWithSymmetry(ctx, px, py, lx, ly, cx, cy) {
    // Fix bug with line crossing vertical at cx
    if ((px - cx >= 0) !== (lx - cx >= 0)) {
        if (px > lx) {
            lx = cx + (cx - lx);
        } else {
            px = cx + (cx - px);
        }
    }
    const positions1 = getRotatedPositions(lx, ly, cx, cy, N_AXES);
    const positions2 = getRotatedPositions(px, py, cx, cy, N_AXES);
    for (let i = 0; i < positions1.length; i++) {
        const { x, y } = positions1[i];
        let { x: x2, y: y2 } = positions2[i];
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();
    }
}

/**
 * Draws guide lines
 */
function drawGuides() {
    const canvas = document.getElementById('guideCanvas');
    const ctx = canvas.getContext('2d');
    const w = window.innerWidth;
    const h = window.innerHeight;
    const cx = w / 2;
    const cy = h / 2;
    const positions = getRotatedPositions(Math.max(w, h), cy, cx, cy, N_AXES);
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

/**
 * Sets fill and stroke style of canvas to color
 */
function setCanvasColor(canvas, color) {
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.strokeStyle = color;
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

/**
 * Show / hide guide lines
 */
function toggleGuides() {
    const canvas = document.getElementById('guideCanvas');
    canvas.style.display = canvas.style.display === 'none' ? 'block' : 'none';
}

/**
 * Axes input change
 */
function axesInputChange(e) {
    N_AXES = +e.target.value;
    drawGuides();
}

/**
 * Thickness input change
 */
function thicknessInputChange(e) {
    const thickness = +e.target.value;
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    ctx.lineWidth = thickness;
    const pointerCanvas = document.getElementById('pointerCanvas');
    const pointerCtx = pointerCanvas.getContext('2d');
    pointerCtx.lineWidth = thickness;
}

/**
 * Color input change
 */
function colorInputChange(e) {
    const color = e.target.value;
    const canvas = document.getElementById('canvas');
    setCanvasColor(canvas, color);
    const pointerCanvas = document.getElementById('pointerCanvas');
    setCanvasColor(pointerCanvas, color);
    const preview = document.getElementById('colorPreview');
    preview.style.backgroundColor = color;
}

/**
 * Mouse down
 */
function handleMouseDown(e) {
    IS_DRAWING = true;
    if (e.touches) {
        LAST_X = e.touches[0].clientX;
        LAST_Y = e.touches[0].clientY;
    } else {
        LAST_X = e.offsetX;
        LAST_Y = e.offsetY;
    }
    handleMouseMove(e);
}

/**
 * Mouse up
 */
function handleMouseUp(e) {
    IS_DRAWING = false;
    handleMouseMove(e);
}

/**
 * Mouse move
 */
function handleMouseMove(e) {
    let x, y;
    if (e.touches) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
    } else {
        x = e.offsetX;
        y = e.offsetY;
    }
    const w = window.innerWidth;
    const h = window.innerHeight;
    if (IS_DRAWING) {
        // Draw
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        drawWithSymmetry(ctx, x, y, LAST_X, LAST_Y, w / 2, h / 2);
        LAST_X = x;
        LAST_Y = y;
    }
    // Show pointer
    const pointerCanvas = document.getElementById('pointerCanvas');
    const pointerCtx = pointerCanvas.getContext('2d');
    pointerCtx.clearRect(0, 0, w, h);
    drawWithSymmetry(pointerCtx, x, y, x, y, w / 2, h / 2);
}
