import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Filter, X } from "lucide-react";
import { useState } from "react";

interface GameFiltersProps {
  onFilterChange: (filters: { search?: string; game?: string; mode?: string; region?: string }) => void;
  activeFilters?: { search?: string; game?: string; mode?: string; region?: string };
}

export function GameFilters({ onFilterChange, activeFilters = {} }: GameFiltersProps) {
  const [search, setSearch] = useState(activeFilters.search || "");
  const [showFilters, setShowFilters] = useState(false);

  const popularGames = [
    "Valorant", "League of Legends", "CS2", "Apex Legends", "Rocket League",
    "Overwatch 2", "Dota 2", "Fortnite", "Call of Duty", "FIFA 24"
  ];

  const gameModes = ["1v1", "2v2", "3v3", "5v5", "Team"];
  const regions = ["NA West", "NA East", "NA Central", "EU West", "EU East", "Asia", "Oceania"];

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFilterChange({ ...activeFilters, search: value });
  };

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...activeFilters, [key]: value === "all" ? undefined : value };
    onFilterChange(newFilters);
  };

  const clearFilter = (key: string) => {
    const newFilters = { ...activeFilters };
    delete newFilters[key as keyof typeof newFilters];
    onFilterChange(newFilters);
  };

  const clearAllFilters = () => {
    setSearch("");
    onFilterChange({});
  };

  const hasActiveFilters = Object.keys(activeFilters).some(key => activeFilters[key as keyof typeof activeFilters]);

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search games, descriptions, or gamer tags..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="pl-10 pr-4"
          data-testid="input-search"
        />
      </div>

      {/* Filter Toggle */}
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-2"
          data-testid="button-toggle-filters"
        >
          <Filter className="h-4 w-4" />
          Filters
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-1 px-1 py-0 text-xs">
              {Object.keys(activeFilters).filter(key => activeFilters[key as keyof typeof activeFilters]).length}
            </Badge>
          )}
        </Button>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="text-muted-foreground hover:text-foreground"
            data-testid="button-clear-all-filters"
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {activeFilters.game && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Game: {activeFilters.game}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => clearFilter('game')}
                data-testid={`button-clear-game-filter`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.mode && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Mode: {activeFilters.mode}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => clearFilter('mode')}
                data-testid={`button-clear-mode-filter`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
          {activeFilters.region && (
            <Badge variant="secondary" className="gap-1 pr-1">
              Region: {activeFilters.region}
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0 hover:bg-transparent"
                onClick={() => clearFilter('region')}
                data-testid={`button-clear-region-filter`}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        </div>
      )}

      {/* Filter Controls */}
      {showFilters && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-card rounded-lg border">
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Game</label>
            <Select value={activeFilters.game || "all"} onValueChange={(value) => handleFilterChange('game', value)}>
              <SelectTrigger data-testid="select-game-filter">
                <SelectValue placeholder="All games" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All games</SelectItem>
                {popularGames.map((game) => (
                  <SelectItem key={game} value={game}>
                    {game}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mode</label>
            <Select value={activeFilters.mode || "all"} onValueChange={(value) => handleFilterChange('mode', value)}>
              <SelectTrigger data-testid="select-mode-filter">
                <SelectValue placeholder="All modes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All modes</SelectItem>
                {gameModes.map((mode) => (
                  <SelectItem key={mode} value={mode}>
                    {mode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Region</label>
            <Select value={activeFilters.region || "all"} onValueChange={(value) => handleFilterChange('region', value)}>
              <SelectTrigger data-testid="select-region-filter">
                <SelectValue placeholder="All regions" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All regions</SelectItem>
                {regions.map((region) => (
                  <SelectItem key={region} value={region}>
                    {region}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  );
}