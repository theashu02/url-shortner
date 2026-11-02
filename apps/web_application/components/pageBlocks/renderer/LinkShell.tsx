interface LinkShellProps {
  href: string | null;
  interactive: boolean;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
  label: string;
  onPress?: (href: string) => void;
}

export function LinkShell({
  href,
  interactive,
  className,
  style,
  children,
  label,
  onPress,
}: LinkShellProps) {
  if (interactive && href) {
    const linkHref: string = href;
    return (
      <a
        href={linkHref}
        target="_blank"
        rel="noreferrer"
        className={className}
        style={style}
        aria-label={label}
        onClick={() => onPress?.(linkHref)}
      >
        {children}
      </a>
    );
  }
  return (
    <span className={className} style={style}>
      {children}
    </span>
  );
}
