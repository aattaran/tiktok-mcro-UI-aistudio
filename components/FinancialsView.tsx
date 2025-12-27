import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FINANCIAL_DATA } from '../constants';
import { DollarSign, TrendingUp, CreditCard } from 'lucide-react';

const StatCard: React.FC<{ title: string; value: string; trend: string; icon: React.ReactNode; color: string }> = ({ title, value, trend, icon, color }) => (
  <div className="glass-panel rounded-2xl p-6 relative overflow-hidden">
    <div className={`absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-xl ${color}`} />
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className="text-zinc-400 text-sm font-medium">{title}</div>
        <div className={`p-2 rounded-lg bg-white/5 ${color.replace('bg-', 'text-')}`}>
          {icon}
        </div>
      </div>
      <div className="text-3xl font-bold text-white tracking-tight mb-2">{value}</div>
      <div className="text-xs text-emerald-400 flex items-center gap-1">
        <TrendingUp className="w-3 h-3" />
        {trend} vs last week
      </div>
    </div>
  </div>
);

export const FinancialsView: React.FC = () => {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard 
          title="Net Profit" 
          value="$12,450.00" 
          trend="+14.2%" 
          icon={<DollarSign className="w-5 h-5" />} 
          color="bg-neon-cyan" 
        />
        <StatCard 
          title="Total Revenue" 
          value="$45,200.00" 
          trend="+8.1%" 
          icon={<TrendingUp className="w-5 h-5" />} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Operating Costs" 
          value="$8,120.00" 
          trend="-2.4%" 
          icon={<CreditCard className="w-5 h-5" />} 
          color="bg-neon-pink" 
        />
      </div>

      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col">
        <h3 className="text-lg font-medium text-white mb-6">Profit vs Revenue</h3>
        <div className="flex-1 w-full min-h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={FINANCIAL_DATA} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f2ea" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00f2ea" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff0050" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff0050" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0F1115', border: '1px solid #ffffff10', borderRadius: '8px' }}
                itemStyle={{ fontSize: '12px' }}
                labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
              />
              <Area 
                type="monotone" 
                dataKey="revenue" 
                stroke="#00f2ea" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
              />
              <Area 
                type="monotone" 
                dataKey="profit" 
                stroke="#ff0050" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorProfit)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
