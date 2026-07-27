interface MobileSectionHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function MobileSectionHeader({
  eyebrow,
  title,
  description,
}: MobileSectionHeaderProps) {
  return (
    <div>
      {eyebrow && (
        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">
          {eyebrow}
        </p>
      )}
      <h1 className="mt-2 font-display text-[2rem] font-black leading-none text-slate-950 dark:text-slate-50">
        {title}
      </h1>
      {description && (
        <p className="mt-3 text-sm font-medium leading-6 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}
