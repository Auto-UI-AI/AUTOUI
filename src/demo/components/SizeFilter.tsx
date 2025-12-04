import { ToggleGroup, ToggleGroupItem } from '../base/toggle-group';
import { cn } from '../base/utils';

interface SizeFilterProps {
  sizes: string[];
  selected: string[];
  onChange: (sizes: string[]) => void;
  label?: string;
  hideLabel?: boolean;
}

export default function SizeFilter({ sizes, selected, onChange, label = 'Size', hideLabel = false }: SizeFilterProps) {
  return (
    <div className="space-y-2 flex mb:flex mb:flex-col" data-testid="size-filter">
      <p className={` text-sm font-medium text-muted-foreground ${hideLabel ? 'sr-only' : ''}`}>{label}</p>
      <ToggleGroup
        type="multiple"
        value={selected}
        onValueChange={onChange}
        className="flex flex-wrap gap-2"
        aria-label="Select sizes"
      >
        {sizes.map((size) => (
          <ToggleGroupItem
            key={size}
            value={size}
            aria-label={`Select size ${size}`}
            className={cn(
              'px-4 py-2 rounded-full border transition-colors text-sm',
              selected.includes(size) ? 'text-primary-foreground border-primary' : 'border-muted hover:border-primary',
            )}
          >
            {size}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
