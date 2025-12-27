import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Area, ReferenceArea, Legend
} from 'recharts';
import { Tag, Users, Zap, Calendar, TrendingUp, DollarSign, MousePointer2, ChevronDown, ArrowRight, Activity, Filter } from 'lucide-react';
import { PRODUCTS } from '../constants';

// --- Types & Mock Data ---

type StrategyType = 'PROMO' | 'REPRICER' | 'AFFILIATE';

interface StrategyEvent {
  id: string;
  name: string;
  type: StrategyType;
  startDay: number; // Day of month (1-30)
  endDay: number;
  color: string;
  lift: string; // Calculated performance lift
  revenue: number; // Attributed revenue
}

const STRATEGIES: StrategyEvent[] = [
  { 
    id: 's1', 
    name: 'Black Friday Warmup', 
    type: 'PROMO', 
    startDay: 5, 
    endDay: 9, 
    color: '#ff0050', // neon-pink
    lift: '+145%',
    revenue: 12400
  },
  { 
    id: 's2', 
    name: 'TechDaily Review Drop', 
    type: 'AFFILIATE', 
    startDay: 13, 
    endDay: 14, 
    color: '#00f2ea', // neon-cyan
    lift: '+210%',
    revenue: 8500
  },
  { 
    id: 's3', 
    name: 'Liquidation Protocol', 
    type: 'REPRICER', 
    startDay: 22, 
    endDay: 26, 
    color: '#fb923c', // orange
    lift: '+320%',
    revenue: 18900
  }
];

const generateTimelineData = () => {
  return Array.from({length: 30}, (_, i) => {
    const day = i + 1;
    // Baseline metrics
    let sales = 40 + Math.random() * 15;
    let visits = 800 + Math.random() * 100;
    
    // Apply strategy effects based on overlaps
    STRATEGIES.forEach(s => {
      if (day >= s.startDay && day <= s.endDay) {
        if (s.type === 'PROMO') {
           // Promos drive visits AND sales
           sales *= 2.5;
           visits *= 2.0;
        } else if (s.type === 'REPRICER') {
           // Repricers (price drops) drive sales significantly, visits slightly
           sales *= 3.5;
           visits *= 1.2;
        } else if (s.type === 'AFFILIATE') {
           // Affiliates drive massive traffic spikes
           sales *= 2.0;
           visits *= 3.5;
        }
      }
    });

    return {
      day: `Nov ${day}`,
      dayNum: day,
      sales: Math.floor(sales),
      visits: Math.floor(visits),
    };
  });
};

const CHART_DATA = generateTimelineData();

const StrategyBadge = ({ type }: { type: StrategyType }) => {
    switch (type) {
        case 'PROMO': return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-pink/10 text-neon-pink border border-neon-pink/20">PROMO</span>;
        case 'REPRICER': return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">REPRICER</span>;
        case 'AFFILIATE': return <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/20">AFFILIATE</span>;
    }
};

export const AnalyticsView: React.FC = () => {
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);

  return (
    <div className="h-full flex flex-col animate-[fadeIn_0.5s_ease-out]">
      {/* Header & Controls */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
           <h2 className="text-2xl font-semibold text-white">Strategy Attribution</h2>
           <p className="text-zinc-500 text-sm mt-1">Analyze how your strategies drive sales & traffic spikes.</p>
        </div>
        
        <div className="flex items-center gap-4">
             {/* Product Selector */}
             <div className="relative z-20">
                <select 
                  className="bg-zinc-900 border border-white/10 rounded-xl py-2 pl-4 pr-10 text-sm text-white appearance-none focus:outline-none focus:border-neon-cyan/50 cursor-pointer hover:bg-zinc-800 transition-colors min-w-[240px]"
                  value={selectedProduct}
                  onChange={(e) => setSelectedProduct(e.target.value)}
                >
                   {PRODUCTS.map(p => (
                     <option key={p.id} value={p.id}>{p.title}</option>
                   ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
             </div>
             
             <button className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                <Filter className="w-5 h-5" />
             </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 min-h-0">
        
        {/* LEFT: Main Chart Area */}
        <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="flex justify-between items-center mb-4 relative z-10">
                <h3 className="text-lg font-medium text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-neon-cyan" />
                    Performance Timeline
                </h3>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="w-3 h-3 bg-white/20 rounded-sm"></div>
                        Sales Volume
                    </div>
                    <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <div className="w-4 h-0.5 bg-purple-400"></div>
                        Shop Visits
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={CHART_DATA} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                        <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.3}/>
                                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.05}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} interval={2} />
                        <YAxis yAxisId="left" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0F1115', border: '1px solid #ffffff10', borderRadius: '8px' }}
                            itemStyle={{ fontSize: '12px' }}
                            labelStyle={{ color: '#a1a1aa', marginBottom: '8px' }}
                        />
                        
                        {/* Highlights for Strategies */}
                        {STRATEGIES.map(strategy => (
                            <ReferenceArea 
                                key={strategy.id}
                                yAxisId="left"
                                x1={`Nov ${strategy.startDay}`} 
                                x2={`Nov ${strategy.endDay}`} 
                                fill={strategy.color}
                                fillOpacity={hoveredStrategy === strategy.id ? 0.15 : 0.05}
                                strokeOpacity={0}
                            >
                            </ReferenceArea>
                        ))}

                        <Bar yAxisId="left" dataKey="sales" name="Sales" fill="url(#salesGradient)" radius={[2, 2, 0, 0]} barSize={20} />
                        <Line yAxisId="right" type="monotone" dataKey="visits" name="Visits" stroke="#a78bfa" strokeWidth={2} dot={false} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            
            {/* Ambient Background Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>

        {/* RIGHT: Strategy List */}
        <div className="w-[380px] flex flex-col gap-4 overflow-y-auto">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Active Strategies</h3>
                <span className="text-xs text-zinc-600">Nov 1 - Nov 30</span>
             </div>

             {STRATEGIES.map(strategy => (
                 <div 
                    key={strategy.id}
                    onMouseEnter={() => setHoveredStrategy(strategy.id)}
                    onMouseLeave={() => setHoveredStrategy(null)}
                    className={`
                        glass-panel rounded-xl p-5 cursor-pointer transition-all duration-300 border-l-2
                        ${hoveredStrategy === strategy.id ? 'bg-white/5 translate-x-1' : 'hover:bg-white/5'}
                    `}
                    style={{ borderLeftColor: strategy.color }}
                 >
                    <div className="flex justify-between items-start mb-3">
                        <StrategyBadge type={strategy.type} />
                        <span className="text-xs text-zinc-500 font-mono">
                            Nov {strategy.startDay} - {strategy.endDay}
                        </span>
                    </div>

                    <h4 className="text-base font-bold text-white mb-1">{strategy.name}</h4>
                    
                    <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                        {strategy.type === 'PROMO' && <Tag className="w-3 h-3" />}
                        {strategy.type === 'REPRICER' && <Zap className="w-3 h-3" />}
                        {strategy.type === 'AFFILIATE' && <Users className="w-3 h-3" />}
                        Strategy Active
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                        <div>
                            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Attributed Rev</div>
                            <div className="text-sm font-bold text-white font-mono">${strategy.revenue.toLocaleString()}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-[10px] text-zinc-500 uppercase font-semibold">Lift vs Base</div>
                            <div className="text-sm font-bold text-emerald-400 flex items-center justify-end gap-1">
                                <TrendingUp className="w-3 h-3" />
                                {strategy.lift}
                            </div>
                        </div>
                    </div>
                 </div>
             ))}

             {/* Add New Strategy Placeholder */}
             <button className="border border-dashed border-white/10 rounded-xl p-4 flex items-center justify-center gap-2 text-zinc-500 hover:text-white hover:bg-white/5 transition-all text-sm group">
                <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Zap className="w-3 h-3" />
                </div>
                Run New Analysis
             </button>
        </div>

      </div>
    </div>
  );
};
