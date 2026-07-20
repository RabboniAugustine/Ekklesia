import { ChevronRight } from "lucide-react";

export function SectionHeader({ title, action }: { title: string; action?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      {action && (
        <button className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
          {action} <ChevronRight size={13} />
        </button>
      )}
    </div>
  );
}
