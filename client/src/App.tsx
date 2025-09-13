import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import { useState } from "react";

// Components
import { LandingPage } from "@/components/LandingPage";
import { GameNavigation } from "@/components/GameNavigation";
import { MatchFeed } from "@/components/MatchFeed";
import { CreateMatchForm } from "@/components/CreateMatchForm";
import { UserProfile } from "@/components/UserProfile";
import { ThemeToggle } from "@/components/ThemeToggle";
import NotFound from "@/pages/not-found";

// Mock user data for demo
const mockUser = {
  id: "user1",
  gamertag: "AlexGamer",
  firstName: "Alex",
  lastName: "Chen",
  profileImageUrl: "",
  bio: "Competitive FPS player looking for ranked teammates. Diamond in Valorant, Global Elite in CS2. Let's climb together!",
  location: "San Francisco, CA",
  age: 24,
  preferredGames: ["Valorant", "CS2", "Apex Legends"],
};

function Router() {
  // Mock authentication state for demo
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "create" | "profile" | "messages" | "settings">("home");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleLogin = () => {
    // In real app, this would redirect to /api/login
    setIsAuthenticated(true);
    console.log("Login triggered - would redirect to /api/login");
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentPage("home");
    console.log("Logout triggered - would redirect to /api/logout");
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
              currentUserId="user1"
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
              <UserProfile
                {...mockUser}
                isOwn={true}
                onEdit={() => console.log("Edit profile triggered")}
              />
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
              currentUserId="user1"
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
                <GameNavigation
                  currentPage={currentPage}
                  onNavigate={(page) => {
                    setCurrentPage(page as any);
                    setShowCreateForm(false);
                  }}
                  user={mockUser}
                  onLogout={handleLogout}
                  pendingMessages={3}
                />
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