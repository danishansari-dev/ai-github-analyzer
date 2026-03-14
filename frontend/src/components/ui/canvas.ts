// Canvas-based trailing lines effect adapted for React app

// @ts-ignore
function n(this: any, e?: any) {
  // @ts-ignore
  this.init(e || {});
}

n.prototype = {
  // @ts-ignore
  init: function (this: any, e: any) {
    // @ts-ignore
    this.phase = e.phase || 0;
    // @ts-ignore
    this.offset = e.offset || 0;
    // @ts-ignore
    this.frequency = e.frequency || 0.001;
    // @ts-ignore
    this.amplitude = e.amplitude || 1;
  },
  // @ts-ignore
  update: function (this: any) {
    this.phase += this.frequency;
    const val = this.offset + Math.sin(this.phase) * this.amplitude;
    // @ts-ignore
    _hueValue = val;
    return val;
  },
  // @ts-ignore
  value: function () {
    // @ts-ignore
    return _hueValue;
  },
};

// @ts-ignore
function Line(this: any, e?: any) {
  // @ts-ignore
  this.init(e || {});
}

Line.prototype = {
  // @ts-ignore
  init: function (this: any, e: any) {
    // @ts-ignore
    this.spring = e.spring + 0.1 * Math.random() - 0.05;
    // @ts-ignore
    this.friction = E.friction + 0.01 * Math.random() - 0.005;
    // @ts-ignore
    this.nodes = [];
    // @ts-ignore
    for (let t, n = 0; n < E.size; n++) {
      // @ts-ignore
      t = new Node();
      // @ts-ignore
      t.x = pos.x;
      // @ts-ignore
      t.y = pos.y;
      // @ts-ignore
      this.nodes.push(t);
    }
  },
  // @ts-ignore
  update: function (this: any) {
    // @ts-ignore
    let e = this.spring;
    // @ts-ignore
    let t = this.nodes[0];
    // @ts-ignore
    t.vx += (pos.x - t.x) * e;
    // @ts-ignore
    t.vy += (pos.y - t.y) * e;
    // @ts-ignore
    for (let n, i = 0, a = this.nodes.length; i < a; i++) {
      // @ts-ignore
      t = this.nodes[i];
      if (i > 0) {
        // @ts-ignore
        n = this.nodes[i - 1];
        // @ts-ignore
        t.vx += (n.x - t.x) * e;
        // @ts-ignore
        t.vy += (n.y - t.y) * e;
        // @ts-ignore
        t.vx += n.vx * E.dampening;
        // @ts-ignore
        t.vy += n.vy * E.dampening;
      }
      // @ts-ignore
      t.vx *= this.friction;
      // @ts-ignore
      t.vy *= this.friction;
      // @ts-ignore
      t.x += t.vx;
      // @ts-ignore
      t.y += t.vy;
      e *= E.tension;
    }
  },
  // @ts-ignore
  draw: function (this: any) {
    // @ts-ignore
    let e, t;
    // @ts-ignore
    let n = this.nodes[0].x;
    // @ts-ignore
    let i = this.nodes[0].y;
    // @ts-ignore
    ctx.beginPath();
    // @ts-ignore
    ctx.moveTo(n, i);
    // @ts-ignore
    for (let a = 1, o = this.nodes.length - 2; a < o; a++) {
      // @ts-ignore
      e = this.nodes[a];
      // @ts-ignore
      t = this.nodes[a + 1];
      n = 0.5 * (e.x + t.x);
      i = 0.5 * (e.y + t.y);
      // @ts-ignore
      ctx.quadraticCurveTo(e.x, e.y, n, i);
    }
    // @ts-ignore
    e = this.nodes[this.nodes.length - 2];
    // @ts-ignore
    t = this.nodes[this.nodes.length - 1];
    // @ts-ignore
    ctx.quadraticCurveTo(e.x, e.y, t.x, t.y);
    // @ts-ignore
    ctx.stroke();
    // @ts-ignore
    ctx.closePath();
  },
};

// @ts-ignore
function onMousemove(e: any) {
  function o() {
    // @ts-ignore
    lines = [];
    // @ts-ignore
    for (let i = 0; i < E.trails; i++) {
      // @ts-ignore
      lines.push(new Line({ spring: 0.45 + (i / E.trails) * 0.025 }));
    }
  }
  // @ts-ignore
  function c(ev: any) {
    ev.touches
      ? // @ts-ignore
        ((pos.x = ev.touches[0].pageX), (pos.y = ev.touches[0].pageY))
      : // @ts-ignore
        ((pos.x = ev.clientX), (pos.y = ev.clientY));
    ev.preventDefault();
  }
  // @ts-ignore
  function l(ev: any) {
    // @ts-ignore
    if (ev.touches && ev.touches.length === 1) {
      // @ts-ignore
      pos.x = ev.touches[0].pageX;
      // @ts-ignore
      pos.y = ev.touches[0].pageY;
    }
  }
  document.removeEventListener("mousemove", onMousemove);
  document.removeEventListener("touchstart", onMousemove);
  document.addEventListener("mousemove", c);
  document.addEventListener("touchmove", c);
  document.addEventListener("touchstart", l);
  c(e);
  o();
  render();
}

// @ts-ignore
let _canvasRafId: number | null = null;

function render() {
  // @ts-ignore
  if (ctx && ctx.running) {
    // @ts-ignore
    ctx.globalCompositeOperation = "source-over";
    // @ts-ignore
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    // @ts-ignore
    ctx.globalCompositeOperation = "lighter";
    // @ts-ignore
    ctx.strokeStyle = "hsla(" + Math.round(f.update()) + ",100%,50%,0.025)";
    // @ts-ignore
    ctx.lineWidth = 10;
    // @ts-ignore
    for (let t = 0; t < E.trails; t++) {
      // @ts-ignore
      const line = lines[t];
      line.update();
      line.draw();
    }
    // @ts-ignore
    ctx.frame++;
    _canvasRafId = window.requestAnimationFrame(render);
  }
}

function resizeCanvas() {
  // @ts-ignore
  if (!ctx) return;
  // @ts-ignore
  ctx.canvas.width = window.innerWidth - 20;
  // @ts-ignore
  ctx.canvas.height = window.innerHeight;
}

// @ts-ignore
let _hueValue = 0;
// @ts-ignore
var ctx: any,
  f: any,
  pos: any = {},
  // @ts-ignore
  lines: any[] = [],
  E = {
    debug: true,
    friction: 0.5,
    trails: 80,
    size: 50,
    dampening: 0.025,
    tension: 0.99,
  };

function Node(this: any) {
  this.x = 0;
  this.y = 0;
  this.vy = 0;
  this.vx = 0;
}

export const renderCanvas = function (): (() => void) | undefined {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (!canvas) return undefined;

  // @ts-ignore
  ctx = canvas.getContext("2d");
  if (!ctx) return undefined;

  // @ts-ignore
  ctx.running = true;
  // @ts-ignore
  ctx.frame = 1;
  f = new n({
    phase: Math.random() * 2 * Math.PI,
    amplitude: 85,
    frequency: 0.0015,
    offset: 285,
  });
  document.addEventListener("mousemove", onMousemove);
  document.addEventListener("touchstart", onMousemove);
  document.body.addEventListener("orientationchange", resizeCanvas);
  window.addEventListener("resize", resizeCanvas);
  const handleFocus = () => {
    // @ts-ignore
    if (ctx && !ctx.running) {
      // @ts-ignore
      ctx.running = true;
      render();
    }
  };
  const handleBlur = () => {
    // @ts-ignore
    if (ctx) ctx.running = false;
  };
  window.addEventListener("focus", handleFocus);
  window.addEventListener("blur", handleBlur);
  resizeCanvas();

  return () => {
    // @ts-ignore
    if (ctx) ctx.running = false;
    if (_canvasRafId != null) {
      cancelAnimationFrame(_canvasRafId);
      _canvasRafId = null;
    }
    document.removeEventListener("mousemove", onMousemove);
    document.removeEventListener("touchstart", onMousemove);
    document.body.removeEventListener("orientationchange", resizeCanvas);
    window.removeEventListener("resize", resizeCanvas);
    window.removeEventListener("focus", handleFocus);
    window.removeEventListener("blur", handleBlur);
  };
};

