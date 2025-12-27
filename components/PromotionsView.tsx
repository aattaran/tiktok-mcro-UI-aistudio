import React, { useState, useMemo } from 'react';
import { PROMOTIONS } from '../constants';
import { Plus, Tag, ChevronLeft, ChevronRight, Calendar as CalendarIcon, LayoutGrid, Rows } from 'lucide-react';

type ViewMode = 'MONTH' | 'WEEK';

export const PromotionsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());

  // --- Date Logic ---
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: Date[] = [];

    if (viewMode === 'MONTH') {
      // Month View: 35 or 42 days grid
      const firstDayOfMonth = new Date(year, month, 1);
      // Adjust to get Monday as start (0=Mon, ..., 6=Sun)
      const startDay = firstDayOfMonth.getDay(); 
      const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; // Convert Sun(0) to 6, Mon(1) to 0

      // Previous month padding
      for (let i = adjustedStartDay; i > 0; i--) {
        days.push(new Date(year, month, 1 - i));
      }

      // Current month days
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }

      // Next month padding to fill grid
      const remainingCells = (days.length <= 35 ? 35 : 42) - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        days.push(new Date(year, month + 1, i));
      }
    } else {
      // Week View: 7 days starting from Monday of current week
      const currentDay = currentDate.getDay(); // 0=Sun, 1=Mon
      const distanceToMon = currentDay === 0 ? 6 : currentDay - 1;
      const monday = new Date(currentDate);
      monday.setDate(currentDate.getDate() - distanceToMon);

      for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        days.push(d);
      }
    }
    return days;
  }, [currentDate, viewMode]);

  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setDate(newDate.getDate() - 7);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else {
      newDate.setDate(newDate.getDate() + 7);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  const getHeaderTitle = () => {
    if (viewMode === 'MONTH') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else {
      const start = calendarDays[0];
      const end = calendarDays[6];
      if (start.getMonth() === end.getMonth()) {
        return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} - ${end.getDate()}, ${end.getFullYear()}`;
      }
      return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${end.getFullYear()}`;
    }
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && 
           date.getMonth() === today.getMonth() && 
           date.getFullYear() === today.getFullYear();
  };

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth();
  };

  return (
    <div className="h-full flex flex-col animate-[fadeIn_0.5s_ease-out]">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-6 shrink-0">
        <div>
           <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
             <Tag className="w-6 h-6 text-neon-pink" />
             Campaign Calendar
           </h2>
           <p className="text-zinc-500 text-sm mt-1">Schedule and manage promotional events.</p>
        </div>
        
        <div className="flex items-center gap-4">
           {/* View Toggle */}
           <div className="flex bg-zinc-900 p-1 rounded-xl border border-white/10">
              <button 
                onClick={() => setViewMode('MONTH')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'MONTH' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Month
              </button>
              <button 
                onClick={() => setViewMode('WEEK')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${viewMode === 'WEEK' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                <Rows className="w-3.5 h-3.5" />
                Week
              </button>
           </div>

           <div className="w-px h-6 bg-white/10 mx-2"></div>

           <button className="group relative px-5 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/50 overflow-hidden transition-all hover:bg-neon-cyan/20">
              <span className="relative flex items-center gap-2 text-sm text-neon-cyan font-medium">
                <Plus className="w-4 h-4" /> Create Campaign
              </span>
           </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col min-h-0">
        
        {/* Calendar Navigation Header */}
        <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
                <button 
                    onClick={handleToday}
                    className="text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
                >
                    Today
                </button>
                <div className="flex items-center gap-1">
                    <button onClick={handlePrev} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button onClick={handleNext} className="p-1.5 rounded-lg hover:bg-white/10 text-zinc-400 hover:text-white transition-colors">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
                <h3 className="text-lg font-bold text-white min-w-[200px]">
                    {getHeaderTitle()}
                </h3>
            </div>
            
            {/* Legend / Info */}
            <div className="flex items-center gap-4 text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-neon-pink"></div>
                    Flash Sale
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-neon-cyan"></div>
                    Coupon
                </div>
            </div>
        </div>
        
        {/* Days Header */}
        <div className="grid grid-cols-7 mb-2 border-b border-white/5 pb-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => (
            <div key={day} className="text-zinc-500 text-xs uppercase text-center font-bold tracking-wider opacity-60">
                {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className={`
            flex-1 grid grid-cols-7 gap-px bg-white/5 border border-white/5 rounded-lg overflow-hidden
            ${viewMode === 'MONTH' ? 'grid-rows-5' : 'grid-rows-1'}
        `}>
          {calendarDays.map((day, idx) => {
             // Mock matching logic: Check if day exists in PROMOTIONS (based on day of month)
             // In a real app, this would match full ISO date string
             const promo = PROMOTIONS.find(p => p.date === day.getDate());
             const today = isToday(day);
             const currentMonth = viewMode === 'WEEK' || isCurrentMonth(day);

             return (
               <div 
                key={idx} 
                className={`
                    bg-[#0F1115] relative p-2 group transition-colors flex flex-col gap-2
                    ${currentMonth ? 'hover:bg-[#15171c]' : 'bg-[#0a0c10] opacity-50 pointer-events-none'}
                `}
               >
                 <div className="flex items-center justify-between">
                    <span className={`
                        text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full
                        ${today ? 'bg-neon-cyan text-black font-bold' : 'text-zinc-500'}
                    `}>
                        {day.getDate()}
                    </span>
                 </div>
                 
                 {/* Render Promo Pill */}
                 {promo && currentMonth && (
                   <div className="animate-[slideUp_0.3s_ease-out]">
                     <div className={`
                       text-[10px] p-2 rounded border backdrop-blur-md cursor-pointer border-l-2
                       ${promo.type === 'FLASH' 
                         ? 'bg-neon-pink/5 border-neon-pink/20 border-l-neon-pink text-zinc-300 hover:text-white hover:border-neon-pink/50' 
                         : 'bg-neon-cyan/5 border-neon-cyan/20 border-l-neon-cyan text-zinc-300 hover:text-white hover:border-neon-cyan/50'}
                     `}>
                       <div className="font-bold truncate leading-tight">{promo.title}</div>
                       {viewMode === 'WEEK' && (
                           <div className="mt-1 opacity-60 text-[9px] flex items-center gap-1">
                               <Tag className="w-2 h-2" /> 09:00 AM - 12:00 PM
                           </div>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Week View: Add some mock time slots or placeholders */}
                 {viewMode === 'WEEK' && !promo && currentMonth && (
                    <div className="flex-1 border-t border-dashed border-white/5 mt-2 pt-2 space-y-8 opacity-0 group-hover:opacity-30 transition-opacity">
                        <div className="h-px w-full bg-white/20"></div>
                        <div className="h-px w-full bg-white/20"></div>
                        <div className="h-px w-full bg-white/20"></div>
                    </div>
                 )}

                 {/* Hover Add Button */}
                 {currentMonth && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                        <button className="w-8 h-8 rounded-full bg-zinc-800 border border-white/10 flex items-center justify-center text-white hover:bg-neon-cyan hover:text-black hover:border-neon-cyan transition-all transform hover:scale-110 shadow-lg">
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                 )}
               </div>
             );
          })}
        </div>
      </div>
    </div>
  );
};