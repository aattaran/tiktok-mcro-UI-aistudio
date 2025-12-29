import React, { useState, useMemo } from 'react';
import { 
  Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  ComposedChart, Line, ReferenceArea
} from 'recharts';
import { 
  Tag, Users, Zap, Calendar, TrendingUp, ChevronDown, 
  Activity, Filter, LayoutGrid, Rows, ChevronLeft, ChevronRight, X, BrainCircuit, Target, ArrowRight, Shield, Clock
} from 'lucide-react';
import { PRODUCTS } from '../constants';

// --- Types & Helpers ---

type StrategyType = 'PROMO' | 'REPRICER' | 'AFFILIATE';
type ViewMode = 'MONTH' | 'WEEK';

interface StrategyDetail {
  goal: string;
  condition: string;
  action: string;
  scope: string[];
}

interface StrategyEvent {
  id: string;
  name: string;
  type: StrategyType;
  startDate: Date;
  endDate: Date;
  color: string;
  lift: string;
  revenue: number;
  config: StrategyDetail;
}

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.setDate(diff));
};

// Mock technical configurations for strategies
const STRATEGY_CONFIGS: Record<string, StrategyDetail> = {
  seasonal: {
    goal: "Maximize holiday sales volume",
    condition: "Traffic exceeds 5k unique visitors/day",
    action: "Auto-apply 15% site-wide coupon",
    scope: ["Gaming Mouse", "Mechanical Keyboard", "Webcam"]
  },
  influencer: {
    goal: "Capitalize on social referral spike",
    condition: "Referral URL contains 'techdaily'",
    action: "Lock price at $84.99 for 48 hours",
    scope: ["Gaming Mouse"]
  },
  liquidation: {
    goal: "Clear Q4 stagnant inventory",
    condition: "Sales velocity < 2 units/day",
    action: "Drop price 5% every 12h until floor reached",
    scope: ["Headset stand holder"]
  }
};

const getInitialStrategies = (baseDate: Date): StrategyEvent[] => {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth();
  return [
    { 
      id: `s1-${year}-${month}`, 
      name: 'Seasonal Surge', 
      type: 'PROMO', 
      startDate: new Date(year, month, 5), 
      endDate: new Date(year, month, 9), 
      color: '#ff0050',
      lift: '+145%',
      revenue: 12400,
      config: STRATEGY_CONFIGS.seasonal
    },
    { 
      id: `s2-${year}-${month}`, 
      name: 'Influencer Drop', 
      type: 'AFFILIATE', 
      startDate: new Date(year, month, 13), 
      endDate: new Date(year, month, 15), 
      color: '#00f2ea',
      lift: '+210%',
      revenue: 8500,
      config: STRATEGY_CONFIGS.influencer
    },
    { 
      id: `s3-${year}-${month}`, 
      name: 'Liquidation Protocol', 
      type: 'REPRICER', 
      startDate: new Date(year, month, 22), 
      endDate: new Date(year, month, 26), 
      color: '#fb923c',
      lift: '+320%',
      revenue: 18900,
      config: STRATEGY_CONFIGS.liquidation
    }
  ];
};

const StrategyBadge = ({ type }: { type: StrategyType }) => {
    const baseClass = "text-[10px] font-bold px-1.5 py-0.5 rounded border flex items-center gap-1";
    let style = "";
    switch (type) {
        case 'PROMO': style = "bg-neon-pink/10 text-neon-pink border-neon-pink/20"; break;
        case 'REPRICER': style = "bg-orange-500/10 text-orange-400 border-orange-500/20"; break;
        case 'AFFILIATE': style = "bg-neon-cyan/10 text-neon-cyan border-neon-cyan/20"; break;
    }
    return <span className={`${baseClass} ${style}`}>{type}</span>;
};

export const AnalyticsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedProduct, setSelectedProduct] = useState(PRODUCTS[0].id);
  const [hoveredStrategy, setHoveredStrategy] = useState<string | null>(null);
  
  // Selection state for Strategy Detail Window
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyEvent | null>(null);

  const handlePrev = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() - 1);
    else d.setDate(d.getDate() - 7);
    setCurrentDate(d);
  };

  const handleNext = () => {
    const d = new Date(currentDate);
    if (viewMode === 'MONTH') d.setMonth(d.getMonth() + 1);
    else d.setDate(d.getDate() + 7);
    setCurrentDate(d);
  };

  const handleToday = () => setCurrentDate(new Date());

  const dateLabel = useMemo(() => {
    if (viewMode === 'MONTH') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const start = getStartOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${currentDate.getFullYear()}`;
    }
  }, [currentDate, viewMode]);

  const allStrategies = useMemo(() => getInitialStrategies(currentDate), [currentDate]);

  const displayData = useMemo(() => {
    const data = [];
    const start = viewMode === 'MONTH' 
      ? new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      : getStartOfWeek(currentDate);
    
    const iterations = viewMode === 'MONTH' ? getDaysInMonth(currentDate) : 7;

    for (let i = 0; i < iterations; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      
      let sales = 30 + Math.random() * 20;
      let visits = 600 + Math.random() * 200;

      allStrategies.forEach(s => {
        if (d >= s.startDate && d <= s.endDate) {
          if (s.type === 'PROMO') { sales *= 2.2; visits *= 1.8; }
          if (s.type === 'REPRICER') { sales *= 3.0; visits *= 1.2; }
          if (s.type === 'AFFILIATE') { sales *= 1.8; visits *= 3.5; }
        }
      });

      data.push({
        date: d,
        label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sales: Math.floor(sales),
        visits: Math.floor(visits),
      });
    }
    return data;
  }, [currentDate, viewMode, allStrategies]);

  const strategiesInView = useMemo(() => {
    const start = displayData[0].date;
    const end = displayData[displayData.length - 1].date;
    return allStrategies.filter(s => (s.startDate <= end && s.endDate >= start));
  }, [displayData, allStrategies]);

  return (
    <div className="h-full flex flex-col animate-[fadeIn_0.5s_ease-out]">
      {/* Top Header & View Controls */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
           <h2 className="text-2xl font-semibold text-white">Strategy Attribution</h2>
           <p className="text-zinc-500 text-sm mt-1">Analyze how your active strategies drive performance peaks.</p>
        </div>
        
        <div className="flex items-center gap-4">
             <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/10">
                <button onClick={() => setViewMode('MONTH')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'MONTH' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <LayoutGrid className="w-3.5 h-3.5" /> Month
                </button>
                <button onClick={() => setViewMode('WEEK')} className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'WEEK' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>
                  <Rows className="w-3.5 h-3.5" /> Week
                </button>
             </div>

             <div className="w-px h-6 bg-white/10 mx-2"></div>

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

      <div className="flex-1 flex flex-col gap-6 min-h-0">
        
        {/* TOP: Strategy Cards */}
        <div className="shrink-0 flex flex-col gap-3">
             <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                   Active Strategies
                </h3>
                <span className="text-[10px] text-zinc-600 font-mono italic">Click a card to inspect configuration</span>
             </div>
             
             <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar snap-x">
                 {strategiesInView.length > 0 ? (
                   strategiesInView.map(strategy => (
                      <div 
                          key={strategy.id}
                          onClick={() => setSelectedStrategy(strategy)}
                          onMouseEnter={() => setHoveredStrategy(strategy.id)}
                          onMouseLeave={() => setHoveredStrategy(null)}
                          className={`
                              flex-none w-[320px] snap-start glass-panel rounded-xl p-5 cursor-pointer transition-all duration-300 border-t-2
                              ${hoveredStrategy === strategy.id ? 'bg-white/5 -translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.4)] border-opacity-100' : 'hover:bg-white/5 border-opacity-40'}
                          `}
                          style={{ borderTopColor: strategy.color }}
                      >
                          <div className="flex justify-between items-start mb-3">
                              <StrategyBadge type={strategy.type} />
                              <span className="text-xs text-zinc-500 font-mono">
                                  {strategy.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {strategy.endDate.getDate()}
                              </span>
                          </div>

                          <h4 className="text-base font-bold text-white mb-1 truncate">{strategy.name}</h4>
                          
                          <div className="flex items-center gap-2 text-xs text-zinc-400 mb-4">
                              <Activity className="w-3 h-3" />
                              Live Tracking
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
                   ))
                 ) : (
                   <div className="flex-1 flex items-center justify-center p-8 text-zinc-600 glass-panel rounded-xl opacity-50 border-dashed min-h-[140px]">
                      <div className="flex flex-col items-center gap-1">
                        <Calendar className="w-6 h-6 mb-1" />
                        <span className="text-xs">No strategies active in this window</span>
                      </div>
                   </div>
                 )}
             </div>
        </div>

        {/* BOTTOM: Chart */}
        <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col relative overflow-hidden">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <button onClick={handleToday} className="text-[10px] font-bold text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-colors uppercase tracking-wider">Today</button>
                        <div className="flex items-center gap-1">
                            <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                            <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors"><ChevronRight className="w-4 h-4" /></button>
                        </div>
                    </div>
                    <h3 className="text-lg font-bold text-white tracking-tight min-w-[200px]">{dateLabel}</h3>
                </div>

                <div className="flex gap-8">
                    <div className="flex items-center gap-2.5">
                        <div className="w-3 h-3 bg-white/20 rounded-sm"></div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Sales Volume</span>
                    </div>
                    <div className="flex items-center gap-2.5">
                        <div className="w-4 h-0.5 bg-purple-400 shadow-[0_0_10px_rgba(167,139,250,0.5)]"></div>
                        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Shop Visits</span>
                    </div>
                </div>
            </div>

            <div className="flex-1 w-full min-h-0 relative z-10">
                <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={displayData} margin={{ top: 10, right: 10, bottom: 0, left: -20 }}>
                        <defs>
                            <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.2}/>
                                <stop offset="100%" stopColor="#ffffff" stopOpacity={0.02}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                        <XAxis dataKey="label" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} dy={10} interval={viewMode === 'MONTH' ? Math.floor(displayData.length / 8) : 0} />
                        <YAxis yAxisId="left" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis yAxisId="right" orientation="right" stroke="#3f3f46" fontSize={10} tickLine={false} axisLine={false} />
                        <Tooltip 
                            contentStyle={{ backgroundColor: '#0F1115', border: '1px solid #ffffff10', borderRadius: '12px', boxShadow: '0 10px 40px rgba(0,0,0,0.5)' }}
                            itemStyle={{ fontSize: '11px', padding: '2px 0' }}
                            labelStyle={{ color: '#71717a', fontSize: '10px', marginBottom: '8px', fontWeight: '700', textTransform: 'uppercase' }}
                            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                        />
                        
                        {allStrategies.map(strategy => (
                            <ReferenceArea 
                                key={strategy.id}
                                yAxisId="left"
                                x1={strategy.startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                                x2={strategy.endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} 
                                fill={strategy.color}
                                fillOpacity={hoveredStrategy === strategy.id ? 0.12 : 0.04}
                                strokeOpacity={0}
                            />
                        ))}

                        <Bar yAxisId="left" dataKey="sales" name="Sales" fill="url(#salesGradient)" radius={[4, 4, 0, 0]} barSize={viewMode === 'MONTH' ? 18 : 60} />
                        <Line yAxisId="right" type="monotone" dataKey="visits" name="Visits" stroke="#a78bfa" strokeWidth={2} dot={viewMode === 'WEEK'} activeDot={{ r: 4, strokeWidth: 0, fill: '#fff' }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
        </div>
      </div>

      {/* --- STRATEGY DETAIL MODAL --- */}
      {selectedStrategy && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-[fadeIn_0.2s_ease-out]">
              <div className="w-full max-w-2xl bg-[#0F1115] border border-white/10 rounded-2xl shadow-[0_0_80px_rgba(0,0,0,1)] overflow-hidden">
                  
                  {/* Modal Header */}
                  <div className="p-6 border-b border-white/10 flex items-center justify-between bg-gradient-to-r from-white/[0.03] to-transparent">
                      <div className="flex items-center gap-4">
                          <div className="p-3 rounded-xl bg-white/5 border border-white/10" style={{ color: selectedStrategy.color }}>
                              {selectedStrategy.type === 'PROMO' ? <Tag className="w-6 h-6" /> : (selectedStrategy.type === 'REPRICER' ? <Zap className="w-6 h-6" /> : <Users className="w-6 h-6" />)}
                          </div>
                          <div>
                              <div className="flex items-center gap-2">
                                  <h3 className="text-xl font-bold text-white">{selectedStrategy.name}</h3>
                                  <StrategyBadge type={selectedStrategy.type} />
                              </div>
                              <p className="text-xs text-zinc-500 font-mono mt-1">UUID: {selectedStrategy.id}</p>
                          </div>
                      </div>
                      <button onClick={() => setSelectedStrategy(null)} className="p-2 text-zinc-500 hover:text-white transition-colors bg-white/5 rounded-lg border border-white/5 hover:bg-white/10">
                          <X className="w-5 h-5" />
                      </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                      
                      {/* Technical Logic Section */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    <Target className="w-4 h-4" /> Optimization Goal
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-200 leading-relaxed italic">
                                    "{selectedStrategy.config.goal}"
                                </div>
                           </div>
                           <div className="space-y-4">
                                <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                                    <Clock className="w-4 h-4" /> Trigger Condition
                                </div>
                                <div className="p-4 rounded-xl bg-white/5 border border-white/5 text-sm text-zinc-200 font-mono">
                                    {selectedStrategy.config.condition}
                                </div>
                           </div>
                      </div>

                      {/* Action Visualizer */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                               <Activity className="w-4 h-4" /> Automation Action
                           </div>
                           <div className="flex items-center gap-4">
                               <div className="flex-1 p-4 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between group">
                                    <span className="text-sm font-medium text-white">{selectedStrategy.config.action}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-400">ACTIVE</span>
                                    </div>
                               </div>
                           </div>
                      </div>

                      {/* Target Scope */}
                      <div className="space-y-4 pt-4 border-t border-white/5">
                           <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase tracking-widest">
                               <Shield className="w-4 h-4" /> Managed Scope
                           </div>
                           <div className="flex flex-wrap gap-2">
                               {selectedStrategy.config.scope.map((item, i) => (
                                   <div key={i} className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/5 text-[10px] text-zinc-400 font-medium">
                                       {item}
                                   </div>
                               ))}
                           </div>
                      </div>
                  </div>

                  {/* Modal Footer */}
                  <div className="p-6 border-t border-white/10 bg-black/40 flex justify-between items-center">
                       <div className="flex items-center gap-6">
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold">Total Attribution</div>
                                <div className="text-lg font-bold text-white font-mono">${selectedStrategy.revenue.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="text-[10px] text-zinc-500 uppercase font-bold">Efficiency Lift</div>
                                <div className="text-lg font-bold text-emerald-400 font-mono">{selectedStrategy.lift}</div>
                            </div>
                       </div>
                       <button 
                         onClick={() => setSelectedStrategy(null)}
                         className="px-6 py-2.5 rounded-xl bg-white text-black font-bold text-sm hover:bg-zinc-200 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                       >
                           View Original Tab <ArrowRight className="w-4 h-4" />
                       </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};