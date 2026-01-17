import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

interface OnlineStatusControlProps {
  status: "online" | "offline";
  onStatusChange: (status: "online" | "offline") => void;
  loading?: boolean;
  className?: string;
}

export function OnlineStatusControl({ 
  status, 
  onStatusChange,
  loading,
  className 
}: OnlineStatusControlProps) {
  const isOnline = status === "online";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex items-center gap-1.5">
        {isOnline ? (
          <Eye className="h-4 w-4 text-green-500" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
        <Label 
          htmlFor="online-status" 
          className="text-sm font-medium cursor-pointer"
        >
          {isOnline ? "Online" : "Ascuns"}
        </Label>
      </div>
      <Switch
        id="online-status"
        checked={isOnline}
        onCheckedChange={(checked) => onStatusChange(checked ? "online" : "offline")}
        disabled={loading}
        className="data-[state=checked]:bg-green-500"
      />
    </div>
  );
}
