export function ComingSoonCard({
  icon: Icon,
  title,
  note,
}: {
  icon: React.ElementType;
  title: string;
  note: string;
}) {
  return (
    <div className="bg-card border border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center text-center gap-2 min-h-[200px]">
      <Icon size={22} className="text-muted-foreground" />
      <p className="text-sm font-semibold text-foreground">{title}</p>
      <p className="text-xs text-muted-foreground max-w-[220px]">{note}</p>
    </div>
  );
}
