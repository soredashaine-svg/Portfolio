/* =========================================================
   Shaine Soreda | Portfolio — all behavior
   ========================================================= */

/* ---------- Dark / light mode ---------- */
const root = document.documentElement;
const themeBtn = document.getElementById("themeToggle");
function setTheme(t) {
  root.setAttribute("data-theme", t);
  themeBtn.textContent = t === "dark" ? "Light" : "Dark";
  try { localStorage.setItem("theme", t); } catch (e) {}
}
let savedTheme = null;
try { savedTheme = localStorage.getItem("theme"); } catch (e) {}
setTheme(savedTheme || "light");
themeBtn.addEventListener("click", () =>
  setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark")
);

/* ---------- Mobile menu ---------- */
const navLinks = document.getElementById("navLinks");
document.getElementById("menuToggle").addEventListener("click", () => navLinks.classList.toggle("open"));
navLinks.querySelectorAll("a").forEach(a => a.addEventListener("click", () => navLinks.classList.remove("open")));

/* ---------- Active nav link on scroll + back to top ---------- */
const sections = [...document.querySelectorAll("section[id], header[id]")];
const toTop = document.getElementById("toTop");
window.addEventListener("scroll", () => {
  const y = window.scrollY + 120;
  sections.forEach(s => {
    const link = navLinks.querySelector(`a[href="#${s.id}"]`);
    if (link) link.classList.toggle("active", y >= s.offsetTop && y < s.offsetTop + s.offsetHeight);
  });
  toTop.classList.toggle("show", window.scrollY > 600);
});
toTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

/* ---------- Typing effect (CHANGE: your roles) ---------- */
const roles = ["IT Support", "Help Desk Technician", "Data Encoder", "Reporting Assistant", "Excel & Sheets lover ♡"];
const typedEl = document.getElementById("typed");
let ri = 0, ci = 0, deleting = false;
(function type() {
  const word = roles[ri];
  typedEl.textContent = word.slice(0, ci);
  if (!deleting && ci < word.length) ci++;
  else if (deleting && ci > 0) ci--;
  else if (!deleting) { deleting = true; return setTimeout(type, 1400); }
  else { deleting = false; ri = (ri + 1) % roles.length; }
  setTimeout(type, deleting ? 45 : 90);
})();

/* ---------- Reveal on scroll + counters ---------- */
const io = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("visible");
    io.unobserve(e.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => io.observe(el));

const counterIO = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const el = e.target, target = +el.dataset.count;
    let n = 0;
    const step = () => { n++; el.textContent = n; if (n < target) setTimeout(step, 1000 / target); };
    if (target > 0) step();
    counterIO.unobserve(el);
  });
});
document.querySelectorAll("[data-count]").forEach(el => counterIO.observe(el));

/* ---------- Card tilt ---------- */
if (window.matchMedia("(hover: hover)").matches) {
  document.querySelectorAll(".tilt").forEach(card => {
    card.addEventListener("mousemove", e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(800px) rotateX(${-y * 8}deg) rotateY(${x * 8}deg) translateY(-4px)`;
    });
    card.addEventListener("mouseleave", () => (card.style.transform = ""));
  });
}

/* ---------- 3D skills cube (drag to spin) ---------- */
const cube = document.getElementById("cube");
const scene = document.getElementById("scene");
let rx = -20, ry = 30, dragging = false, lx = 0, ly = 0, auto = true;
scene.addEventListener("pointerdown", e => { dragging = true; auto = false; lx = e.clientX; ly = e.clientY; scene.setPointerCapture(e.pointerId); });
scene.addEventListener("pointermove", e => {
  if (!dragging) return;
  ry += (e.clientX - lx) * 0.6; rx -= (e.clientY - ly) * 0.6;
  lx = e.clientX; ly = e.clientY;
  cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
});
scene.addEventListener("pointerup", () => { dragging = false; setTimeout(() => (auto = true), 2500); });
(function spin() {
  if (auto && !dragging) { ry += 0.25; cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; }
  requestAnimationFrame(spin);
})();

/* ---------- Skill table filter ---------- */
document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    document.querySelectorAll("#skillTable tbody tr").forEach(tr => {
      tr.style.display = f === "all" || tr.dataset.cat === f ? "" : "none";
    });
  });
});

/* ---------- IPv4 subnet calculator ---------- */
const ipInput = document.getElementById("ipInput");
const cidrInput = document.getElementById("cidrInput");
const toIp = n => [24, 16, 8, 0].map(s => (n >>> s) & 255).join(".");
function calcSubnet() {
  const cidr = +cidrInput.value;
  document.getElementById("cidrLabel").textContent = "/" + cidr;
  const err = document.getElementById("calcError");
  const parts = ipInput.value.trim().split(".");
  const ids = ["rNet", "rBc", "rMask", "rHosts", "rFirst", "rLast"];
  const valid = parts.length === 4 && parts.every(p => /^\d{1,3}$/.test(p) && +p <= 255);
  if (!valid) {
    err.textContent = "Please enter a valid IPv4 address (e.g. 192.168.1.25).";
    ids.forEach(id => (document.getElementById(id).textContent = "-"));
    return;
  }
  err.textContent = "";
  const ip = parts.reduce((a, p) => ((a << 8) | +p) >>> 0, 0);
  const mask = cidr === 0 ? 0 : (0xffffffff << (32 - cidr)) >>> 0;
  const net = (ip & mask) >>> 0;
  const bc = (net | (~mask >>> 0)) >>> 0;
  let hosts, first, last;
  if (cidr === 32) { hosts = 1; first = last = net; }
  else if (cidr === 31) { hosts = 2; first = net; last = bc; }
  else { hosts = Math.pow(2, 32 - cidr) - 2; first = net + 1; last = bc - 1; }
  document.getElementById("rNet").textContent = toIp(net);
  document.getElementById("rBc").textContent = toIp(bc);
  document.getElementById("rMask").textContent = toIp(mask);
  document.getElementById("rHosts").textContent = hosts.toLocaleString();
  document.getElementById("rFirst").textContent = toIp(first);
  document.getElementById("rLast").textContent = toIp(last);
}
ipInput.addEventListener("input", calcSubnet);
cidrInput.addEventListener("input", calcSubnet);
calcSubnet();

/* ---------- Certificate lightbox ---------- */
const certs = [...document.querySelectorAll(".cert[data-src]")];
const lb = document.getElementById("lightbox");
const lbImg = document.getElementById("lbImg");
const lbCap = document.getElementById("lbCap");
let lbIndex = 0;
let lbItems = certs.map(c => ({ src: c.dataset.src, cap: c.dataset.caption }));
const certItems = lbItems;
function openLb(i) {
  lbIndex = (i + lbItems.length) % lbItems.length;
  lbImg.src = lbItems[lbIndex].src;
  lbCap.textContent = lbItems[lbIndex].cap;
  lb.classList.add("open");
}
certs.forEach((c, i) => c.addEventListener("click", () => { lbItems = certItems; openLb(i); }));

document.getElementById("lbClose").addEventListener("click", () => lb.classList.remove("open"));
document.getElementById("lbPrev").addEventListener("click", () => openLb(lbIndex - 1));
document.getElementById("lbNext").addEventListener("click", () => openLb(lbIndex + 1));
lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("open"); });
document.addEventListener("keydown", e => {
  if (!lb.classList.contains("open")) return;
  if (e.key === "Escape") lb.classList.remove("open");
  if (e.key === "ArrowLeft") openLb(lbIndex - 1);
  if (e.key === "ArrowRight") openLb(lbIndex + 1);
});

/* ---------- Contact ---------- */
document.getElementById("copyEmail").addEventListener("click", e => {
  const email = document.getElementById("emailText").textContent;
  const done = () => { e.target.textContent = "Copied!"; setTimeout(() => (e.target.textContent = "Copy"), 1500); };
  const fallback = () => {
    const r = document.createRange(); r.selectNodeContents(document.getElementById("emailText"));
    const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r);
    e.target.textContent = "Selected – press Ctrl+C";
  };
  try { navigator.clipboard.writeText(email).then(done, fallback); } catch (err) { fallback(); }
});
document.getElementById("contactForm").addEventListener("submit", e => {
  e.preventDefault();
  const email = document.getElementById("emailText").textContent;
  const name = document.getElementById("cName").value;
  const msg = document.getElementById("cMsg").value;
  window.location.href = `mailto:${email}?subject=${encodeURIComponent("Portfolio message from " + name)}&body=${encodeURIComponent(msg)}`;
});

/* ---------- Final checklist (saved in this browser) ---------- */
const checklistItems = [
  "Professional email", "Professional photograph", "About Me", "Career objective", "Resume",
  "LinkedIn", "GitHub", "Web development skills demonstrated", "Networking skills demonstrated",
  "Cybersecurity skills demonstrated", "Data analysis skills demonstrated", "AI literacy evidence",
  "Five troubleshooting scenarios", "Security case study", "AI usage log",
  "Mock interview completed", "Technical interview completed",
  "Career plan completed", "Final reflection completed"
];
let checked = [];
try {
  const saved = JSON.parse(localStorage.getItem("checklist") || "[]");
  if (Array.isArray(saved)) {
    const version = localStorage.getItem("checklistVersion");
    if (version === "3") {
      checked = saved.filter(Number.isInteger);
    } else if (version === "2") {
      const indexMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 8: 7, 10: 8, 11: 9, 12: 10, 14: 11, 21: 12, 22: 13, 23: 14, 24: 15, 25: 16, 27: 17, 28: 18 };
      checked = saved.filter(Number.isInteger).flatMap(i => indexMap[i] === undefined ? [] : [indexMap[i]]);
    } else {
      const indexMap = { 0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 8: 7, 10: 8, 11: 9, 12: 10, 14: 11, 24: 12, 25: 13, 26: 14, 27: 15, 28: 16, 30: 17, 31: 18 };
      checked = saved.filter(Number.isInteger).flatMap(i => indexMap[i] === undefined ? [] : [indexMap[i]]);
    }
    localStorage.setItem("checklist", JSON.stringify(checked));
    localStorage.setItem("checklistVersion", "3");
  }
} catch (e) {}
const cl = document.getElementById("checklist");
function updateProgress() {
  const done = cl.querySelectorAll("input:checked").length;
  document.getElementById("progressLabel").textContent = `${done} of ${checklistItems.length} done`;
  document.getElementById("progressBar").style.width = (done / checklistItems.length) * 100 + "%";
}
checklistItems.forEach((item, i) => {
  const li = document.createElement("li");
  li.innerHTML = `<label><input type="checkbox" ${checked.includes(i) ? "checked" : ""}/> ${item}</label>`;
  li.querySelector("input").addEventListener("change", ev => {
    checked = ev.target.checked ? [...checked, i] : checked.filter(x => x !== i);
    try { localStorage.setItem("checklist", JSON.stringify(checked)); } catch (e) {}
    updateProgress();
  });
  cl.appendChild(li);
});
updateProgress();

document.getElementById("year").textContent = new Date().getFullYear();

/* ---------- Hero sparkles + mouse parallax on the background ---------- */
const sparkles = document.getElementById("sparkles");
for (let i = 0; i < 26; i++) {
  const sp = document.createElement("span");
  sp.className = "sparkle";
  const size = 3 + Math.random() * 6;
  sp.style.cssText = `left:${Math.random() * 100}%;top:${30 + Math.random() * 65}%;width:${size}px;height:${size}px;` +
    `animation-duration:${5 + Math.random() * 7}s;animation-delay:${-Math.random() * 10}s;`;
  sparkles.appendChild(sp);
}
const heroEl = document.querySelector(".hero");
const wavesEl = document.querySelector(".hero-waves");
if (window.matchMedia("(hover: hover)").matches) {
  heroEl.addEventListener("mousemove", e => {
    const x = e.clientX / window.innerWidth - 0.5;
    const y = e.clientY / window.innerHeight - 0.5;
    wavesEl.style.transform = `translate(${x * -25}px, ${y * -15}px)`;
  });
  heroEl.addEventListener("mouseleave", () => (wavesEl.style.transform = ""));
}