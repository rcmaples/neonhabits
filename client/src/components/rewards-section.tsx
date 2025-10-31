import { Coffee, Gamepad2, ShoppingBag, Music } from "lucide-react";

export function RewardsSection() {
  const rewards = [
    { id: "1", name: "Coffee Break", cost: 25, icon: Coffee },
    { id: "2", name: "Game Session", cost: 75, icon: Gamepad2 },
    { id: "3", name: "New Gear", cost: 200, icon: ShoppingBag },
    { id: "4", name: "Music Album", cost: 50, icon: Music },
  ];

  // Mock available credits
  const availableCredits = 1247;

  return (
    <div className="bg-card rounded-lg border border-border p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-neon-yellow text-glow">REWARD CACHE</h3>
        <div className="mono text-neon-yellow" data-testid="text-available-credits">
          ₡{availableCredits.toLocaleString()} available
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {rewards.map((reward) => {
          const Icon = reward.icon;
          const canAfford = availableCredits >= reward.cost;
          
          return (
            <div 
              key={reward.id}
              className={`p-4 bg-muted/10 rounded-lg border transition-all cursor-pointer group ${
                canAfford 
                  ? "border-muted/20 hover:border-neon-yellow/30" 
                  : "border-muted/20 opacity-50"
              }`}
              data-testid={`reward-${reward.id}`}
            >
              <div className="w-12 h-12 mx-auto mb-3 bg-gradient-to-br from-neon-yellow/20 to-accent/20 rounded-lg border border-neon-yellow/50 flex items-center justify-center glow-yellow group-hover:shadow-lg group-hover:shadow-neon-yellow/20 transition-all duration-300">
                <Icon className="w-6 h-6 text-neon-yellow drop-shadow-[0_0_8px_rgba(255,215,0,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] transition-all duration-300" />
              </div>
              <h4 className="text-sm font-medium text-center mb-1" data-testid={`reward-name-${reward.id}`}>
                {reward.name}
              </h4>
              <p className="text-xs text-center text-muted-foreground mono" data-testid={`reward-cost-${reward.id}`}>
                ₡{reward.cost}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
