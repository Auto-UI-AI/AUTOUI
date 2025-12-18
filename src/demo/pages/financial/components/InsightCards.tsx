import { SuggestedPromptsCard } from './SuggestedPromptsCard';
import { SpendingByCategoryCard } from './SpendingByCategoryCard';
import { UpcomingBillsCard } from './UpcomingBillsCard';

export function InsightCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 lg:px-6">
      <div className="md:col-span-5">
        <SuggestedPromptsCard />
      </div>
      <div className="md:col-span-4">
        <SpendingByCategoryCard />
      </div>
      <div className="md:col-span-3">
        <UpcomingBillsCard />
      </div>
    </div>
  );
}
