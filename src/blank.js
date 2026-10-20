import gsap from "gsap";

const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!reduce) {
  gsap.from(".rule", {
    scaleX: 0,
    duration: 0.7,
    ease: "power3.out",
    transformOrigin: "left center",
  });
}

window.addEventListener("beforeprint", () => {
  gsap.set(".rule", { scaleX: 1 });
});

document.querySelector("#print")?.addEventListener("click", () => window.print());
