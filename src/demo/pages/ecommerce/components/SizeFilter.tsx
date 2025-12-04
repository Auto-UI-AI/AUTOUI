import React from 'react';

interface SizeFilterProps {
  sizes: string[];
  onFilter: (size: string) => void;
}

const SizeFilter: React.FC<SizeFilterProps> = ({ sizes, onFilter }) => {
  return (
    <div className="size-filter">
      {sizes.map((size) => (
        <button key={size} onClick={() => onFilter(size)}>
          {size}
        </button>
      ))}
    </div>
  );
};

export default SizeFilter;
