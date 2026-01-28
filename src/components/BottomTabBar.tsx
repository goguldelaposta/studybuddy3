import { Link, useLocation } from "react-router-dom";
import { Home, Users, MessageCircle, User } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { useRealtimeNotifications } from "@/hooks/useRealtimeNotifications";
import { triggerHaptic } from "@/hooks/useHapticFeedback";
import { cn } from "@/lib/utils";

interface TabItem {
  path: string;
  icon: typeof Home;
  label: string;
  badge?: number;
}

export function BottomTabBar() {
  const location = useLocation();
  const { unreadCount } = useRealtimeNotifications();

  const tabs: TabItem[] = [
    { path: "/", icon: Home, label: "Acasă" },
    { path: "/groups", icon: Users, label: "Grupuri" },
    { path: "/messages", icon: MessageCircle, label: "Mesaje", badge: unreadCount },
    { path: "/profile", icon: User, label: "Profil" },
  ];

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const handleTabPress = () => {
    triggerHaptic('light');
  };

  return (
    <nav 
      className="fixed bottom-0 left-0 right-0 z-50 md:hidden"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {/* Glassmorphism background */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xl border-t border-border/50" />
      
      <div className="relative flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const active = isActive(tab.path);
          const Icon = tab.icon;
          
          return (
            <Link
              key={tab.path}
              to={tab.path}
              onClick={handleTabPress}
              className={cn(
                "relative flex flex-col items-center justify-center flex-1 h-full min-w-[64px] py-2 transition-colors duration-200",
                active ? "text-primary" : "text-muted-foreground"
              )}
            >
              <motion.div
                className="relative"
                whileTap={{ scale: 0.9 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                {/* Active indicator */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -inset-2 rounded-xl bg-primary/10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                
                <Icon className={cn(
                  "relative w-6 h-6 transition-all duration-200",
                  active && "scale-110"
                )} />
                
                {/* Badge for notifications */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <Badge 
                    className="absolute -top-1 -right-2 h-4 min-w-4 px-1 text-[10px] bg-destructive text-destructive-foreground border-0"
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </Badge>
                )}
              </motion.div>
              
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-all duration-200",
                active ? "opacity-100" : "opacity-70"
              )}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
