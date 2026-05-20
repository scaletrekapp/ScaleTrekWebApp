// RTL layout mirroring utilities for Arabic support

export const rtlFlip = (lang: string, className: string): string => {
  if (lang !== "ar") return className;
  return className
    .replace(/left-(\d+)/g, "right-$1")
    .replace(/right-(\d+)/g, "left-$1")
    .replace(/-left-/g, "-right-")
    .replace(/-right-/g, "-left-")
    .replace(/ml-(\d+)/g, (m, n) => `mr-${n}`)
    .replace(/mr-(\d+)/g, (m, n) => `ml-${n}`)
    .replace(/pl-(\d+)/g, (m, n) => `pr-${n}`)
    .replace(/pr-(\d+)/g, (m, n) => `pl-${n}`)
    .replace(/translate-x-/g, "translate-x-");
};

export const isRTL = (lang: string): boolean => lang === "ar";
