import { Calendar, TrendingUp, Award } from "lucide-react";

export function ProgressOverview() {
  // Mock data for now - in real app this would come from hooks
  const weekData = [
    { day: "MON", percentage: 90 },
    { day: "TUE", percentage: 75 },
    { day: "WED", percentage: 100 },
    { day: "THU", percentage: 85 },
    { day: "FRI", percentage: 65 },
    { day: "SAT", percentage: 0 },
    { day: "SUN", percentage: 0 },
  ];

  const dailyHabits = [
    { id: "1", name: "Morning Workout", completed: false },
    { id: "2", name: "Code Review", completed: false },
    { id: "3", name: "Meditation", completed: true },
  ];

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Daily Progress */}
      <div className="bg-card rounded-lg border border-border p-6 glow-primary">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary">DAILY SYNC</h3>
          <Calendar className="w-5 h-5 text-primary" />
        </div>
        <div className="space-y-4">
          {dailyHabits.map((habit) => (
            <div 
              key={habit.id}
              className={`flex items-center justify-between p-3 rounded border ${
                habit.completed 
                  ? "bg-accent/10 border-accent/30" 
                  : "bg-muted/20 border-muted/30"
              }`}
              data-testid={`daily-habit-${habit.id}`}
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse-neon"></div>
                <span className={`text-sm ${habit.completed ? "line-through text-muted-foreground" : ""}`}>
                  {habit.name}
                </span>
              </div>
              <div className={`w-6 h-6 rounded border flex items-center justify-center ${
                habit.completed 
                  ? "bg-accent/20 border-accent" 
                  : "border-primary/50 hover:bg-primary/20 transition-colors cursor-pointer"
              }`}>
                {habit.completed && <div className="w-4 h-4 text-accent">✓</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-card rounded-lg border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-accent">WEEK ANALYSIS</h3>
          <TrendingUp className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-3">
          {weekData.map((day) => (
            <div key={day.day} className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground mono">{day.day}</span>
              <div className="flex-1 mx-2 h-2 bg-muted/30 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                  style={{ width: `${day.percentage}%` }}
                ></div>
              </div>
              <span className="text-xs mono">{day.percentage}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Achievement Showcase */}
      <div className="bg-card rounded-lg border border-border p-6 glow-accent">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-accent">RECENT UNLOCK</h3>
          <Award className="w-5 h-5 text-accent" />
        </div>
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-accent/20 to-primary/20 rounded-lg border border-accent/50 glow-accent flex items-center justify-center">
            <div className="w-8 h-8 text-accent">⚡</div>
          </div>
          <h4 className="font-semibold text-accent mb-1" data-testid="text-achievement-name">
            Code Warrior
          </h4>
          <p className="text-xs text-muted-foreground" data-testid="text-achievement-description">
            Complete 100 coding tasks
          </p>
          <div className="mt-3 text-xs mono text-primary">+500 XP • +₡250</div>
        </div>
      </div>
    </section>
  );
}
