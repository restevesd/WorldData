
import React, { useEffect, useState, useRef } from 'react';
import { WorldStat } from '../types';

interface StatCardProps {
  stat: WorldStat;
  isUpdating?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ stat, isUpdating = false }) => {
  const [displayValue, setDisplayValue] = useState(stat.value);
  const [highlight, setHighlight] = useState(false);
  const prevValueRef = useRef(stat.value);

  // Efecto de parpadeo y actualización de valor
  useEffect(() => {
    if (stat.value !== prevValueRef.current) {
      setHighlight(true);
      setDisplayValue(stat.value);
      const timer = setTimeout(() => setHighlight(false), 600);
      prevValueRef.current = stat.value;
      return () => clearTimeout(timer);
    }
  }, [stat.value]);

  const getIcon = (category: string) => {
    switch (category) {
      case 'population': return '👥';
      case 'environment': return '🌱';
      case 'government_economics': return '💰';
      case 'health': return '❤️';
      case 'society_media': return '📱';
      case 'food': return '🍞';
      case 'water': return '💧';
      case 'energy': return '⚡';
      default: return '📊';
    }
  };

  const getColorClasses = (category: string) => {
    switch (category) {
      case 'population': return 'border-blue-500/20 bg-blue-500/5 text-blue-400';
      case 'environment': return 'border-green-500/20 bg-green-500/5 text-green-400';
      case 'government_economics': return 'border-amber-500/20 bg-amber-500/5 text-amber-400';
      case 'health': return 'border-red-500/20 bg-red-500/5 text-red-400';
      case 'society_media': return 'border-purple-500/20 bg-purple-500/5 text-purple-400';
      case 'food': return 'border-orange-500/20 bg-orange-500/5 text-orange-400';
      case 'water': return 'border-cyan-500/20 bg-cyan-500/5 text-cyan-400';
      case 'energy': return 'border-yellow-500/20 bg-yellow-500/5 text-yellow-400';
      default: return 'border-gray-500/20 bg-gray-500/5 text-gray-400';
    }
  };

  return (
    <div 
      className={`
        relative overflow-hidden group
        p-5 rounded-xl border transition-all duration-500
        ${getColorClasses(stat.category)}
        ${highlight ? 'border-white/40 bg-white/5 scale-[1.02]' : 'hover:border-white/20'}
      `}
    >
      {isUpdating && (
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent bg-[length:200%_100%] animate-shine pointer-events-none" />
      )}
      
      <div className="flex items-start justify-between mb-3">
        <div className="flex flex-col">
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50 mb-1">
            {stat.category.replace('_', ' & ')}
          </span>
          <h3 className="text-sm font-semibold text-white leading-tight line-clamp-2">
            {stat.label}
          </h3>
        </div>
        <span className="text-xl grayscale group-hover:grayscale-0 transition-all">{getIcon(stat.category)}</span>
      </div>

      <div className="flex flex-col">
        <div className={`text-xl md:text-2xl font-mono font-bold tracking-tighter truncate transition-all ${isUpdating ? 'opacity-40 blur-[1px]' : 'opacity-100'}`}>
          {displayValue}
        </div>
        <div className="flex items-center gap-1 mt-2">
           <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse"></div>
           <span className="text-[10px] opacity-40 font-medium">REAL-TIME TRACKING</span>
        </div>
      </div>
      
      {/* Glow Effect */}
      <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-current opacity-[0.03] blur-2xl rounded-full" />
    </div>
  );
};

export default StatCard;
