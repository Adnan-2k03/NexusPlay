import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Gamepad2, 
  Users, 
  Zap, 
  Shield, 
  Star,
  ArrowRight,
  Play
} from "lucide-react";

interface LandingPageProps {
  onLogin: () => void;
}

export function LandingPage({ onLogin }: LandingPageProps) {
  const features = [
    {
      icon: Users,
      title: "Find Your Squad",
      description: "Connect with gamers who match your playstyle and skill level"
    },
    {
      icon: Zap,
      title: "Real-Time Matching",
      description: "Instant notifications when players accept your match requests"
    },
    {
      icon: Shield,
      title: "Verified Players",
      description: "Safe, secure platform with authenticated gaming profiles"
    }
  ];

  const games = [
    "Valorant", "League of Legends", "CS2", "Apex Legends", 
    "Rocket League", "Overwatch 2", "Dota 2", "Fortnite"
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Gamepad2 className="h-6 w-6 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground font-display">GameMatch</h1>
        </div>
        
        <Button 
          onClick={onLogin}
          className="gap-2"
          data-testid="button-login-header"
        >
          <Play className="h-4 w-4" />
          Get Started
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="space-y-4">
            <Badge variant="secondary" className="mb-4">
              🎮 Social Gaming Platform
            </Badge>
            <h2 className="text-4xl md:text-6xl font-bold text-foreground font-display leading-tight">
              Find Your Perfect
              <span className="text-primary block">Gaming Squad</span>
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Join thousands of gamers creating teams, finding opponents, and making lasting gaming connections in real-time.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              size="lg" 
              onClick={onLogin}
              className="gap-2 text-lg px-8 py-6"
              data-testid="button-login-hero"
            >
              Start Matching
              <ArrowRight className="h-5 w-5" />
            </Button>
            <p className="text-sm text-muted-foreground">
              Free to join • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Featured Games */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">Popular Games</h3>
          <p className="text-muted-foreground">Find teammates for your favorite games</p>
        </div>
        
        <div className="flex flex-wrap justify-center gap-3 max-w-4xl mx-auto">
          {games.map((game) => (
            <Badge 
              key={game} 
              variant="outline" 
              className="px-4 py-2 text-sm hover-elevate cursor-pointer"
            >
              {game}
            </Badge>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">Why Choose GameMatch?</h3>
          <p className="text-muted-foreground">Built by gamers, for gamers</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Card key={index} className="text-center hover-elevate">
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <h4 className="text-lg font-semibold text-foreground mb-2">
                    {feature.title}
                  </h4>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Social Proof */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto text-center">
          <CardContent className="py-12 px-8">
            <div className="flex justify-center mb-6">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-500 fill-current" />
              ))}
            </div>
            <blockquote className="text-xl text-foreground mb-4 italic">
              "GameMatch helped me find my perfect ranked team. We've climbed from Gold to Diamond together!"
            </blockquote>
            <cite className="text-muted-foreground">
              - ProGamer2024, Valorant Player
            </cite>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center space-y-8">
          <h3 className="text-3xl font-bold text-foreground font-display">
            Ready to Level Up Your Gaming?
          </h3>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Join the community and start finding your perfect gaming matches today.
          </p>
          <Button 
            size="lg" 
            onClick={onLogin}
            className="gap-2 text-lg px-8 py-6"
            data-testid="button-login-cta"
          >
            <Gamepad2 className="h-5 w-5" />
            Start Your Journey
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 border-t border-border">
        <div className="text-center text-muted-foreground text-sm">
          <p>&copy; 2024 GameMatch. Built for the gaming community.</p>
        </div>
      </footer>
    </div>
  );
}