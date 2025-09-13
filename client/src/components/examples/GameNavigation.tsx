import { GameNavigation } from '../GameNavigation';
import { useState } from 'react';

export default function GameNavigationExample() {
  const [currentPage, setCurrentPage] = useState<"home" | "search" | "create" | "profile" | "messages" | "settings">("home");

  const mockUser = {
    gamertag: "AlexGamer",
    profileImageUrl: ""
  };

  return (
    <div className="min-h-screen bg-background">
      <GameNavigation
        currentPage={currentPage}
        onNavigate={(page) => {
          setCurrentPage(page as any);
          console.log('Navigated to:', page);
        }}
        user={mockUser}
        onLogout={() => console.log('Logout triggered')}
        pendingMessages={3}
      />
      
      {/* Content area with proper spacing */}
      <div className="md:ml-20 pt-16 md:pt-0 pb-16 md:pb-0 p-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Current Page: {currentPage}</h1>
          <p className="text-muted-foreground">
            This demonstrates the navigation component with both desktop sidebar and mobile responsive layout.
          </p>
        </div>
      </div>
    </div>
  );
}