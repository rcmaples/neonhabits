import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth + character system
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(), // Nullable for Replit Auth
  username: text("username").unique(), // Keep for character system, nullable for Replit users
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const characters = pgTable("characters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  specialization: text("specialization").notNull().default("netrunner"), // netrunner, street_samurai, techie, solo
  level: integer("level").notNull().default(1),
  xp: integer("xp").notNull().default(0),
  xpToNext: integer("xp_to_next").notNull().default(100),
  hp: integer("hp").notNull().default(100),
  maxHp: integer("max_hp").notNull().default(100),
  credits: integer("credits").notNull().default(0),
  streak: integer("streak").notNull().default(0),
  avatarData: jsonb("avatar_data").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habits = pgTable("habits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  xpReward: integer("xp_reward").notNull().default(25),
  creditsReward: integer("credits_reward").notNull().default(10),
  streak: integer("streak").notNull().default(0),
  color: text("color").notNull().default("primary"),
  isActive: boolean("is_active").notNull().default(true),
  lastCompleted: timestamp("last_completed"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitCompletions = pgTable("habit_completions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  habitId: varchar("habit_id").notNull().references(() => habits.id, { onDelete: "cascade" }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  completedAt: timestamp("completed_at").defaultNow().notNull(),
  xpGained: integer("xp_gained").notNull(),
  creditsGained: integer("credits_gained").notNull(),
});

export const todos = pgTable("todos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  xpReward: integer("xp_reward").notNull().default(50),
  creditsReward: integer("credits_reward").notNull().default(25),
  isCompleted: boolean("is_completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailies = pgTable("dailies", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  difficulty: text("difficulty").notNull().default("medium"), // easy, medium, hard
  xpReward: integer("xp_reward").notNull().default(20),
  creditsReward: integer("credits_reward").notNull().default(8),
  streak: integer("streak").notNull().default(0),
  isCompletedToday: boolean("is_completed_today").notNull().default(false),
  lastCompletedDate: text("last_completed_date"), // Store as YYYY-MM-DD string for easy date comparison
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  description: text("description"),
  cost: integer("cost").notNull(),
  icon: text("icon").notNull().default("gift"),
  isAvailable: boolean("is_available").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const equipment = pgTable("equipment", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: text("type").notNull(), // armor, weapon, accessory
  description: text("description"),
  stats: jsonb("stats").default({}), // { defense: 15, focus: 5 }
  icon: text("icon").notNull().default("shield"),
  isEquipped: boolean("is_equipped").notNull().default(false),
  cost: integer("cost").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const achievements = pgTable("achievements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull().default("award"),
  xpReward: integer("xp_reward").notNull().default(100),
  creditsReward: integer("credits_reward").notNull().default(50),
  unlockedAt: timestamp("unlocked_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Replit Auth specific schemas
export const upsertUserSchema = createInsertSchema(users).omit({
  createdAt: true,
  updatedAt: true,
});

export const insertCharacterSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true,
});

export const insertHabitSchema = createInsertSchema(habits).omit({
  id: true,
  createdAt: true,
  lastCompleted: true,
});

export const insertTodoSchema = createInsertSchema(todos).omit({
  id: true,
  createdAt: true,
  completedAt: true,
}).extend({
  dueDate: z.string().optional().transform((val) => val ? new Date(val) : undefined),
});

export const insertDailySchema = createInsertSchema(dailies).omit({
  id: true,
  createdAt: true,
  lastCompletedDate: true,
});

export const insertRewardSchema = createInsertSchema(rewards).omit({
  id: true,
  createdAt: true,
});

export const insertEquipmentSchema = createInsertSchema(equipment).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertCharacter = z.infer<typeof insertCharacterSchema>;
export type Character = typeof characters.$inferSelect;
export type InsertHabit = z.infer<typeof insertHabitSchema>;
export type Habit = typeof habits.$inferSelect;
export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type InsertTodo = z.infer<typeof insertTodoSchema>;
export type Todo = typeof todos.$inferSelect;
export type InsertDaily = z.infer<typeof insertDailySchema>;
export type Daily = typeof dailies.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;
export type Reward = typeof rewards.$inferSelect;
export type InsertEquipment = z.infer<typeof insertEquipmentSchema>;
export type Equipment = typeof equipment.$inferSelect;
export type Achievement = typeof achievements.$inferSelect;
