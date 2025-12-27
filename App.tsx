import React, { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { InventoryView } from './components/InventoryView';
import { RepricerView } from './components/RepricerView';
import { PromotionsView } from './components/PromotionsView';
import { FinancialsView } from './components/FinancialsView';
import { FulfillmentView } from './components/FulfillmentView';
import { AnalyticsView } from './components/AnalyticsView';
import { Tab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.INVENTORY);

  const renderContent = () => {
    switch (activeTab) {
      case Tab.INVENTORY: return <InventoryView />;
      case Tab.REPRICER: return <RepricerView />;
      case Tab.PROMOTIONS: return <PromotionsView />;
      case Tab.FINANCIALS: return <FinancialsView />;
      case Tab.FULFILLMENT: return <FulfillmentView />;
      case Tab.ANALYTICS: return <AnalyticsView />;
      default: return <InventoryView />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-white selection:bg-neon-cyan/30 selection:text-neon-cyan">
      {/* Background Ambient Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="fixed bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-cyan-900/20 blur-[120px] rounded-full pointer-events-none z-0"></div>

      {/* Layout */}
      <div className="relative z-10 flex w-full h-full overflow-hidden">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <main className="flex-1 h-full p-8 overflow-y-auto overflow-x-hidden relative">
           {/* Top Header Placeholder (Breadcrumbs or Global Search could go here) */}
           <header className="mb-8 flex justify-between items-center opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]">
             <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">
               Workspace / {activeTab.toLowerCase()}
             </div>
             <div className="text-xs text-zinc-600">
               Last synced: Just now
             </div>
           </header>

           {/* Dynamic Content Area */}
           <div className="h-[calc(100%-3rem)] animate-[slideUp_0.4s_ease-out]">
             {renderContent()}
           </div>
        </main>
      </div>
      
      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}