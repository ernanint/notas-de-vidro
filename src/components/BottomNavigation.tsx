import { StickyNote, CheckSquare, User, BookOpen, Home } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

const navItems = [
  { icon: StickyNote, label: "Notas", path: "/local" },
  { icon: CheckSquare, label: "Tarefas", path: "/local/tasks" },
  { icon: BookOpen, label: "Compartilhadas", path: "/local/shared" },
  { icon: User, label: "Perfil", path: "/local/profile" },
  { icon: Home, label: "Início", path: "/" },
];

export const BottomNavigation = () => {
  return (
    <nav className="glass-nav">
      <div className="flex justify-around items-center py-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center p-3 rounded-xl transition-all duration-300",
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              )
            }
          >
            {({ isActive }) => (
              <>
                <item.icon 
                  className={cn(
                    "w-6 h-6 transition-all duration-300",
                    isActive && "drop-shadow-[0_0_8px_rgba(147,51,234,0.5)]"
                  )} 
                />
                <span className="text-xs mt-1 font-medium">{item.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};