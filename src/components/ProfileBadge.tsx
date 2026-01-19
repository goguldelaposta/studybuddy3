import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Baby, UserCheck, UserPlus, Users, Network, 
  MessageCircle, MessagesSquare, Crown, Handshake, 
  Megaphone, Award, Rocket, LucideIcon, ShieldCheck, BookOpen, Flame, Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ProfileBadgeProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
  animated?: boolean;
  delay?: number;
}

const iconMap: Record<string, LucideIcon> = {
  'baby': Baby,
  'user-check': UserCheck,
  'user-plus': UserPlus,
  'users': Users,
  'network': Network,
  'message-circle': MessageCircle,
  'messages-square': MessagesSquare,
  'crown': Crown,
  'handshake': Handshake,
  'megaphone': Megaphone,
  'award': Award,
  'rocket': Rocket,
  'shield-check': ShieldCheck,
  'book-open': BookOpen,
  'flame': Flame,
  'star': Star,
};

const colorMap: Record<string, string> = {
  'blue': 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
  'green': 'bg-green-100 text-green-700 border-green-200 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
  'purple': 'bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
  'pink': 'bg-pink-100 text-pink-700 border-pink-200 hover:bg-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-700',
  'amber': 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700',
  'teal': 'bg-teal-100 text-teal-700 border-teal-200 hover:bg-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-700',
  'cyan': 'bg-cyan-100 text-cyan-700 border-cyan-200 hover:bg-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-700',
  'emerald': 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700',
  'orange': 'bg-orange-100 text-orange-700 border-orange-200 hover:bg-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700',
  'gold': 'bg-yellow-100 text-yellow-700 border-yellow-200 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700',
  'violet': 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-700',
};

const glowMap: Record<string, string> = {
  'blue': 'hover:shadow-blue-300/50 dark:hover:shadow-blue-500/30',
  'green': 'hover:shadow-green-300/50 dark:hover:shadow-green-500/30',
  'purple': 'hover:shadow-purple-300/50 dark:hover:shadow-purple-500/30',
  'pink': 'hover:shadow-pink-300/50 dark:hover:shadow-pink-500/30',
  'amber': 'hover:shadow-amber-300/50 dark:hover:shadow-amber-500/30',
  'teal': 'hover:shadow-teal-300/50 dark:hover:shadow-teal-500/30',
  'cyan': 'hover:shadow-cyan-300/50 dark:hover:shadow-cyan-500/30',
  'emerald': 'hover:shadow-emerald-300/50 dark:hover:shadow-emerald-500/30',
  'orange': 'hover:shadow-orange-300/50 dark:hover:shadow-orange-500/30',
  'gold': 'hover:shadow-yellow-300/50 dark:hover:shadow-yellow-500/30',
  'violet': 'hover:shadow-violet-300/50 dark:hover:shadow-violet-500/30',
};

const sizeMap = {
  sm: { badge: 'px-2 py-0.5 text-xs', icon: 'w-3 h-3' },
  md: { badge: 'px-2.5 py-1 text-sm', icon: 'w-4 h-4' },
  lg: { badge: 'px-3 py-1.5 text-base', icon: 'w-5 h-5' },
};

export const ProfileBadge = ({ 
  name, 
  description, 
  icon, 
  color, 
  size = "md",
  showTooltip = true,
  animated = false,
  delay = 0
}: ProfileBadgeProps) => {
  const IconComponent = iconMap[icon] || Award;
  const colorClasses = colorMap[color] || colorMap.blue;
  const glowClasses = glowMap[color] || glowMap.blue;
  const sizeClasses = sizeMap[size];

  const badgeContent = (
    <Badge 
      variant="outline" 
      className={cn(
        colorClasses, 
        sizeClasses.badge, 
        glowClasses,
        "font-medium gap-1.5 cursor-default transition-all duration-300",
        "hover:scale-110 hover:shadow-md",
        animated && "animate-fade-in opacity-0",
        animated && "animate-fill-forwards"
      )}
      style={animated ? { animationDelay: `${delay}ms` } : undefined}
    >
      <IconComponent className={cn(sizeClasses.icon, "transition-transform group-hover:rotate-12")} />
      {name}
    </Badge>
  );

  if (!showTooltip) return badgeContent;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent className="max-w-[200px]">
        <div className="flex items-center gap-2 mb-1">
          <IconComponent className="w-4 h-4" />
          <p className="font-semibold">{name}</p>
        </div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
};
