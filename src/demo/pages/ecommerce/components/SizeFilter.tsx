import React from 'react';

import { ToggleGroup, ToggleGroupItem } from '@/demo/base/toggleGroup';
import { cn } from '@/demo/base/utils';

interface SizeFilterProps {
  sizes: string[];
  onFilter: (size: string) => void;
  selected?: string;
}

const SizeFilter: React.FC<SizeFilterProps> = ({ sizes, onFilter, selected }) => {
  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={(val) => val && onFilter(val)}
      className="flex flex-wrap justify-start gap-2"
      data-testid="size-filter"
    >
      {sizes.map((size) => (
        <ToggleGroupItem
          key={size}
          value={size}
          aria-label={`Select ${size}`}
          className={cn(
            'px-3 py-1.5 rounded-full border-0 bg-muted/40 transition-colors text-sm hover:bg-muted/55',
            selected === size ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-foreground',
          )}
        >
          {size}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default SizeFilter;
