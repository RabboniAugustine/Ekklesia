// NOTE: everything in this file is placeholder data for modules that are
// not yet wired to Supabase. As each module (Events, Finance, Ministries,
// Communication, Reports) gets a real backend, its data should move out of
// here and into a service file, the same way Members and Dashboard did.

import { Music, Baby, Globe, Mic, BookOpen, Heart } from "lucide-react";

export const givingData = [
  { month: "Jan", tithes: 42000, offerings: 11000, special: 4500 },
  { month: "Feb", tithes: 38500, offerings: 9800, special: 2200 },
  { month: "Mar", tithes: 47200, offerings: 13400, special: 8100 },
  { month: "Apr", tithes: 44800, offerings: 12100, special: 3300 },
  { month: "May", tithes: 51300, offerings: 14700, special: 6000 },
  { month: "Jun", tithes: 49600, offerings: 13900, special: 5400 },
  { month: "Jul", tithes: 55200, offerings: 16300, special: 9200 },
];

export const recentDonations = [
  { name: "Emmanuel Tabi", amount: 1200, fund: "General Tithe", date: "Jul 3, 2026", method: "Online" },
  { name: "Grace Okonkwo", amount: 500, fund: "Building Fund", date: "Jul 3, 2026", method: "Card" },
  { name: "David Mensah", amount: 800, fund: "General Tithe", date: "Jul 2, 2026", method: "Online" },
  { name: "Ruth Andersen", amount: 250, fund: "Missions", date: "Jul 2, 2026", method: "Cash" },
  { name: "Sarah Boateng", amount: 2000, fund: "Special Offering", date: "Jul 1, 2026", method: "Transfer" },
];

export const ministries = [
  { name: "Worship & Arts", leader: "James Ofori", members: 34, icon: Music, color: "bg-violet-100 text-violet-700" },
  { name: "Children's Church", leader: "Abena Frimpong", members: 22, icon: Baby, color: "bg-pink-100 text-pink-700" },
  { name: "Outreach & Missions", leader: "David Mensah", members: 41, icon: Globe, color: "bg-emerald-100 text-emerald-700" },
  { name: "Media & Technology", leader: "Kwame Adu", members: 15, icon: Mic, color: "bg-sky-100 text-sky-700" },
  { name: "Biblical Education", leader: "Pastor Ruth Nkrumah", members: 28, icon: BookOpen, color: "bg-amber-100 text-amber-700" },
  { name: "Prayer & Intercession", leader: "Elder Asiedu", members: 19, icon: Heart, color: "bg-red-100 text-red-700" },
];
