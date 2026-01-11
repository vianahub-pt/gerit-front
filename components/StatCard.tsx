
import React, { useState, useEffect, useRef } from 'react';

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactElement;
  color: 'blue' | 'gray' | 'amber' | 'green';
}

const colorClasses = {
    blue: 'text-blue-600',
    gray: 'text-gray-600',
    amber: 'text-amber-600',
    green: 'text-green-600',
};

export const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);

  useEffect(() => {
    const startValue = prevValueRef.current;
    const endValue = value;
    prevValueRef.current = value;

    if (startValue === endValue) {
      setDisplayValue(endValue);
      return;
    }

    let startTime: number | null = null;
    const duration = 400;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      // easeOutCubic easing function
      const easedProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.round(startValue + (endValue - startValue) * easedProgress);
      
      setDisplayValue(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 cursor-default">
      <p className="text-sm font-medium text-gray-500">{title}</p>
      <div className="flex items-baseline mt-2 space-x-2">
        <div className={colorClasses[color]}>
          {React.cloneElement(icon as React.ReactElement<{ className?: string }>, { className: "w-[22px] h-[22px]" })}
        </div>
        <p className="text-[28px] font-semibold text-gray-900">{displayValue}</p>
      </div>
    </div>
  );
};