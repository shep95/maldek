
"use client"

import { memo, useEffect, useLayoutEffect, useMemo, useState, useRef } from "react"
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
    autoSpin = true, // Add a new prop for auto-spinning
    autoSpinSpeed = 0.05, // Speed of auto-spin in degrees per frame
  }: {
    handleClick: (imgUrl: string, index: number) => void
    controls: any
    cards: string[]
    isCarouselActive: boolean
    autoSpin?: boolean
    autoSpinSpeed?: number
  }) => {
    const isScreenSizeSm = useMediaQuery("(max-width: 640px)")
    const cylinderWidth = isScreenSizeSm ? 600 : 1000
    const faceCount = cards.length
    const faceWidth = cylinderWidth / faceCount
    const radius = cylinderWidth / (2 * Math.PI)
    const rotation = useMotionValue(0)
    const transform = useTransform(
      rotation,
      (value) => `rotate3d(0, 1, 0, ${value}deg)`
    )
    const carouselMounted = useRef(false);
    const isUserInteracting = useRef(false);
    const autoRotationRef = useRef<number | null>(null);

    // Calculate how much rotation equals one card movement
    const stepRotation = 360 / faceCount
    
    // Fix the animation control mounting issue
    useEffect(() => {
      carouselMounted.current = true;
      return () => {
        carouselMounted.current = false;
        if (autoRotationRef.current !== null) {
          cancelAnimationFrame(autoRotationRef.current);
        }
      };
    }, []);

    // Auto-spin animation
    useEffect(() => {
      if (!autoSpin || !isCarouselActive || !carouselMounted.current) return;
      
      let lastTime = 0;
      
      const animateRotation = (time: number) => {
        if (!carouselMounted.current) return;
        
        // Skip animation when user is interacting
        if (!isUserInteracting.current) {
          // Smooth animation based on time difference
          if (lastTime) {
            const delta = time - lastTime;
            // Update rotation value - slower speed for smoother rotation
            rotation.set(rotation.get() + (autoSpinSpeed * delta / 16));
          }
          lastTime = time;
        }
        
        autoRotationRef.current = requestAnimationFrame(animateRotation);
      };
      
      autoRotationRef.current = requestAnimationFrame(animateRotation);
      
      return () => {
        if (autoRotationRef.current !== null) {
          cancelAnimationFrame(autoRotationRef.current);
          autoRotationRef.current = null;
        }
      };
    }, [autoSpin, isCarouselActive, rotation, autoSpinSpeed]);

    const handleDragEnd = (_, info) => {
      if (isCarouselActive && carouselMounted.current) {
        const targetRotation = Math.round(rotation.get() / stepRotation) * stepRotation;
        controls.start({
          rotateY: targetRotation,
          transition: {
            type: "spring",
            stiffness: 100,
            damping: 30,
            mass: 0.1,
          },
        });
      }
    };

    return (
      <div
        className="flex h-full items-center justify-center bg-card/50 overflow-hidden rounded-lg"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform",
          maxWidth: "100%",
        }}
      >
        <motion.div
          drag={isCarouselActive ? "x" : false}
          className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing"
          style={{
            transform,
            rotateY: rotation,
            width: cylinderWidth,
            transformStyle: "preserve-3d",
          }}
          onDrag={(_, info) => {
            if (isCarouselActive) {
              // Reduced sensitivity for more controlled movement - one swipe moves roughly one card
              rotation.set(rotation.get() + info.offset.x * 0.015);
            }
          }}
          onDragStart={() => {
            isUserInteracting.current = true;
          }}
          onDragEnd={(e, info) => {
            isUserInteracting.current = false;
            handleDragEnd(e, info);
          }}
          onHoverStart={() => {
            isUserInteracting.current = true;
          }}
          onHoverEnd={() => {
            isUserInteracting.current = false;
          }}
          animate={controls}
        >
          {cards.map((imgUrl, i) => (
            <motion.div
              key={`key-${imgUrl}-${i}`}
              className="absolute flex h-full origin-center items-center justify-center rounded-xl bg-card/50 p-2"
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
                className="pointer-events-none w-full rounded-xl object-cover aspect-square"
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

function ThreeDPhotoCarousel({ 
  imageUrls,
  autoSpin = true,
  autoSpinSpeed = 0.05
}: { 
  imageUrls: string[];
  autoSpin?: boolean;
  autoSpinSpeed?: number;
}) {
  const [activeImg, setActiveImg] = useState<string | null>(null)
  const [isCarouselActive, setIsCarouselActive] = useState(true)
  const controls = useAnimation()
  const cards = useMemo(() => imageUrls, [imageUrls])
  const carouselMounted = useRef(false);

  const handleClick = (imgUrl: string) => {
    setActiveImg(imgUrl)
    setIsCarouselActive(false)
    controls.stop()
  }

  const handleClose = () => {
    setActiveImg(null)
    setIsCarouselActive(true)
  }

  useEffect(() => {
    carouselMounted.current = true;
    return () => {
      carouselMounted.current = false;
    };
  }, []);

  if (!imageUrls || imageUrls.length < 3) {
    return null;
  }

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {activeImg && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0 }}
            layoutId={`img-container-${activeImg}`}
            layout="position"
            onClick={handleClose}
            className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 m-5 md:m-36 lg:mx-[19rem] rounded-3xl"
            style={{ willChange: "opacity" }}
            transition={transitionOverlay}
          >
            <motion.img
              layoutId={`img-${activeImg}`}
              src={activeImg}
              className="max-w-full max-h-full rounded-lg shadow-lg"
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
          autoSpin={autoSpin}
          autoSpinSpeed={autoSpinSpeed}
        />
      </div>
    </motion.div>
  )
}

export { ThreeDPhotoCarousel };
