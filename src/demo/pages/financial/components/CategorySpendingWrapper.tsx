import * as React from 'react';
import { SpendingByCategoryCard } from './SpendingByCategoryCard';

export function CategorySpendingWrapper({ period, ...props }: { period?: 7 | 30 | 90 }) {
  return (
    <div className="w-full max-w-2xl">
      <SpendingByCategoryCard period={period} {...props} />
    </div>
  );
}
