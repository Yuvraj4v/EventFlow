import { useState, useEffect } from 'react';

export default function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({});
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const diff = new Date(targetDate) - new Date();
      if (diff <= 0) { setExpired(true); return; }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60)
      });
    };
    calculate();
    const timer = setInterval(calculate, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (expired) return (
    <div className="flex items-center gap-2 text-rose-500 font-semibold text-sm">
      <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
      Event has started
    </div>
  );

  return (
    <div className="flex items-center gap-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="flex flex-col items-center">
          <div className="w-14 h-14 bg-gray-900 dark:bg-gray-800 rounded-xl flex items-center justify-center">
            <span className="text-2xl font-bold text-white tabular-nums">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-1 capitalize">{unit}</span>
        </div>
      ))}
    </div>
  );
}
