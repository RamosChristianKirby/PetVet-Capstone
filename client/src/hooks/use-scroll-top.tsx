import { useState, useEffect } from "react";

// Custom hook to determine if the page has been scrolled past a certain threshold.

export const useScrollTop = (threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {

      // Check if the vertical scroll position is greater than the threshold.

      if (window.scrollY > threshold)
        setScrolled(true);
      else
        setScrolled(false);

    };

    // Adding the scroll event listener when the component mounts.

    window.addEventListener("scroll", handleScroll);

    // Cleanup function to remove the scroll event listener when the component unmounts.

    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return scrolled;
};
