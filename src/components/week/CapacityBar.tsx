'use client';

interface CapacityBarProps {
  used: number;
  total: number;
  showLabel?: boolean;
}

export function CapacityBar({ used, total, showLabel = false }: CapacityBarProps) {
  const percentage = total > 0 ? Math.min((used / total) * 100, 100) : 0;
  const isOverCapacity = used > total;
  const overflowPercentage = isOverCapacity ? ((used - total) / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="capacity-bar">
        <div
          className={`capacity-bar-fill ${isOverCapacity ? 'over-capacity' : ''}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <div className="flex justify-between text-xs text-stone-500 mt-1">
          <span>{Math.round(used / 60)}h scheduled</span>
          <span>{Math.round(total / 60)}h capacity</span>
        </div>
      )}
      {isOverCapacity && (
        <div className="text-xs text-coral-500 mt-1">
          +{Math.round(overflowPercentage)}% over capacity
        </div>
      )}
    </div>
  );
}
