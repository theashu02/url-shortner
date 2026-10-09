interface EyebrowProps {
  children: string;
}

/** Small square section label used above landing section headings. */
export function Eyebrow({ children }: EyebrowProps) {
  return (
    <span className="inline-flex items-center gap-2 border border-line bg-card px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-ember shadow-sm">
      <span className="h-2 w-2 bg-ember" aria-hidden="true" />
      {children}
    </span>
  );
}
