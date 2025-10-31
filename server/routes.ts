import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { insertHabitSchema, insertTodoSchema, insertDailySchema, insertRewardSchema, insertEquipmentSchema } from "@shared/schema";
import { setupAuth, isAuthenticated } from "./replitAuth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Get character data
      const character = await storage.getCharacter(userId);
      
      res.json({ 
        user: { 
          id: user.id, 
          email: user.email, 
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl
        }, 
        character 
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Character setup for new users
  app.post("/api/setup-character", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { username, specialization, appearance } = z.object({
        username: z.string().min(3).max(20),
        specialization: z.enum(["netrunner", "street_samurai", "techie", "solo"]).default("netrunner"),
        appearance: z.object({
          avatar: z.enum(["cyber_punk", "neon_ghost", "data_warrior", "code_ninja"]).default("cyber_punk"),
          primaryColor: z.enum(["neon_blue", "electric_purple", "cyber_yellow", "matrix_green"]).default("neon_blue"),
        }).default({ avatar: "cyber_punk", primaryColor: "neon_blue" }),
      }).parse(req.body);

      // Check if username is already taken
      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already taken" });
      }

      // Update user with username
      await storage.upsertUser({
        id: userId,
        username: username,
      });

      // Check if character already exists
      const existingCharacter = await storage.getCharacter(userId);
      if (existingCharacter) {
        return res.status(400).json({ message: "Character already exists" });
      }

      // Calculate starting bonuses based on specialization
      const getSpecializationBonuses = (spec: string) => {
        switch (spec) {
          case "netrunner":
            return { hp: 100, maxHp: 100, credits: 0 };
          case "street_samurai":
            return { hp: 110, maxHp: 110, credits: 0 };
          case "techie":
            return { hp: 100, maxHp: 100, credits: 25 };
          case "solo":
            return { hp: 105, maxHp: 105, credits: 10 };
          default:
            return { hp: 100, maxHp: 100, credits: 0 };
        }
      };

      const bonuses = getSpecializationBonuses(specialization);

      // Create character with specialization and appearance
      const character = await storage.createCharacter({
        userId: userId,
        name: `CYBER-${username.toUpperCase()}`,
        specialization: specialization,
        hp: bonuses.hp,
        maxHp: bonuses.maxHp,
        credits: bonuses.credits,
        avatarData: {
          avatar: appearance.avatar,
          primaryColor: appearance.primaryColor,
        },
      });

      // Create specialization-specific equipment
      const getSpecializationEquipment = (spec: string) => {
        switch (spec) {
          case "netrunner":
            return {
              name: "Neural Interface v2.0",
              description: "+15 XP gain • +5 Focus",
              stats: { xpBonus: 15, focus: 5 },
              icon: "cpu",
            };
          case "street_samurai":
            return {
              name: "Combat Exoskeleton",
              description: "+20 Defense • +5 Strength",
              stats: { defense: 20, strength: 5 },
              icon: "shield",
            };
          case "techie":
            return {
              name: "Multi-Tool Implant",
              description: "+10 Defense • +30₡ on tasks",
              stats: { defense: 10, creditsBonus: 30 },
              icon: "wrench",
            };
          case "solo":
            return {
              name: "Tactical Processor",
              description: "+12 Defense • 2x Daily Streaks",
              stats: { defense: 12, streakMultiplier: 2 },
              icon: "target",
            };
          default:
            return {
              name: "Neural Firewall v1.0",
              description: "+10 Defense • +3 Focus",
              stats: { defense: 10, focus: 3 },
              icon: "shield",
            };
        }
      };

      const equipment = getSpecializationEquipment(specialization);
      await storage.createEquipment({
        userId: userId,
        name: equipment.name,
        type: "armor",
        description: equipment.description,
        stats: equipment.stats,
        icon: equipment.icon,
        isEquipped: true,
        cost: 0,
      });

      res.json({ character });
    } catch (error) {
      console.error("Character setup error:", error);
      res.status(400).json({ message: "Character setup failed" });
    }
  });

  // Character routes
  app.get("/api/character", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const character = await storage.getCharacter(userId);
      if (!character) return res.status(404).json({ message: "Character not found" });

      res.json(character);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch character" });
    }
  });

  // Habits routes
  app.get("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const habits = await storage.getHabits(userId);
      res.json(habits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch habits" });
    }
  });

  app.post("/api/habits", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const habitData = insertHabitSchema.parse({ ...req.body, userId });
      
      // Set XP and credits based on difficulty
      const difficultyMultipliers = { easy: 1, medium: 1.5, hard: 2 };
      const multiplier = difficultyMultipliers[habitData.difficulty as keyof typeof difficultyMultipliers] || 1;
      
      const habit = await storage.createHabit({
        ...habitData,
        xpReward: Math.floor(25 * multiplier),
        creditsReward: Math.floor(10 * multiplier),
      });

      res.json(habit);
    } catch (error) {
      res.status(400).json({ message: "Failed to create habit" });
    }
  });

  app.post("/api/habits/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const { id } = req.params;
      const completion = await storage.completeHabit(id, userId);
      res.json(completion);
    } catch (error) {
      res.status(400).json({ message: "Failed to complete habit" });
    }
  });

  // Todos routes
  app.get("/api/todos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const todos = await storage.getTodos(userId);
      res.json(todos);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch todos" });
    }
  });

  app.post("/api/todos", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const todoData = insertTodoSchema.parse({ ...req.body, userId });
      
      // Set XP and credits based on priority
      const priorityMultipliers = { low: 1, medium: 1.5, high: 2 };
      const multiplier = priorityMultipliers[todoData.priority as keyof typeof priorityMultipliers] || 1;
      
      const todo = await storage.createTodo({
        ...todoData,
        xpReward: Math.floor(50 * multiplier),
        creditsReward: Math.floor(25 * multiplier),
      });

      res.json(todo);
    } catch (error) {
      console.error("Todo creation error:", error);
      res.status(400).json({ 
        message: "Failed to create todo",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  app.post("/api/todos/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      const todo = await storage.completeTodo(id);
      res.json(todo);
    } catch (error) {
      res.status(400).json({ message: "Failed to complete todo" });
    }
  });

  // Dailies routes
  app.get("/api/dailies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const dailies = await storage.getDailies(userId);
      res.json(dailies);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch dailies" });
    }
  });

  app.post("/api/dailies", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const dailyData = insertDailySchema.parse({ ...req.body, userId });
      
      // Set XP and credits based on difficulty
      const difficultyMultipliers = { easy: 1, medium: 1.5, hard: 2 };
      const multiplier = difficultyMultipliers[dailyData.difficulty as keyof typeof difficultyMultipliers] || 1;
      
      const daily = await storage.createDaily({
        ...dailyData,
        xpReward: Math.floor(20 * multiplier),
        creditsReward: Math.floor(8 * multiplier),
      });

      res.json(daily);
    } catch (error) {
      res.status(400).json({ message: "Failed to create daily" });
    }
  });

  app.post("/api/dailies/:id/complete", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const { id } = req.params;
      const daily = await storage.completeDaily(id, userId);
      res.json(daily);
    } catch (error) {
      res.status(400).json({ message: error instanceof Error ? error.message : "Failed to complete daily" });
    }
  });

  // Rewards routes
  app.get("/api/rewards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const rewards = await storage.getRewards(userId);
      res.json(rewards);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch rewards" });
    }
  });

  app.post("/api/rewards", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const rewardData = insertRewardSchema.parse({ ...req.body, userId });
      const reward = await storage.createReward(rewardData);
      res.json(reward);
    } catch (error) {
      res.status(400).json({ message: "Failed to create reward" });
    }
  });

  app.post("/api/rewards/:id/purchase", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const { id } = req.params;
      const success = await storage.purchaseReward(id, userId);
      
      if (!success) {
        return res.status(400).json({ message: "Insufficient credits or reward not available" });
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to purchase reward" });
    }
  });

  // Equipment routes
  app.get("/api/equipment", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const equipment = await storage.getEquipment(userId);
      res.json(equipment);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch equipment" });
    }
  });

  app.post("/api/equipment/:id/equip", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const { id } = req.params;
      const equipment = await storage.equipItem(id, userId);
      res.json(equipment);
    } catch (error) {
      res.status(400).json({ message: "Failed to equip item" });
    }
  });

  // Achievements routes
  app.get("/api/achievements", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const achievements = await storage.getAchievements(userId);
      res.json(achievements);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch achievements" });
    }
  });

  // Stats routes
  app.get("/api/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;

      const habits = await storage.getHabits(userId);
      const todos = await storage.getTodos(userId);
      const completions = await storage.getHabitCompletions(userId, new Date());
      const character = await storage.getCharacter(userId);

      const stats = {
        totalHabits: habits.length,
        activeTodos: todos.filter(t => !t.isCompleted).length,
        completedToday: completions.length,
        streak: character?.streak || 0,
      };

      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
