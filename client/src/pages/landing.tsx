import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Zap, Shield, Target, Trophy } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background cyber-grid">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg border border-primary/50 glow-primary flex items-center justify-center">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-primary text-glow">NETRUNNER</h1>
              <p className="text-xs text-muted-foreground mono">v2.077</p>
            </div>
          </div>
          <Button 
            onClick={handleLogin}
            className="bg-primary hover:bg-primary/80 text-primary-foreground glow-primary"
            data-testid="button-login"
          >
            JACK IN
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="text-primary text-glow">CYBER</span>
            <span className="text-foreground">HABITS</span>
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Gamify your daily routines in a cyberpunk universe. Complete habits, earn XP, 
            level up your character, and become the ultimate NetRunner.
          </p>
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-primary-foreground text-lg px-8 py-6 glow-primary"
            data-testid="button-get-started"
          >
            INITIALIZE NEURAL LINK
          </Button>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="bg-card/50 border-border glow-cyan">
            <CardHeader className="text-center">
              <Shield className="w-12 h-12 text-accent mx-auto mb-4" />
              <CardTitle className="text-accent">Habit Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Transform daily routines into cyberpunk missions. Track habits and build streaks 
                to enhance your digital avatar.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border glow-primary">
            <CardHeader className="text-center">
              <Target className="w-12 h-12 text-primary mx-auto mb-4" />
              <CardTitle className="text-primary">RPG Progression</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Gain XP, level up, and unlock new abilities. Your real-world progress 
                powers your virtual character.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-card/50 border-border glow-yellow">
            <CardHeader className="text-center">
              <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <CardTitle className="text-yellow-400">Rewards System</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-center">
                Earn credits through completed tasks and spend them on custom rewards 
                and character upgrades.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-primary/10 to-accent/10 border-primary/50 glow-primary">
          <CardContent className="pt-8">
            <h3 className="text-3xl font-bold mb-4 text-primary text-glow">
              Ready to Jack In?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join the resistance and start building better habits in the neon-lit world of tomorrow.
            </p>
            <Button 
              onClick={handleLogin}
              size="lg"
              className="bg-primary hover:bg-primary/80 text-primary-foreground glow-primary"
              data-testid="button-cta-login"
            >
              CONNECT TO MATRIX
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}