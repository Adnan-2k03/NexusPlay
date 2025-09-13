import { MatchRequestCard } from '../MatchRequestCard';

export default function MatchRequestCardExample() {
  return (
    <div className="p-4 space-y-4 max-w-md">
      <MatchRequestCard
        id="1"
        gamertag="AlexGamer"
        profileImageUrl=""
        gameName="Valorant"
        gameMode="5v5"
        description="Looking for Diamond+ players for ranked queue. Need good comms!"
        region="NA West"
        status="waiting"
        timeAgo="2 hours ago"
        onAccept={() => console.log('Accept request triggered')}
        onDecline={() => console.log('Decline request triggered')}
      />
      
      <MatchRequestCard
        id="2"
        gamertag="SamTheSniper"
        gameName="League of Legends"
        gameMode="5v5"
        description="Forming team for upcoming tournament. Looking for experienced support and jungle."
        region="NA West"
        tournamentName="Spring Tournament"
        status="connected"
        timeAgo="1 hour ago"
        isOwn={true}
      />
    </div>
  );
}