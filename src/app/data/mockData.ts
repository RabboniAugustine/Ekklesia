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

export const upcomingEvents = [
  { id: 1, title: "Sunday Morning Service", date: "Jul 6, 2026", time: "9:00 AM", location: "Main Sanctuary", rsvp: 287, capacity: 400, type: "service" },
  { id: 2, title: "Youth Bible Study", date: "Jul 8, 2026", time: "6:30 PM", location: "Room 204", rsvp: 43, capacity: 60, type: "study" },
  { id: 3, title: "Worship Team Rehearsal", date: "Jul 9, 2026", time: "7:00 PM", location: "Music Room", rsvp: 18, capacity: 25, type: "rehearsal" },
  { id: 4, title: "Community Outreach Day", date: "Jul 12, 2026", time: "8:00 AM", location: "Eastside Park", rsvp: 74, capacity: 120, type: "outreach" },
  { id: 5, title: "Elder Board Meeting", date: "Jul 14, 2026", time: "10:00 AM", location: "Conference Room", rsvp: 9, capacity: 12, type: "meeting" },
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

export const prayerRequests = [
  { name: "Anonymous", request: "Healing for chronic back pain", date: "Jul 3", private: true },
  { name: "Ruth Andersen", request: "Guidance in career decision", date: "Jul 2", private: false },
  { name: "Anonymous", request: "Restoration of a broken marriage", date: "Jul 1", private: true },
  { name: "Michael Asante", request: "Financial breakthrough and wisdom", date: "Jun 30", private: false },
];
