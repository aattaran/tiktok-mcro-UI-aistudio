import React, { useState } from 'react';
import { Tab } from '../types';
import { LayoutGrid, Zap, Tag, PieChart, Truck, Settings, ChevronLeft, ChevronRight, Hexagon } from 'lucide-react';

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
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div 
      className={`
        relative h-full glass-panel border-r border-white/5 flex flex-col backdrop-blur-xl z-50 transition-all duration-300 ease-in-out
        ${isCollapsed ? 'w-20' : 'w-64'}
      `}
    >
      {/* Toggle Button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-9 w-6 h-6 bg-zinc-900 border border-white/20 rounded-full flex items-center justify-center text-zinc-400 hover:text-white hover:border-neon-cyan hover:shadow-[0_0_10px_rgba(0,242,234,0.3)] transition-all z-50"
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo Area */}
      <div className={`h-20 flex items-center border-b border-white/5 ${isCollapsed ? 'justify-center' : 'px-8'}`}>
        <div className="relative group cursor-pointer flex items-center justify-center">
            {isCollapsed ? (
                 <Hexagon className="w-8 h-8 text-neon-cyan fill-neon-cyan/20 animate-pulse-fast" />
            ) : (
                <>
                    <h1 className="text-2xl font-bold tracking-tighter text-white italic group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-neon-cyan group-hover:to-neon-pink transition-all duration-500">
                        MCRO
                    </h1>
                    <div className="absolute -bottom-1 left-0 w-8 h-0.5 bg-gradient-to-r from-neon-cyan to-neon-pink shadow-[0_0_10px_rgba(0,242,234,0.5)]"></div>
                </>
            )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-8 px-3 space-y-2">
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`
                w-full flex items-center rounded-xl transition-all duration-300 group relative overflow-hidden
                ${isActive ? 'text-white bg-white/5' : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.02]'}
                ${isCollapsed ? 'justify-center py-3' : 'gap-3 px-4 py-3'}
              `}
              title={isCollapsed ? item.label : undefined}
            >
              {isActive && (
                 <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-neon-cyan to-neon-pink shadow-[0_0_10px_#00f2ea]" />
              )}
              
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-neon-cyan' : ''}`} />
              
              {!isCollapsed && (
                <span className="font-medium whitespace-nowrap overflow-hidden animate-[fadeIn_0.3s_ease-out]">{item.label}</span>
              )}
              
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-r from-neon-cyan/5 to-transparent pointer-events-none" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className={`p-4 border-t border-white/5 ${isCollapsed ? 'flex flex-col items-center gap-4' : ''}`}>
        <button 
            className={`
                flex items-center rounded-xl text-zinc-500 hover:text-white hover:bg-white/5 transition-colors
                ${isCollapsed ? 'justify-center p-2 w-full' : 'w-full gap-3 px-4 py-3'}
            `}
            title={isCollapsed ? 'Settings' : undefined}
        >
          <Settings className="w-5 h-5" />
          {!isCollapsed && <span className="font-medium">Settings</span>}
        </button>
        
        <div className={`mt-2 flex items-center ${isCollapsed ? 'justify-center' : 'px-4 gap-3'}`}>
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neon-cyan to-neon-pink p-[1px] flex-shrink-0">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white">
              JD
            </div>
          </div>
          {!isCollapsed && (
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs text-white font-medium truncate">John Doe</span>
              <span className="text-[10px] text-zinc-500 truncate">Pro Plan</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};