import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line } from 'recharts';
import { REPRICER_RULES, PRODUCTS } from '../constants';
import { RepricerRule, Product } from '../types';
import { 
  Zap, TrendingDown, DollarSign, Moon, ArrowLeft, Save, Search, 
  BarChart3, Settings2, CheckSquare, Square, Clock, ArrowDownWideNarrow, AlertCircle, CheckCircle2,
  Swords, Shield, Plus, Target, Flame, Rocket, Pencil
} from 'lucide-react';

// --- Types for Simulation ---
interface SimulationDataPoint {
  time: string;
  price: number;
  competitorPrice: number;
  volume: number;
}

// --- Helpers ---

const getIcon = (type: string, className = "w-5 h-5") => {
  switch (type) {
    case 'VELOCITY': return <Zap className={`${className} text-emerald-400`} />;
    case 'LIQUIDATION': return <TrendingDown className={`${className} text-orange-400`} />;
    case 'PROFIT': return <DollarSign className={`${className} text-neon-cyan`} />;
    default: return <Moon className={`${className} text-indigo-400`} />;
  }
};

const getColor = (type: string) => {
  switch (type) {
    case 'VELOCITY': return '#34d399'; // emerald-400
    case 'LIQUIDATION': return '#fb923c'; // orange-400
    case 'PROFIT': return '#00f2ea'; // neon-cyan
    default: return '#818cf8'; // indigo-400
  }
};

export const RepricerView: React.FC = () => {
  // --- View State ---
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'SETTINGS' | 'CREATE'>('LIST');
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null);
  
  // --- Editing State ---
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState('');
  
  // --- Data State ---
  const [rules, setRules] = useState<RepricerRule[]>(REPRICER_RULES);
  const [ruleAssignments, setRuleAssignments] = useState<Record<string, Set<string>>>({
    '1': new Set(['1', '3']), 
  });
  const [searchQuery, setSearchQuery] = useState('');

  // --- Global Settings State ---
  const [globalSettings, setGlobalSettings] = useState({
      minProfitMargin: 15,
      maxDailyDrop: 5,
      ignoreNewSellers: true,
      matchAmazon: false
  });

  // --- Create Strategy Form State ---
  const [newStrategy, setNewStrategy] = useState({
      name: '',
      type: 'PROFIT' as 'PROFIT' | 'VELOCITY' | 'LIQUIDATION',
      description: ''
  });

  // --- Dynamic Configuration State (Detail View) ---
  // "When" Condition
  const [salesThreshold, setSalesThreshold] = useState(5);
  const [periodDays, setPeriodDays] = useState(7);
  
  // "Set Price" Actions
  const [percentDrop, setPercentDrop] = useState(2.5);
  const [percentLimit, setPercentLimit] = useState(15.0);
  const [fixedDrop, setFixedDrop] = useState(0.50);
  const [fixedLimit, setFixedLimit] = useState(5.00);

  // Derived Active Rule
  const activeRule = useMemo(() => 
    rules.find(r => r.id === selectedRuleId), 
  [rules, selectedRuleId]);

  // Sync View Mode with Selection and Reset Edit State
  useEffect(() => {
    if (selectedRuleId) {
        setViewMode('DETAIL');
        setIsEditingName(false);
    } else if (viewMode === 'DETAIL') {
        setViewMode('LIST');
    }
  }, [selectedRuleId]);

  const assignedProductIds = useMemo(() => 
    ruleAssignments[selectedRuleId || ''] || new Set(), 
  [ruleAssignments, selectedRuleId]);

  // --- Real-time Simulation Engine ---
  const simulationResults = useMemo(() => {
    const data: SimulationDataPoint[] = [];
    
    // Initial State
    let myPrice = 100.00;
    let competitorPrice = 100.50; // Starts slightly higher
    const costBasis = 65.00; // Fixed cost assumption for margin calc

    // Accumulators for KPIs
    let totalWinChance = 0;
    let totalMargin = 0;
    let totalVolume = 0;
    const totalSteps = 24;

    // Simulation Loop (24h)
    for (let i = 0; i < totalSteps; i++) {
        // 1. Simulate Competitor Moves (Random Walk + Market Trends)
        const marketNoise = (Math.random() - 0.5) * 2; 
        const marketTrend = Math.sin(i / 6) * 3; 
        competitorPrice = 100.50 + marketTrend + marketNoise;

        // 2. Apply User Strategy (My Price Logic)
        const dropFactor = (percentDrop / 100);
        
        let targetPrice = myPrice;
             
        // Logic: If we are losing buy box, trigger the drop rule
        if (myPrice >= competitorPrice * 0.99) {
            targetPrice = myPrice * (1 - dropFactor) - fixedDrop;
        } else {
            // Strategy behavior
            if (activeRule?.type === 'PROFIT') {
                targetPrice = myPrice * 1.01; 
            } else if (activeRule?.type === 'VELOCITY') {
                targetPrice = Math.min(myPrice, competitorPrice - 0.10);
            }
        }

        // Apply Limits & Global Guardrails
        const maxPercentDrop = 100 * (percentLimit / 100);
        const maxFixedDrop = fixedLimit;
        // Global Setting: Min Margin Floor
        const globalMinMarginPrice = costBasis * (1 + (globalSettings.minProfitMargin / 100));
        
        const floorPrice = Math.max(100 - maxPercentDrop - maxFixedDrop, globalMinMarginPrice);
        
        // Ensure price doesn't go below floor
        myPrice = Math.max(floorPrice, targetPrice);


        // 3. Calculate Win Probability for this step
        const priceDiffPercent = (competitorPrice - myPrice) / competitorPrice;
        let stepWinChance = 0;
        
        if (priceDiffPercent > 0.03) stepWinChance = 95; 
        else if (priceDiffPercent > 0) stepWinChance = 60 + (priceDiffPercent * 1000); 
        else if (priceDiffPercent > -0.02) stepWinChance = 20; 
        else stepWinChance = 0; 

        // 4. Calculate Margin %
        const currentMargin = ((myPrice - costBasis) / myPrice) * 100;

        // 5. Calculate Volume
        const baseVolume = 10;
        const volume = Math.floor(baseVolume * (stepWinChance / 100) * 1.5) + Math.random() * 2;

        // Accumulate
        totalWinChance += stepWinChance;
        totalMargin += currentMargin;
        totalVolume += volume;

        data.push({
            time: `${i}:00`,
            price: parseFloat(myPrice.toFixed(2)),
            competitorPrice: parseFloat(competitorPrice.toFixed(2)),
            volume: volume
        });
    }

    // Averages
    const avgWinRate = Math.min(100, Math.floor(totalWinChance / totalSteps));
    const avgMargin = (totalMargin / totalSteps).toFixed(1);
    const winRateChange = (avgWinRate - 25).toFixed(0); 

    return {
        chartData: data,
        avgWinRate,
        avgMargin,
        winRateChange
    };
  }, [percentDrop, fixedDrop, percentLimit, fixedLimit, activeRule, globalSettings]);

  const { chartData, avgWinRate, avgMargin, winRateChange } = simulationResults;

  // --- Handlers ---
  const toggleProduct = (productId: string) => {
    if (!selectedRuleId) return;
    const newSet = new Set(assignedProductIds);
    if (newSet.has(productId)) newSet.delete(productId);
    else newSet.add(productId);
    setRuleAssignments(prev => ({ ...prev, [selectedRuleId]: newSet }));
  };

  const handleSelectAll = () => {
    if (!selectedRuleId) return;
    const allIds = PRODUCTS.map(p => p.id);
    const newSet = new Set(assignedProductIds.size === allIds.length ? [] : allIds);
    setRuleAssignments(prev => ({ ...prev, [selectedRuleId]: newSet }));
  };

  const handleCreateStrategy = () => {
      const id = (rules.length + 100).toString();
      const newRule: RepricerRule = {
          id,
          name: newStrategy.name || 'Untitled Strategy',
          type: newStrategy.type,
          active: false,
          description: newStrategy.description || 'Custom strategy configuration.'
      };
      setRules([...rules, newRule]);
      setRuleAssignments(prev => ({ ...prev, [id]: new Set() }));
      
      // Reset and Navigate
      setNewStrategy({ name: '', type: 'PROFIT', description: '' });
      setSelectedRuleId(id);
      setViewMode('DETAIL');
  };

  const toggleRuleActive = (e: React.MouseEvent, ruleId: string) => {
      e.stopPropagation();
      setRules(prev => prev.map(r => 
          r.id === ruleId ? { ...r, active: !r.active } : r
      ));
  };

  const handleRename = () => {
    if (activeRule && tempName.trim()) {
        setRules(prev => prev.map(r => r.id === activeRule.id ? { ...r, name: tempName } : r));
    }
    setIsEditingName(false);
  };

  // --- Render Functions ---

  const renderGlobalSettings = () => (
    <div className="h-full flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
        <div className="flex items-center gap-4 shrink-0">
            <button 
                onClick={() => setViewMode('LIST')}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-3">
                    Safety Guardrails
                    <Shield className="w-5 h-5 text-neon-cyan" />
                </h2>
                <p className="text-zinc-500 text-xs mt-0.5">Global constraints applied to all repricing strategies.</p>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Margin Constraints */}
            <div className="glass-panel p-6 rounded-2xl space-y-8">
                 <div className="space-y-4">
                     <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-zinc-200">Minimum Profit Margin</label>
                         <span className="text-neon-cyan font-mono font-bold">{globalSettings.minProfitMargin}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="5" max="50" step="1"
                        value={globalSettings.minProfitMargin}
                        onChange={(e) => setGlobalSettings({...globalSettings, minProfitMargin: Number(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan" 
                     />
                     <p className="text-xs text-zinc-500">
                         The absolute floor price will be calculated based on Cost Basis + {globalSettings.minProfitMargin}% Margin.
                         No strategy can price below this point.
                     </p>
                 </div>

                 <div className="h-px bg-white/5 w-full"></div>

                 <div className="space-y-4">
                     <div className="flex justify-between items-center">
                         <label className="text-sm font-medium text-zinc-200">Max Daily Price Drop</label>
                         <span className="text-neon-pink font-mono font-bold">{globalSettings.maxDailyDrop}%</span>
                     </div>
                     <input 
                        type="range" 
                        min="1" max="25" step="0.5"
                        value={globalSettings.maxDailyDrop}
                        onChange={(e) => setGlobalSettings({...globalSettings, maxDailyDrop: Number(e.target.value)})}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-pink" 
                     />
                     <p className="text-xs text-zinc-500">
                         Prevents price tanking. A product's price cannot decrease by more than {globalSettings.maxDailyDrop}% within a 24h rolling window.
                     </p>
                 </div>
            </div>

            {/* Feature Toggles */}
            <div className="glass-panel p-6 rounded-2xl space-y-6">
                <h3 className="text-sm font-medium text-zinc-400 uppercase tracking-wider">Advanced Behavior</h3>
                
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${globalSettings.ignoreNewSellers ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                            <Shield className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">Ignore New Sellers</div>
                            <div className="text-xs text-zinc-500">Don't compete with sellers &lt; 5 ratings</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setGlobalSettings({...globalSettings, ignoreNewSellers: !globalSettings.ignoreNewSellers})}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${globalSettings.ignoreNewSellers ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${globalSettings.ignoreNewSellers ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                         <div className={`p-2 rounded-lg ${globalSettings.matchAmazon ? 'bg-orange-500/20 text-orange-400' : 'bg-zinc-800 text-zinc-500'}`}>
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <div className="text-sm font-medium text-white">Match Amazon Price</div>
                            <div className="text-xs text-zinc-500">Always match Amazon Retail if present</div>
                        </div>
                    </div>
                    <button 
                        onClick={() => setGlobalSettings({...globalSettings, matchAmazon: !globalSettings.matchAmazon})}
                        className={`w-12 h-6 rounded-full p-1 transition-colors ${globalSettings.matchAmazon ? 'bg-orange-500' : 'bg-zinc-700'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform ${globalSettings.matchAmazon ? 'translate-x-6' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>
        </div>
    </div>
  );

  const renderCreateStrategy = () => (
    <div className="h-full flex flex-col items-center justify-center animate-[fadeIn_0.3s_ease-out]">
         <div className="w-full max-w-2xl glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-neon-cyan/5 blur-[80px] rounded-full pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8 relative z-10">
                <button 
                    onClick={() => setViewMode('LIST')}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold text-white">Strategy Blueprint</h2>
            </div>

            <div className="space-y-6 relative z-10">
                {/* Name Input */}
                <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Strategy Name</label>
                    <input 
                        type="text"
                        value={newStrategy.name}
                        onChange={(e) => setNewStrategy({...newStrategy, name: e.target.value})}
                        placeholder="e.g., Aggressive Weekend Sale"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-neon-cyan/50 transition-all"
                    />
                </div>

                {/* Type Selection */}
                <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Optimization Goal</label>
                    <div className="grid grid-cols-3 gap-4">
                        {[
                            { id: 'PROFIT', icon: DollarSign, label: 'Max Profit', color: 'text-neon-cyan', bg: 'bg-neon-cyan/10', border: 'border-neon-cyan/50' },
                            { id: 'VELOCITY', icon: Zap, label: 'Velocity', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/50' },
                            { id: 'LIQUIDATION', icon: Flame, label: 'Liquidation', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/50' },
                        ].map((opt) => (
                            <button
                                key={opt.id}
                                onClick={() => setNewStrategy({...newStrategy, type: opt.id as any})}
                                className={`
                                    p-4 rounded-xl border flex flex-col items-center gap-3 transition-all duration-300
                                    ${newStrategy.type === opt.id ? `${opt.bg} ${opt.border} shadow-[0_0_15px_rgba(0,0,0,0.3)]` : 'bg-white/5 border-white/5 hover:bg-white/10 text-zinc-500'}
                                `}
                            >
                                <opt.icon className={`w-6 h-6 ${newStrategy.type === opt.id ? opt.color : ''}`} />
                                <span className={`text-xs font-bold ${newStrategy.type === opt.id ? 'text-white' : ''}`}>{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-xs text-zinc-400 uppercase tracking-wider font-semibold">Description</label>
                    <textarea 
                        value={newStrategy.description}
                        onChange={(e) => setNewStrategy({...newStrategy, description: e.target.value})}
                        placeholder="Briefly describe when this strategy should be used..."
                        className="w-full h-24 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-neon-cyan/50 transition-all resize-none"
                    />
                </div>

                {/* Submit Action */}
                <button 
                    onClick={handleCreateStrategy}
                    disabled={!newStrategy.name}
                    className={`
                        w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all mt-4
                        ${newStrategy.name 
                            ? 'bg-gradient-to-r from-neon-cyan to-blue-500 text-black shadow-[0_0_20px_rgba(0,242,234,0.3)] hover:shadow-[0_0_30px_rgba(0,242,234,0.5)] hover:scale-[1.02]' 
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'}
                    `}
                >
                    <Rocket className="w-5 h-5" />
                    Initialize Strategy
                </button>
            </div>
         </div>
    </div>
  );

  const renderDetailView = () => {
     if (!activeRule) return null;
     const themeColor = getColor(activeRule.type);
    
    return (
      <div className="h-full flex flex-col gap-6 animate-[fadeIn_0.3s_ease-out]">
        {/* Header */}
        <div className="flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSelectedRuleId(null)}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex flex-col">
              {isEditingName ? (
                <div className="flex items-center gap-2 h-7">
                    <input 
                        autoFocus
                        type="text" 
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                        className="bg-zinc-900 border border-neon-cyan/50 text-xl font-bold text-white px-2 py-0.5 rounded focus:outline-none min-w-[200px]"
                    />
                </div>
              ) : (
                <div className="flex items-center gap-3 h-7 group">
                    <h2 
                        onClick={() => {
                            setTempName(activeRule.name);
                            setIsEditingName(true);
                        }}
                        className="text-xl font-bold text-white cursor-pointer hover:underline decoration-dashed underline-offset-4 decoration-zinc-600"
                    >
                        {activeRule.name}
                    </h2>
                    <button 
                        onClick={() => {
                            setTempName(activeRule.name);
                            setIsEditingName(true);
                        }}
                        className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-white transition-all"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <span className={`px-2 py-0.5 rounded text-[10px] bg-white/5 border border-white/10 tracking-wider font-mono ${activeRule.active ? 'text-emerald-400' : 'text-zinc-500'}`}>
                        {activeRule.active ? 'ACTIVE' : 'PAUSED'}
                    </span>
                </div>
              )}
              <p className="text-zinc-500 text-xs mt-1">{activeRule.description}</p>
            </div>
          </div>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-neon-cyan/10 hover:bg-neon-cyan/20 border border-neon-cyan/50 text-neon-cyan rounded-lg transition-all"
            onClick={() => setSelectedRuleId(null)}
          >
            <Save className="w-4 h-4" />
            Save Configuration
          </button>
        </div>

        {/* Content Layout */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Column: Configuration & Simulation */}
          <div className="w-full lg:w-5/12 flex flex-col gap-6 overflow-y-auto pr-2">
            
            {/* KPI Simulation Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold flex items-center gap-2">
                        Proj. Win Rate
                        <span className="p-0.5 rounded bg-zinc-800 text-zinc-400 cursor-help" title="Probability of winning the Buy Box based on price vs competitor">
                            <AlertCircle className="w-3 h-3" />
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                        {avgWinRate}% 
                        <span className={`${Number(winRateChange) >= 0 ? 'text-emerald-500' : 'text-red-500'} text-xs font-medium`}>
                             {Number(winRateChange) > 0 ? '+' : ''}{winRateChange}%
                        </span>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <Swords className="w-16 h-16" />
                    </div>
                    <div className="h-1 w-full bg-zinc-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${avgWinRate}%` }} />
                    </div>
                </div>
                <div className="glass-panel p-4 rounded-xl relative overflow-hidden group">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1 font-semibold">Avg. Margin</div>
                    <div className="text-2xl font-bold text-white flex items-baseline gap-2">
                        {avgMargin}% 
                        <span className="text-zinc-500 text-xs font-medium">real-time</span>
                    </div>
                    <div className="absolute right-0 bottom-0 opacity-[0.03] group-hover:opacity-10 transition-opacity">
                        <DollarSign className="w-16 h-16" />
                    </div>
                     <div className="h-1 w-full bg-zinc-800 rounded-full mt-3 overflow-hidden">
                        <div className="h-full bg-neon-pink transition-all duration-500" style={{ width: `${Math.min(100, parseFloat(avgMargin) * 2)}%` }} />
                    </div>
                </div>
            </div>

            {/* LOGIC CONFIGURATION PANEL */}
            <div className="glass-panel p-6 rounded-2xl space-y-8 border-l-4" style={{ borderLeftColor: themeColor }}>
                
                {/* Section 1: Trigger Conditions */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        Trigger Condition
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-400 font-normal ml-auto">WHEN</span>
                    </div>
                    
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                            <span>If Sales Count is lower than</span>
                            <input 
                                type="number" 
                                value={salesThreshold}
                                onChange={(e) => setSalesThreshold(Number(e.target.value))}
                                className="w-16 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-center text-white focus:border-neon-cyan focus:outline-none"
                            />
                            <span>units</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-300">
                             <span>Over a period of</span>
                             <input 
                                type="number" 
                                value={periodDays}
                                onChange={(e) => setPeriodDays(Number(e.target.value))}
                                className="w-16 bg-zinc-900 border border-white/10 rounded-lg px-2 py-1 text-center text-white focus:border-neon-cyan focus:outline-none"
                            />
                            <span>days</span>
                        </div>
                    </div>
                </div>

                {/* Section 2: Pricing Actions */}
                <div className="space-y-4">
                    <div className="flex items-center gap-2 text-white font-medium">
                        <ArrowDownWideNarrow className="w-4 h-4 text-zinc-400" />
                        Pricing Actions
                        <span className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded text-zinc-400 font-normal ml-auto">THEN</span>
                    </div>
                    
                    <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-5">
                        {/* Percentage Rule */}
                        <div className="space-y-2">
                             <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                                <span>Decrease price by</span>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="0.1"
                                        value={percentDrop}
                                        onChange={(e) => setPercentDrop(Number(e.target.value))}
                                        className="w-20 bg-zinc-900 border border-white/10 rounded-lg pl-3 pr-6 py-1 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                    <span className="absolute right-2 top-1.5 text-xs text-zinc-500">%</span>
                                </div>
                                <span>down to a limit of</span>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="1"
                                        value={percentLimit}
                                        onChange={(e) => setPercentLimit(Number(e.target.value))}
                                        className="w-20 bg-zinc-900 border border-white/10 rounded-lg pl-3 pr-6 py-1 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                    <span className="absolute right-2 top-1.5 text-xs text-zinc-500">%</span>
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="10" step="0.1" 
                                value={percentDrop}
                                onChange={(e) => setPercentDrop(Number(e.target.value))}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan" 
                            />
                        </div>

                        {/* Divider */}
                        <div className="flex items-center gap-3">
                            <div className="h-px bg-white/5 flex-1"></div>
                            <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">AND / OR</span>
                            <div className="h-px bg-white/5 flex-1"></div>
                        </div>

                        {/* Fixed Value Rule */}
                        <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-300">
                                <span>Decrease price by</span>
                                <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-xs text-zinc-500">$</span>
                                    <input 
                                        type="number" 
                                        step="0.01"
                                        value={fixedDrop}
                                        onChange={(e) => setFixedDrop(Number(e.target.value))}
                                        className="w-20 bg-zinc-900 border border-white/10 rounded-lg pl-5 pr-2 py-1 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                                <span>up to a limit of</span>
                                <div className="relative">
                                    <span className="absolute left-2 top-1.5 text-xs text-zinc-500">$</span>
                                    <input 
                                        type="number" 
                                        step="0.50"
                                        value={fixedLimit}
                                        onChange={(e) => setFixedLimit(Number(e.target.value))}
                                        className="w-20 bg-zinc-900 border border-white/10 rounded-lg pl-5 pr-2 py-1 text-white focus:border-neon-cyan focus:outline-none"
                                    />
                                </div>
                            </div>
                            <input 
                                type="range" 
                                min="0" max="5" step="0.1" 
                                value={fixedDrop}
                                onChange={(e) => setFixedDrop(Number(e.target.value))}
                                className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-pink" 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Simulation Chart */}
            <div className="glass-panel p-6 rounded-2xl flex-1 min-h-[250px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-white">Projected Performance vs Competitor</h3>
                    <div className="flex gap-4">
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <div className="w-2 h-2 rounded-full" style={{ background: themeColor }}></div>
                            My Price
                        </div>
                         <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <div className="w-3 h-1 rounded-full bg-yellow-500/50 border border-dashed border-yellow-500"></div>
                            Competitor
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400">
                            <div className="w-2 h-2 rounded-full bg-zinc-600"></div>
                            Volume
                        </div>
                    </div>
                </div>
                <div className="flex-1 w-full -ml-4">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                        <defs>
                            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={themeColor} stopOpacity={0.3}/>
                                <stop offset="95%" stopColor={themeColor} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="time" hide />
                        <YAxis hide domain={['dataMin - 5', 'dataMax + 5']} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0F1115', border: '1px solid #ffffff10', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                        />
                        {/* Competitor Line */}
                        <Area
                            type="monotone"
                            dataKey="competitorPrice"
                            stroke="#eab308"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            fill="transparent"
                            isAnimationActive={false}
                        />
                        {/* My Price */}
                        <Area 
                            type="monotone" 
                            dataKey="price" 
                            stroke={themeColor} 
                            strokeWidth={2}
                            fillOpacity={1} 
                            fill="url(#colorPrice)" 
                            animationDuration={300}
                        />
                        {/* Volume Bar (represented as step line) */}
                         <Area 
                            type="step" 
                            dataKey="volume" 
                            stroke="#52525b" 
                            strokeWidth={1}
                            strokeDasharray="2 2"
                            fill="transparent" 
                            animationDuration={300}
                        />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
          </div>

          {/* Right Column: Scope Selector */}
          <div className="flex-1 glass-panel rounded-2xl flex flex-col overflow-hidden">
            <div className="p-6 border-b border-white/5 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold text-white">Assigned Scope</h3>
                        <p className="text-xs text-zinc-500">Select products managed by this strategy</p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-zinc-400">
                            {assignedProductIds.size} Selected
                        </span>
                    </div>
                </div>
                
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                        type="text" 
                        placeholder="Search SKU, Title..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-black/20 border border-white/5 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-neon-cyan/30 transition-all"
                    />
                </div>
            </div>

            <div className="flex-1 overflow-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0f1115] z-10 shadow-sm">
                        <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                            <th className="py-3 pl-6 w-10">
                                <button onClick={handleSelectAll} className="hover:text-white">
                                    {assignedProductIds.size === PRODUCTS.length ? <CheckSquare className="w-4 h-4 text-neon-cyan" /> : <Square className="w-4 h-4" />}
                                </button>
                            </th>
                            <th className="py-3 pl-2">Product Info</th>
                            <th className="py-3">Price</th>
                            <th className="py-3">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {PRODUCTS.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku.toLowerCase().includes(searchQuery.toLowerCase())).map((product) => {
                            const isSelected = assignedProductIds.has(product.id);
                            return (
                                <tr 
                                    key={product.id}
                                    onClick={() => toggleProduct(product.id)}
                                    className={`
                                        cursor-pointer transition-colors border-b border-white/5 last:border-0
                                        ${isSelected ? 'bg-white/[0.03]' : 'hover:bg-white/[0.02]'}
                                    `}
                                >
                                    <td className="py-3 pl-6">
                                        <div className={`transition-colors ${isSelected ? 'text-neon-cyan' : 'text-zinc-600'}`}>
                                            {isSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                                        </div>
                                    </td>
                                    <td className="py-3 pl-2">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded bg-zinc-800 flex-shrink-0 overflow-hidden">
                                                <img src={product.image} alt="" className="w-full h-full object-cover opacity-80" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className={`truncate font-medium ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{product.title}</span>
                                                <span className="text-[10px] text-zinc-600 font-mono">{product.sku}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-3 font-mono text-zinc-400">${product.price}</td>
                                    <td className="py-3">
                                        {product.status === 'active' ? (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
                                        ) : (
                                            <span className="inline-flex w-2 h-2 rounded-full bg-zinc-600" />
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // --- Main Render Switch ---

  if (viewMode === 'DETAIL' && activeRule) return renderDetailView();
  if (viewMode === 'SETTINGS') return renderGlobalSettings();
  if (viewMode === 'CREATE') return renderCreateStrategy();

  // --- List View Render ---
  return (
    <div className="h-full flex flex-col animate-[fadeIn_0.5s_ease-out]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Smart Repricer Strategies</h2>
          <p className="text-zinc-500 text-sm mt-1">Configure automated pricing rules based on market conditions.</p>
        </div>
        <button 
            onClick={() => setViewMode('SETTINGS')}
            className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition flex items-center gap-2"
        >
            <Settings2 className="w-4 h-4" />
            Global Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {rules.map((rule) => {
          const count = ruleAssignments[rule.id]?.size || 0;
          
          return (
            <div 
                key={rule.id}
                onClick={() => setSelectedRuleId(rule.id)}
                className={`
                glass-panel rounded-2xl p-6 relative overflow-hidden group cursor-pointer
                hover:border-white/20 hover:shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300
                border-b-4
                `}
                style={{ borderBottomColor: getColor(rule.type) }}
            >
                {/* Hover Glow Effect */}
                <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-500 pointer-events-none"
                    style={{ background: `radial-gradient(circle at center, ${getColor(rule.type)}, transparent 70%)` }}
                />

                <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-white/5 rounded-xl border border-white/5 group-hover:scale-110 transition-transform duration-300">
                    {getIcon(rule.type)}
                </div>
                 <button
                    onClick={(e) => toggleRuleActive(e, rule.id)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 focus:outline-none ${rule.active ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                >
                    <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${rule.active ? 'translate-x-6' : 'translate-x-0'}`} />
                </button>
                </div>
                
                <h3 className="text-lg font-medium text-white mb-2 group-hover:text-neon-cyan transition-colors relative z-10">
                {rule.name}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed mb-6 h-10 relative z-10 line-clamp-2">
                {rule.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-white/5 relative z-10">
                    <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {count} Products
                    </div>
                    <span className="text-xs text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-300 flex items-center gap-1">
                        Configure <ArrowLeft className="w-3 h-3 rotate-180" />
                    </span>
                </div>
            </div>
          )
        })}

        {/* New Strategy Card */}
        <div 
            onClick={() => setViewMode('CREATE')}
            className="border border-dashed border-white/10 rounded-2xl p-6 flex flex-col items-center justify-center gap-4 text-zinc-500 hover:text-white hover:border-white/30 hover:bg-white/[0.02] transition-all cursor-pointer group"
        >
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6" />
            </div>
            <span className="text-sm font-medium">Create Custom Strategy</span>
        </div>
      </div>
    </div>
  );
};