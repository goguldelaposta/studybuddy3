import { cn } from "@/lib/utils";

interface OnlineStatusIndicatorProps {
  isOnline: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function OnlineStatusIndicator({ 
  isOnline, 
  size = "md",
  className 
}: OnlineStatusIndicatorProps) {
  const sizeClasses = {
    sm: "w-2 h-2",
    md: "w-3 h-3",
    lg: "w-4 h-4",
  };

  if (!isOnline) return null;

  return (
    <span
      className={cn(
        "absolute rounded-full bg-green-500 border-2 border-background",
        sizeClasses[size],
        className
      )}
      aria-label="Online"
    />
  );
}
