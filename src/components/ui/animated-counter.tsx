
"use client";

import { MotionValue, motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

const fontSize = 14; // Smaller font size to fit in the UI
const padding = 6; // Smaller padding to fit in the UI
const height = fontSize + padding;

export function AnimatedCounter({ value }: { value: number }) {
  return (
    <div
      style={{ fontSize }}
      className="flex space-x-1 overflow-hidden leading-none"
    >
      {value > 999 ? (
        <>
          <Digit place={1000} value={value} />
          <span>K+</span>
        </>
      ) : value > 99 ? (
        <>
          <Digit place={100} value={value} />
          <Digit place={10} value={value} />
          <Digit place={1} value={value} />
        </>
      ) : value > 9 ? (
        <>
          <Digit place={10} value={value} />
          <Digit place={1} value={value} />
        </>
      ) : (
        <Digit place={1} value={value} />
      )}
    </div>
  );
}

function Digit({ place, value }: { place: number; value: number }) {
  let valueRoundedToPlace = Math.floor(value / place) % 10;
  let animatedValue = useSpring(valueRoundedToPlace);

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums">
      {[...Array(10).keys()].map((i) => (
        <Number key={i} mv={animatedValue} number={i} />
      ))}
    </div>
  );
}

function Number({ mv, number }: { mv: MotionValue; number: number }) {
  let y = useTransform(mv, (latest) => {
    let placeValue = latest % 10;
    let offset = (10 + number - placeValue) % 10;
    let memo = offset * height;
    if (offset > 5) {
      memo -= 10 * height;
    }
    return memo;
  });

  return (
    <motion.span
      style={{ y }}
      className="absolute inset-0 flex items-center justify-center"
    >
      {number}
    </motion.span>
  );
}
