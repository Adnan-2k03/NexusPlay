import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchRequestCard } from "./MatchRequestCard";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { MatchRequestWithUser } from "@shared/schema";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GameFilters } from "./GameFilters";
import { RefreshCw, Plus, Wifi, WifiOff, EyeOff, Eye } from "lucide-react";

// Utility function to format time ago
function formatTimeAgo(date: string | Date | null): string {
  if (!date) return "Unknown";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

// Extended type for UI display
interface MatchRequestDisplay extends Omit<MatchRequestWithUser, 'gamertag' | 'profileImageUrl' | 'region' | 'tournamentName'> {
  timeAgo: string;
  gamertag: string; // Override to ensure non-null for display
  profileImageUrl?: string; // Use undefined instead of null for UI consistency
  region?: string; // Use undefined instead of null for UI consistency
  tournamentName?: string; // Use undefined instead of null for UI consistency
}

interface MatchFeedProps {
  onCreateMatch: () => void;
  onAcceptMatch: (id: string) => void;
  onDeclineMatch: (id: string) => void;
  currentUserId?: string;
}

export function MatchFeed({ 
  onCreateMatch, 
  onAcceptMatch, 
  onDeclineMatch,
  currentUserId = "user1"
}: MatchFeedProps) {
  const queryClient = useQueryClient();
  const { isConnected, lastMessage } = useWebSocket();
  const [filters, setFilters] = useState<{ search?: string; game?: string; mode?: string; region?: string }>({});
  const [showHidden, setShowHidden] = useState(false);

  // Fetch match requests from API
  const { data: fetchedMatches = [], isLoading: isFetchingMatches, refetch } = useQuery<MatchRequestWithUser[]>({
    queryKey: ['/api/match-requests', filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.game) params.append('game', filters.game);
      if (filters.mode) params.append('mode', filters.mode);
      if (filters.region) params.append('region', filters.region);
      
      const response = await fetch(`/api/match-requests?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch match requests');
      }
      return response.json();
    },
    retry: false,
  });

  // Fetch hidden match IDs
  const { data: hiddenMatchIds = [] } = useQuery<string[]>({
    queryKey: ['/api/hidden-matches'],
    queryFn: async () => {
      const response = await fetch('/api/hidden-matches');
      if (!response.ok) {
        if (response.status === 401) {
          // User not authenticated, return empty array
          return [];
        }
        throw new Error('Failed to fetch hidden matches');
      }
      return response.json();
    },
    retry: false,
  });

  // Transform backend data to display format (memoized to prevent infinite re-renders)
  const transformedMatches: MatchRequestDisplay[] = useMemo(() => 
    fetchedMatches
      .filter(match => match.gamertag) // Only show matches with valid gamertags
      .map(match => ({
        ...match,
        gamertag: match.gamertag || "Unknown Player",
        profileImageUrl: match.profileImageUrl ?? undefined,
        region: match.region ?? undefined,
        tournamentName: match.tournamentName ?? undefined,
        timeAgo: formatTimeAgo(match.createdAt),
      })), [fetchedMatches]);

  // Handle real-time WebSocket updates
  useEffect(() => {
    if (!lastMessage) return;

    const { type, data } = lastMessage;
    
    switch (type) {
      case 'match_request_created':
        // Invalidate and refetch the match requests to include the new one
        queryClient.invalidateQueries({ queryKey: ['/api/match-requests'] });
        break;
      
      case 'match_request_updated':
        // Update specific match request in the cache
        queryClient.setQueryData(['/api/match-requests', filters], (oldData: MatchRequestWithUser[] | undefined) => {
          if (!oldData || !data) return oldData;
          
          return oldData.map(match => 
            match.id === data.id ? { ...match, ...data } : match
          );
        });
        break;
      
      case 'match_request_deleted':
        // Remove the deleted match request from cache
        queryClient.setQueryData(['/api/match-requests', filters], (oldData: MatchRequestWithUser[] | undefined) => {
          if (!oldData || !data?.id) return oldData;
          
          return oldData.filter(match => match.id !== data.id);
        });
        break;
      
      default:
        // Handle other message types if needed
        break;
    }
  }, [lastMessage, queryClient, filters]);



  const filteredMatches = transformedMatches.filter(match => {
    // Filter by hidden status
    if (!showHidden && hiddenMatchIds.includes(match.id)) {
      return false;
    }
    if (showHidden && !hiddenMatchIds.includes(match.id)) {
      return false;
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      if (!match.gameName.toLowerCase().includes(searchLower) &&
          !match.description.toLowerCase().includes(searchLower) &&
          !match.gamertag.toLowerCase().includes(searchLower)) {
        return false;
      }
    }
    if (filters.game && !match.gameName.toLowerCase().includes(filters.game.toLowerCase())) {
      return false;
    }
    if (filters.mode && match.gameMode !== filters.mode) {
      return false;
    }
    if (filters.region && match.region !== filters.region) {
      return false;
    }
    return true;
  });

  const handleRefresh = () => {
    refetch();
  };

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-16" />
                    <Skeleton className="h-5 w-12" />
                  </div>
                </div>
              </div>
              <Skeleton className="h-5 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <Skeleton className="h-4 w-3/4 mb-4" />
            <div className="flex gap-4">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Match Feed</h1>
          <div className="flex items-center gap-1">
            {isConnected ? (
              <Wifi className="h-4 w-4 text-green-500" />
            ) : (
              <WifiOff className="h-4 w-4 text-red-500" />
            )}
            <span className="text-xs text-muted-foreground">
              {isConnected ? "Live" : "Offline"}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={showHidden ? "default" : "outline"}
            size="sm"
            onClick={() => setShowHidden(!showHidden)}
            data-testid="button-toggle-hidden"
          >
            {showHidden ? <Eye className="h-4 w-4 mr-1" /> : <EyeOff className="h-4 w-4 mr-1" />}
            {showHidden ? "Show All" : "Hidden"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isFetchingMatches}
            data-testid="button-refresh-feed"
          >
            <RefreshCw className={`h-4 w-4 ${isFetchingMatches ? 'animate-spin' : ''}`} />
          </Button>
          <Button
            onClick={onCreateMatch}
            size="sm"
            className="gap-2"
            data-testid="button-create-match"
          >
            <Plus className="h-4 w-4" />
            Create
          </Button>
        </div>
      </div>

      {/* Filters */}
      <GameFilters 
        onFilterChange={setFilters}
        activeFilters={filters}
      />

      {/* Match Feed */}
      <div className="space-y-4">
        {isFetchingMatches ? (
          <LoadingSkeleton />
        ) : filteredMatches.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground space-y-2">
                <p className="text-lg">No matches found</p>
                <p className="text-sm">Try adjusting your filters or create a new match request</p>
              </div>
              <Button 
                onClick={onCreateMatch}
                className="mt-4 gap-2"
                data-testid="button-create-first-match"
              >
                <Plus className="h-4 w-4" />
                Create Your First Match
              </Button>
            </CardContent>
          </Card>
        ) : (
          filteredMatches.map((match) => (
            <MatchRequestCard
              key={match.id}
              {...match}
              isOwn={match.userId === currentUserId}
              onAccept={() => onAcceptMatch(match.id)}
              onDecline={() => onDeclineMatch(match.id)}
            />
          ))
        )}
      </div>

      {/* Live Updates Indicator */}
      {isConnected && (
        <div className="text-center text-xs text-muted-foreground">
          🔴 Live updates enabled • New matches appear automatically
        </div>
      )}
    </div>
  );
}