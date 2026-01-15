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

import { ToggleGroup, ToggleGroupItem } from '@/demo/base/toggleGroup';
import { cn } from '@/demo/base/utils';

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
      className="flex flex-wrap justify-start gap-2"
      data-testid="category-filter"
    >
      {categories.map((category) => (
        <ToggleGroupItem
          key={category}
          value={category}
          aria-label={`Select ${category}`}
          className={cn(
            'px-4 py-2 rounded-full border-0 bg-muted/40 transition-colors text-sm hover:bg-muted/55',
            selected === category ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'text-foreground',
          )}
          data-testid={`category-filter-chip-${category}`}
        >
          {category}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
