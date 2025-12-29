import React, { useState, useMemo, useEffect } from 'react';
import { PROMOTIONS, PRODUCTS } from '../constants';
import { Promotion } from '../types';
import { 
  Plus, Tag, ChevronLeft, ChevronRight, LayoutGrid, Rows, 
  Copy, Clock, Zap, Users, X, Sparkles, Calendar as CalendarIcon,
  CheckCircle2, AlertCircle, ArrowRight as ArrowRightIcon, CalendarDays,
  Percent, ShoppingBag, Ticket, ChevronDown, Rocket, DollarSign
} from 'lucide-react';

type ViewMode = 'MONTH' | 'WEEK';

// Extend Promotion for internal state usage with full date objects
interface ExtendedPromotion extends Promotion {
  fullStartDate: Date;
  fullEndDate: Date;
}

// Helper to format date for input value (YYYY-MM-DD)
const toLocalDateString = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

// Helper to format time for input value (HH:mm)
const toLocalTimeString = (date: Date) => {
  const pad = (num: number) => num.toString().padStart(2, '0');
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
};

// Generate Date Options (Next 60 days)
const getDateOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 60; i++) {
        const d = new Date(today);
        d.setDate(today.getDate() + i);
        
        let label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (i === 0) label = 'Today';
        if (i === 1) label = 'Tomorrow';

        options.push({
            value: toLocalDateString(d),
            label: label,
            dateObj: new Date(d) // Store object for easy retrieval
        });
    }
    return options;
};

// Generate Time Options (15 min intervals)
const getTimeOptions = () => {
    const times = [];
    for(let i=0; i<24; i++) {
        for(let j=0; j<60; j+=15) {
            const hour = i.toString().padStart(2, '0');
            const minute = j.toString().padStart(2, '0');
            const date = new Date();
            date.setHours(i);
            date.setMinutes(j);
            const label = date.toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
            times.push({ value: `${hour}:${minute}`, label });
        }
    }
    return times;
};

// Round date to nearest 15 minutes
const roundToNearest15 = (date: Date) => {
    const ms = 1000 * 60 * 15;
    return new Date(Math.ceil(date.getTime() / ms) * ms);
};

export const PromotionsView: React.FC = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('MONTH');
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Initialize state with constants mapped to real dates relative to today
  const [localPromotions, setLocalPromotions] = useState<ExtendedPromotion[]>(() => {
    const today = new Date();
    return PROMOTIONS.map(p => {
      const start = new Date(today.getFullYear(), today.getMonth(), p.date, 9, 0, 0); // Default 9 AM
      const end = new Date(start.getTime() + (3 * 60 * 60 * 1000)); // Default 3 hours
      return {
        ...p,
        fullStartDate: start,
        fullEndDate: end,
        affiliatesNotified: false
      };
    });
  });

  // --- Duplication Modal State ---
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [selectedPromo, setSelectedPromo] = useState<ExtendedPromotion | null>(null);
  
  // --- Creation Wizard State ---
  const [isCreating, setIsCreating] = useState(false);
  const [creationStep, setCreationStep] = useState(1); // 1: Type, 2: Details & Schedule, 3: Products

  // Creation Config
  const [newPromoConfig, setNewPromoConfig] = useState({
    title: '',
    category: 'FLASHSALE' as 'FLASHSALE' | 'PRODUCT_DISCOUNT' | 'COUPON',
    productLevel: 'PRODUCT' as 'PRODUCT' | 'SHOP' | 'VARIATION',
    discountType: 'PERCENTAGE' as 'PERCENTAGE' | 'FIXED',
    discountValue: 0,
    startTime: new Date(),
    durationMinutes: 180, // 3 hours default
    replicates: 1, // 1 means no duplication, just the single event
    intervalValue: 60,
    intervalUnit: 'Minutes' as 'Minutes' | 'Hours',
    selectedProductIds: new Set<string>()
  });

  const [dupConfig, setDupConfig] = useState({
    replicates: 5,
    intervalValue: 60,
    intervalUnit: 'Minutes' as 'Minutes' | 'Hours',
    notifyAffiliates: false,
    affiliateNoticeTime: '24h', // 24h, 48h
    startTime: new Date(), // Start time for the FIRST duplicate
  });

  const dateOptions = useMemo(() => getDateOptions(), []);
  const timeOptions = useMemo(() => getTimeOptions(), []);

  // --- Date Logic ---
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const days: Date[] = [];

    if (viewMode === 'MONTH') {
      const firstDayOfMonth = new Date(year, month, 1);
      const startDay = firstDayOfMonth.getDay(); 
      const adjustedStartDay = startDay === 0 ? 6 : startDay - 1; 

      for (let i = adjustedStartDay; i > 0; i--) {
        days.push(new Date(year, month, 1 - i));
      }

      const daysInMonth = new Date(year, month + 1, 0).getDate();
      for (let i = 1; i <= daysInMonth; i++) {
        days.push(new Date(year, month, i));
      }

      const remainingCells = (days.length <= 35 ? 35 : 42) - days.length;
      for (let i = 1; i <= remainingCells; i++) {
        days.push(new Date(year, month + 1, i));
      }
    } else {
      const currentDay = currentDate.getDay(); 
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

  // --- Handlers ---
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') newDate.setMonth(newDate.getMonth() - 1);
    else newDate.setDate(newDate.getDate() - 7);
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'MONTH') newDate.setMonth(newDate.getMonth() + 1);
    else newDate.setDate(newDate.getDate() + 7);
    setCurrentDate(newDate);
  };

  const handleToday = () => setCurrentDate(new Date());

  // --- Logic for Duplication ---
  
  const openDuplicator = (e: React.MouseEvent, promo: ExtendedPromotion) => {
    e.stopPropagation();
    setSelectedPromo(promo);
    
    const rawStart = new Date(promo.fullEndDate.getTime() + 60 * 60000);
    const defaultStart = roundToNearest15(rawStart);
    
    setDupConfig({
        replicates: 5,
        intervalValue: 60,
        intervalUnit: 'Minutes',
        notifyAffiliates: false,
        affiliateNoticeTime: '24h',
        startTime: defaultStart
    });
    setIsDuplicating(true);
  };

  // --- Logic for Creation ---

  const openCreator = (e?: React.MouseEvent, preSelectedDate?: Date) => {
      if (e) e.stopPropagation();
      const start = preSelectedDate ? new Date(preSelectedDate) : new Date();
      if (preSelectedDate) {
          // If clicked on calendar, default to 9 AM that day
          start.setHours(9, 0, 0, 0);
      } else {
          // If global button, nearest 15 mins from now
          const now = new Date();
          const ms = 1000 * 60 * 15;
          start.setTime(Math.ceil(now.getTime() / ms) * ms);
      }

      setNewPromoConfig({
          title: '',
          category: 'FLASHSALE',
          productLevel: 'PRODUCT',
          discountType: 'PERCENTAGE',
          discountValue: 20, // Default 20%
          startTime: start,
          durationMinutes: 180,
          replicates: 1,
          intervalValue: 60,
          intervalUnit: 'Minutes',
          selectedProductIds: new Set()
      });
      setCreationStep(1);
      setIsCreating(true);
  };

  const handleCreationDateChange = (dateStr: string) => {
      const current = new Date(newPromoConfig.startTime);
      const [year, month, day] = dateStr.split('-').map(Number);
      current.setFullYear(year);
      current.setMonth(month - 1);
      current.setDate(day);
      setNewPromoConfig(prev => ({...prev, startTime: current}));
  };

  const handleCreationTimeChange = (timeStr: string) => {
      const current = new Date(newPromoConfig.startTime);
      const [hours, minutes] = timeStr.split(':').map(Number);
      current.setHours(hours);
      current.setMinutes(minutes);
      setNewPromoConfig(prev => ({...prev, startTime: current}));
  };

  // Shared Duplication/Creation Logic helpers
  const handleDateChange = (dateStr: string) => {
      const current = new Date(dupConfig.startTime);
      const [year, month, day] = dateStr.split('-').map(Number);
      current.setFullYear(year);
      current.setMonth(month - 1);
      current.setDate(day);
      setDupConfig({...dupConfig, startTime: current});
  };

  const handleTimeChange = (timeStr: string) => {
      const current = new Date(dupConfig.startTime);
      const [hours, minutes] = timeStr.split(':').map(Number);
      current.setHours(hours);
      current.setMinutes(minutes);
      setDupConfig({...dupConfig, startTime: current});
  };

  // --- Live Previews ---

  const calculatedPreviews = useMemo(() => {
    // 1. Duplication Mode
    if (isDuplicating && selectedPromo) {
        const previews = [];
        const durationMs = selectedPromo.fullEndDate.getTime() - selectedPromo.fullStartDate.getTime();
        const intervalMs = dupConfig.intervalUnit === 'Minutes' 
            ? dupConfig.intervalValue * 60000 
            : dupConfig.intervalValue * 3600000;
        
        let lastEndTime: Date | null = null;
        for (let i = 0; i < dupConfig.replicates; i++) {
            let newStart: Date;
            if (i === 0) {
                newStart = new Date(dupConfig.startTime);
            } else {
                const base = lastEndTime || new Date(dupConfig.startTime);
                newStart = new Date(base.getTime() + intervalMs);
            }
            const newEnd = new Date(newStart.getTime() + durationMs);
            previews.push({
                id: `dup-${Date.now()}-${i}`,
                title: `${selectedPromo.title} (Wave ${i + 1})`,
                fullStartDate: newStart,
                fullEndDate: newEnd,
                type: selectedPromo.type
            });
            lastEndTime = newEnd; 
        }
        return previews;
    } 
    // 2. Creation Mode
    else if (isCreating) {
        const previews = [];
        const durationMs = newPromoConfig.durationMinutes * 60000;
        const intervalMs = newPromoConfig.intervalUnit === 'Minutes'
            ? newPromoConfig.intervalValue * 60000
            : newPromoConfig.intervalValue * 3600000;

        let lastEndTime: Date | null = null;
        for (let i = 0; i < newPromoConfig.replicates; i++) {
             let newStart: Date;
             if (i === 0) {
                 newStart = new Date(newPromoConfig.startTime);
             } else {
                 const base = lastEndTime || new Date(newPromoConfig.startTime);
                 newStart = new Date(base.getTime() + intervalMs);
             }
             const newEnd = new Date(newStart.getTime() + durationMs);
             
             let title = newPromoConfig.title || 'Untitled Campaign';
             if (newPromoConfig.replicates > 1) title += ` (Wave ${i+1})`;

             // Map internal category to display type
             let displayType: 'FLASH' | 'COUPON' = 'FLASH';
             if (newPromoConfig.category === 'COUPON') displayType = 'COUPON';

             previews.push({
                 id: `new-${i}`,
                 title: title,
                 fullStartDate: newStart,
                 fullEndDate: newEnd,
                 type: displayType
             });
             lastEndTime = newEnd;
        }
        return previews;
    }
    return [];
  }, [selectedPromo, dupConfig, isDuplicating, isCreating, newPromoConfig]);

  // --- Actions ---

  const confirmDuplication = () => {
    if (!selectedPromo) return;
    const newPromos: ExtendedPromotion[] = calculatedPreviews.map(p => ({
      ...p,
      date: p.fullStartDate.getDate(),
      affiliatesNotified: dupConfig.notifyAffiliates
    }));
    setLocalPromotions(prev => [...prev, ...newPromos]);
    setIsDuplicating(false);
  };

  const confirmCreation = () => {
      const newPromos: ExtendedPromotion[] = calculatedPreviews.map(p => ({
          ...p,
          date: p.fullStartDate.getDate(),
          affiliatesNotified: false
      }));
      setLocalPromotions(prev => [...prev, ...newPromos]);
      setIsCreating(false);
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

  // --- Render Helpers ---

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

  const calculateDiscountedPrice = (originalPrice: number) => {
      if (newPromoConfig.discountType === 'PERCENTAGE') {
          return originalPrice * (1 - newPromoConfig.discountValue / 100);
      } else {
          return Math.max(0, originalPrice - newPromoConfig.discountValue);
      }
  };

  return (
    <div className="h-full flex flex-col animate-[fadeIn_0.5s_ease-out] relative">
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

           <button 
                onClick={() => openCreator()}
                className="group relative px-5 py-2 rounded-xl bg-neon-cyan/10 border border-neon-cyan/50 overflow-hidden transition-all hover:bg-neon-cyan/20"
           >
              <span className="relative flex items-center gap-2 text-sm text-neon-cyan font-medium">
                <Plus className="w-4 h-4" /> Create Campaign
              </span>
           </button>
        </div>
      </div>

      {/* Calendar Container */}
      <div className="flex-1 glass-panel rounded-2xl p-6 flex flex-col min-h-0 relative z-0">
        
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
                <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                    Duplicated Surge
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
             // Matching logic using full Date objects (ignoring time for daily slot)
             const dayPromos = localPromotions.filter(p => 
                p.fullStartDate.getDate() === day.getDate() &&
                p.fullStartDate.getMonth() === day.getMonth() &&
                p.fullStartDate.getFullYear() === day.getFullYear()
             );
             
             const today = isToday(day);
             const currentMonth = viewMode === 'WEEK' || isCurrentMonth(day);

             return (
               <div 
                key={idx} 
                className={`
                    bg-[#0F1115] relative p-2 group transition-colors flex flex-col gap-1 overflow-hidden
                    ${currentMonth ? 'hover:bg-[#15171c]' : 'bg-[#0a0c10] opacity-50 pointer-events-none'}
                `}
               >
                 <div className="flex items-center justify-between mb-1">
                    <span className={`
                        text-xs font-mono w-6 h-6 flex items-center justify-center rounded-full
                        ${today ? 'bg-neon-cyan text-black font-bold' : 'text-zinc-500'}
                    `}>
                        {day.getDate()}
                    </span>
                    {dayPromos.length > 0 && (
                        <span className="text-[9px] text-zinc-600 font-mono">{dayPromos.length} events</span>
                    )}
                 </div>
                 
                 {/* Scrollable list of promos for that day */}
                 <div className="flex-1 overflow-y-auto space-y-1 custom-scrollbar">
                    {dayPromos.map((promo) => (
                       <div key={promo.id} className="animate-[slideUp_0.3s_ease-out] group/item relative">
                         <div className={`
                           text-[10px] p-1.5 rounded border backdrop-blur-md cursor-pointer border-l-2 pr-6 relative
                           ${promo.title.includes('Wave') 
                              ? 'bg-purple-500/5 border-purple-500/20 border-l-purple-500 text-zinc-300' 
                              : promo.type === 'FLASH' 
                                ? 'bg-neon-pink/5 border-neon-pink/20 border-l-neon-pink text-zinc-300' 
                                : 'bg-neon-cyan/5 border-neon-cyan/20 border-l-neon-cyan text-zinc-300'}
                         `}>
                           <div className="font-bold truncate leading-tight">{promo.title}</div>
                           <div className="mt-0.5 opacity-60 text-[9px] flex items-center gap-1 font-mono">
                               <Clock className="w-2 h-2" /> 
                               {promo.fullStartDate.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                           </div>
                           
                           {/* Affiliate Indicator */}
                           {promo.affiliatesNotified && (
                               <div className="absolute top-1 right-6 text-emerald-400" title="Affiliates Notified">
                                   <Users className="w-2.5 h-2.5" />
                               </div>
                           )}

                           {/* Duplicate Action Button */}
                           <button 
                                onClick={(e) => openDuplicator(e, promo)}
                                className="absolute right-1 top-1.5 w-4 h-4 flex items-center justify-center rounded hover:bg-white/20 text-zinc-500 hover:text-white transition-colors"
                                title="Surge Replicate"
                           >
                               <Copy className="w-2.5 h-2.5" />
                           </button>
                         </div>
                       </div>
                    ))}
                 </div>

                 {/* Hover Add Button (Opens Creator with Date) */}
                 {currentMonth && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[1px]">
                         <button 
                            onClick={(e) => openCreator(e, day)}
                            className="w-8 h-8 rounded-full bg-neon-cyan text-black flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_15px_#00f2ea]"
                         >
                             <Plus className="w-5 h-5" />
                         </button>
                    </div>
                 )}
               </div>
             );
          })}
        </div>
      </div>

      {/* --- SURGE REPLICATOR MODAL (Existing) --- */}
      {isDuplicating && selectedPromo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
              <div className="w-full max-w-4xl bg-[#0F1115] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row">
                  {/* Left: Configuration */}
                  <div className="w-full md:w-1/2 p-8 border-r border-white/5 flex flex-col gap-6">
                      <div className="flex items-center justify-between">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Zap className="w-5 h-5 text-neon-cyan" />
                              Surge Replicator
                          </h3>
                      </div>
                      
                      {/* Smart Suggestion */}
                      <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 flex gap-3">
                          <Sparkles className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                          <div>
                              <div className="text-xs font-bold text-purple-400 uppercase tracking-wider mb-1">AI Insight</div>
                              <p className="text-sm text-zinc-300 leading-relaxed">
                                  Historical data suggests <b>60-minute intervals</b> on weekends drive <b>15% higher conversion</b> for flash sales.
                              </p>
                              <button 
                                onClick={() => setDupConfig(prev => ({...prev, intervalValue: 60, intervalUnit: 'Minutes'}))}
                                className="mt-2 text-xs text-white underline decoration-dashed hover:text-purple-300"
                              >
                                  Apply Suggestion
                              </button>
                          </div>
                      </div>

                      <div className="space-y-4">
                          <div className="space-y-2">
                              <label className="text-xs text-zinc-400 uppercase font-semibold">Base Promotion</label>
                              <div className="p-3 bg-white/5 rounded-lg border border-white/5 text-sm text-white flex justify-between items-center">
                                  <span>{selectedPromo.title}</span>
                                  <span className="text-xs font-mono text-zinc-500">
                                    {selectedPromo.fullStartDate.toLocaleDateString()}
                                  </span>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs text-zinc-400 uppercase font-semibold">Start Timing (First Duplicate)</label>
                              <div className="grid grid-cols-2 gap-3">
                                  {/* Date Dropdown */}
                                  <div className="relative">
                                      <select 
                                        value={toLocalDateString(dupConfig.startTime)}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 pl-9 text-white focus:border-neon-cyan outline-none text-sm appearance-none cursor-pointer"
                                      >
                                          {dateOptions.map(opt => (
                                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                                          ))}
                                      </select>
                                      <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                  </div>

                                  {/* Time Dropdown */}
                                  <div className="relative">
                                      <select 
                                        value={toLocalTimeString(dupConfig.startTime)}
                                        onChange={(e) => handleTimeChange(e.target.value)}
                                        className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 pl-9 text-white focus:border-neon-cyan outline-none text-sm appearance-none cursor-pointer"
                                      >
                                          {timeOptions.map(opt => (
                                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                                          ))}
                                      </select>
                                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                  </div>
                              </div>
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs text-zinc-400 uppercase font-semibold">Total Replicates</label>
                              <input 
                                type="range" 
                                min="1" max="20" 
                                value={dupConfig.replicates}
                                onChange={(e) => setDupConfig({...dupConfig, replicates: parseInt(e.target.value)})}
                                className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan mb-2"
                              />
                              <input 
                                type="number" 
                                value={dupConfig.replicates}
                                onChange={(e) => setDupConfig({...dupConfig, replicates: parseInt(e.target.value)})}
                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan outline-none"
                              />
                          </div>

                          <div className="space-y-2">
                              <label className="text-xs text-zinc-400 uppercase font-semibold">Interval Gap</label>
                              <div className="flex gap-2">
                                  <input 
                                    type="number" 
                                    value={dupConfig.intervalValue}
                                    onChange={(e) => setDupConfig({...dupConfig, intervalValue: parseInt(e.target.value)})}
                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan outline-none"
                                  />
                                  <select 
                                    value={dupConfig.intervalUnit}
                                    onChange={(e) => setDupConfig({...dupConfig, intervalUnit: e.target.value as any})}
                                    className="bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan outline-none min-w-[100px]"
                                  >
                                      <option value="Minutes">Minutes</option>
                                      <option value="Hours">Hours</option>
                                  </select>
                              </div>
                              <p className="text-[10px] text-zinc-500">
                                  Time added after the previous promotion ends.
                              </p>
                          </div>
                          
                          <div className="pt-4 border-t border-white/5">
                              <label className="flex items-center justify-between cursor-pointer group">
                                  <div className="flex items-center gap-3">
                                      <div className={`p-2 rounded-lg ${dupConfig.notifyAffiliates ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-800 text-zinc-500'}`}>
                                          <Users className="w-4 h-4" />
                                      </div>
                                      <div>
                                          <div className="text-sm font-medium text-white">Notify Affiliates</div>
                                          <div className="text-xs text-zinc-500">Send automated surge alerts</div>
                                      </div>
                                  </div>
                                  <div 
                                    onClick={() => setDupConfig({...dupConfig, notifyAffiliates: !dupConfig.notifyAffiliates})}
                                    className={`w-10 h-5 rounded-full relative transition-colors ${dupConfig.notifyAffiliates ? 'bg-emerald-500' : 'bg-zinc-700'}`}
                                  >
                                      <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${dupConfig.notifyAffiliates ? 'translate-x-5' : ''}`} />
                                  </div>
                              </label>

                              {dupConfig.notifyAffiliates && (
                                  <div className="mt-4 animate-[slideUp_0.2s_ease-out] ml-11">
                                      <select 
                                        className="w-full bg-zinc-900 border border-emerald-500/30 rounded-lg p-2 text-sm text-white focus:outline-none"
                                        value={dupConfig.affiliateNoticeTime}
                                        onChange={(e) => setDupConfig({...dupConfig, affiliateNoticeTime: e.target.value})}
                                      >
                                          <option value="24h">24 Hours Before Start</option>
                                          <option value="48h">48 Hours Before Start</option>
                                          <option value="1w">1 Week Before Start</option>
                                      </select>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>

                  {/* Right: Live Preview */}
                  <div className="w-full md:w-1/2 bg-black/20 flex flex-col">
                      <div className="p-6 border-b border-white/5 flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Live Preview</h4>
                          <span className="text-xs font-mono text-neon-cyan">{calculatedPreviews.length} Events</span>
                      </div>
                      
                      <div className="flex-1 overflow-y-auto p-6 space-y-3">
                          {calculatedPreviews.map((p, idx) => (
                              <div key={idx} className="flex gap-4 items-start group">
                                  <div className="flex flex-col items-center pt-1">
                                      <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-neon-cyan transition-colors" />
                                      {idx !== calculatedPreviews.length - 1 && (
                                          <div className="w-px h-full bg-zinc-800 my-1" />
                                      )}
                                  </div>
                                  <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/5 group-hover:border-neon-cyan/30 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-sm text-white font-medium">{p.title}</span>
                                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">Wave {idx + 1}</span>
                                      </div>
                                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                                          <Clock className="w-3 h-3" />
                                          {p.fullStartDate.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})} 
                                          <ArrowRightIcon className="w-3 h-3 mx-1" />
                                          {p.fullEndDate.toLocaleString([], {hour:'2-digit', minute:'2-digit'})}
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>

                      <div className="p-6 border-t border-white/5 flex gap-3">
                          <button 
                            onClick={() => setIsDuplicating(false)}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                              Cancel
                          </button>
                          <button 
                            onClick={confirmDuplication}
                            className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-neon-cyan to-blue-600 text-black font-bold hover:shadow-[0_0_20px_rgba(0,242,234,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                          >
                              <Copy className="w-4 h-4" />
                              Confirm Replication
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* --- CREATE CAMPAIGN WIZARD (New) --- */}
      {isCreating && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
             <div className="w-full max-w-5xl bg-[#0F1115] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col md:flex-row h-[85vh]">
                
                {/* Left: Configuration Steps */}
                <div className="w-full md:w-7/12 p-8 border-r border-white/5 flex flex-col gap-6 overflow-y-auto">
                    <div className="flex items-center justify-between shrink-0">
                          <h3 className="text-xl font-bold text-white flex items-center gap-2">
                              <Rocket className="w-5 h-5 text-neon-pink" />
                              New Campaign
                          </h3>
                          <div className="flex gap-1">
                              {[1, 2, 3].map(step => (
                                  <div key={step} className={`w-2 h-2 rounded-full ${creationStep >= step ? 'bg-neon-pink' : 'bg-zinc-800'}`} />
                              ))}
                          </div>
                    </div>

                    {/* Step 1: Campaign Type */}
                    {creationStep === 1 && (
                        <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
                            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Select Campaign Type</h4>
                            <div className="grid grid-cols-1 gap-4">
                                {[
                                    { id: 'FLASHSALE', icon: Zap, label: 'Flash Deal', desc: 'Limited-time price drops with countdown timers.', color: 'text-neon-pink', border: 'hover:border-neon-pink/50' },
                                    { id: 'PRODUCT_DISCOUNT', icon: Tag, label: 'Product Discount', desc: 'Fixed amount or percentage off regular price.', color: 'text-emerald-400', border: 'hover:border-emerald-500/50' },
                                    { id: 'COUPON', icon: Ticket, label: 'Coupon', desc: 'Vouchers claimable by customers.', color: 'text-neon-cyan', border: 'hover:border-neon-cyan/50' }
                                ].map((type) => (
                                    <button 
                                        key={type.id}
                                        onClick={() => setNewPromoConfig({...newPromoConfig, category: type.id as any})}
                                        className={`
                                            flex items-center gap-4 p-4 rounded-xl border transition-all text-left group
                                            ${newPromoConfig.category === type.id ? 'bg-white/5 border-white/20 shadow-lg' : 'bg-black/20 border-white/5 ' + type.border}
                                        `}
                                    >
                                        <div className={`w-12 h-12 rounded-full bg-black/40 flex items-center justify-center ${type.color}`}>
                                            <type.icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className={`font-bold text-lg ${newPromoConfig.category === type.id ? 'text-white' : 'text-zinc-400 group-hover:text-white'}`}>{type.label}</div>
                                            <div className="text-sm text-zinc-500">{type.desc}</div>
                                        </div>
                                        {newPromoConfig.category === type.id && (
                                            <div className="ml-auto text-neon-cyan"><CheckCircle2 className="w-5 h-5" /></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Step 2: Schedule & Surge */}
                    {creationStep === 2 && (
                         <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
                            <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Campaign Details</h4>
                            
                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold">Campaign Title</label>
                                <input 
                                    type="text" 
                                    value={newPromoConfig.title}
                                    onChange={(e) => setNewPromoConfig({...newPromoConfig, title: e.target.value})}
                                    placeholder="e.g. Summer Flash Sale"
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-neon-pink outline-none"
                                />
                            </div>

                             {/* Discount Configuration */}
                             <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold">Discount Configuration</label>
                                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                                    <div className="flex bg-zinc-900 p-1 rounded-lg border border-white/10 w-fit">
                                        <button 
                                            onClick={() => setNewPromoConfig({...newPromoConfig, discountType: 'PERCENTAGE'})}
                                            className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${newPromoConfig.discountType === 'PERCENTAGE' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            <Percent className="w-3.5 h-3.5" />
                                            Percentage Off
                                        </button>
                                        <button 
                                            onClick={() => setNewPromoConfig({...newPromoConfig, discountType: 'FIXED'})}
                                            className={`px-4 py-2 rounded-md text-xs font-medium flex items-center gap-2 transition-all ${newPromoConfig.discountType === 'FIXED' ? 'bg-zinc-800 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                                        >
                                            <DollarSign className="w-3.5 h-3.5" />
                                            Fixed Amount Off
                                        </button>
                                    </div>
                                    
                                    <div>
                                        <label className="text-[10px] text-zinc-400 uppercase font-bold mb-1.5 block">
                                            {newPromoConfig.discountType === 'PERCENTAGE' ? 'Discount Percentage' : 'Discount Amount'}
                                        </label>
                                        <div className="relative">
                                            <input 
                                                type="number" 
                                                value={newPromoConfig.discountValue}
                                                onChange={(e) => setNewPromoConfig({...newPromoConfig, discountValue: Number(e.target.value)})}
                                                className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 pl-10 text-white focus:border-neon-cyan outline-none font-mono"
                                            />
                                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                                                {newPromoConfig.discountType === 'PERCENTAGE' ? <Percent className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                                            </div>
                                            {newPromoConfig.discountType === 'PERCENTAGE' && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-500">%</div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                             <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold">Start Timing</label>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="relative">
                                        <select 
                                            value={toLocalDateString(newPromoConfig.startTime)}
                                            onChange={(e) => handleCreationDateChange(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 pl-9 text-white focus:border-neon-pink outline-none text-sm appearance-none cursor-pointer"
                                        >
                                            {dateOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <CalendarDays className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                    <div className="relative">
                                        <select 
                                            value={toLocalTimeString(newPromoConfig.startTime)}
                                            onChange={(e) => handleCreationTimeChange(e.target.value)}
                                            className="w-full bg-zinc-900 border border-white/10 rounded-lg p-2.5 pl-9 text-white focus:border-neon-pink outline-none text-sm appearance-none cursor-pointer"
                                        >
                                            {timeOptions.map(opt => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </select>
                                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs text-zinc-500 font-bold">Duration (Minutes)</label>
                                <input 
                                    type="number" 
                                    value={newPromoConfig.durationMinutes}
                                    onChange={(e) => setNewPromoConfig({...newPromoConfig, durationMinutes: Number(e.target.value)})}
                                    className="w-full bg-zinc-900 border border-white/10 rounded-lg p-3 text-white focus:border-neon-pink outline-none"
                                />
                            </div>

                            {/* Integrated Surge Replication in Creation Flow */}
                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <div className="flex items-center justify-between">
                                    <h5 className="text-sm font-bold text-white flex items-center gap-2">
                                        <Zap className="w-4 h-4 text-neon-cyan" /> 
                                        Enable Surge Replication?
                                    </h5>
                                    <span className="text-xs text-zinc-500">Create multiple waves instantly</span>
                                </div>

                                <div className="p-4 bg-black/20 rounded-xl border border-white/5 space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-xs text-zinc-500 font-bold">Total Waves (Replicates)</label>
                                        <div className="flex items-center gap-4">
                                            <input 
                                                type="range" min="1" max="10"
                                                value={newPromoConfig.replicates}
                                                onChange={(e) => setNewPromoConfig({...newPromoConfig, replicates: Number(e.target.value)})}
                                                className="flex-1 h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-neon-cyan"
                                            />
                                            <span className="text-neon-cyan font-mono font-bold">{newPromoConfig.replicates}x</span>
                                        </div>
                                    </div>

                                    {newPromoConfig.replicates > 1 && (
                                        <div className="space-y-2 animate-[fadeIn_0.3s_ease-out]">
                                            <label className="text-xs text-zinc-500 font-bold">Interval Gap</label>
                                            <div className="flex gap-2">
                                                <input 
                                                    type="number" 
                                                    value={newPromoConfig.intervalValue}
                                                    onChange={(e) => setNewPromoConfig({...newPromoConfig, intervalValue: Number(e.target.value)})}
                                                    className="flex-1 bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan outline-none"
                                                />
                                                <select 
                                                    value={newPromoConfig.intervalUnit}
                                                    onChange={(e) => setNewPromoConfig({...newPromoConfig, intervalUnit: e.target.value as any})}
                                                    className="bg-zinc-900 border border-white/10 rounded-lg p-2 text-white focus:border-neon-cyan outline-none min-w-[100px]"
                                                >
                                                    <option value="Minutes">Minutes</option>
                                                    <option value="Hours">Hours</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                         </div>
                    )}

                    {/* Step 3: Scope */}
                    {creationStep === 3 && (
                        <div className="space-y-6 animate-[slideUp_0.3s_ease-out]">
                             <h4 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Product Scope</h4>
                             
                             <div className="flex gap-4 mb-4">
                                 <button 
                                    onClick={() => setNewPromoConfig({...newPromoConfig, productLevel: 'PRODUCT'})}
                                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${newPromoConfig.productLevel === 'PRODUCT' ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-zinc-500'}`}
                                 >
                                     Specific Products
                                 </button>
                                 <button 
                                    onClick={() => setNewPromoConfig({...newPromoConfig, productLevel: 'SHOP'})}
                                    className={`flex-1 py-3 rounded-xl border text-sm font-medium transition-all ${newPromoConfig.productLevel === 'SHOP' ? 'bg-white/10 border-white/30 text-white' : 'border-white/5 text-zinc-500'}`}
                                 >
                                     Entire Shop
                                 </button>
                             </div>

                             {newPromoConfig.productLevel === 'PRODUCT' && (
                                 <div className="border border-white/5 rounded-xl overflow-hidden">
                                     <div className="max-h-[300px] overflow-y-auto">
                                         <table className="w-full text-left">
                                             <thead className="bg-black/20 text-xs text-zinc-500 uppercase">
                                                 <tr>
                                                     <th className="p-3 w-10">Select</th>
                                                     <th className="p-3">Product</th>
                                                     <th className="p-3 text-right">Original</th>
                                                     <th className="p-3 text-right text-neon-cyan">New Price</th>
                                                 </tr>
                                             </thead>
                                             <tbody className="text-sm">
                                                 {PRODUCTS.map(product => {
                                                     const isSelected = newPromoConfig.selectedProductIds.has(product.id);
                                                     const discountedPrice = calculateDiscountedPrice(product.price);
                                                     
                                                     return (
                                                         <tr 
                                                            key={product.id} 
                                                            onClick={() => {
                                                                const newSet = new Set(newPromoConfig.selectedProductIds);
                                                                if(isSelected) newSet.delete(product.id);
                                                                else newSet.add(product.id);
                                                                setNewPromoConfig({...newPromoConfig, selectedProductIds: newSet});
                                                            }}
                                                            className={`cursor-pointer hover:bg-white/5 transition-colors ${isSelected ? 'bg-white/5' : ''}`}
                                                         >
                                                             <td className="p-3">
                                                                 <div className={`w-4 h-4 border rounded flex items-center justify-center ${isSelected ? 'bg-neon-pink border-neon-pink' : 'border-zinc-600'}`}>
                                                                     {isSelected && <CheckCircle2 className="w-3 h-3 text-black" />}
                                                                 </div>
                                                             </td>
                                                             <td className="p-3 text-zinc-300">
                                                                <div className="font-medium">{product.title}</div>
                                                                <div className="text-[10px] text-zinc-500 font-mono">{product.sku}</div>
                                                             </td>
                                                             <td className="p-3 text-right font-mono text-zinc-500 line-through">${product.price.toFixed(2)}</td>
                                                             <td className="p-3 text-right font-mono font-bold text-neon-cyan">${discountedPrice.toFixed(2)}</td>
                                                         </tr>
                                                     );
                                                 })}
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>
                             )}
                        </div>
                    )}
                </div>

                {/* Right: Preview & Controls */}
                <div className="w-full md:w-5/12 bg-black/20 flex flex-col">
                     <div className="p-6 border-b border-white/5 flex justify-between items-center">
                          <h4 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Live Preview</h4>
                          <span className="text-xs font-mono text-neon-pink">{calculatedPreviews.length} Events Scheduled</span>
                     </div>

                     <div className="flex-1 overflow-y-auto p-6 space-y-3">
                         {calculatedPreviews.length === 0 ? (
                             <div className="h-full flex flex-col items-center justify-center text-zinc-600 gap-2 opacity-50">
                                 <ShoppingBag className="w-8 h-8" />
                                 <span className="text-sm">Configure campaign to see preview</span>
                             </div>
                         ) : (
                             calculatedPreviews.map((p, idx) => (
                              <div key={idx} className="flex gap-4 items-start group animate-[slideUp_0.2s_ease-out]">
                                  <div className="flex flex-col items-center pt-1">
                                      <div className="w-2 h-2 rounded-full bg-zinc-700 group-hover:bg-neon-pink transition-colors" />
                                      {idx !== calculatedPreviews.length - 1 && (
                                          <div className="w-px h-full bg-zinc-800 my-1" />
                                      )}
                                  </div>
                                  <div className="flex-1 bg-white/5 rounded-lg p-3 border border-white/5 group-hover:border-neon-pink/30 transition-colors">
                                      <div className="flex justify-between items-start mb-1">
                                          <span className="text-sm text-white font-medium">{p.title}</span>
                                          <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded">
                                              {idx === 0 ? 'Main' : `Wave ${idx}`}
                                          </span>
                                      </div>
                                      <div className="text-xs text-zinc-400 font-mono flex items-center gap-2">
                                          <Clock className="w-3 h-3" />
                                          {p.fullStartDate.toLocaleString([], {month:'short', day:'numeric', hour:'2-digit', minute:'2-digit'})} 
                                          <ArrowRightIcon className="w-3 h-3 mx-1" />
                                          {p.fullEndDate.toLocaleString([], {hour:'2-digit', minute:'2-digit'})}
                                      </div>
                                  </div>
                              </div>
                          ))
                         )}
                     </div>

                     <div className="p-6 border-t border-white/5 flex gap-3">
                         {creationStep > 1 && (
                             <button 
                                onClick={() => setCreationStep(prev => prev - 1)}
                                className="px-6 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                             >
                                 Back
                             </button>
                         )}
                         <button 
                            onClick={() => setIsCreating(false)}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all"
                          >
                              Cancel
                          </button>
                         {creationStep < 3 ? (
                             <button 
                                onClick={() => setCreationStep(prev => prev + 1)}
                                className="flex-[2] py-3 rounded-xl bg-white text-black font-bold hover:bg-zinc-200 transition-all"
                             >
                                 Next Step
                             </button>
                         ) : (
                             <button 
                                onClick={confirmCreation}
                                className="flex-[2] py-3 rounded-xl bg-gradient-to-r from-neon-pink to-purple-600 text-white font-bold hover:shadow-[0_0_20px_rgba(255,0,80,0.3)] hover:scale-[1.02] transition-all flex items-center justify-center gap-2"
                             >
                                 <Rocket className="w-4 h-4" />
                                 Launch Campaign
                             </button>
                         )}
                     </div>
                </div>
             </div>
          </div>
      )}
    </div>
  );
};