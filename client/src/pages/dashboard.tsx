import { CharacterProfile } from "@/components/character-profile";
import { Navigation } from "@/components/navigation";
import { ProgressOverview } from "@/components/progress-overview";
import { HabitTracker } from "@/components/habit-tracker";
import { MissionControl } from "@/components/mission-control";
import { DailiesTracker } from "@/components/dailies-tracker";
import { RewardsSection } from "@/components/rewards-section";
import { LoadoutSection } from "@/components/loadout-section";
import { useCharacter } from "@/hooks/use-character";
import { useAuth } from "@/hooks/useAuth";
import { Settings, Calendar, Target, TrendingUp, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Dashboard() {
  const { character, isLoading } = useCharacter();
  const [location] = useLocation();
  
  const getPageTitle = () => {
    switch (location) {
      case "/habits": return "HABIT PROTOCOLS";
      case "/dailies": return "DAILY ROUTINES"; 
      case "/todos": return "MISSION OBJECTIVES";
      case "/rewards": return "REWARD MATRIX";
      case "/crew": return "NEURAL CREW";
      case "/market": return "CYBER MARKET";
      default: return "NEURAL DASHBOARD";
    }
  };

  const getPageDescription = () => {
    switch (location) {
      case "/habits": return "Automated behavioral enhancement protocols";
      case "/dailies": return "Critical daily maintenance routines";
      case "/todos": return "Active mission objectives and tasks";
      case "/rewards": return "Available reward packages and upgrades";
      case "/crew": return "Connected NetRunners and team status";
      case "/market": return "Equipment and upgrade marketplace";
      default: return "Data stream initialized // System status: OPTIMAL";
    }
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-primary text-glow">Loading Neural Interface...</div>
      </div>
    );
  }

  if (!character) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-destructive">Character not found</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="w-80 bg-card border-r border-border flex flex-col cyber-grid">
        <CharacterProfile character={character} />
        <Navigation />
        
        {/* Quick Actions */}
        <div className="p-4 border-t border-border">
          <Button 
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 glow-accent"
            onClick={() => {
              // Quick habit completion or other action
              alert("Neural link activated! Quick actions coming soon...");
            }}
            data-testid="button-jack-in"
          >
            JACK IN
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-card/50 backdrop-blur-sm border-b border-border p-6 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary text-glow">{getPageTitle()}</h1>
              <p className="text-muted-foreground mt-1">{getPageDescription()}</p>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick stats */}
              <div className="flex gap-6 text-sm">
                <div className="text-center">
                  <div className="text-lg font-bold text-accent mono" data-testid="text-streak">
                    {character.streak}
                  </div>
                  <div className="text-xs text-muted-foreground">STREAK</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-primary mono" data-testid="text-level">
                    {character.level}
                  </div>
                  <div className="text-xs text-muted-foreground">LEVEL</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-neon-cyan mono" data-testid="text-credits">
                    ₡{character.credits}
                  </div>
                  <div className="text-xs text-muted-foreground">CREDITS</div>
                </div>
              </div>
              
              {/* Settings */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="p-2 rounded-md border border-border hover:bg-muted/10 transition-colors"
                    data-testid="button-settings"
                  >
                    <Settings className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Disconnect
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          {location === "/" ? (
            <>
              {/* Progress Overview */}
              <ProgressOverview />

              {/* Active Tasks & Habits */}
              <section className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <HabitTracker />
                <MissionControl />
              </section>

              {/* Rewards & Equipment */}
              <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RewardsSection />
                <LoadoutSection />
              </section>
            </>
          ) : location === "/habits" ? (
            <HabitTracker />
          ) : location === "/dailies" ? (
            <DailiesTracker />
          ) : location === "/todos" ? (
            <MissionControl />
          ) : location === "/rewards" ? (
            <RewardsSection />
          ) : (
            <div className="text-center py-20">
              <h2 className="text-2xl font-bold text-primary text-glow mb-4">
                {getPageTitle()}
              </h2>
              <p className="text-muted-foreground mb-8">
                This neural interface module is currently under development.
              </p>
              <p className="text-sm text-muted-foreground">
                Check back soon for enhanced functionality in this sector.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
