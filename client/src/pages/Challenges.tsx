import { Trophy, Flag, CheckCircle2, Circle } from 'lucide-react';
import { useState } from 'react';

export default function Challenges() {
  const [activeTab, setActiveTab] = useState<'goals' | 'badges'>('goals');

  // MOCK DATA
  const goals = [
    { id: 1, title: 'Reduce transport emissions by 15%', progress: 8, target: 15, unit: '%', completed: false },
    { id: 2, title: 'Have 4 plant-based meals this week', progress: 4, target: 4, unit: 'meals', completed: true },
    { id: 3, title: 'Keep electricity under 50 kWh', progress: 32, target: 50, unit: 'kWh', completed: false },
  ];

  const badges = [
    { id: 1, name: 'Eco Beginner', desc: 'Logged your first activity', achieved: true },
    { id: 2, name: 'Carbon Hero', desc: 'Met 5 weekly goals', achieved: true },
    { id: 3, name: 'Plant Power', desc: 'Logged 10 plant-based meals', achieved: false },
    { id: 4, name: 'Transit Master', desc: 'Used public transport 5 days in a row', achieved: false },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Challenges & Goals</h1>
          <p className="text-slate-400">Push yourself to reduce your footprint and earn achievements.</p>
        </div>
        
        <div className="flex bg-slate-900/50 p-1 rounded-lg border border-glass-border">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'goals' ? 'bg-primary/20 text-primary shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Weekly Goals
          </button>
          <button
            onClick={() => setActiveTab('badges')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'badges' ? 'bg-amber-500/20 text-amber-500 shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Badges
          </button>
        </div>
      </div>

      <div className="glass-panel p-6 md:p-8">
        
        {activeTab === 'goals' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Flag className="w-5 h-5 text-primary" /> Active Goals
              </h2>
              <button className="text-sm text-primary hover:underline font-medium">
                + New Goal
              </button>
            </div>

            <div className="grid gap-4">
              {goals.map(goal => (
                <div key={goal.id} className={`p-5 rounded-xl border ${goal.completed ? 'border-primary/30 bg-primary/5' : 'border-glass-border bg-slate-900/50'}`}>
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-3">
                      {goal.completed ? (
                        <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                      ) : (
                        <Circle className="w-6 h-6 text-slate-600 shrink-0" />
                      )}
                      <h3 className={`font-semibold ${goal.completed ? 'text-slate-200 line-through opacity-70' : 'text-slate-100'}`}>
                        {goal.title}
                      </h3>
                    </div>
                    <span className="text-sm font-medium text-slate-400 whitespace-nowrap">
                      {goal.progress} / {goal.target} {goal.unit}
                    </span>
                  </div>
                  
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all duration-1000 ${goal.completed ? 'bg-primary' : 'bg-slate-400'}`} 
                      style={{ width: `${Math.min(100, (goal.progress / goal.target) * 100)}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-6 animate-in fade-in">
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6">
              <Trophy className="w-5 h-5 text-amber-500" /> Achievement Gallery
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {badges.map(badge => (
                <div 
                  key={badge.id} 
                  className={`p-6 rounded-xl border flex flex-col items-center text-center gap-3 transition-all ${
                    badge.achieved 
                      ? 'border-amber-500/30 bg-amber-500/10' 
                      : 'border-glass-border bg-slate-900/30 opacity-60 grayscale'
                  }`}
                >
                  <div className={`p-4 rounded-full ${badge.achieved ? 'bg-amber-500/20 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.3)]' : 'bg-slate-800 text-slate-500'}`}>
                    <Trophy className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-200">{badge.name}</h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
