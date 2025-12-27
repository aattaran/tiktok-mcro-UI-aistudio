import React from 'react';
import { PROMOTIONS } from '../constants';
import { Plus, Tag } from 'lucide-react';

export const PromotionsView: React.FC = () => {
  const days = Array.from({ length: 35 }, (_, i) => i + 1); // Mock calendar days

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-white flex items-center gap-2">
          <Tag className="w-5 h-5 text-neon-pink" />
          Campaign Calendar
        </h2>
        <button className="group relative px-6 py-2 rounded-full bg-zinc-900 border border-white/10 overflow-hidden transition-all hover:border-neon-pink/50">
          <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-neon-cyan to-neon-pink opacity-10 group-hover:opacity-20 transition-opacity" />
          <span className="relative flex items-center gap-2 text-sm text-white">
            <Plus className="w-4 h-4" /> Bulk Create
          </span>
        </button>
      </div>

      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col">
        <div className="grid grid-cols-7 mb-4">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-zinc-500 text-xs uppercase text-center pb-2 tracking-widest">{day}</div>
          ))}
        </div>
        
        <div className="flex-1 grid grid-cols-7 grid-rows-5 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden">
          {days.map((day) => {
             // Mock logic to place promos
             const promo = PROMOTIONS.find(p => p.date === day);
             const isToday = day === 14;

             return (
               <div key={day} className="bg-[#0F1115] relative p-2 min-h-[100px] group hover:bg-[#15171c] transition-colors">
                 <span className={`text-xs font-mono ${isToday ? 'bg-neon-cyan text-black px-1.5 py-0.5 rounded-full font-bold' : 'text-zinc-600'}`}>
                   {day <= 30 ? day : ''}
                 </span>
                 
                 {promo && (
                   <div className="mt-2">
                     <div className={`
                       text-[10px] p-2 rounded border backdrop-blur-md cursor-pointer
                       ${promo.type === 'FLASH' 
                         ? 'bg-neon-pink/10 border-neon-pink/30 text-neon-pink shadow-[0_0_10px_rgba(255,0,80,0.1)]' 
                         : 'bg-neon-cyan/10 border-neon-cyan/30 text-neon-cyan shadow-[0_0_10px_rgba(0,242,234,0.1)]'}
                     `}>
                       <div className="font-bold truncate">{promo.title}</div>
                       <div className="opacity-70 text-[9px] mt-1">{promo.type}</div>
                     </div>
                   </div>
                 )}

                 {/* Hover Add Button */}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                   <button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-neon-cyan hover:text-black transition">
                     <Plus className="w-3 h-3" />
                   </button>
                 </div>
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};
