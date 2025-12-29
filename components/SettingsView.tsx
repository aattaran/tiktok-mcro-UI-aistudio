import React, { useState } from 'react';
import { 
  User, Mail, Shield, Check, CreditCard, 
  ExternalLink, RefreshCw, Smartphone, 
  Zap, Rocket, LogOut, ArrowRight, Sparkles, 
  Copy, Truck, ShoppingCart, Info, Activity, Clock, AlertTriangle, X
} from 'lucide-react';

const PLANS = [
  {
    id: 'spark',
    name: 'Spark',
    price: '$0',
    description: 'The "Trial" Tier for hobbyists testing the waters.',
    features: [
      '25 Active Products',
      '5 AI Credits/mo',
      'Manual Repricing Only',
      'Manual Promo Creation',
      'Track 50 Shipments'
    ],
    current: false,
    color: 'zinc',
    trial: false
  },
  {
    id: 'velocity',
    name: 'Velocity',
    price: '$49',
    description: 'The "Growth" Tier for serious commerce engines.',
    features: [
      '500 Active Products',
      '50 AI Credits/mo',
      '3 Active Strategies',
      'Standard Calendar View',
      'Track 500 Shipments'
    ],
    current: true,
    color: 'neon-cyan',
    badge: 'Popular',
    trial: true
  },
  {
    id: 'hyperdrive',
    name: 'Hyperdrive',
    price: '$99',
    description: 'The "Power" Tier for high-volume professionals.',
    features: [
      '2,000 Active Products',
      '500 AI Credits/mo',
      '10 Active Strategies',
      'Surge Replicator Unlocked',
      'Track 2,000 Shipments'
    ],
    current: false,
    color: 'neon-pink',
    trial: true
  },
];

const ADD_ONS = [
  {
    id: 'ai_pack',
    name: 'AI Generation Pack',
    price: '$1.00',
    unit: '20 Credits',
    desc: 'Bulk generate titles & descriptions for 20 additional products.',
    icon: Sparkles,
    color: 'text-neon-cyan',
    bg: 'bg-neon-cyan/10'
  },
  {
    id: 'strategy_slot',
    name: 'Strategy Slot Expansion',
    price: '$10.00',
    unit: '+1 Active Strategy',
    desc: 'Run an additional simultaneous Repricer strategy.',
    icon: Zap,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10'
  },
  {
    id: 'surge_wave',
    name: 'Surge Wave Pass',
    price: '$5.00',
    unit: '50 Promo Waves',
    desc: 'Unlock 50 automated promotion replication events.',
    icon: Copy,
    color: 'text-neon-pink',
    bg: 'bg-neon-pink/10'
  },
  {
    id: 'logistics_capacity',
    name: 'Logistics Capacity',
    price: '$3.00',
    unit: '100 Shipment Trackers',
    desc: 'Increase your tracking limit by 100 active shipments.',
    icon: Truck,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10'
  }
];

export const SettingsView: React.FC = () => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const currentPlan = PLANS.find(p => p.current) || PLANS[0];

  const handleCancelClick = () => {
    if (currentPlan.price === '$0') return;
    setShowCancelModal(true);
  };

  const confirmCancellation = () => {
    // In a real app, this would trigger an API call
    console.log("Subscription cancelled. Reverting to Spark at end of period.");
    setShowCancelModal(false);
    alert("Subscription cancelled. Your plan will remain active until the end of the billing period, then revert to Spark.");
  };

  return (
    <div className="h-full flex flex-col gap-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="shrink-0">
        <h2 className="text-2xl font-semibold text-white">System Settings</h2>
        <p className="text-zinc-500 text-sm mt-1">Configure your account, platform connections, and modular capacity.</p>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-8 overflow-y-auto pr-2 custom-scrollbar pb-8">
        
        {/* Left Column: Account & Integration */}
        <div className="lg:col-span-1 space-y-8">
          
          {/* User Profile Card */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-neon-cyan/5 blur-2xl rounded-full" />
            <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <User className="w-4 h-4" /> Personal Profile
            </h3>
            
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-neon-cyan to-neon-pink p-[2px]">
                   <div className="w-full h-full rounded-2xl bg-black flex items-center justify-center text-2xl font-bold text-white">
                     JD
                   </div>
                </div>
                <button className="absolute -bottom-2 -right-2 p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-white transition-colors">
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
              
              <div className="text-center">
                <div className="text-lg font-bold text-white">John Doe</div>
                <div className="text-sm text-zinc-500 flex items-center justify-center gap-1.5 mt-1">
                  <Mail className="w-3.5 h-3.5" /> john.doe@mcro.ai
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <button className="w-full py-2.5 rounded-xl bg-white/5 border border-white/5 text-sm font-medium text-white hover:bg-white/10 transition-all">
                Update Password
              </button>
              <button className="w-full py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-sm font-medium text-red-400 hover:bg-red-500/20 transition-all flex items-center justify-center gap-2">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>

          {/* TikTok Integration Card */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">
             <div className="absolute -left-4 bottom-0 w-32 h-32 bg-neon-pink/5 blur-3xl rounded-full" />
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-6 flex items-center gap-2">
              <Smartphone className="w-4 h-4" /> Platform Link
            </h3>

            <div className="p-4 bg-black/40 border border-white/5 rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center border border-white/10 shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.03-12.08z"/></svg>
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">MCRO_OFFICIAL</div>
                    <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono uppercase">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Connected
                    </div>
                  </div>
                </div>
                <button className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                  <ExternalLink className="w-4 h-4 text-zinc-500" />
                </button>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex justify-between text-xs py-2 border-b border-white/5">
                <span className="text-zinc-500">Last Sync</span>
                <span className="text-zinc-300 font-mono">12m ago</span>
              </div>
              <div className="flex justify-between text-xs py-2 border-b border-white/5">
                <span className="text-zinc-500">Daily Uploads</span>
                <span className="text-zinc-300 font-mono">24/100</span>
              </div>
            </div>

            <button className="w-full mt-6 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all flex items-center justify-center gap-2">
               <RefreshCw className="w-4 h-4" /> Trigger Force Sync
            </button>
          </div>

        </div>

        {/* Right Column: Plans & Marketplace */}
        <div className="lg:col-span-2 space-y-8">
          
          <div className="glass-panel p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-96 h-96 bg-neon-cyan/5 blur-[100px] rounded-full" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
              <div>
                <h3 className="text-2xl font-bold text-white">Subscription Management</h3>
                <p className="text-zinc-500 text-sm mt-1">Current Billing Cycle: 12 Nov - 12 Dec 2025</p>
              </div>
              <div className="flex gap-4 items-center">
                {currentPlan.price !== '$0' && (
                  <button 
                    onClick={handleCancelClick}
                    className="text-xs text-zinc-500 hover:text-red-400 transition-colors font-medium underline underline-offset-4"
                  >
                    Cancel Subscription
                  </button>
                )}
                <div className="px-5 py-3 rounded-2xl bg-gradient-to-br from-neon-cyan/20 to-blue-500/20 border border-neon-cyan/30 flex items-center gap-4">
                  <div className="p-2.5 rounded-xl bg-neon-cyan/20 text-neon-cyan">
                    <CreditCard className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] text-zinc-400 uppercase font-bold tracking-widest">Next Payment</div>
                    <div className="text-xl font-bold text-white font-mono">{currentPlan.price}.00</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Plan Comparison Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
              {PLANS.map((plan) => (
                <div 
                  key={plan.id}
                  className={`
                    flex flex-col rounded-2xl border transition-all duration-300 p-6 relative
                    ${plan.current 
                      ? 'bg-white/5 border-neon-cyan shadow-[0_0_30px_rgba(0,242,234,0.15)] scale-105 z-10' 
                      : 'bg-black/40 border-white/5 hover:border-white/20 hover:scale-[1.02]'}
                  `}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-neon-cyan text-black text-[10px] font-bold uppercase tracking-widest">
                      {plan.badge}
                    </div>
                  )}

                  <div className="mb-6">
                    <h4 className={`text-lg font-bold mb-1 ${plan.current ? 'text-neon-cyan' : 'text-white'}`}>
                      {plan.name}
                    </h4>
                    <div className="flex items-baseline gap-1 mb-2">
                       <span className="text-3xl font-bold text-white">{plan.price}</span>
                       <span className="text-xs text-zinc-500 font-medium">/mo</span>
                    </div>
                    {plan.trial && !plan.current && (
                        <div className="flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-tight mb-2">
                            <Clock className="w-3 h-3" />
                            7-Day Free Trial Available
                        </div>
                    )}
                    <p className="text-xs text-zinc-500 leading-relaxed min-h-[40px]">{plan.description}</p>
                  </div>

                  <div className="flex-1 space-y-3 mb-8">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start gap-2 text-[10px] text-zinc-400 leading-tight">
                        <Check className={`w-3 h-3 flex-shrink-0 mt-0.5 ${plan.current ? 'text-neon-cyan' : 'text-zinc-600'}`} />
                        {feature}
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3">
                    <button 
                      disabled={plan.current}
                      className={`
                        w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2
                        ${plan.current 
                          ? 'bg-zinc-800 text-zinc-500 cursor-default' 
                          : plan.trial 
                            ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.2)] hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]'
                            : 'bg-white text-black hover:bg-zinc-200'}
                      `}
                    >
                      {plan.current ? 'Current Plan' : (plan.trial ? 'Start 7-Day Trial' : 'Select Plan')}
                      {!plan.current && <ArrowRight className="w-3 h-3" />}
                    </button>
                    
                    {plan.current && plan.price !== '$0' && (
                      <button 
                        onClick={() => setShowCancelModal(true)}
                        className="w-full py-2 text-[10px] font-bold text-zinc-500 hover:text-red-400 transition-colors uppercase tracking-widest"
                      >
                        Downgrade to Spark
                      </button>
                    )}
                  </div>
                  
                  {!plan.current && plan.trial && (
                      <p className="text-center text-[9px] text-zinc-600 mt-2 italic">No credit card required to start</p>
                  )}
                </div>
              ))}
            </div>

            {/* Feature Marketplace Section */}
            <div className="space-y-6 pt-10 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <ShoppingCart className="w-5 h-5 text-neon-cyan" />
                            Feature Marketplace
                        </h3>
                        <p className="text-xs text-zinc-500 mt-1">Scale specific capabilities on demand without a full upgrade.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5 text-zinc-400 hover:text-white transition-colors cursor-help group relative">
                        <Info className="w-4 h-4" />
                        <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-zinc-900 border border-white/10 rounded-lg text-[10px] leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20 shadow-2xl">
                            Add-ons are billed instantly. Credits never expire and work alongside any primary plan level.
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {ADD_ONS.map((addon) => (
                        <div key={addon.id} className="p-4 bg-black/20 border border-white/5 rounded-2xl flex items-center justify-between hover:border-white/20 transition-all group">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${addon.bg} ${addon.color}`}>
                                    <addon.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="text-sm font-bold text-white">{addon.name}</div>
                                    <div className="text-[10px] text-zinc-500 mt-0.5">{addon.desc}</div>
                                    <div className={`text-[10px] font-mono mt-1 ${addon.color}`}>{addon.unit}</div>
                                </div>
                            </div>
                            <div className="text-right flex flex-col items-end gap-2">
                                <div className="text-sm font-bold text-white font-mono">{addon.price}</div>
                                <button className="px-4 py-1.5 rounded-lg border border-white/10 text-[10px] font-bold text-zinc-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all">
                                    Buy
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Extra Benefits Footer */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-white/5">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-neon-cyan/10 border border-neon-cyan/20 flex items-center justify-center text-neon-cyan shrink-0">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white mb-1">Compute Priority</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed">Prioritized AI inference queue for generation times &lt; 800ms during peak surges.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white mb-1">System Guardrails</h5>
                    <p className="text-xs text-zinc-500 leading-relaxed">Included coverage for shipments when managed via MCRO Logistics command center.</p>
                  </div>
                </div>
            </div>
          </div>

          {/* Payment Method Preview */}
          <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 border-l-4 border-l-neon-pink">
              <div className="flex items-center gap-5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                   <CreditCard className="w-8 h-8 text-zinc-400" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">Visa ending in •••• 4242</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest mt-1">Expires 12/28</div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-white hover:bg-white/10 transition-all">
                  Edit Method
                </button>
                <button className="px-4 py-2 rounded-lg bg-white/5 border border-white/5 text-xs font-medium text-white hover:bg-white/10 transition-all">
                  Billing History
                </button>
              </div>
          </div>
        </div>
      </div>

      {/* Cancel Confirmation Modal */}
      {showCancelModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out] p-4">
          <div className="w-full max-w-md bg-[#0F1115] border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-red-400" />
                Confirm Cancellation
              </h3>
              <button onClick={() => setShowCancelModal(false)} className="text-zinc-500 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-8 space-y-6">
              <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Are you sure you want to cancel your <span className="text-white font-bold">{currentPlan.name}</span> subscription? 
                  You will lose access to premium features like <span className="text-neon-cyan">Bulk AI Credits</span> and <span className="text-neon-cyan">Advanced Repricing</span> at the end of this billing cycle.
                </p>
              </div>
              
              <div className="space-y-2">
                <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">Ending on</div>
                <div className="text-sm text-white font-mono">12 Dec 2025</div>
              </div>

              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setShowCancelModal(false)}
                  className="flex-1 py-3 rounded-xl border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-all font-bold text-sm"
                >
                  Keep My Plan
                </button>
                <button 
                  onClick={confirmCancellation}
                  className="flex-1 py-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 transition-all font-bold text-sm"
                >
                  Confirm Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
