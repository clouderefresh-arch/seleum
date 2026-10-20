import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { Observer } from "gsap/Observer";
import { CustomEase } from "gsap/CustomEase";

gsap.registerPlugin(DrawSVGPlugin, Observer, CustomEase);
CustomEase.create("ols", "0.16,1,0.3,1");

const slides = gsap.utils.toArray(".slide");
const counter = document.querySelector("#counter");
const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let index = 0;
let animating = false;

function updateCounter() {
  if (counter) counter.textContent = `${index + 1} из ${slides.length}`;
}

function playSlide(slide) {
  if (reduce) return;
  const rule = slide.querySelector(".slide-rule");
  if (rule) {
    gsap.fromTo(
      rule,
      { scaleX: 0 },
      { scaleX: 1, duration: 0.45, ease: "ols", transformOrigin: "left center" }
    );
  }
  if (!slide.classList.contains("cover")) return;

  const tl = gsap.timeline({ defaults: { ease: "ols" } });
  tl.fromTo(
    ".cover-logo",
    { clipPath: "inset(0 100% 0 0)" },
    { clipPath: "inset(0 0% 0 0)", duration: 0.55 }
  )
    .from(".cover-streak", { drawSVG: 0, duration: 0.6, stagger: 0.06 }, 0.04)
    .from(".cover h1, .cover .sub", { y: 16, autoAlpha: 0, duration: 0.4, stagger: 0.06 }, 0.12)
    .fromTo(".cover-truck", { x: 0 }, { x: 220, duration: 0.95, ease: "power2.inOut" }, 0.2)
    .to(
      ".cover-wheel",
      { rotation: 320, duration: 0.95, ease: "none", transformOrigin: "50% 50%" },
      0.2
    );
}

function go(next) {
  const dest = gsap.utils.clamp(0, slides.length - 1, next);
  if (dest === index || animating) return;
  const dir = dest > index ? 1 : -1;
  const from = slides[index];
  const to = slides[dest];
  index = dest;
  updateCounter();

  if (reduce) {
    gsap.set(slides, { autoAlpha: 0, x: 0 });
    gsap.set(to, { autoAlpha: 1, x: 0 });
    return;
  }

  animating = true;
  gsap.killTweensOf([from, to]);
  gsap.set(to, { x: 28 * dir, autoAlpha: 0 });
  gsap.to(from, { x: -28 * dir, autoAlpha: 0, duration: 0.26, ease: "power3.in" });
  gsap.to(to, {
    x: 0,
    autoAlpha: 1,
    duration: 0.4,
    ease: "ols",
    onStart: () => playSlide(to),
    onComplete: () => {
      animating = false;
    },
  });
}

gsap.set(slides, { autoAlpha: 0 });
gsap.set(slides[0], { autoAlpha: 1 });
updateCounter();
playSlide(slides[0]);

document.querySelector("#prev")?.addEventListener("click", () => go(index - 1));
document.querySelector("#next")?.addEventListener("click", () => go(index + 1));
document.querySelector("#print")?.addEventListener("click", () => window.print());

window.addEventListener("keydown", (event) => {
  if (event.key === "ArrowRight" || event.key === "PageDown") {
    event.preventDefault();
    go(index + 1);
  }
  if (event.key === "ArrowLeft" || event.key === "PageUp") {
    event.preventDefault();
    go(index - 1);
  }
  if (event.key === "Home") go(0);
  if (event.key === "End") go(slides.length - 1);
});

if (!reduce) {
  Observer.create({
    target: ".stage",
    type: "pointer,touch",
    tolerance: 70,
    onLeft: (self) => {
      if (self.event?.target?.closest("a, button")) return;
      go(index + 1);
    },
    onRight: (self) => {
      if (self.event?.target?.closest("a, button")) return;
      go(index - 1);
    },
  });
}
