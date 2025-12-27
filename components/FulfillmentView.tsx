import React from 'react';
import { SHIPMENTS } from '../constants';
import { Truck, Package, AlertOctagon, CheckCircle2 } from 'lucide-react';

export const FulfillmentView: React.FC = () => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-semibold text-white">Logistics Command</h2>
        <div className="flex gap-4">
            <div className="flex items-center gap-2 text-sm text-zinc-400">
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                API Connected
            </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="grid grid-cols-5 text-xs text-zinc-500 uppercase tracking-wider px-6 pb-2">
            <div>Shipment ID</div>
            <div>Destination</div>
            <div>Items</div>
            <div>Status</div>
            <div className="text-right">Est. Arrival</div>
        </div>
        
        {SHIPMENTS.map((shipment) => {
            const isStuck = shipment.status === 'STUCK';
            
            return (
                <div 
                    key={shipment.id}
                    className={`
                        glass-panel rounded-xl p-6 grid grid-cols-5 items-center transition-all duration-300
                        ${isStuck ? 'border-neon-pink/50 shadow-[0_0_15px_rgba(255,0,80,0.15)] animate-pulse-fast bg-neon-pink/5' : 'hover:bg-white/5'}
                    `}
                >
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isStuck ? 'bg-neon-pink/20 text-neon-pink' : 'bg-zinc-800 text-zinc-400'}`}>
                            <Truck className="w-4 h-4" />
                        </div>
                        <span className="font-mono text-white">{shipment.id}</span>
                    </div>
                    
                    <div className="text-zinc-300 font-medium">{shipment.destination}</div>
                    
                    <div className="flex items-center gap-2 text-zinc-400">
                        <Package className="w-4 h-4" />
                        {shipment.items}
                    </div>
                    
                    <div>
                        <span className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wide border
                            ${isStuck ? 'bg-red-500/10 text-red-400 border-red-500/20' : ''}
                            ${shipment.status === 'RECEIVING' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : ''}
                            ${shipment.status === 'IN_TRANSIT' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : ''}
                            ${shipment.status === 'CLOSED' ? 'bg-zinc-500/10 text-zinc-500 border-zinc-500/20' : ''}
                        `}>
                            {isStuck && <AlertOctagon className="w-3 h-3" />}
                            {shipment.status === 'IN_TRANSIT' && <Truck className="w-3 h-3" />}
                            {shipment.status === 'RECEIVING' && <CheckCircle2 className="w-3 h-3" />}
                            {shipment.status}
                        </span>
                    </div>
                    
                    <div className={`text-right font-mono text-sm ${isStuck ? 'text-neon-pink' : 'text-zinc-400'}`}>
                        {shipment.eta}
                    </div>
                </div>
            )
        })}
      </div>
    </div>
  );
};
