// Toggle menú móvil
const toggle = document.querySelector(".nav-toggle");
const menu = document.querySelector("#menu");
if (toggle && menu) {
  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(open));
  });
}

// Cerrar menú móvil al hacer clic en un enlace, ESC o click fuera
(function () {
  const toggle = document.querySelector(".nav-toggle");
  const menu = document.querySelector("#menu");
  if (!toggle || !menu) return;

  menu.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;
    closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && menu.classList.contains("is-open")) closeMenu();
  });

  document.addEventListener("click", (e) => {
    if (!menu.classList.contains("is-open")) return;
    const clickedInsideMenu = menu.contains(e.target);
    const clickedToggle = toggle.contains(e.target);
    if (!clickedInsideMenu && !clickedToggle) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640 && menu.classList.contains("is-open")) {
      closeMenu();
    }
  });

  function closeMenu() {
    menu.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
  }
})();

// Footer año
const yearEl = document.getElementById("year");
if (yearEl) yearEl.textContent = new Date().getFullYear();

// Validación simple del formulario de contacto
// Validación + envío real
(function () {
  const form = document.getElementById("contactForm");
  if (!form) return;

  const nameInput = document.getElementById("cname");
  const emailInput = document.getElementById("cemail");
  const msgInput = document.getElementById("cmsg");

  const nameError = document.getElementById("cnameError");
  const emailError = document.getElementById("cemailError");
  const msgError = document.getElementById("cmsgError");
  const formMsg = document.getElementById("contactMessage");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

  function reset() {
    [nameError, emailError, msgError].forEach((el) => (el.textContent = ""));
    [nameInput, emailInput, msgInput].forEach((el) =>
      el.classList.remove("is-invalid")
    );
    if (formMsg) {
      formMsg.textContent = "";
      formMsg.className = "form-message";
    }
  }

  function invalid(el, target, text) {
    target.textContent = text;
    el.classList.add("is-invalid");
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    reset();

    let ok = true;
    if (!nameInput.value.trim()) {
      invalid(nameInput, nameError, "Escribe tu nombre.");
      ok = false;
    }
    if (!emailInput.value.trim()) {
      invalid(emailInput, emailError, "El correo es obligatorio.");
      ok = false;
    } else if (!emailRegex.test(emailInput.value.trim())) {
      invalid(emailInput, emailError, "Correo no válido.");
      ok = false;
    }
    if (!msgInput.value.trim()) {
      invalid(msgInput, msgError, "Cuéntame brevemente tu mensaje.");
      ok = false;
    }

    if (!ok) {
      formMsg.textContent = "Revisa los campos marcados.";
      formMsg.className = "form-message form-message--error";
      return;
    }

    formMsg.textContent = "Enviando…";
    formMsg.className = "form-message";

    try {
      const body = new FormData();
      body.append("name", nameInput.value.trim());
      body.append("email", emailInput.value.trim());
      body.append("message", msgInput.value.trim());

      const res = await fetch("sendmail.php", {
        method: "POST",
        body,
      });
      const data = await res.json();

      if (data.ok) {
        formMsg.textContent = "¡Gracias! Te respondere por email.";
        formMsg.className = "form-message form-message--success";
        form.reset();
        nameInput.focus();
      } else {
        formMsg.textContent =
          data.msg || "No se pudo enviar. Escríbeme por WhatsApp.";
        formMsg.className = "form-message form-message--error";
      }
    } catch (err) {
      formMsg.textContent = "Error de red. Intenta más tarde o por WhatsApp.";
      formMsg.className = "form-message form-message--error";
    }
  });
})();

// Mostrar botón WhatsApp al hacer scroll
document.addEventListener("scroll", () => {
  const btn = document.querySelector(".whatsapp-btn");
  if (!btn) return;

  if (window.scrollY > 150) {
    // aparece después de 150px
    btn.classList.add("show");
  } else {
    btn.classList.remove("show");
  }
});

(function () {
  const el = document.getElementById("hero-particles");
  if (!el) return;

  const dpr = Math.max(1, Math.min(window.devicePixelRatio || 1, 2));
  let ctx,
    w,
    h,
    particles = [],
    running = true;

  const styles = getComputedStyle(document.documentElement);
  const ACCENT = styles.getPropertyValue("--accent").trim() || "#E02018";

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }
  function resize() {
    w = el.clientWidth;
    h = el.clientHeight;
    el.width = Math.floor(w * dpr);
    el.height = Math.floor(h * dpr);
    ctx = el.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const target = Math.min(90, Math.max(40, Math.floor((w * h) / 18000)));
    if (particles.length > target) particles.length = target;
    while (particles.length < target) {
      particles.push(spawn());
    }
  }

  function spawn() {
    const speed = rand(0.05, 0.25);
    const dir = rand(0, Math.PI * 2);
    const r = rand(2, 4);
    const palette = [ACCENT, "rgba(255,255,255,.9)", "rgba(255,255,255,.6)"];
    return {
      x: rand(0, w),
      y: rand(0, h),
      vx: Math.cos(dir) * speed,
      vy: Math.sin(dir) * speed,
      r,
      alpha: rand(0.4, 0.9),
      color: palette[Math.floor(rand(0, palette.length))],
    };
  }

  function step() {
    if (!running) return;
    ctx.clearRect(0, 0, w, h);

    for (let p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < -10) p.x = w + 10;
      else if (p.x > w + 10) p.x = -10;
      if (p.y < -10) p.y = h + 10;
      else if (p.y > h + 10) p.y = -10;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }

    requestAnimationFrame(step);
  }

  document.addEventListener("visibilitychange", () => {
    running = document.visibilityState === "visible";
    if (running) requestAnimationFrame(step);
  });

  window.addEventListener("resize", resize);
  resize();
  requestAnimationFrame(step);
})();

// Activa animación de entrada del HERO
document.addEventListener("DOMContentLoaded", () => {
  const hero = document.querySelector(".hero");
  if (hero) {
    // pequeño timeout para asegurar estilos aplicados
    setTimeout(() => hero.classList.add("is-in"), 60);
  }
});

// Animación fade-up en TODA la página
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target); // se anima solo una vez
        }
      });
    },
    { threshold: 0.2 }
  ); // activa cuando 20% es visible

  // Busca todos los elementos con clase fade-up
  document.querySelectorAll(".fade-up").forEach((el) => {
    observer.observe(el);
  });
});

// Animaciones en TODA la página
document.addEventListener("DOMContentLoaded", () => {
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 }
  );

  // 👇 ahora observa varias clases
  document
    .querySelectorAll(".fade-up, .fade-left, .fade-right, .zoom-in")
    .forEach((el) => observer.observe(el));
});



