import { Leaf, TrendingDown, Target, Award } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export default function Dashboard() {
  const { user } = useAuthStore();
  
  // MOCK DATA for now until we connect to API
  const isLoading = false;
  const ecoScore = 84;
  const totalEmissions = 124.5;
  const goalProgress = 65;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="skeleton h-32 w-full rounded-2xl"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="skeleton h-48 rounded-2xl"></div>
          <div className="skeleton h-48 rounded-2xl"></div>
          <div className="skeleton h-48 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Welcome & Score Banner */}
      <section className="glass-panel p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute -right-20 -top-20 opacity-5 pointer-events-none">
          <Leaf className="w-96 h-96" />
        </div>
        
        <div className="relative z-10 flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Welcome back, {user?.displayName?.split(' ')[0] || 'Eco Warrior'}!</h1>
          <p className="text-slate-400 text-lg max-w-xl">
            You're doing great. Keep tracking your activities to reach your sustainability goals.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center bg-slate-900/50 p-6 rounded-2xl border border-glass-border shadow-inner">
          <span className="text-sm text-slate-400 uppercase tracking-wider font-semibold mb-2">Eco Score</span>
          <div className="text-5xl font-bold text-primary flex items-baseline gap-1">
            {ecoScore}<span className="text-2xl text-slate-500">/100</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${ecoScore}%` }}></div>
          </div>
        </div>
      </section>

      {/* Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
              <TrendingDown className="w-6 h-6" />
            </div>
            <span className="font-medium text-lg">Total Emissions</span>
          </div>
          <div className="text-3xl font-bold">{totalEmissions} <span className="text-lg text-slate-500 font-normal">kg CO₂</span></div>
          <p className="text-sm text-emerald-400 flex items-center gap-1">
            <TrendingDown className="w-4 h-4" /> 12% less than last week
          </p>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-3 bg-purple-500/10 text-purple-400 rounded-xl">
              <Target className="w-6 h-6" />
            </div>
            <span className="font-medium text-lg">Weekly Goal</span>
          </div>
          <div className="text-3xl font-bold">{goalProgress}% <span className="text-lg text-slate-500 font-normal">achieved</span></div>
          <div className="w-full bg-slate-800 rounded-full h-2 mt-auto overflow-hidden">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${goalProgress}%` }}></div>
          </div>
        </div>

        <div className="glass-panel p-6 flex flex-col gap-4">
          <div className="flex items-center gap-3 text-slate-300">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-xl">
              <Award className="w-6 h-6" />
            </div>
            <span className="font-medium text-lg">Achievements</span>
          </div>
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-bold uppercase tracking-wider rounded-full border border-amber-500/30">
              Eco Beginner
            </span>
            <span className="px-3 py-1 bg-slate-800 text-slate-400 text-xs font-bold uppercase tracking-wider rounded-full border border-glass-border">
              3 Day Streak
            </span>
          </div>
        </div>
      </section>

      {/* AI Recommendations */}
      <section className="glass-panel p-8">
        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
          <Leaf className="text-primary w-6 h-6" />
          Personalized Recommendations
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          <div className="p-5 bg-slate-900/50 rounded-xl border border-glass-border hover:border-primary/50 transition-colors cursor-pointer group">
            <h3 className="text-lg font-semibold text-slate-200 group-hover:text-primary transition-colors">Use Public Transport</h3>
            <p className="text-slate-400 text-sm mt-2">Swap 2 car trips for public transit this week.</p>
            <div className="mt-4 inline-flex px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              Save ~15 kg CO₂
            </div>
          </div>

          <div className="p-5 bg-slate-900/50 rounded-xl border border-glass-border hover:border-primary/50 transition-colors cursor-pointer group">
            <h3 className="text-lg font-semibold text-slate-200 group-hover:text-primary transition-colors">Plant-Based Swap</h3>
            <p className="text-slate-400 text-sm mt-2">Replace two high-meat meals with plant-based alternatives.</p>
            <div className="mt-4 inline-flex px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full">
              Save ~8 kg CO₂
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
