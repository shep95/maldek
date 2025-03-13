
"use client"

import { memo, useEffect, useLayoutEffect, useState, useRef } from "react"
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from "framer-motion"

export const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect

type UseMediaQueryOptions = {
  defaultValue?: boolean
  initializeWithValue?: boolean
}

const IS_SERVER = typeof window === "undefined"

export function useMediaQuery(
  query: string,
  {
    defaultValue = false,
    initializeWithValue = true,
  }: UseMediaQueryOptions = {}
): boolean {
  const getMatches = (query: string): boolean => {
    if (IS_SERVER) {
      return defaultValue
    }
    return window.matchMedia(query).matches
  }

  const [matches, setMatches] = useState<boolean>(() => {
    if (initializeWithValue) {
      return getMatches(query)
    }
    return defaultValue
  })

  const handleChange = () => {
    setMatches(getMatches(query))
  }

  useIsomorphicLayoutEffect(() => {
    const matchMedia = window.matchMedia(query)
    handleChange()

    matchMedia.addEventListener("change", handleChange)

    return () => {
      matchMedia.removeEventListener("change", handleChange)
    }
  }, [query])

  return matches
}

const duration = 0.15
const transition = { duration, ease: [0.32, 0.72, 0, 1], filter: "blur(4px)" }
const transitionOverlay = { duration: 0.5, ease: [0.32, 0.72, 0, 1] }

const Carousel = memo(
  ({
    handleClick,
    controls,
    cards,
    isCarouselActive,
  }: {
    handleClick: (imgUrl: string, index: number) => void
    controls: any
    cards: string[]
    isCarouselActive: boolean
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    const cylinderWidth = isScreenSizeSm ? 600 : 1000
    const faceCount = Math.max(cards.length, 1)
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )
    const carouselRef = useRef<HTMLDivElement>(null)
    
    // Calculate how much rotation equals one card movement
    const stepRotation = 360 / faceCount

    // Initialize carousel with a small rotation to ensure it's visible
    useEffect(() => {
      if (controls && cards.length > 0) {
        controls.start({
          rotateY: 5,
          transition: {
            type: "spring",
            stiffness: 50,
            damping: 10,
          },
        }).then(() => {
          rotation.set(5);
        });
      }
    }, [controls, cards.length]);

    const handleDragEnd = (_, info) => {
      if (isCarouselActive && cards.length > 0) {
        const targetRotation = Math.round(rotation.get() / stepRotation) * stepRotation;
        controls.start({
          rotateY: targetRotation,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 30,
            mass: 0.1,
          },
        }).then(() => {
          rotation.set(targetRotation);
        });
      }
    };

    return (
      <div
        className="flex h-full items-center justify-center bg-card/20 overflow-hidden rounded-lg"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
          maxWidth: "100%",
          height: "300px",
        }}
        ref={carouselRef}
      >
        <motion.div
          drag={isCarouselActive && cards.length > 0 ? "x" : false}
          className="relative flex h-full origin-center cursor-grab active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) => {
            if (isCarouselActive && cards.length > 0) {
              // Reduced sensitivity for more controlled movement
              rotation.set(rotation.get() + info.offset.x * 0.1)
            }
          }}
          onDragEnd={handleDragEnd}
          animate={controls}
        >
          {cards.map((imgUrl, i) => (
            <motion.div
              key={`carousel-item-${i}-${imgUrl}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl bg-card/20 p-2"
              style={{
                width: `${faceWidth}px`,
                transform: `rotateY(${
                  i * (360 / faceCount)
                }deg) translateZ(${radius}px)`,
              }}
              onClick={() => handleClick(imgUrl, i)}
            >
              <motion.img
                src={imgUrl}
                alt={`image_${i}`}
                layoutId={`img-${imgUrl}`}
                className="pointer-events-none h-full w-full rounded-xl object-cover"
                initial={{ filter: "blur(4px)" }}
                layout="position"
                animate={{ filter: "blur(0px)" }}
                transition={transition}
              />
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }
)

function ThreeDPhotoCarousel({ imageUrls }: { imageUrls: string[] }) {
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()
  
  // Make sure we have valid URLs
  const cards = imageUrls?.filter(url => url && url.trim() !== '') || []

  const handleClick = (imgUrl: string) => {
    setActiveImg(imgUrl)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveImg(null)
    setIsCarouselActive(true)
  }

  // If we don't have enough images, don't render the carousel
  if (!cards || cards.length < 3) {
    return null;
  }

  return (
    <motion.div layout className="relative" style={{ height: "300px" }}>
      <AnimatePresence mode="sync">
        {activeImg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeImg}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 z-50 m-5 flex items-center justify-center rounded-3xl bg-black bg-opacity-70 md:m-36 lg:mx-[19rem]"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.img
              layoutId={`img-${activeImg}`}
              src={activeImg}
              className="max-h-full max-w-full rounded-lg shadow-lg"
              initial={{ scale: 0.5 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.5,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1],
              }}
              style={{
                willChange: "transform",
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
      <div className="relative h-[300px] w-full overflow-hidden rounded-xl">
        <Carousel
          handleClick={handleClick}
          controls={controls}
          cards={cards}
          isCarouselActive={isCarouselActive}
        />
      </div>
    </motion.div>
  )
}

export { ThreeDPhotoCarousel };
