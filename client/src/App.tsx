import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState, useEffect } from "react";

// Hooks
import { useAuth } from "@/hooks/useAuth";

// Components
import { LandingPage } from "@/components/LandingPage";
import { GameNavigation } from "@/components/GameNavigation";
import { MatchFeed } from "@/components/MatchFeed";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { UserProfile } from "@/components/UserProfile";
import { ProfileSetup } from "@/components/ProfileSetup";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Connections } from "@/components/Connections";
import NotFound from "@/pages/not-found";

// Types
import type { User } from "@shared/schema";

// Utility function to convert database User (with nulls) to component-compatible user (with undefined)
function mapUserForComponents(user: User) {
  return {
    id: user.id,
    gamertag: user.gamertag || "",
    firstName: user.firstName ?? undefined,
    lastName: user.lastName ?? undefined,
    profileImageUrl: user.profileImageUrl ?? undefined,
    bio: user.bio ?? undefined,
    location: user.location ?? undefined,
    age: user.age ?? undefined,
    preferredGames: user.preferredGames ?? undefined,
  };
}

function Router() {
  // Real authentication using useAuth hook
  const { user, isLoading, isAuthenticated } = useAuth();
  
  // ALL hooks must be called before any early returns
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "create" | "profile" | "messages" | "settings" | "profile-setup" | "connections">("home");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Auto-redirect authenticated users without gamertag to profile setup
  useEffect(() => {
    if (isAuthenticated && user && !user.gamertag && currentPage !== "profile-setup") {
      setCurrentPage("profile-setup");
    }
  }, [isAuthenticated, user, currentPage]);

  // Show loading while authentication is being checked - MUST come after ALL hooks
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    // Redirect to Replit Auth endpoint
    window.location.href = '/api/login';
  };

  const handleLogout = () => {
    // Redirect to logout endpoint
    window.location.href = '/api/logout';
  };

  const handleCreateMatch = () => {
    setShowCreateForm(true);
  };

  const handleCancelCreate = () => {
    setShowCreateForm(false);
  };

  const handleSubmitMatch = async (data: any) => {
    try {
      const response = await fetch('/api/match-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create match request');
      }
      
      const newMatch = await response.json();
      console.log('Match request created successfully:', newMatch);
      setShowCreateForm(false);
      
      // Optionally show success message to user
    } catch (error) {
      console.error('Error creating match request:', error);
      // TODO: Show error message to user
    }
  };

  const handleAcceptMatch = async (matchId: string) => {
    try {
      // First, get the match request details to find the accepter (owner)
      const matchResponse = await fetch('/api/match-requests');
      if (!matchResponse.ok) {
        throw new Error('Failed to fetch match requests');
      }
      
      const matches = await matchResponse.json();
      const targetMatch = matches.find((m: any) => m.id === matchId);
      
      if (!targetMatch) {
        throw new Error('Match request not found');
      }

      // Create a match connection between current user (requester) and match owner (accepter)
      const response = await fetch('/api/match-connections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestId: matchId,
          accepterId: targetMatch.userId, // Owner of the match request
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to accept match request');
      }

      const connection = await response.json();
      console.log('Match request accepted successfully:', connection);
      
      // The WebSocket will handle real-time updates
    } catch (error) {
      console.error('Error accepting match request:', error);
      // TODO: Show error message to user
    }
  };

  const handleDeclineMatch = async (matchId: string) => {
    try {
      const response = await fetch(`/api/match-requests/${matchId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'declined'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decline match request');
      }

      const updatedMatch = await response.json();
      console.log('Match request declined successfully:', updatedMatch);
      
      // The WebSocket will handle real-time updates
    } catch (error) {
      console.error('Error declining match request:', error);
      // TODO: Show error message to user
    }
  };

  const renderMainContent = () => {
    if (showCreateForm) {
      return (
        <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
          <CreateMatchForm
            onSubmit={handleSubmitMatch}
            onCancel={handleCancelCreate}
          />
        </div>
      );
    }

    switch (currentPage) {
      case "home":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <MatchFeed
              onCreateMatch={handleCreateMatch}
              onAcceptMatch={handleAcceptMatch}
              onDeclineMatch={handleDeclineMatch}
              currentUserId={user?.id || ""}
            />
          </div>
        );
      case "profile":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
                <ThemeToggle />
              </div>
              {user && user.gamertag && (
                <UserProfile
                  {...mapUserForComponents(user)}
                  isOwn={true}
                  onEdit={() => setCurrentPage("profile-setup")}
                />
              )}
              {user && !user.gamertag && (
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">You need to set up your gamertag and profile to use the matchmaking system.</p>
                  <button 
                    onClick={() => setCurrentPage("profile-setup")}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90"
                    data-testid="button-setup-profile"
                  >
                    Setup Profile
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case "connections":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <Connections currentUserId={user?.id || ""} />
          </div>
        );
      case "search":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-foreground mb-6">Search Players</h1>
              <div className="text-center text-muted-foreground py-12">
                <p>Search functionality coming soon!</p>
                <p className="text-sm mt-2">Find players by game, skill level, or region</p>
              </div>
            </div>
          </div>
        );
      case "messages":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <div className="max-w-2xl mx-auto">
              <h1 className="text-2xl font-bold text-foreground mb-6">Messages</h1>
              <div className="text-center text-muted-foreground py-12">
                <p>Messaging system coming soon!</p>
                <p className="text-sm mt-2">Chat with your matched teammates</p>
              </div>
            </div>
          </div>
        );
      case "settings":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-foreground">Settings</h1>
                <ThemeToggle />
              </div>
              <div className="space-y-6">
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Appearance</h3>
                  <p className="text-sm text-muted-foreground mb-4">Toggle between light and dark themes</p>
                  <ThemeToggle />
                </div>
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Notifications</h3>
                  <p className="text-sm text-muted-foreground">Notification preferences coming soon</p>
                </div>
              </div>
            </div>
          </div>
        );
      case "profile-setup":
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <ProfileSetup
              user={user}
              onComplete={() => {
                setCurrentPage("profile");
                // Trigger a refresh of user data
              }}
              onCancel={() => {
                setCurrentPage(user?.gamertag ? "profile" : "home");
              }}
            />
          </div>
        );
      default:
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <MatchFeed
              onCreateMatch={handleCreateMatch}
              onAcceptMatch={handleAcceptMatch}
              onDeclineMatch={handleDeclineMatch}
              currentUserId={user?.id || ""}
            />
          </div>
        );
    }
  };

  return (
    <Switch>
      {!isAuthenticated ? (
        <Route path="/" component={() => <LandingPage onLogin={handleLogin} />} />
      ) : (
        <>
          <Route path="/">
            {() => (
              <div className="min-h-screen bg-background">
                {user && user.gamertag && (
                  <GameNavigation
                    currentPage={currentPage}
                    onNavigate={(page) => {
                      setCurrentPage(page as any);
                      setShowCreateForm(false);
                    }}
                    user={mapUserForComponents(user)}
                    onLogout={handleLogout}
                    pendingMessages={3}
                  />
                )}
                {renderMainContent()}
              </div>
            )}
          </Route>
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="gamematch-ui-theme">
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;