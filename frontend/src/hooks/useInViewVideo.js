import { useEffect, useRef } from "react";

export function useInViewVideo({ muted, pausedByUser }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const element = videoRef.current;

    if (!element) {
      return undefined;
    }

    const applyPlaybackState = (isVisible) => {
      element.dataset.inView = String(isVisible);

      if (!isVisible) {
        element.pause();
        element.muted = true;
        element.defaultMuted = true;
        return;
      }

      element.muted = muted;
      element.defaultMuted = muted;
      element.volume = muted ? 0 : 1;

      if (pausedByUser) {
        element.pause();
      } else {
        element.play().catch(() => {});
      }
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        applyPlaybackState(entry.isIntersecting);
      },
      { threshold: 0.75 }
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [muted, pausedByUser]);

  return videoRef;
}
