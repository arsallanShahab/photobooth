import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = src;
    img.onload = () => resolve(img);
    img.onerror = reject;
  });
};

//get size factor for image
export const getSizeFactor = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number,
) => {
  const widthFactor = width / maxWidth;
  const heightFactor = height / maxHeight;
  return Math.max(widthFactor, heightFactor);
};
