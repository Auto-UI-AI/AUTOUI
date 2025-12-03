import * as React from 'react';
import { UpcomingBillsCard } from './UpcomingBillsCard';

export function UpcomingBillsWrapper(props: any) {
  return (
    <div className="w-full max-w-md">
      <UpcomingBillsCard {...props} />
    </div>
  );
}
