"use client";

import { useEffect, useState } from "react";

const ScrollToTopButton = () => {
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const checkScrollPosition = () => {
      setShowButton(window.scrollY > 400);
    };

    window.addEventListener("scroll", checkScrollPosition);
    return () => {
      window.removeEventListener("scroll", checkScrollPosition);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const baseClass =
    "fixed bottom-5 right-5 p-3 rounded-full border border-gray-600 bg-white shadow-lg text-black cursor-pointer transition-all duration-300";
  const hiddenClass = "opacity-0 translate-y-5 pointer-events-none";
  const visibleClass = "opacity-100 translate-y-0";

  return (
    <button
      onClick={scrollToTop}
      className={`${baseClass} ${showButton ? visibleClass : hiddenClass}`}
    >
      <div className="flex flex-col items-center">
        <span className="material-symbols-outlined">arrow_drop_up</span>
      </div>
    </button>
  );
};

export default ScrollToTopButton;
