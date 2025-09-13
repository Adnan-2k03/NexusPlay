import { MatchFeed } from '../MatchFeed';

export default function MatchFeedExample() {
  return (
    <div className="p-4 min-h-screen bg-background">
      <MatchFeed
        onCreateMatch={() => console.log('Create match triggered')}
        onAcceptMatch={(id) => console.log('Accept match:', id)}
        onDeclineMatch={(id) => console.log('Decline match:', id)}
        currentUserId="user1"
      />
    </div>
  );
}