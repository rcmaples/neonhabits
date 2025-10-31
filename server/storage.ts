import { eq, desc, and } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "@shared/schema";
import type {
  User,
  InsertUser,
  UpsertUser,
  Character,
  InsertCharacter,
  Habit,
  InsertHabit,
  HabitCompletion,
  Todo,
  InsertTodo,
  Daily,
  InsertDaily,
  Reward,
  InsertReward,
  Equipment,
  InsertEquipment,
  Achievement,
} from "@shared/schema";

const sql = neon(process.env.DATABASE_URL!, {
  fetchOptions: {
    cache: 'no-store',
  },
});
const db = drizzle(sql, { schema });


export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  // Replit Auth required method
  upsertUser(user: UpsertUser): Promise<User>;

  // Characters
  getCharacter(userId: string): Promise<Character | undefined>;
  createCharacter(character: InsertCharacter): Promise<Character>;
  updateCharacter(userId: string, updates: Partial<Character>): Promise<Character>;

  // Habits
  getHabits(userId: string): Promise<Habit[]>;
  createHabit(habit: InsertHabit): Promise<Habit>;
  updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit>;
  deleteHabit(habitId: string): Promise<void>;
  completeHabit(habitId: string, userId: string): Promise<HabitCompletion>;
  getHabitCompletions(userId: string, date?: Date): Promise<HabitCompletion[]>;

  // Todos
  getTodos(userId: string): Promise<Todo[]>;
  createTodo(todo: InsertTodo): Promise<Todo>;
  updateTodo(todoId: string, updates: Partial<Todo>): Promise<Todo>;
  deleteTodo(todoId: string): Promise<void>;
  completeTodo(todoId: string): Promise<Todo>;

  // Dailies
  getDailies(userId: string): Promise<Daily[]>;
  createDaily(daily: InsertDaily): Promise<Daily>;
  updateDaily(dailyId: string, updates: Partial<Daily>): Promise<Daily>;
  deleteDaily(dailyId: string): Promise<void>;
  completeDaily(dailyId: string, userId: string): Promise<Daily>;
  resetDailies(userId: string): Promise<void>;

  // Rewards
  getRewards(userId: string): Promise<Reward[]>;
  createReward(reward: InsertReward): Promise<Reward>;
  purchaseReward(rewardId: string, userId: string): Promise<boolean>;

  // Equipment
  getEquipment(userId: string): Promise<Equipment[]>;
  createEquipment(equipment: InsertEquipment): Promise<Equipment>;
  equipItem(equipmentId: string, userId: string): Promise<Equipment>;

  // Achievements
  getAchievements(userId: string): Promise<Achievement[]>;
  unlockAchievement(userId: string, name: string, description: string): Promise<Achievement>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.email, email)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(schema.users).where(eq(schema.users.username, username)).limit(1);
    return result[0];
  }

  async createUser(user: InsertUser): Promise<User> {
    const result = await db.insert(schema.users).values(user).returning();
    return result[0];
  }

  // Replit Auth required method
  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(schema.users)
      .values(userData)
      .onConflictDoUpdate({
        target: schema.users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async getCharacter(userId: string): Promise<Character | undefined> {
    const result = await db.select().from(schema.characters).where(eq(schema.characters.userId, userId)).limit(1);
    return result[0];
  }

  async createCharacter(character: InsertCharacter): Promise<Character> {
    const result = await db.insert(schema.characters).values(character).returning();
    return result[0];
  }

  async updateCharacter(userId: string, updates: Partial<Character>): Promise<Character> {
    const result = await db.update(schema.characters)
      .set(updates)
      .where(eq(schema.characters.userId, userId))
      .returning();
    return result[0];
  }

  async getHabits(userId: string): Promise<Habit[]> {
    return await db.select().from(schema.habits)
      .where(and(eq(schema.habits.userId, userId), eq(schema.habits.isActive, true)))
      .orderBy(desc(schema.habits.createdAt));
  }

  async createHabit(habit: InsertHabit): Promise<Habit> {
    const result = await db.insert(schema.habits).values(habit).returning();
    return result[0];
  }

  async updateHabit(habitId: string, updates: Partial<Habit>): Promise<Habit> {
    const result = await db.update(schema.habits)
      .set(updates)
      .where(eq(schema.habits.id, habitId))
      .returning();
    return result[0];
  }

  async deleteHabit(habitId: string): Promise<void> {
    await db.update(schema.habits)
      .set({ isActive: false })
      .where(eq(schema.habits.id, habitId));
  }

  async completeHabit(habitId: string, userId: string): Promise<HabitCompletion> {
    const habit = await db.select().from(schema.habits).where(eq(schema.habits.id, habitId)).limit(1);
    if (!habit[0]) throw new Error("Habit not found");

    const now = new Date();
    const updatedHabit = await db.update(schema.habits)
      .set({ 
        streak: habit[0].streak + 1,
        lastCompleted: now
      })
      .where(eq(schema.habits.id, habitId))
      .returning();

    const completion = await db.insert(schema.habitCompletions).values({
      habitId,
      userId,
      xpGained: habit[0].xpReward,
      creditsGained: habit[0].creditsReward,
    }).returning();

    // Update character XP and credits
    const character = await this.getCharacter(userId);
    if (character) {
      const newXp = character.xp + habit[0].xpReward;
      const newCredits = character.credits + habit[0].creditsReward;
      
      // Check for level up
      let newLevel = character.level;
      let xpToNext = character.xpToNext;
      if (newXp >= character.xpToNext) {
        newLevel++;
        xpToNext = Math.floor(character.xpToNext * 1.5);
      }

      await this.updateCharacter(userId, {
        xp: newXp,
        credits: newCredits,
        level: newLevel,
        xpToNext,
      });
    }

    return completion[0];
  }

  async getHabitCompletions(userId: string, date?: Date): Promise<HabitCompletion[]> {
    let whereConditions = [eq(schema.habitCompletions.userId, userId)];
    
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      
      // Add date range filter if needed
      // whereConditions.push(gte(schema.habitCompletions.completedAt, startOfDay));
      // whereConditions.push(lte(schema.habitCompletions.completedAt, endOfDay));
    }

    return await db.select().from(schema.habitCompletions)
      .where(and(...whereConditions))
      .orderBy(desc(schema.habitCompletions.completedAt));
  }

  async getTodos(userId: string): Promise<Todo[]> {
    return await db.select().from(schema.todos)
      .where(eq(schema.todos.userId, userId))
      .orderBy(desc(schema.todos.createdAt));
  }

  async createTodo(todo: InsertTodo): Promise<Todo> {
    const result = await db.insert(schema.todos).values(todo).returning();
    return result[0];
  }

  async updateTodo(todoId: string, updates: Partial<Todo>): Promise<Todo> {
    const result = await db.update(schema.todos)
      .set(updates)
      .where(eq(schema.todos.id, todoId))
      .returning();
    return result[0];
  }

  async deleteTodo(todoId: string): Promise<void> {
    await db.delete(schema.todos).where(eq(schema.todos.id, todoId));
  }

  async completeTodo(todoId: string): Promise<Todo> {
    const todo = await db.select().from(schema.todos).where(eq(schema.todos.id, todoId)).limit(1);
    if (!todo[0]) throw new Error("Todo not found");

    const result = await db.update(schema.todos)
      .set({ 
        isCompleted: true,
        completedAt: new Date()
      })
      .where(eq(schema.todos.id, todoId))
      .returning();

    // Update character XP and credits
    const character = await this.getCharacter(todo[0].userId);
    if (character) {
      const newXp = character.xp + todo[0].xpReward;
      const newCredits = character.credits + todo[0].creditsReward;
      
      // Check for level up
      let newLevel = character.level;
      let xpToNext = character.xpToNext;
      if (newXp >= character.xpToNext) {
        newLevel++;
        xpToNext = Math.floor(character.xpToNext * 1.5);
      }

      await this.updateCharacter(todo[0].userId, {
        xp: newXp,
        credits: newCredits,
        level: newLevel,
        xpToNext,
      });
    }

    return result[0];
  }

  // Dailies methods
  async getDailies(userId: string): Promise<Daily[]> {
    return await db.select().from(schema.dailies)
      .where(and(eq(schema.dailies.userId, userId), eq(schema.dailies.isActive, true)))
      .orderBy(desc(schema.dailies.createdAt));
  }

  async createDaily(daily: InsertDaily): Promise<Daily> {
    const result = await db.insert(schema.dailies).values(daily).returning();
    return result[0];
  }

  async updateDaily(dailyId: string, updates: Partial<Daily>): Promise<Daily> {
    const result = await db.update(schema.dailies)
      .set(updates)
      .where(eq(schema.dailies.id, dailyId))
      .returning();
    return result[0];
  }

  async deleteDaily(dailyId: string): Promise<void> {
    await db.delete(schema.dailies).where(eq(schema.dailies.id, dailyId));
  }

  async completeDaily(dailyId: string, userId: string): Promise<Daily> {
    const daily = await db.select().from(schema.dailies).where(eq(schema.dailies.id, dailyId)).limit(1);
    if (!daily[0]) throw new Error("Daily not found");

    const today = new Date().toISOString().split('T')[0]; // Get YYYY-MM-DD format
    const isAlreadyCompletedToday = daily[0].lastCompletedDate === today;

    if (isAlreadyCompletedToday) {
      throw new Error("Daily already completed today");
    }

    // Update streak: increment if completed yesterday, reset if gap
    let newStreak = daily[0].streak;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (daily[0].lastCompletedDate === yesterdayStr) {
      newStreak += 1; // Consecutive day
    } else if (daily[0].lastCompletedDate === null || daily[0].lastCompletedDate !== today) {
      newStreak = 1; // First completion or gap in streak
    }

    const result = await db.update(schema.dailies)
      .set({ 
        isCompletedToday: true,
        lastCompletedDate: today,
        streak: newStreak
      })
      .where(eq(schema.dailies.id, dailyId))
      .returning();

    // Update character XP and credits
    const character = await this.getCharacter(userId);
    if (character) {
      const newXp = character.xp + daily[0].xpReward;
      const newCredits = character.credits + daily[0].creditsReward;
      
      // Check for level up
      let newLevel = character.level;
      let xpToNext = character.xpToNext;
      if (newXp >= character.xpToNext) {
        newLevel++;
        xpToNext = Math.floor(character.xpToNext * 1.5);
      }

      await this.updateCharacter(userId, {
        xp: newXp,
        credits: newCredits,
        level: newLevel,
        xpToNext,
      });
    }

    return result[0];
  }

  async resetDailies(userId: string): Promise<void> {
    // Reset all dailies for a new day - called by a daily cron job
    await db.update(schema.dailies)
      .set({ isCompletedToday: false })
      .where(and(eq(schema.dailies.userId, userId), eq(schema.dailies.isActive, true)));
  }

  async getRewards(userId: string): Promise<Reward[]> {
    return await db.select().from(schema.rewards)
      .where(and(eq(schema.rewards.userId, userId), eq(schema.rewards.isAvailable, true)))
      .orderBy(schema.rewards.cost);
  }

  async createReward(reward: InsertReward): Promise<Reward> {
    const result = await db.insert(schema.rewards).values(reward).returning();
    return result[0];
  }

  async purchaseReward(rewardId: string, userId: string): Promise<boolean> {
    const reward = await db.select().from(schema.rewards).where(eq(schema.rewards.id, rewardId)).limit(1);
    const character = await this.getCharacter(userId);
    
    if (!reward[0] || !character || character.credits < reward[0].cost) {
      return false;
    }

    await this.updateCharacter(userId, {
      credits: character.credits - reward[0].cost
    });

    return true;
  }

  async getEquipment(userId: string): Promise<Equipment[]> {
    return await db.select().from(schema.equipment)
      .where(eq(schema.equipment.userId, userId))
      .orderBy(desc(schema.equipment.isEquipped));
  }

  async createEquipment(equipment: InsertEquipment): Promise<Equipment> {
    const result = await db.insert(schema.equipment).values(equipment).returning();
    return result[0];
  }

  async equipItem(equipmentId: string, userId: string): Promise<Equipment> {
    // First, unequip all items of the same type
    const equipment = await db.select().from(schema.equipment).where(eq(schema.equipment.id, equipmentId)).limit(1);
    if (!equipment[0]) throw new Error("Equipment not found");

    await db.update(schema.equipment)
      .set({ isEquipped: false })
      .where(and(
        eq(schema.equipment.userId, userId),
        eq(schema.equipment.type, equipment[0].type)
      ));

    // Then equip the selected item
    const result = await db.update(schema.equipment)
      .set({ isEquipped: true })
      .where(eq(schema.equipment.id, equipmentId))
      .returning();

    return result[0];
  }

  async getAchievements(userId: string): Promise<Achievement[]> {
    return await db.select().from(schema.achievements)
      .where(eq(schema.achievements.userId, userId))
      .orderBy(desc(schema.achievements.unlockedAt));
  }

  async unlockAchievement(userId: string, name: string, description: string): Promise<Achievement> {
    const result = await db.insert(schema.achievements).values({
      userId,
      name,
      description,
    }).returning();

    // Grant achievement rewards
    const character = await this.getCharacter(userId);
    if (character) {
      await this.updateCharacter(userId, {
        xp: character.xp + result[0].xpReward,
        credits: character.credits + result[0].creditsReward,
      });
    }

    return result[0];
  }
}

export const storage = new DatabaseStorage();
