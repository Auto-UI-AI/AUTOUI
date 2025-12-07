import { useState, useEffect } from 'react';
import { Input } from '@/demo/base/input';
import { Button } from '@/demo/base/button';
import { Search } from 'lucide-react';

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export default function SearchBar({ onSearch, placeholder = 'Search products...', debounceMs = 300 }: SearchBarProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => onSearch(query), debounceMs);
    return () => clearTimeout(handler);
  }, [query, debounceMs, onSearch]);

  return (
    <div className="relative w-full max-w-md" data-testid="search-bar">
      <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        data-testid="search-bar-input"
        className="pl-9 pr-10"
      />
      {query && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1 h-7 w-7 text-gray-400 hover:text-gray-700"
          onClick={() => setQuery('')}
          aria-label="Clear search"
        >
          ✕
        </Button>
      )}
    </div>
  );
}
