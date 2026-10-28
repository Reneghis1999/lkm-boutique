import {
  BatteryCharging,
  BatteryFull,
  Briefcase,
  Cable,
  Cpu,
  Disc3,
  Gamepad2,
  HardDrive,
  Joystick,
  Laptop,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Package,
  PenTool,
  Plug,
  Search,
  Shield,
  Smartphone,
  Speaker,
  Tag,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const iconMap: Record<string, LucideIcon> = {
  BatteryCharging,
  BatteryFull,
  Briefcase,
  Cable,
  Cpu,
  Disc3,
  Gamepad2,
  HardDrive,
  Joystick,
  Laptop,
  MapPin,
  MessageCircle,
  MonitorPlay,
  Package,
  PenTool,
  Plug,
  Search,
  Shield,
  Smartphone,
  Speaker,
  Tag,
  Wrench,
};

export function DynamicIcon({
  name,
  className,
}: {
  name: string;
  className?: string;
}) {
  const Icon = iconMap[name] ?? Package;
  return <Icon className={className} strokeWidth={1.75} />;
}
