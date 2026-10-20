import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { SplitText } from "gsap/SplitText";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(
  ScrollTrigger,
  ScrollToPlugin,
  DrawSVGPlugin,
  MotionPathPlugin,
  SplitText,
  CustomEase
);

CustomEase.create("ols", "0.16,1,0.3,1");
gsap.defaults({ ease: "power3.out", duration: 0.4 });

const mm = gsap.matchMedia();

mm.add(
  {
    reduce: "(prefers-reduced-motion: reduce)",
    motion: "(prefers-reduced-motion: no-preference)",
  },
  (context) => {
    const { reduce } = context.conditions;
    if (reduce) return;

    document.fonts.ready.then(() => {
      const lines = gsap.utils.toArray("#hero-title .line");
      const split = lines.length
        ? lines.map((line) => SplitText.create(line, { type: "words", aria: "auto" }))
        : null;

      const intro = gsap.timeline({ defaults: { ease: "ols" } });
      intro
        .fromTo(
          ".nav-logo",
          { clipPath: "inset(0 100% 0 0)" },
          { clipPath: "inset(0 0% 0 0)", duration: 0.55 }
        )
        .from(".streak", { drawSVG: 0, duration: 0.7, stagger: 0.05 }, 0.05);

      if (split) {
        intro.from(
          split.flatMap((item) => item.words),
          { y: 22, autoAlpha: 0, duration: 0.42, stagger: 0.04 },
          0.16
        );
      }

      const route = document.querySelector("#route");
      const routeLength = route?.getTotalLength?.() ?? 0;
      if (routeLength > 10) {
        intro.to(
          "#truck",
          {
            motionPath: {
              path: "#route",
              align: "#route",
              alignOrigin: [0.12, 0.92],
              autoRotate: false,
            },
            duration: 1.05,
            ease: "power2.inOut",
            immediateRender: true,
          },
          0
        );
      } else {
        intro.fromTo(
          "#truck",
          { x: 0 },
          { x: 240, duration: 1.05, ease: "power2.inOut" },
          0.28
        );
      }

      intro
        .to(
          ".wheel",
          {
            rotation: 360,
            duration: 1.05,
            ease: "none",
            transformOrigin: "50% 50%",
          },
          0.28
        )
        .from(
          ".cargo",
          { y: -10, autoAlpha: 0, duration: 0.3, ease: "ols" },
          1.05
        );

      const ambient = gsap.to(".ambient-streak", {
        x: 22,
        duration: 2.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        paused: true,
      });

      intro.eventCallback("onComplete", () => ambient.play());

      ScrollTrigger.create({
        trigger: ".hero",
        start: "top bottom",
        end: "bottom top",
        onToggle: (self) => (self.isActive ? ambient.play() : ambient.pause()),
      });

      const aboutIcons = gsap.utils.toArray(".obj .icon-draw");
      if (aboutIcons.length) {
        gsap.from(aboutIcons, {
          drawSVG: 0,
          duration: 0.5,
          stagger: 0.08,
          ease: "ols",
          scrollTrigger: { trigger: "#about", start: "top 75%", once: true },
        });
      }

      const idle = gsap.timeline({ repeat: -1, paused: true });
      idle
        .to(".obj-truck", { x: 8, duration: 1.5, ease: "sine.inOut", yoyo: true, repeat: 1 })
        .to(
          ".obj-liquid",
          {
            scaleY: 0.84,
            transformOrigin: "50% 100%",
            duration: 1.3,
            ease: "sine.inOut",
            yoyo: true,
            repeat: 1,
          }
        )
        .to(".obj-sheet", { y: -6, duration: 1.2, ease: "sine.inOut", yoyo: true, repeat: 1 });

      ScrollTrigger.create({
        trigger: "#about",
        start: "top 80%",
        end: "bottom 15%",
        onEnter: () => idle.play(),
        onEnterBack: () => idle.play(),
        onLeave: () => idle.pause(0),
        onLeaveBack: () => idle.pause(0),
      });

      const trip = gsap.timeline({
        scrollTrigger: { trigger: "#trip", start: "top 72%", once: true },
        defaults: { ease: "ols" },
      });
      trip
        .from(".trip-line", { scaleX: 0, duration: 0.55, transformOrigin: "left center" })
        .from(".step-icon .icon-draw", { drawSVG: 0, duration: 0.45, stagger: 0.1 }, 0.08)
        .from(".step-icon .icon-obj", { y: 8, autoAlpha: 0, duration: 0.35, stagger: 0.1 }, 0.16);

      const road = gsap.timeline({
        scrollTrigger: { trigger: "#base", start: "top 70%", once: true },
      });
      road
        .from(".road-line", { scaleX: 0, duration: 0.6, ease: "ols", transformOrigin: "left center" })
        .from(".stop", { autoAlpha: 0, y: 8, duration: 0.3, stagger: 0.08, ease: "ols" }, 0.2)
        .fromTo(
          ".road-truck",
          { x: 0 },
          {
            x: () => {
              const track = document.querySelector(".track");
              const truck = document.querySelector(".road-truck");
              if (!track || !truck) return 0;
              return gsap.utils.clamp(0, 2000, track.clientWidth - truck.offsetWidth);
            },
            duration: 1.15,
            ease: "power2.inOut",
          },
          0.15
        );

      gsap.utils.toArray(".step").forEach((step) => {
        const obj = step.querySelector(".icon-obj");
        if (!obj) return;
        step.addEventListener("pointerenter", () => {
          gsap.to(obj, { x: 5, duration: 0.16, ease: "ols" });
        });
        step.addEventListener("pointerleave", () => {
          gsap.to(obj, { x: 0, duration: 0.22, ease: "ols" });
        });
      });

      ScrollTrigger.refresh();
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }
);

gsap.utils.toArray("[data-scroll]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const target = link.getAttribute("href");
    if (!target || !document.querySelector(target)) return;
    event.preventDefault();
    const offset = (document.querySelector(".nav-wrap")?.offsetHeight || 72) + 12;
    gsap.to(window, {
      duration: 0.7,
      ease: "power2.inOut",
      scrollTo: { y: target, offsetY: offset },
    });
  });
});

gsap.utils.toArray(".btn").forEach((btn) => {
  btn.addEventListener("pointerdown", () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.to(btn, { scale: 0.98, duration: 0.12, ease: "ols" });
  });
  const release = () => gsap.to(btn, { scale: 1, duration: 0.2, ease: "ols" });
  btn.addEventListener("pointerup", release);
  btn.addEventListener("pointerleave", release);
});

const form = document.querySelector("#request-form");
const result = document.querySelector("#result");
const resultText = document.querySelector("#result-text");
let letter = "";

function digits(value) {
  return (value.match(/\d/g) || []).length;
}

function validate(data) {
  const errors = [];
  const need = (name, message) => errors.push({ name, message });
  if (!data.company) need("company", "Укажите компанию.");
  if (!data.name) need("name", "Укажите, как к вам обращаться.");
  if (!data.phone) need("phone", "Укажите телефон.");
  else if (digits(data.phone) < 6) need("phone", "В телефоне слишком мало цифр.");
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    need("email", "Проверьте адрес почты: нужна точка после имени сервера.");
  }
  if (!data.from) need("from", "Укажите, откуда забрать груз.");
  if (!data.to) need("to", "Укажите, куда доставить груз.");
  if (!data.cargo) need("cargo", "Выберите тип груза.");
  if (!data.when) need("when", "Укажите, когда забрать груз.");
  return errors;
}

function paintErrors(errors) {
  gsap.utils.toArray(".field").forEach((field) => {
    const name = field.dataset.name;
    const hit = errors.find((item) => item.name === name);
    const control = field.querySelector("input, select, textarea");
    const err = field.querySelector(".err");
    if (hit) {
      field.dataset.invalid = "true";
      control?.setAttribute("aria-invalid", "true");
      if (err) err.textContent = hit.message;
    } else {
      delete field.dataset.invalid;
      control?.removeAttribute("aria-invalid");
      if (err) err.textContent = "";
    }
  });
}

function buildLetter(data) {
  const lines = [
    "Заявка на рейс",
    `Компания: ${data.company}`,
    `Имя: ${data.name}`,
    `Телефон: ${data.phone}`,
    `Почта: ${data.email || "не указана"}`,
    `Откуда: ${data.from}`,
    `Куда: ${data.to}`,
    `Груз: ${data.cargo}`,
    `Места или вес: ${data.places || "не указано"}`,
    `Когда забрать: ${data.when}`,
    `Температурный режим: ${data.temp || "не требуется"}`,
    `Комментарий: ${data.comment || "нет"}`,
  ];
  return lines.join("\n");
}

function drawCheck() {
  const mark = document.querySelector("#check-mark");
  if (!mark) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    gsap.set(mark, { drawSVG: "0% 100%" });
    return;
  }
  gsap.fromTo(mark, { drawSVG: 0 }, { drawSVG: "0% 100%", duration: 0.45, ease: "ols" });
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const raw = new FormData(form);
  const data = Object.fromEntries(
    [...raw.entries()].map(([key, value]) => [key, String(value).trim()])
  );
  const errors = validate(data);
  paintErrors(errors);
  if (errors.length) {
    const first = form.querySelector(`[data-name="${errors[0].name}"] input, [data-name="${errors[0].name}"] select, [data-name="${errors[0].name}"] textarea`);
    first?.focus();
    if (
      first &&
      !window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      gsap.fromTo(
        first,
        { x: 0 },
        { x: 7, duration: 0.07, repeat: 5, yoyo: true, ease: "power1.inOut", clearProps: "x" }
      );
    }
    result.hidden = true;
    return;
  }

  letter = buildLetter(data);
  const subject = `Заявка на рейс, ${data.company}`;
  const href = `mailto:info@olslogistic.ru?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(letter)}`;
  result.hidden = false;
  resultText.textContent = letter;
  drawCheck();
  window.location.href = href;
});

document.querySelector("#copy")?.addEventListener("click", async () => {
  const status = document.querySelector("#copy-status");
  try {
    await navigator.clipboard.writeText(letter);
    if (status) status.textContent = "Текст заявки скопирован.";
  } catch {
    const area = document.createElement("textarea");
    area.value = letter;
    document.body.appendChild(area);
    area.select();
    document.execCommand("copy");
    area.remove();
    if (status) status.textContent = "Текст заявки скопирован.";
  }
});
