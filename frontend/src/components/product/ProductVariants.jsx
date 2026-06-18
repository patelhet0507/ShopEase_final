import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check } from 'lucide-react'

export default function ProductVariants({ product, onVariantSelect }) {
  // 🟢 FIX: Track separate selections for each unique variant type group
  const [selections, setSelections] = useState({})

  if (!product || !product.variants || product.variants.length === 0) {
    return null
  }

  // Group variants by type safely
  const variantsByType = {}
  product.variants.forEach(variant => {
    if (!variant || !variant.type) return
    if (!variantsByType[variant.type]) {
      variantsByType[variant.type] = []
    }
    variantsByType[variant.type].push(variant)
  })

  const groupKeys = Object.keys(variantsByType)

  const handleSelectVariant = (type, variant) => {
    const updatedSelections = {
      ...selections,
      [type]: variant
    }
    setSelections(updatedSelections)

    // If a user made choices across every option group, pass the complete selection back up
    if (Object.keys(updatedSelections).length === groupKeys.length) {
      onVariantSelect?.(updatedSelections)
    }
  }

  // Check if a color string is valid to render as a background block
  const isColorHexOrNamed = (str) => {
    if (!str) return false
    return str.startsWith('#') || ['red', 'blue', 'green', 'yellow', 'black', 'white', 'silver', 'purple', 'orange', 'pink', 'gold', 'grey'].includes(str.toLowerCase())
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 bg-surface border border-border p-6 rounded-[24px] shadow-sm text-primary"
    >
      <div>
        <h3 className="font-display font-bold text-lg text-primary">Customize Options</h3>
        <p className="text-xs text-muted mt-0.5">Select from available variants below</p>
      </div>

      {Object.entries(variantsByType).map(([type, variants]) => {
        const currentSelection = selections[type]

        return (
          <div key={type} className="space-y-3">
            <label className="block text-xs uppercase font-bold tracking-wider text-secondary capitalize">
              Select {type}
            </label>

            <div className="flex flex-wrap gap-3">
              {variants.map((variant) => {
                const isSelected = currentSelection?.id === variant.id
                const isColorType = type.toLowerCase() === 'color' && isColorHexOrNamed(variant.value)

                return (
                  <motion.button
                    key={variant.id}
                    onClick={() => handleSelectVariant(type, variant)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative px-4 py-2.5 rounded-xl border font-medium text-sm transition-all flex items-center gap-2 ${
                      isSelected
                        ? 'border-purple-500 bg-purple-500/10 text-primary shadow-sm shadow-purple-500/5'
                        : 'border-border bg-surface-raised text-secondary hover:border-subtle'
                    }`}
                  >
                    {/* 🟢 SWATCH ADDITION: Render color dot indicator if variant is a color */}
                    {isColorType && (
                      <span 
                        className="w-4 h-4 rounded-full border border-black/20 block flex-shrink-0 shadow-inner"
                        style={{ backgroundColor: variant.value }}
                      />
                    )}

                    <span>{variant.value}</span>

                    {variant.price_adjustment > 0 && (
                      <span className={`text-xs font-bold ${isSelected ? 'text-purple-400' : 'text-purple-500/80'}`}>
                        +₹{Number(variant.price_adjustment).toLocaleString()}
                      </span>
                    )}
                  </motion.button>
                )
              })}
            </div>

            {/* 🟢 CONTEXT SENSITIVE STOCK CHECK: Scoped accurately to this specific option group */}
            {currentSelection && currentSelection.stock <= 5 && (
              <p className="text-xs text-orange-500 font-medium flex items-center gap-1 bg-orange-500/5 border border-orange-500/10 px-3 py-1.5 rounded-lg w-max">
                <span>⚠️ Only {currentSelection.stock} units remaining in stock</span>
              </p>
            )}
          </div>
        )
      })}

      {/* Complete verification banner shows only when all fields are completed */}
      <AnimatePresence>
        {Object.keys(selections).length === groupKeys.length && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-emerald-500/5 border border-emerald-500/20 text-emerald-400 rounded-xl p-3 flex items-center gap-2 text-xs font-semibold"
          >
            <Check size={14} className="text-emerald-400" />
            <span>All options configured successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}