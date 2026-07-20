import { useEffect, useState } from "react";
import { CheckCircle, Search, UserPlus, Users } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import {
  checkInMember,
  getTodayAttendanceCount,
  registerVisitorAndCheckIn,
  searchMembersByName,
  type MemberSearchResult,
} from "../../services/attendanceService";

export function Attendance() {
  const { profile } = useAuth();
  const churchId = profile?.church_id;

  const [searchTerm, setSearchTerm] = useState("");
  const [members, setMembers] = useState<MemberSearchResult[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [todayCount, setTodayCount] = useState(0);
  const [visitor, setVisitor] = useState({ firstName: "", lastName: "", phone: "", email: "" });

  useEffect(() => {
    if (!churchId) return;
    getTodayAttendanceCount(churchId)
      .then(setTodayCount)
      .catch((error) => console.error(error));
  }, [churchId]);

  async function handleSearch(value: string) {
    setSearchTerm(value);
    setMessage("");

    if (!churchId) {
      setMessage("Your profile isn't linked to a church yet.");
      return;
    }

    if (value.trim().length < 2) {
      setMembers([]);
      return;
    }

    try {
      const results = await searchMembersByName(churchId, value);
      setMembers(results);
    } catch (error) {
      console.error(error);
      setMessage("Unable to search members right now.");
    }
  }

  async function handleMemberCheckIn(member: MemberSearchResult) {
    if (!churchId) return;
    const fullName = `${member.first_name} ${member.last_name}`;

    try {
      setLoading(true);
      await checkInMember({
        churchId,
        memberId: member.id,
        serviceName: "Sunday Service",
      });

      setTodayCount((count) => count + 1);
      setMessage(`${fullName} checked in successfully.`);
      setSearchTerm("");
      setMembers([]);
    } catch (error) {
      console.error(error);
      setMessage("Unable to check in this member.");
    } finally {
      setLoading(false);
    }
  }

  async function handleVisitorRegistration() {
    if (!churchId) {
      setMessage("Your profile isn't linked to a church yet.");
      return;
    }

    if (!visitor.firstName.trim() || !visitor.lastName.trim()) {
      setMessage("Enter the visitor first and last name.");
      return;
    }

    try {
      setLoading(true);
      const result = await registerVisitorAndCheckIn({
        churchId,
        firstName: visitor.firstName,
        lastName: visitor.lastName,
        phone: visitor.phone,
        email: visitor.email,
        serviceName: "Sunday Service",
      });

      setTodayCount((count) => count + 1);
      setMessage(`${result.member.first_name} ${result.member.last_name} registered and checked in.`);
      setVisitor({ firstName: "", lastName: "", phone: "", email: "" });
    } catch (error) {
      console.error(error);
      setMessage("Unable to register this visitor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Attendance Check-In</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search registered members or register first-time visitors at the entrance.
          </p>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-3 flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-primary flex items-center justify-center">
            <Users size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="text-xl font-semibold text-foreground">{todayCount}</p>
          </div>
        </div>
      </div>

      {!churchId && (
        <div className="border border-amber-200 bg-amber-50 text-amber-800 rounded-lg p-4 text-sm">
          Your profile isn't linked to a church yet. Contact an admin to get set up.
        </div>
      )}

      {message && (
        <div className="border border-border bg-card rounded-lg p-4 text-sm text-foreground">
          {message}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Search size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">Registered Member</h2>
          </div>

          <input
            value={searchTerm}
            onChange={(event) => handleSearch(event.target.value)}
            placeholder="Search by first or last name"
            className="w-full border border-border rounded-md px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />

          <div className="space-y-2">
            {members.map((member) => {
              const fullName = `${member.first_name} ${member.last_name}`;

              return (
                <div key={member.id} className="flex items-center justify-between border border-border rounded-md p-3 gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-foreground truncate">{fullName}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {member.phone || member.email || member.member_type}
                    </p>
                  </div>
                  <button
                    disabled={loading}
                    onClick={() => handleMemberCheckIn(member)}
                    className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-3 py-2 rounded-md text-sm disabled:opacity-50 shrink-0"
                  >
                    <CheckCircle size={16} />
                    Check In
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg p-5 space-y-4">
          <div className="flex items-center gap-2">
            <UserPlus size={18} className="text-primary" />
            <h2 className="font-semibold text-foreground">New Visitor Registration</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              value={visitor.firstName}
              onChange={(event) => setVisitor({ ...visitor, firstName: event.target.value })}
              placeholder="First name"
              className="border border-border rounded-md px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={visitor.lastName}
              onChange={(event) => setVisitor({ ...visitor, lastName: event.target.value })}
              placeholder="Last name"
              className="border border-border rounded-md px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={visitor.phone}
              onChange={(event) => setVisitor({ ...visitor, phone: event.target.value })}
              placeholder="Phone optional"
              className="border border-border rounded-md px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            <input
              value={visitor.email}
              onChange={(event) => setVisitor({ ...visitor, email: event.target.value })}
              placeholder="Email optional"
              className="border border-border rounded-md px-3 py-3 bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <button
            disabled={loading}
            onClick={handleVisitorRegistration}
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-3 rounded-md text-sm disabled:opacity-50"
          >
            <UserPlus size={16} />
            Register & Check In
          </button>
        </div>
      </div>
    </div>
  );
}
