/**
 * Horizontal category filter chips component.
 * Displays selectable category buttons for filtering products by category.
 *
 * @example
 * ```tsx
 * <CategoryFilter
 *   categories={["All", "Tops", "Bottoms", "Shoes"]}
 *   selected="All"
 *   onSelect={(category) => console.log("Selected", category)}
 * />
 * ```
 */

import { ToggleGroup, ToggleGroupItem } from '../base/toggle-group';
import { cn } from '../base/utils';

interface CategoryFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

export default function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <ToggleGroup
      type="single"
      value={selected}
      onValueChange={(val) => val && onSelect(val)}
      className="flex flex-wrap gap-2"
      data-testid="category-filter"
    >
      {categories.map((category) => (
        <ToggleGroupItem
          key={category}
          value={category}
          aria-label={`Select ${category}`}
          className={cn(
            'px-4 py-2 rounded-full border transition-colors text-sm',
            selected === category ? 'text-primary-foreground border-primary' : 'border-muted hover:border-primary',
          )}
          data-testid={`category-filter-chip-${category}`}
        >
          {category}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
