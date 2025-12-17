import { SuggestedPromptsCard } from './SuggestedPromptsCard';
import { SpendingByCategoryCard } from './SpendingByCategoryCard';
import { UpcomingBillsCard } from './UpcomingBillsCard';

export function InsightCards() {
  return (
    <div className="*:data-[slot=card]:shadow-xs grid grid-cols-1 md:grid-cols-4 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <div className="md:col-span-2">
        <SuggestedPromptsCard />
      </div>
      <div className="md:col-span-1">
        <SpendingByCategoryCard />
      </div>
      <div className="md:col-span-1">
        <UpcomingBillsCard />
      </div>
    </div>
  );
}
