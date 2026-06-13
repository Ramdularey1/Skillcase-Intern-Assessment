import { useEffect, useRef } from "react";

export function useInViewVideo() {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          element.play().catch(() => {});
        } else {
          element.pause();
        }
      },
      { threshold: 0.75 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  return videoRef;
}
