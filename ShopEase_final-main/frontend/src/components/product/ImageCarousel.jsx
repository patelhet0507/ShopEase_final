import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export default function ImageCarousel({ images = [] }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState(0)

  // Handle empty images
  const imageList = images && images.length > 0 ? images : [
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop'
  ]

  const slideVariants = {
    enter: (dir) => ({
      x: dir > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (dir) => ({
      zIndex: 0,
      x: dir < 0 ? 1000 : -1000,
      opacity: 0
    })
  }

  const paginate = (newDirection) => {
    setDirection(newDirection)
    setCurrentIndex((prev) => (prev + newDirection + imageList.length) % imageList.length)
  }

  useEffect(() => {
    const timer = setInterval(() => paginate(1), 5000)
    return () => clearInterval(timer)
  }, [imageList.length])

  return (
    <div className="relative w-full aspect-square bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl overflow-hidden group">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.img
          key={currentIndex}
          src={imageList[currentIndex]}
          alt={`Product image ${currentIndex + 1}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </AnimatePresence>

      {/* Navigation Buttons */}
      {imageList.length > 1 && (
        <>
          <motion.button
            onClick={() => paginate(-1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} className="font-bold" />
          </motion.button>

          <motion.button
            onClick={() => paginate(1)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/90 hover:bg-white text-slate-900 p-3 rounded-full shadow-lg transition opacity-0 group-hover:opacity-100"
            aria-label="Next image"
          >
            <ChevronRight size={24} className="font-bold" />
          </motion.button>
        </>
      )}

      {/* Thumbnail Strip */}
      {imageList.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 bg-white/80 backdrop-blur-sm p-3 rounded-full">
          {imageList.map((_, idx) => (
            <motion.button
              key={idx}
              onClick={() => {
                setDirection(idx > currentIndex ? 1 : -1)
                setCurrentIndex(idx)
              }}
              className={`w-2 h-2 rounded-full transition ${
                idx === currentIndex ? 'bg-blue-600 w-8' : 'bg-slate-300 hover:bg-slate-400'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to image ${idx + 1}`}
            />
          ))}
        </div>
      )}

      {/* Counter */}
      {imageList.length > 1 && (
        <div className="absolute top-4 right-4 z-20 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {currentIndex + 1} / {imageList.length}
        </div>
      )}
    </div>
  )
}
