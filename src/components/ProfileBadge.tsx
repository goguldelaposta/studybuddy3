import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Baby, UserCheck, UserPlus, Users, Network, 
  MessageCircle, MessagesSquare, Crown, Handshake, 
  Megaphone, Award, Rocket, LucideIcon
} from "lucide-react";

interface ProfileBadgeProps {
  name: string;
  description: string;
  icon: string;
  color: string;
  size?: "sm" | "md" | "lg";
  showTooltip?: boolean;
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
};

const colorMap: Record<string, string> = {
  'blue': 'bg-blue-100 text-blue-700 border-blue-200',
  'green': 'bg-green-100 text-green-700 border-green-200',
  'purple': 'bg-purple-100 text-purple-700 border-purple-200',
  'pink': 'bg-pink-100 text-pink-700 border-pink-200',
  'amber': 'bg-amber-100 text-amber-700 border-amber-200',
  'teal': 'bg-teal-100 text-teal-700 border-teal-200',
  'cyan': 'bg-cyan-100 text-cyan-700 border-cyan-200',
  'emerald': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  'orange': 'bg-orange-100 text-orange-700 border-orange-200',
  'gold': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'violet': 'bg-violet-100 text-violet-700 border-violet-200',
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
  showTooltip = true 
}: ProfileBadgeProps) => {
  const IconComponent = iconMap[icon] || Award;
  const colorClasses = colorMap[color] || colorMap.blue;
  const sizeClasses = sizeMap[size];

  const badgeContent = (
    <Badge 
      variant="outline" 
      className={`${colorClasses} ${sizeClasses.badge} font-medium gap-1.5 cursor-default transition-transform hover:scale-105`}
    >
      <IconComponent className={sizeClasses.icon} />
      {name}
    </Badge>
  );

  if (!showTooltip) return badgeContent;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {badgeContent}
      </TooltipTrigger>
      <TooltipContent>
        <p className="font-medium">{name}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </TooltipContent>
    </Tooltip>
  );
};
