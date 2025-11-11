/**
 * Buttons or dropdown for filtering products by size.
 */
import React from 'react';
import { ToggleGroup, ToggleGroupItem } from '../base/toggle-group';
import { cn } from '../base/utils';

interface SizeFilterProps {
  sizes: string[];
  selected: string;
  onSelect: (size: string) => void;
}

const SizeFilter: React.FC<SizeFilterProps> = ({ sizes, selected, onSelect }) => {
  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={(val) => val && onSelect(val)}
      className="flex flex-wrap gap-2"
      data-testid="size-filter"
    >
      {sizes.map((size) => (
        <ToggleGroupItem
          key={size}
          value={size}
          aria-label={`Select ${size}`}
          className={cn(
            'px-4 py-2 rounded-full border transition-colors text-sm',
            selected === size ? 'text-primary-foreground border-primary' : 'border-muted hover:border-primary',
          )}
          data-testid={`size-filter-chip-${size}`}
        >
          {size}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

export default SizeFilter;
