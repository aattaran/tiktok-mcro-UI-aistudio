import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from '../constants';
import { Sparkles, Box, BrainCircuit, Type, FileText, Send, Wand2, ArrowRight, CheckSquare, Square, Check, RefreshCw, GripVertical } from 'lucide-react';
import { Product } from '../types';

type OptimizationField = 'title' | 'description';

export const InventoryView: React.FC = () => {
  // Local state for products to support "Applying" changes
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set([PRODUCTS[0].id]));
  
  // Editor state
  const [activeField, setActiveField] = useState<OptimizationField>('title');
  const [userPrompt, setUserPrompt] = useState('');
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResults, setGeneratedResults] = useState<Record<string, string>>({}); // Map productId -> generatedText

  // Resizable Panel State
  const [panelWidth, setPanelWidth] = useState(480);
  const [isResizing, setIsResizing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Derived state
  const selectedCount = selectedIds.size;
  const isBulk = selectedCount > 1;
  const singleProduct = selectedCount === 1 
    ? products.find(p => p.id === Array.from(selectedIds)[0]) 
    : null;

  // Clear generation results when selection changes
  useEffect(() => {
    setGeneratedResults({});
  }, [selectedIds, activeField]);

  // Resizing Logic
  const startResizing = useCallback((mouseDownEvent: React.MouseEvent) => {
    setIsResizing(true);
    mouseDownEvent.preventDefault();
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback(
    (mouseMoveEvent: MouseEvent) => {
      if (isResizing && containerRef.current) {
        const containerRect = containerRef.current.getBoundingClientRect();
        // Calculate width from the right side of the container
        const newWidth = containerRect.right - mouseMoveEvent.clientX;
        
        // Constraints
        const minWidth = 320; // Minimum width for AI panel
        const maxWidth = containerRect.width - 400; // Keep at least 400px for table
        
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setPanelWidth(newWidth);
        }
      }
    },
    [isResizing]
  );

  useEffect(() => {
    if (isResizing) {
      window.addEventListener("mousemove", resize);
      window.addEventListener("mouseup", stopResizing);
    }
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  // Toggle single ID selection
  const toggleSelection = (id: string, multiSelect: boolean) => {
    const newSet = new Set(multiSelect ? selectedIds : []);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    // Prevent empty selection if possible, or handle empty state
    if (newSet.size === 0 && !multiSelect) {
        newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === products.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(products.map(p => p.id)));
    }
  };

  const applyChange = (id: string, newValue: string) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, [activeField]: newValue } : p
    ));
    // Clear the result for this item after applying
    const newResults = { ...generatedResults };
    delete newResults[id];
    setGeneratedResults(newResults);
  };

  const generateContent = async (targetProducts: Product[]) => {
    setIsGenerating(true);
    
    // Reset results for the targets being regenerated
    const initialResults = { ...generatedResults };
    targetProducts.forEach(p => delete initialResults[p.id]);
    setGeneratedResults(initialResults);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use type assertion for global access
      const aiStudio = (window as any).aistudio;

      // Create promises for parallel generation
      const promises = targetProducts.map(async (product) => {
        const currentContent = activeField === 'title' ? product.title : product.description;
        const prompt = `
          Task: Rewrite the product ${activeField} for an e-commerce listing.
          
          Product Context:
          SKU: ${product.sku}
          Current ${activeField}: "${currentContent}"
          Price: $${product.price}
          
          User Instructions: ${userPrompt || "Optimize for higher conversion and SEO."}
          
          Output: Only return the new ${activeField} text. Do not include quotes or explanations.
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: prompt,
        });

        return { id: product.id, text: response.text?.trim() };
      });

      const results = await Promise.all(promises);
      
      const newResults = { ...initialResults };
      results.forEach(r => {
        if (r.text) newResults[r.id] = r.text;
      });
      setGeneratedResults(newResults);

    } catch (error: any) {
      console.error("Generation failed", error);
      const aiStudio = (window as any).aistudio;
      const errorMessage = error.message || error.toString();
      
      if (errorMessage.includes("Requested entity was not found") && aiStudio?.openSelectKey) {
          await aiStudio.openSelectKey();
          // Ideally retry here, but for now just alert
          alert("API Key refreshed. Please try again.");
      }
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full w-full" ref={containerRef}>
      {/* Left: Product List Table */}
      <div className="flex-1 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col transition-all min-w-[400px]">
        <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
          <Box className="w-5 h-5 text-neon-cyan" />
          Inventory Matrix
        </h2>
        <div className="overflow-auto flex-1 pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 pl-2 w-10">
                    <button onClick={handleSelectAll} className="hover:text-white transition-colors">
                        {selectedIds.size === products.length && products.length > 0 ? (
                            <CheckSquare className="w-4 h-4 text-neon-cyan" />
                        ) : (
                            <Square className="w-4 h-4" />
                        )}
                    </button>
                </th>
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3 hidden xl:table-cell">SKU</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {products.map((product) => {
                const isSelected = selectedIds.has(product.id);
                return (
                  <tr
                    key={product.id}
                    onClick={() => {
                        setSelectedIds(new Set([product.id]));
                    }}
                    className={`
                      group cursor-pointer transition-all duration-300 border-b border-white/5 last:border-0
                      ${isSelected ? 'bg-white/10 border-l-2 border-l-neon-cyan' : 'hover:bg-white/5 border-l-2 border-l-transparent'}
                    `}
                  >
                    <td className="py-4 pl-2" onClick={(e) => {
                        e.stopPropagation();
                        toggleSelection(product.id, true);
                    }}>
                        <div className="w-4 h-4 text-zinc-500 group-hover:text-white transition-colors">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-neon-cyan" /> : <Square className="w-4 h-4" />}
                        </div>
                    </td>
                    <td className="py-4 pl-2">
                      <div className="flex items-center gap-3">
                        <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                        <div className="flex flex-col">
                          <span className={`font-medium transition-colors ${isSelected ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
                            {product.title.substring(0, 30)}...
                          </span>
                          <span className="xl:hidden text-[10px] text-zinc-600 font-mono mt-0.5">{product.sku}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 text-zinc-500 font-mono text-xs hidden xl:table-cell">{product.sku}</td>
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
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Resizer Handle */}
      <div 
        className={`
            w-4 flex items-center justify-center cursor-col-resize group hover:bg-white/5 transition-colors select-none z-20
            ${isResizing ? 'bg-white/10' : ''}
        `}
        onMouseDown={startResizing}
      >
        <div className={`w-[1px] h-12 bg-zinc-700 group-hover:bg-neon-cyan group-hover:shadow-[0_0_10px_#00f2ea] transition-all ${isResizing ? 'bg-neon-cyan shadow-[0_0_15px_#00f2ea] h-full' : ''}`} />
        <GripVertical className={`w-3 h-3 text-zinc-600 absolute opacity-0 group-hover:opacity-100 transition-opacity ${isResizing ? 'opacity-100 text-neon-cyan' : ''}`} />
      </div>

      {/* Right: AI Operations Panel */}
      <div style={{ width: panelWidth }} className="flex flex-col gap-6 flex-shrink-0">
        <div className="glass-panel rounded-2xl h-full relative overflow-hidden flex flex-col">
          
          {/* Panel Background Effects */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-cyan/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-neon-pink/5 blur-[80px] rounded-full pointer-events-none" />

          {selectedCount > 0 ? (
            <div className="relative z-10 flex flex-col h-full p-0">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">
                        {isBulk ? 'Bulk AI Editor' : 'Generative Editor'}
                    </h3>
                    <p className="text-xs text-zinc-500">
                        {isBulk ? `${selectedCount} items selected` : 'Powered by Gemini 3 Flash'}
                    </p>
                  </div>
                </div>
                {!isBulk && singleProduct && (
                    <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-mono">
                    {singleProduct.sku}
                    </div>
                )}
              </div>

              {/* Tabs for Field Selection */}
              <div className="flex p-2 gap-2 border-b border-white/5 bg-black/20">
                <button 
                  onClick={() => setActiveField('title')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all
                  ${activeField === 'title' 
                    ? 'bg-zinc-800 text-white shadow-lg border border-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                >
                  <Type className="w-3.5 h-3.5" />
                  Title
                </button>
                <button 
                  onClick={() => setActiveField('description')}
                  className={`flex-1 py-2.5 rounded-lg text-xs font-medium flex items-center justify-center gap-2 transition-all
                  ${activeField === 'description' 
                    ? 'bg-zinc-800 text-white shadow-lg border border-white/10' 
                    : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'}`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  Description
                </button>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                
                {/* Single Item - Current Value Section */}
                {!isBulk && singleProduct && (
                    <>
                    <div className="space-y-2">
                        <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                            Current {activeField}
                        </label>
                        <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-zinc-400 text-sm leading-relaxed relative group">
                            {activeField === 'title' ? singleProduct.title : singleProduct.description}
                            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Original</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center text-zinc-700">
                        <ArrowRight className="w-5 h-5 rotate-90" />
                    </div>
                    </>
                )}

                {/* Bulk - Summary */}
                {isBulk && (
                    <div className="p-4 rounded-xl bg-neon-cyan/5 border border-neon-cyan/20 text-neon-cyan/80 text-sm flex items-center gap-3">
                        <Sparkles className="w-4 h-4" />
                        You are editing {activeField}s for {selectedCount} products.
                    </div>
                )}

                {/* Prompt Input Section - Shared */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                     <label className="text-xs text-neon-cyan uppercase tracking-wider font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        AI Prompt
                      </label>
                      <span className="text-[10px] text-zinc-500">Instruct the model</span>
                  </div>
                  
                  <div className="relative">
                    <textarea 
                      value={userPrompt}
                      onChange={(e) => setUserPrompt(e.target.value)}
                      placeholder={`E.g., "Make it punchy and sales-focused", "Include keyword 'ergonomic'", "Use a professional tone"`}
                      className="w-full h-24 bg-zinc-900/50 border border-zinc-700/50 rounded-xl p-4 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-neon-cyan/50 focus:ring-1 focus:ring-neon-cyan/50 transition-all resize-none"
                    />
                    <button 
                      onClick={() => {
                        const targets = products.filter(p => selectedIds.has(p.id));
                        generateContent(targets);
                      }}
                      disabled={isGenerating}
                      className={`
                        absolute bottom-3 right-3 p-2 rounded-lg flex items-center justify-center transition-all duration-300
                        ${isGenerating 
                          ? 'bg-zinc-800 cursor-not-allowed text-zinc-500' 
                          : 'bg-neon-cyan text-black hover:bg-cyan-300 hover:scale-105 hover:shadow-[0_0_15px_rgba(0,242,234,0.3)]'}
                      `}
                    >
                      {isGenerating ? (
                        <div className="w-4 h-4 border-2 border-zinc-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Results Section */}
                <div className="space-y-4">
                    {/* Render results for all selected products (bulk or single) */}
                    {products.filter(p => selectedIds.has(p.id)).map(product => {
                        const result = generatedResults[product.id];
                        // If we are generating, show loading placeholder for this item
                        // If we have a result, show the result card
                        // If neither, show nothing (unless in single mode, handled differently above, but let's unify)
                        
                        if (!result && !isGenerating) return null;

                        return (
                            <div key={product.id} className="animate-[fadeIn_0.5s_ease-out]">
                                {isBulk && (
                                    <div className="text-[10px] text-zinc-500 mb-1 font-mono flex justify-between">
                                        <span>{product.sku}</span>
                                        <span className="truncate max-w-[150px]">{product.title}</span>
                                    </div>
                                )}
                                
                                <div className={`
                                min-h-[80px] rounded-xl border relative overflow-hidden transition-all duration-500
                                ${result 
                                    ? 'bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/30' 
                                    : 'bg-zinc-900/30 border-zinc-800 border-dashed'}
                                `}>
                                {isGenerating && !result && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 backdrop-blur-sm z-10 bg-black/20">
                                        <div className="w-8 h-0.5 overflow-hidden bg-zinc-800 rounded-full">
                                            <div className="w-full h-full bg-neon-cyan origin-left animate-[progress_1s_ease-in-out_infinite]" />
                                        </div>
                                    </div>
                                )}
                                
                                {result && (
                                    <div className="p-4">
                                        <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{result}</p>
                                        <div className="mt-3 flex justify-end">
                                            <button 
                                                onClick={() => applyChange(product.id, result)}
                                                className="text-[10px] flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all"
                                            >
                                                <Check className="w-3 h-3" />
                                                Apply
                                            </button>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-4">
               <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Box className="w-6 h-6 opacity-50" />
               </div>
               <p className="text-sm">Select products to start editing</p>
            </div>
          )}
        </div>
      </div>
      
      <style>{`
        @keyframes progress {
          0% { transform: scaleX(0); }
          50% { transform: scaleX(0.5); }
          100% { transform: scaleX(0); transform-origin: right; }
        }
      `}</style>
    </div>
  );
};
