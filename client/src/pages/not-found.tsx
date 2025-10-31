import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background cyber-grid">
      <Card className="w-full max-w-md mx-4 bg-card/80 backdrop-blur-sm border-border">
        <CardContent className="pt-6 text-center space-y-6">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-destructive/20 border border-destructive/50 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-2">404 - NEURAL LINK BROKEN</h1>
              <p className="text-muted-foreground">
                This sector of the Matrix doesn't exist in our database.
              </p>
            </div>
          </div>

          <Link href="/">
            <Button className="w-full bg-primary hover:bg-primary/80 text-primary-foreground glow-primary">
              <ArrowLeft className="w-4 h-4 mr-2" />
              RETURN TO NEURAL DASHBOARD
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
