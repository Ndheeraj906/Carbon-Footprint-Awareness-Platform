import { useState } from 'react';
import { Car, Zap, Utensils, Send } from 'lucide-react';

export default function Calculator() {
  const [activity, setActivity] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // TODO: Connect to backend API
    setTimeout(() => {
      setIsSubmitting(false);
      setActivity('');
      setAmount('');
      alert('Activity logged successfully! (Mock)');
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Carbon Calculator</h1>
        <p className="text-slate-400">Log your daily activities to track your environmental impact.</p>
      </div>

      <form onSubmit={handleSubmit} className="glass-panel p-6 md:p-8 space-y-6">
        
        <div className="space-y-4">
          <label className="block text-sm font-medium text-slate-300">Category</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => setActivity('transport')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                activity === 'transport' 
                  ? 'border-primary bg-primary/10 text-primary' 
                  : 'border-glass-border bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <Car className="w-8 h-8" />
              <span className="font-medium">Transport</span>
            </button>

            <button
              type="button"
              onClick={() => setActivity('energy')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                activity === 'energy' 
                  ? 'border-amber-500 bg-amber-500/10 text-amber-500' 
                  : 'border-glass-border bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <Zap className="w-8 h-8" />
              <span className="font-medium">Home Energy</span>
            </button>

            <button
              type="button"
              onClick={() => setActivity('diet')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                activity === 'diet' 
                  ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500' 
                  : 'border-glass-border bg-slate-900/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
              }`}
            >
              <Utensils className="w-8 h-8" />
              <span className="font-medium">Diet</span>
            </button>
          </div>
        </div>

        {activity && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <label htmlFor="amount" className="block text-sm font-medium text-slate-300">
              {activity === 'transport' ? 'Distance (km)' : 
               activity === 'energy' ? 'Electricity Usage (kWh)' : 
               'Number of High-Meat Meals'}
            </label>
            <input
              type="number"
              id="amount"
              min="0"
              step="0.1"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="input-field text-xl"
              placeholder="e.g., 25"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={!activity || !amount || isSubmitting}
          className="btn-primary w-full flex items-center justify-center gap-2 mt-8"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
          ) : (
            <>
              <Send className="w-5 h-5" /> Log Activity
            </>
          )}
        </button>

      </form>
    </div>
  );
}
