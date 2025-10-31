import { Grid3X3, Target, CheckSquare, ListTodo, Gift, Users, ShoppingBag } from "lucide-react";
import { Link, useLocation } from "wouter";

const navigationItems = [
  { icon: Grid3X3, label: "DASHBOARD", href: "/" },
  { icon: Target, label: "HABITS", href: "/habits" },
  { icon: CheckSquare, label: "DAILIES", href: "/dailies" },
  { icon: ListTodo, label: "TO-DOS", href: "/todos" },
  { icon: Gift, label: "REWARDS", href: "/rewards" },
  { icon: Users, label: "CREW", href: "/crew" },
  { icon: ShoppingBag, label: "MARKET", href: "/market" },
];

export function Navigation() {
  const [location] = useLocation();

  return (
    <nav className="flex-1 p-4">
      <ul className="space-y-2">
        {navigationItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          return (
            <li key={item.label}>
              <Link 
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary border border-primary/20 glow-primary" 
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/10"
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
