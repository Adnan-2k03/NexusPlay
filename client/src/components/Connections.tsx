import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Calendar, Users, Trophy } from "lucide-react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useEffect, useState } from "react";
import { queryClient } from "@/lib/queryClient";
import type { MatchConnection } from "@shared/schema";
import { Chat } from "./Chat";

interface ConnectionsProps {
  currentUserId?: string;
}

function formatTimeAgo(date: string | Date | null): string {
  if (!date) return "Unknown";
  const now = new Date();
  const past = new Date(date);
  const diffMs = now.getTime() - past.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "Just connected";
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
}

export function Connections({ currentUserId }: ConnectionsProps) {
  const { lastMessage } = useWebSocket();
  const [openChatId, setOpenChatId] = useState<string | null>(null);

  const { data: connections = [], isLoading, refetch } = useQuery<MatchConnection[]>({
    queryKey: ['/api/user/connections'],
    queryFn: async () => {
      const response = await fetch('/api/user/connections');
      if (!response.ok) {
        throw new Error('Failed to fetch connections');
      }
      return response.json();
    },
    retry: false,
  });

  // Handle real-time WebSocket updates for connections
  useEffect(() => {
    if (!lastMessage) return;

    const { type } = lastMessage;
    
    if (type === 'match_connection_created' || type === 'match_connection_updated') {
      // Invalidate and refetch connections when they're created or updated
      queryClient.invalidateQueries({ queryKey: ['/api/user/connections'] });
    }
  }, [lastMessage]);

  const LoadingSkeleton = () => (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-6 w-20" />
            </div>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-4 w-full mb-2" />
            <div className="flex gap-2 mb-3">
              <Skeleton className="h-5 w-16" />
              <Skeleton className="h-5 w-12" />
            </div>
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Connections</h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            Loading...
          </Badge>
        </div>
        <LoadingSkeleton />
      </div>
    );
  }

  if (connections.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">My Connections</h1>
          </div>
          <Badge variant="secondary" className="text-sm">
            0 connections
          </Badge>
        </div>
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">No connections yet</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            When you accept match requests or others accept yours, your gaming connections will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">My Connections</h1>
        </div>
        <Badge variant="secondary" className="text-sm">
          {connections.length} connection{connections.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-4">
        {connections.map((connection) => {
          const isRequester = connection.requesterId === currentUserId;
          const timeAgo = formatTimeAgo(connection.createdAt);
          
          return (
            <Card key={connection.id} className="hover:shadow-md transition-shadow" data-testid={`connection-card-${connection.id}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={""} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {isRequester ? "A" : "R"}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {isRequester ? `Accepter: ${connection.accepterId}` : `Requester: ${connection.requesterId}`}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {isRequester ? "You requested to connect" : "They requested to connect"}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={
                      connection.status === 'accepted' ? 'default' : 
                      connection.status === 'pending' ? 'secondary' : 
                      'destructive'
                    }
                    className="text-xs"
                    data-testid={`connection-status-${connection.id}`}
                  >
                    {connection.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{timeAgo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>Match ID: {connection.requestId.slice(-6)}</span>
                    </div>
                  </div>
                  {connection.status === 'accepted' && (
                    <Dialog open={openChatId === connection.id} onOpenChange={(open) => setOpenChatId(open ? connection.id : null)}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="gap-1 text-primary hover:text-primary"
                          data-testid={`button-chat-${connection.id}`}
                        >
                          <MessageCircle className="h-4 w-4" />
                          <span className="text-xs">Chat</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-lg h-[600px] flex flex-col p-0">
                        <DialogHeader className="p-4 pb-3 border-b">
                          <DialogTitle>
                            Chat with {isRequester ? `Accepter ${connection.accepterId}` : `Requester ${connection.requesterId}`}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden">
                          <Chat
                            connectionId={connection.id}
                            currentUserId={currentUserId || ""}
                            otherUserId={isRequester ? connection.accepterId : connection.requesterId}
                            otherUserName={isRequester ? connection.accepterId : connection.requesterId}
                          />
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}