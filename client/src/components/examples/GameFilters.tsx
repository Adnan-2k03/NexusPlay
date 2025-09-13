import { GameFilters } from '../GameFilters';
import { useState } from 'react';

export default function GameFiltersExample() {
  const [filters, setFilters] = useState({});

  return (
    <div className="p-4 max-w-4xl">
      <GameFilters
        onFilterChange={(newFilters) => {
          setFilters(newFilters);
          console.log('Filters changed:', newFilters);
        }}
        activeFilters={filters}
      />
    </div>
  );
}