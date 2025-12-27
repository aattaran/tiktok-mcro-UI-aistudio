import React from 'react';
import { REPRICER_RULES } from '../constants';
import { Zap, TrendingDown, DollarSign, Moon } from 'lucide-react';

const getIcon = (type: string) => {
  switch (type) {
    case 'VELOCITY': return <Zap className="w-5 h-5 text-emerald-400" />;
    case 'LIQUIDATION': return <TrendingDown className="w-5 h-5 text-orange-400" />;
    case 'PROFIT': return <DollarSign className="w-5 h-5 text-neon-cyan" />;
    default: return <Moon className="w-5 h-5 text-indigo-400" />;
  }
};

const getBorderColor = (type: string) => {
  switch (type) {
    case 'VELOCITY': return 'border-b-emerald-500';
    case 'LIQUIDATION': return 'border-b-orange-500';
    case 'PROFIT': return 'border-b-neon-cyan';
    default: return 'border-b-indigo-500';
  }
};

export const RepricerView: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-semibold text-white">Smart Repricer Strategies</h2>
          <p className="text-zinc-500 text-sm mt-1">Configure automated pricing rules based on market conditions.</p>
        </div>
        <button className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white hover:bg-white/10 transition">
          + New Strategy
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {REPRICER_RULES.map((rule) => (
          <div 
            key={rule.id}
            className={`
              glass-panel rounded-2xl p-6 relative overflow-hidden group hover:bg-white/[0.07] transition-all duration-300
              border-b-4 ${getBorderColor(rule.type)}
            `}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                {getIcon(rule.type)}
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={rule.active} readOnly className="sr-only peer" />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r peer-checked:from-neon-cyan peer-checked:to-neon-pink shadow-[0_0_10px_rgba(0,0,0,0.5)]"></div>
              </label>
            </div>
            
            <h3 className="text-lg font-medium text-white mb-2 group-hover:text-neon-cyan transition-colors">
              {rule.name}
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed mb-6 h-12">
              {rule.description}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
              <span className="text-xs text-zinc-500 font-mono">ID: {rule.id.padStart(4, '0')}</span>
              <button className="text-xs text-white hover:text-neon-pink transition-colors">Configure &rarr;</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
