import React from 'react';
import { Tab } from '../types';
import { LayoutGrid, Zap, Tag, PieChart, Truck, Settings } from 'lucide-react';

interface SidebarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const NAV_ITEMS = [
  { id: Tab.INVENTORY, label: 'Inventory', icon: LayoutGrid },
  { id: Tab.REPRICER, label: 'Repricer', icon: Zap },
  { id: Tab.PROMOTIONS, label: 'Promotions', icon: Tag },
  { id: Tab.FINANCIALS, label: 'Financials', icon: PieChart },
  { id: Tab.FULFILLMENT, label: 'Fulfillment', icon: Truck },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="w-64 h-full glass-panel border-r border-white/5 flex flex-col backdrop-blur-xl z-50">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-8 border-b border-white/5">
        <div className="relative group cursor-pointer">
          <h1 className="text-2xl font-bold tracking-tighter text-white italic group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-cyan group-hover:to-neon-pink transition-all duration-500">
            MCRO
          </h1>
          <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-pink shadow-[0_0_10px_rgba(0,242,234,0.5)]"></div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}
              `}
            >
              {isActive && (
                 <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan to-neon-pink shadow-[0_0_10px_#00f2ea]" />
              )}
              
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-neon-cyan' : ''}`} />
              <span className="font-medium">{item.label}</span>
              
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="p-4 border-t border-white/5">
        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors">
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </button>
        <div className="mt-4 px-4 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink p-[1px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-white font-medium">John Doe</span>
            <span className="text-[10px] text-zinc-500">Pro Plan</span>
          </div>
        </div>
      </div>
    </div>
  );
};
