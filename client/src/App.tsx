import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";

// Hooks
import { useAuth } from "@/hooks/useAuth";

// Components
import { LandingPage } from "@/components/LandingPage";
import { GameNavigation } from "@/components/GameNavigation";
import { MatchFeed } from "@/components/MatchFeed";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";

function Router() {
  // Real authentication using useAuth hook
  const { user, isLoading, isAuthenticated } = useAuth();
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "create" | "profile" | "messages" | "settings">("home");
  const [showCreateForm, setShowCreateForm] = useState(false);

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

  const handleSubmitMatch = (data: any) => {
    console.log("Creating match request:", data);
    setShowCreateForm(false);
    // TODO: Submit to API
  };

  // Show loading while authentication is being checked
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
              onAcceptMatch={(id) => console.log("Accept match:", id)}
              onDeclineMatch={(id) => console.log("Decline match:", id)}
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
                  {...user}
                  gamertag={user.gamertag}
                  isOwn={true}
                  onEdit={() => console.log("Edit profile triggered")}
                />
              )}
              {user && !user.gamertag && (
                <div className="p-6 bg-card rounded-lg border">
                  <h3 className="font-semibold mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-muted-foreground mb-4">You need to set up your gamertag and profile to use the matchmaking system.</p>
                  <button 
                    onClick={() => console.log("Setup profile triggered")}
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
      default:
        return (
          <div className="md:ml-20 pt-16 md:pt-6 pb-16 md:pb-6 px-4">
            <MatchFeed
              onCreateMatch={handleCreateMatch}
              onAcceptMatch={(id) => console.log("Accept match:", id)}
              onDeclineMatch={(id) => console.log("Decline match:", id)}
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
                    user={{ ...user, gamertag: user.gamertag }}
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