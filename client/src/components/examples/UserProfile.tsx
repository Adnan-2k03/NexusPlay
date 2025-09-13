import { UserProfile } from '../UserProfile';

export default function UserProfileExample() {
  return (
    <div className="p-4 space-y-6 bg-background min-h-screen">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <UserProfile
          id="1"
          gamertag="AlexGamer"
          firstName="Alex"
          lastName="Chen"
          bio="Competitive FPS player looking for ranked teammates. Diamond in Valorant, Global Elite in CS2. Let's climb together!"
          location="San Francisco, CA"
          age={24}
          preferredGames={["Valorant", "CS2", "Apex Legends"]}
          isOwn={true}
          onEdit={() => console.log('Edit profile triggered')}
        />
        
        <UserProfile
          id="2"
          gamertag="SamTheSniper"
          firstName="Sam"
          lastName="Rivera"
          bio="Casual gamer who loves team-based strategy games. Always looking to learn and improve!"
          location="Austin, TX"
          age={28}
          preferredGames={["League of Legends", "Overwatch 2", "Rocket League", "Dota 2"]}
          isOwn={false}
          onMessage={() => console.log('Message user triggered')}
        />
      </div>
    </div>
  );
}