import type { Character } from "@shared/schema";
import { User } from "lucide-react";

const getSpecializationName = (specialization: string) => {
  switch (specialization) {
    case "netrunner":
      return "NetRunner";
    case "street_samurai":
      return "Street Samurai";
    case "techie":
      return "Techie";
    case "solo":
      return "Solo";
    default:
      return "NetRunner";
  }
};

interface CharacterProfileProps {
  character: Character;
}

export function CharacterProfile({ character }: CharacterProfileProps) {
  const hpPercentage = (character.hp / character.maxHp) * 100;
  const xpPercentage = (character.xp / character.xpToNext) * 100;

  return (
    <div className="p-6 border-b border-border">
      <div className="flex items-center gap-4">
        {/* Cyberpunk avatar placeholder with neon border */}
        <div className="relative">
          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 border border-primary/50 glow-primary flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse-neon"></div>
        </div>
        <div>
          <h2 className="text-lg font-bold text-primary text-glow" data-testid="text-character-name">
            {character.name}
          </h2>
          <p className="text-sm text-muted-foreground mono">
            Level <span data-testid="text-character-level">{character.level}</span> {getSpecializationName(character.specialization || "netrunner")}
          </p>
        </div>
      </div>
      
      {/* Stats Bars */}
      <div className="mt-4 space-y-3">
        {/* HP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">HEALTH</span>
            <span className="mono text-destructive" data-testid="text-character-hp">
              {character.hp}/{character.maxHp}
            </span>
          </div>
          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className="hp-bar absolute inset-0" 
              style={{ "--hp-width": `${hpPercentage}%` } as React.CSSProperties}
            ></div>
          </div>
        </div>
        
        {/* XP Bar */}
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">EXPERIENCE</span>
            <span className="mono text-primary" data-testid="text-character-xp">
              {character.xp.toLocaleString()}/{character.xpToNext.toLocaleString()}
            </span>
          </div>
          <div className="relative h-2 bg-muted/30 rounded-full overflow-hidden glow-primary">
            <div 
              className="xp-bar absolute inset-0" 
              style={{ "--xp-width": `${xpPercentage}%` } as React.CSSProperties}
            ></div>
          </div>
        </div>
        
        {/* Currency */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-xs text-muted-foreground">CREDITS</span>
          <span className="mono text-neon-yellow font-bold" data-testid="text-character-credits">
            ₡{character.credits.toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}
