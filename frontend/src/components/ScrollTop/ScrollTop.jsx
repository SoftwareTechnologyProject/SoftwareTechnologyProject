import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const scrollToTop = (duration = 600) => {
  const start = window.pageYOffset;
  const startTime = performance.now();

  const animate = (time) => {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);

    const ease =
      progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

    window.scrollTo(0, start * (1 - ease));

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    scrollToTop(700); 
  }, [pathname]);

  return null;
};

export default ScrollToTop;
