import { Shield, Users, Calendar, BarChart2 } from "lucide-react";

type WelcomePageProps = {
  onGetStarted: () => void;
};

export function WelcomePage({ onGetStarted }: WelcomePageProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="max-w-5xl w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        <div>
          <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center mb-5">
            <Shield size={24} className="text-white" />
          </div>

          <p className="text-sm font-semibold text-primary uppercase tracking-wider">
            Church Management System
          </p>

          <h1 className="text-4xl lg:text-5xl font-bold text-foreground mt-3 leading-tight">
            Manage your church with clarity, care, and order.
          </h1>

          <p className="text-muted-foreground mt-4 text-base leading-7">
            Track attendance, manage members, organize ministries, record giving,
            communicate with your church family, and keep leadership informed in
            one secure system.
          </p>

          <button
            onClick={onGetStarted}
            className="mt-7 bg-primary text-primary-foreground px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors"
          >
            Sign In to Continue
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                title: "Attendance",
                text: "Ushers can check in members and visitors from the entrance.",
                icon: BarChart2,
              },
              {
                title: "Members",
                text: "Keep member records, status, contact info, and follow-ups organized.",
                icon: Users,
              },
              {
                title: "Events",
                text: "Plan church services, meetings, programs, and recurring events.",
                icon: Calendar,
              },
              {
                title: "Security",
                text: "Give access based on role: admin, usher, finance, pastor, and more.",
                icon: Shield,
              },
            ].map((item) => (
              <div
                key={item.title}
                className="border border-border rounded-xl p-4 bg-muted/30"
              >
                <item.icon size={20} className="text-primary mb-3" />
                <h2 className="font-semibold text-foreground">{item.title}</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}