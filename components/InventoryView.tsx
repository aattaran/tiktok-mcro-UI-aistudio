import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { PRODUCTS } from '../constants';
import { Sparkles, Box, BrainCircuit, Type, FileText, Send, Wand2, ArrowRight } from 'lucide-react';
import { Product } from '../types';

type OptimizationField = 'title' | 'description';

export const InventoryView: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(PRODUCTS[0]);
  const [activeField, setActiveField] = useState<OptimizationField>('title');
  const [userPrompt, setUserPrompt] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Reset local state when switching products or fields
  useEffect(() => {
    setGeneratedContent(null);
    setUserPrompt('');
  }, [selectedProduct, activeField]);

  const handleGenerate = async () => {
    if (!selectedProduct) return;

    setIsGenerating(true);
    setGeneratedContent(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const currentContent = activeField === 'title' ? selectedProduct.title : selectedProduct.description;
      
      const prompt = `
        Task: Rewrite the product ${activeField} for an e-commerce listing.
        
        Product Context:
        SKU: ${selectedProduct.sku}
        Current ${activeField}: "${currentContent}"
        Price: $${selectedProduct.price}
        
        User Instructions: ${userPrompt || "Optimize for higher conversion and SEO."}
        
        Output: Only return the new ${activeField} text. Do not include quotes or explanations.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-latest',
        contents: prompt,
      });

      if (response.text) {
        setGeneratedContent(response.text.trim());
      }
    } catch (error) {
      console.error("Generation failed", error);
      setGeneratedContent("Error generating content. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* Left: Product List Table */}
      <div className="flex-1 glass-panel rounded-2xl p-6 overflow-hidden flex flex-col transition-all">
        <h2 className="text-xl font-medium text-white mb-6 flex items-center gap-2">
          <Box className="w-5 h-5 text-neon-cyan" />
          Inventory Matrix
        </h2>
        <div className="overflow-auto flex-1 pr-2">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                <th className="pb-3 pl-2">Product</th>
                <th className="pb-3 hidden xl:table-cell">SKU</th>
                <th className="pb-3">Price</th>
                <th className="pb-3">Stock</th>
                <th className="pb-3">Status</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {PRODUCTS.map((product) => (
                <tr
                  key={product.id}
                  onClick={() => setSelectedProduct(product)}
                  className={`
                    group cursor-pointer transition-all duration-300 border-b border-white/5 last:border-0
                    ${selectedProduct?.id === product.id ? 'bg-white/10 border-l-2 border-l-neon-cyan' : 'hover:bg-white/5 border-l-2 border-l-transparent'}
                  `}
                >
                  <td className="py-4 pl-2">
                    <div className="flex items-center gap-3">
                      <img src={product.image} alt="" className="w-10 h-10 rounded-lg object-cover bg-zinc-800" />
                      <div className="flex flex-col">
                        <span className={`font-medium transition-colors ${selectedProduct?.id === product.id ? 'text-white' : 'text-zinc-400 group-hover:text-zinc-200'}`}>
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
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: AI Operations Panel */}
      <div className="w-[480px] flex flex-col gap-6">
        <div className="glass-panel rounded-2xl h-full relative overflow-hidden flex flex-col">
          
          {/* Panel Background Effects */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-neon-cyan/5 blur-[80px] rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[200px] h-[200px] bg-neon-pink/5 blur-[80px] rounded-full pointer-events-none" />

          {selectedProduct ? (
            <div className="relative z-10 flex flex-col h-full p-0">
              {/* Header */}
              <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-black border border-white/10 flex items-center justify-center">
                    <BrainCircuit className="w-5 h-5 text-neon-cyan" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-white">Generative Editor</h3>
                    <p className="text-xs text-zinc-500">Powered by Gemini 2.5 Flash</p>
                  </div>
                </div>
                <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-zinc-400 font-mono">
                  {selectedProduct.sku}
                </div>
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
                
                {/* Current Value Section */}
                <div className="space-y-2">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">
                    Current {activeField}
                  </label>
                  <div className="p-4 rounded-xl bg-black/40 border border-white/5 text-zinc-400 text-sm leading-relaxed relative group">
                    {activeField === 'title' ? selectedProduct.title : selectedProduct.description}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[10px] bg-zinc-800 text-zinc-400 px-2 py-1 rounded">Original</span>
                    </div>
                  </div>
                </div>

                {/* Arrow Divider */}
                <div className="flex justify-center text-zinc-700">
                  <ArrowRight className="w-5 h-5 rotate-90" />
                </div>

                {/* Prompt Input Section */}
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
                      onClick={handleGenerate}
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

                {/* Result Section */}
                {(generatedContent || isGenerating) && (
                  <div className="animate-[fadeIn_0.5s_ease-out]">
                    <label className="text-xs text-emerald-400 uppercase tracking-wider font-semibold mb-2 block">
                      Generated Result
                    </label>
                    <div className={`
                      min-h-[100px] rounded-xl border relative overflow-hidden transition-all duration-500
                      ${generatedContent 
                        ? 'bg-gradient-to-br from-emerald-500/5 to-transparent border-emerald-500/30' 
                        : 'bg-zinc-900/30 border-zinc-800 border-dashed'}
                    `}>
                      {isGenerating && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 backdrop-blur-sm z-10 bg-black/20">
                           <div className="w-12 h-1 overflow-hidden bg-zinc-800 rounded-full">
                             <div className="w-full h-full bg-neon-cyan origin-left animate-[progress_1s_ease-in-out_infinite]" />
                           </div>
                           <span className="text-xs text-neon-cyan font-mono animate-pulse">Thinking...</span>
                        </div>
                      )}
                      
                      {generatedContent && (
                        <div className="p-4">
                          <p className="text-sm text-white leading-relaxed whitespace-pre-wrap">{generatedContent}</p>
                          <div className="mt-4 flex justify-end">
                            <button className="text-xs flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 rounded-lg border border-emerald-500/20 transition-all">
                              <Wand2 className="w-3 h-3" />
                              Apply Change
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 gap-4">
               <div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800">
                  <Box className="w-6 h-6 opacity-50" />
               </div>
               <p className="text-sm">Select a product to start editing</p>
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
