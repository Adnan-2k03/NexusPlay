import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { MatchRequestCard } from "./MatchRequestCard";
import { GameFilters } from "./GameFilters";
import { RefreshCw, Plus, Wifi, WifiOff } from "lucide-react";

interface MatchRequest {
  id: string;
  userId: string;
  gamertag: string;
  profileImageUrl?: string;
  gameName: string;
  gameMode: string;
  description: string;
  region?: string;
  tournamentName?: string;
  status: "waiting" | "connected" | "declined";
  timeAgo: string;
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
  const [matches, setMatches] = useState<MatchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(true);
  const [filters, setFilters] = useState<{ search?: string; game?: string; mode?: string; region?: string }>({});

  // TODO: Replace with real API call
  const mockMatches: MatchRequest[] = [
    {
      id: "1",
      userId: "user2",
      gamertag: "AlexGamer",
      profileImageUrl: "",
      gameName: "Valorant",
      gameMode: "5v5",
      description: "Looking for Diamond+ players for ranked queue. Need good comms!",
      region: "NA West",
      status: "waiting",
      timeAgo: "2 hours ago"
    },
    {
      id: "2",
      userId: "user3",
      gamertag: "SamTheSniper",
      profileImageUrl: "",
      gameName: "Rocket League",
      gameMode: "3v3",
      description: "Casual 3v3 matches, just for fun. All skill levels welcome!",
      region: "NA Central",
      status: "waiting",
      timeAgo: "1 hour ago"
    },
    {
      id: "3",
      userId: "user4",
      gamertag: "JordanPro",
      profileImageUrl: "",
      gameName: "League of Legends",
      gameMode: "5v5",
      description: "Forming team for upcoming tournament. Looking for experienced support and jungle.",
      region: "NA West",
      tournamentName: "Spring Tournament",
      status: "waiting",
      timeAgo: "45 minutes ago"
    },
    {
      id: "4",
      userId: "user2",
      gamertag: "AlexGamer",
      profileImageUrl: "",
      gameName: "CS2",
      gameMode: "5v5",
      description: "Faceit Level 8+ only. Serious players for competitive matches.",
      region: "NA West",
      status: "connected",
      timeAgo: "30 minutes ago"
    },
    {
      id: "5",
      userId: "user5",
      gamertag: "NoobMaster",
      profileImageUrl: "",
      gameName: "Apex Legends",
      gameMode: "3v3",
      description: "Ranked Arenas, looking for consistent teammates. Currently Platinum.",
      region: "NA Central",
      status: "waiting",
      timeAgo: "15 minutes ago"
    }
  ];

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setMatches(mockMatches);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const filteredMatches = matches.filter(match => {
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
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => {
      setMatches([...mockMatches]);
      setIsLoading(false);
    }, 500);
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
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
            data-testid="button-refresh-feed"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
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
        {isLoading ? (
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