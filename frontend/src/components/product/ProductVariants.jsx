import { useState } from 'react'
import { motion } from 'framer-motion'

export default function ProductVariants({ product, onVariantSelect }) {
  const [selectedVariant, setSelectedVariant] = useState(null)

  if (!product.variants || product.variants.length === 0) {
    return null
  }

  // Group variants by type
  const variantsByType = {}
  product.variants.forEach(variant => {
    if (!variantsByType[variant.type]) {
      variantsByType[variant.type] = []
    }
    variantsByType[variant.type].push(variant)
  })

  const handleSelectVariant = (variant) => {
    setSelectedVariant(variant.id)
    onVariantSelect?.(variant)
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-slate-50 p-6 rounded-xl"
    >
      <h3 className="text-xl font-bold text-slate-900">Choose Options</h3>

      {Object.entries(variantsByType).map(([type, variants]) => (
        <div key={type} className="space-y-3">
          <label className="block text-sm font-semibold text-slate-900 capitalize">
            {type}
          </label>

          <div className="flex flex-wrap gap-3">
            {variants.map((variant, idx) => (
              <motion.button
                key={variant.id}
                onClick={() => handleSelectVariant(variant)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-4 py-2 rounded-lg border-2 font-semibold transition ${
                  selectedVariant === variant.id
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-300 bg-white text-slate-900 hover:border-slate-400'
                }`}
              >
                {variant.value}
                {variant.price_adjustment > 0 && (
                  <span className="text-xs ml-1 text-blue-600 font-bold">
                    +₹{variant.price_adjustment}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

          {selectedVariant && variants.find(v => v.id === selectedVariant)?.stock <= 5 && (
            <p className="text-xs text-orange-600 font-semibold">
              ⚠ Only {variants.find(v => v.id === selectedVariant)?.stock} in stock
            </p>
          )}
        </div>
      ))}

      {selectedVariant && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white border-2 border-green-300 rounded-lg p-3"
        >
          <p className="text-sm text-green-700 font-semibold">✓ Variant selected</p>
        </motion.div>
      )}
    </motion.div>
  )
}
