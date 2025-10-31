import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { Zap, User, Cpu, Shield, Brain, Sword, Wrench, Target } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const createCharacterSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Username can only contain letters, numbers, hyphens, and underscores"),
  specialization: z.enum(["netrunner", "street_samurai", "techie", "solo"], {
    required_error: "Please select a specialization",
  }),
  appearance: z.object({
    avatar: z.enum(["cyber_punk", "neon_ghost", "data_warrior", "code_ninja"]),
    primaryColor: z.enum(["neon_blue", "electric_purple", "cyber_yellow", "matrix_green"]),
  }),
});

type CreateCharacterForm = z.infer<typeof createCharacterSchema>;

const getSpecializationIcon = (specialization: string) => {
  switch (specialization) {
    case "netrunner":
      return <Brain className="w-8 h-8 text-purple-400" />;
    case "street_samurai":
      return <Sword className="w-8 h-8 text-purple-400" />;
    case "techie":
      return <Wrench className="w-8 h-8 text-purple-400" />;
    case "solo":
      return <Target className="w-8 h-8 text-purple-400" />;
    default:
      return <Brain className="w-8 h-8 text-purple-400" />;
  }
};

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

const getSpecializationBonus = (specialization: string) => {
  switch (specialization) {
    case "netrunner":
      return "+5 XP bonus on habits";
    case "street_samurai":
      return "+10 HP bonus";
    case "techie":
      return "+25₡ bonus on todos";
    case "solo":
      return "Double daily streak bonus";
    default:
      return "+5 XP bonus on habits";
  }
};

export default function CharacterCreation() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CreateCharacterForm>({
    resolver: zodResolver(createCharacterSchema),
    defaultValues: {
      username: "",
      specialization: "netrunner",
      appearance: {
        avatar: "cyber_punk",
        primaryColor: "neon_blue",
      },
    },
  });

  const createCharacterMutation = useMutation({
    mutationFn: async (data: CreateCharacterForm) => {
      return apiRequest("POST", "/api/setup-character", data);
    },
    onSuccess: () => {
      toast({
        title: "Neural Interface Activated!",
        description: "Your character has been successfully created. Welcome to the Matrix, NetRunner.",
      });
      
      // Invalidate queries to refresh user and character data
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/character"] });
      
      // Redirect to dashboard
      setLocation("/");
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Character Creation Failed",
        description: error.message || "Failed to create character. Please try again.",
      });
    },
  });

  const onSubmit = (data: CreateCharacterForm) => {
    createCharacterMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-background cyber-grid flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl bg-card/80 backdrop-blur-sm border-primary/50 glow-primary">
        <CardHeader className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-accent/20 rounded-full border-2 border-primary/50 glow-primary flex items-center justify-center">
              <Zap className="w-10 h-10 text-primary" />
            </div>
          </div>
          <div>
            <CardTitle className="text-3xl font-bold text-primary text-glow mb-2">
              NEURAL INTERFACE INITIALIZATION
            </CardTitle>
            <CardDescription className="text-lg text-muted-foreground">
              Configure your NetRunner persona to begin your journey in the cyber realm
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {/* Character Preview */}
          <div className="grid md:grid-cols-4 gap-4">
            <div className="flex flex-col items-center space-y-2 p-4 border border-accent/30 rounded-lg bg-accent/10">
              <User className="w-8 h-8 text-accent" />
              <span className="text-sm font-medium text-accent">Identity</span>
              <span className="text-xs text-muted-foreground mono">
                CYBER-{form.watch("username")?.toUpperCase() || "..."}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 border border-primary/30 rounded-lg bg-primary/10">
              <Cpu className="w-8 h-8 text-primary" />
              <span className="text-sm font-medium text-primary">Neural Core</span>
              <span className="text-xs text-muted-foreground">Level 1 • 0 XP</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 border border-yellow-400/30 rounded-lg bg-yellow-400/10">
              <Shield className="w-8 h-8 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-400">Firewall</span>
              <span className="text-xs text-muted-foreground">100 HP • 0₡</span>
            </div>
            <div className="flex flex-col items-center space-y-2 p-4 border border-purple-400/30 rounded-lg bg-purple-400/10">
              {getSpecializationIcon(form.watch("specialization"))}
              <span className="text-sm font-medium text-purple-400">
                {getSpecializationName(form.watch("specialization"))}
              </span>
              <span className="text-xs text-muted-foreground">
                {getSpecializationBonus(form.watch("specialization"))}
              </span>
            </div>
          </div>

          {/* Username Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-primary text-lg font-semibold">
                      NetRunner Callsign
                    </FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          className="text-lg py-6 pl-4 pr-12 bg-background/50 border-primary/50 focus:border-primary focus:ring-primary"
                          disabled={createCharacterMutation.isPending}
                          data-testid="input-username"
                        />
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <span className="text-xs font-mono text-muted-foreground">
                            CYBER-{field.value ? field.value.toUpperCase() : "..."}
                          </span>
                        </div>
                      </div>
                    </FormControl>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Choose a unique callsign for your NetRunner identity.
                    </p>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="specialization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-accent text-lg font-semibold">
                      Cyberpunk Specialization
                    </FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="text-lg py-6 bg-background/50 border-accent/50 focus:border-accent focus:ring-accent">
                          <SelectValue placeholder="Choose your path" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="netrunner" className="text-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Brain className="w-5 h-5 text-primary" />
                            <div>
                              <div className="font-semibold">NetRunner</div>
                              <div className="text-sm text-muted-foreground">Master of the digital realm</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="street_samurai" className="text-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Sword className="w-5 h-5 text-destructive" />
                            <div>
                              <div className="font-semibold">Street Samurai</div>
                              <div className="text-sm text-muted-foreground">Warrior of the urban jungle</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="techie" className="text-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Wrench className="w-5 h-5 text-yellow-400" />
                            <div>
                              <div className="font-semibold">Techie</div>
                              <div className="text-sm text-muted-foreground">Hardware and system specialist</div>
                            </div>
                          </div>
                        </SelectItem>
                        <SelectItem value="solo" className="text-lg p-4">
                          <div className="flex items-center space-x-3">
                            <Target className="w-5 h-5 text-accent" />
                            <div>
                              <div className="font-semibold">Solo</div>
                              <div className="text-sm text-muted-foreground">Independent operative</div>
                            </div>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                    <p className="text-sm text-muted-foreground">
                      Your specialization affects starting bonuses and gameplay advantages.
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                size="lg"
                className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-primary-foreground text-lg py-6 glow-primary"
                disabled={createCharacterMutation.isPending}
                data-testid="button-create-character"
              >
                {createCharacterMutation.isPending ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/20 border-t-primary-foreground rounded-full animate-spin"></div>
                    <span>INITIALIZING NEURAL LINK...</span>
                  </div>
                ) : (
                  "JACK INTO THE MATRIX"
                )}
              </Button>
            </form>
          </Form>

          {/* Info Text */}
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              By creating your character, you'll gain access to:
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-xs">
              <span className="text-primary">• Habit Tracking System</span>
              <span className="text-accent">• XP & Leveling</span>
              <span className="text-yellow-400">• Credits & Rewards</span>
              <span className="text-purple-400">• Equipment & Upgrades</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}