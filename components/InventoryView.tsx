import React, { useState } from 'react';
import { PRODUCTS } from '../constants';
import { Sparkles, ArrowRight, Box, BrainCircuit, Check } from 'lucide-react';
import { Product } from '../types';

export const InventoryView: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS[0]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [hasOptimized, setHasOptimized] = useState(false);

  const handleOptimize = () => {
    setIsOptimizing(true);
    setHasOptimized(false);
    setTimeout(() => {
      setIsOptimizing(false);
      setHasOptimized(true);
    }, 1500);
  };

  return (
    <div className="flex h-full gap-6">
      {/* Product List Table */}
      <div className="flex-1 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col">
        <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
          <Box className="w-5 h-5 text-neon-cyan" />
          Inventory Matrix
        </h2>
        <div className="overflow-auto flex-1 pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3">SKU</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {PRODUCTS.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => {
                    setSelectedProduct(product);
                    setHasOptimized(false);
                  }}
                  className={`
                    group cursor-pointer transition-all duration-300 border-b border-white/5 last:border-0
                    ${selectedProduct?.id === product.id ? 'bg-white/5' : 'hover:bg-white/5'}
                  `}
                >
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                      <span className={`font-medium ${selectedProduct?.id === product.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                        {product.title.substring(0, 25)}...
                      </span>
                    </div>
                  </td>
                  <td className="py-4 text-zinc-500 font-mono text-xs">{product.sku}</td>
                  <td className="py-4 text-zinc-300">${product.price}</td>
                  <td className="py-4 text-zinc-300">{product.stock}</td>
                  <td className="py-4">
                    <span className={`
                      px-2 py-1 rounded-full text-[10px] font-bold tracking-wide
                      ${product.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'}
                    `}>
                      {product.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Panel */}
      <div className="w-[400px] flex flex-col gap-6">
        <div className="glass-panel rounded-2xl p-6 h-full relative overflow-hidden group">
          {/* Decorative Glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-cyan/20 blur-[60px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-medium text-white flex items-center gap-2">
                <BrainCircuit className="w-5 h-5 text-neon-pink" />
                MCRO AI Optimizer
              </h3>
              <div className="text-[10px] bg-white/10 px-2 py-0.5 rounded text-zinc-400 border border-white/10">v2.5.0</div>
            </div>

            {selectedProduct ? (
              <div className="flex-1 flex flex-col gap-6">
                <div>
                  <label className="text-xs text-zinc-500 uppercase tracking-wider mb-2 block">Current Title</label>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-zinc-400 text-sm leading-relaxed">
                    {selectedProduct.title}
                  </div>
                </div>

                <div className="flex items-center justify-center py-2">
                  <ArrowRight className="w-5 h-5 text-zinc-600 rotate-90 md:rotate-0" />
                </div>

                <div className="relative">
                  <label className="text-xs text-neon-cyan uppercase tracking-wider mb-2 block flex items-center gap-2">
                    <Sparkles className="w-3 h-3" />
                    AI Suggestion
                  </label>
                  <div className={`
                    p-4 rounded-xl border min-h-[100px] text-sm leading-relaxed transition-all duration-500 relative overflow-hidden
                    ${hasOptimized 
                      ? 'bg-neon-cyan/5 border-neon-cyan/30 text-white shadow-[0_0_15px_rgba(0,242,234,0.1)]' 
                      : 'bg-black/40 border-dashed border-zinc-700 text-zinc-600 flex items-center justify-center'}
                  `}>
                    {isOptimizing && (
                      <div className="absolute inset-0 bg-black/80 flex items-center justify-center backdrop-blur-sm z-20">
                         <div className="flex flex-col items-center gap-2">
                           <div className="w-8 h-8 border-2 border-neon-pink border-t-transparent rounded-full animate-spin"></div>
                           <span className="text-xs text-neon-pink animate-pulse">Analyzing Keywords...</span>
                         </div>
                      </div>
                    )}
                    
                    {hasOptimized ? (
                      <span className="animate-[fadeIn_0.5s_ease-out]">{selectedProduct.optimizedTitle}</span>
                    ) : (
                      !isOptimizing && "Optimization Required"
                    )}
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <button
                    onClick={handleOptimize}
                    disabled={isOptimizing}
                    className={`
                      w-full py-3 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300
                      ${hasOptimized 
                        ? 'bg-zinc-800 text-zinc-400 cursor-not-allowed border border-white/5' 
                        : 'bg-gradient-to-r from-cyan-400 to-pink-500 text-black hover:shadow-[0_0_20px_rgba(0,242,234,0.4)] hover:scale-[1.02]'}
                    `}
                  >
                    {hasOptimized ? (
                      <>
                        <Check className="w-4 h-4" /> Optimized
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 fill-black" /> Optimize Listing
                      </>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-zinc-600 text-sm">
                Select a product to optimize
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
