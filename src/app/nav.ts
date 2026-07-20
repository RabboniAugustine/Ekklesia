import {
  BarChart2, CheckCircle, Users, Calendar, DollarSign, Heart,
  MessageSquare, FileText, Settings,
} from "lucide-react";
import type { NavModule } from "./types";

export const navItems: { id: NavModule; label: string; icon: React.ElementType }[] = [
  { id: "dashboard", label: "Dashboard", icon: BarChart2 },
  { id: "attendance", label: "Attendance", icon: CheckCircle },
  { id: "members", label: "Members", icon: Users },
  { id: "events", label: "Events", icon: Calendar },
  { id: "finance", label: "Finance", icon: DollarSign },
  { id: "ministries", label: "Ministries", icon: Heart },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "reports", label: "Reports", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
];
