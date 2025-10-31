import { Shield, Zap, Cpu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function LoadoutSection() {
  const equipment = [
    {
      id: "1",
      name: "Neural Firewall v2.1",
      description: "+15 Defense • +5 Focus",
      icon: Shield,
      equipped: true,
      rarity: "primary"
    },
    {
      id: "2",
      name: "Quantum Processor",
      description: "+20 Intelligence • +10 XP Boost",
      icon: Zap,
      equipped: true,
      rarity: "accent"
    },
    {
      id: "3",
      name: "Matrix Interface",
      description: "+25 Skill • +15% Habit Bonus",
      icon: Cpu,
      equipped: true,
      rarity: "cyan"
    },
  ];

  const getRarityClasses = (rarity: string) => {
    switch (rarity) {
      case "primary":
        return "from-primary/20 to-accent/20 border-primary/50";
      case "accent":
        return "from-accent/20 to-primary/20 border-accent/50";
      case "cyan":
        return "from-neon-cyan/20 to-accent/20 border-neon-cyan/50 glow-cyan";
      default:
        return "from-primary/20 to-accent/20 border-primary/50";
    }
  };

  const getRarityTextColor = (rarity: string) => {
    switch (rarity) {
      case "primary":
        return "text-primary";
      case "accent":
        return "text-accent";
      case "cyan":
        return "text-neon-cyan";
      default:
        return "text-primary";
    }
  };

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-primary">LOADOUT</h3>
        <Button 
          className="px-3 py-1 bg-primary/10 text-primary rounded border border-primary/20 text-sm hover:bg-primary/20 transition-colors"
          data-testid="button-customize-loadout"
        >
          CUSTOMIZE
        </Button>
      </div>
      
      <div className="space-y-4">
        {equipment.map((item) => {
          const Icon = item.icon;
          
          return (
            <div 
              key={item.id}
              className="flex items-center gap-4 p-3 bg-muted/10 rounded border border-muted/20"
              data-testid={`equipment-${item.id}`}
            >
              <div className={`w-10 h-10 bg-gradient-to-br rounded border flex items-center justify-center ${getRarityClasses(item.rarity)}`}>
                <Icon className={`w-5 h-5 ${getRarityTextColor(item.rarity)}`} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm" data-testid={`equipment-name-${item.id}`}>
                  {item.name}
                </h4>
                <p className="text-xs text-muted-foreground" data-testid={`equipment-description-${item.id}`}>
                  {item.description}
                </p>
              </div>
              <span className={`text-xs mono ${getRarityTextColor(item.rarity)}`} data-testid={`equipment-status-${item.id}`}>
                {item.equipped ? "EQUIPPED" : "AVAILABLE"}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
