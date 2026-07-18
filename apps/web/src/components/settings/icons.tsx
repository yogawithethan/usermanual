type IconProps = {
  className?: string;
};

export function Icon({ name, className = "h-4 w-4" }: IconProps & { name: string }) {
  const common = {
    className,
    fill: "none",
    stroke: "currentColor",
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
    "aria-hidden": true,
  };

  if (name === "sun") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
      </svg>
    );
  }

  if (name === "book") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5z" />
      </svg>
    );
  }

  if (name === "music") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M9 18V5l12-2v13" />
        <circle cx="6" cy="18" r="3" />
        <circle cx="18" cy="16" r="3" />
      </svg>
    );
  }

  if (name === "person") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M20 21a8 8 0 0 0-16 0" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    );
  }

  if (name === "settings") {
    return (
      <svg viewBox="0 0 24 24" {...common} strokeWidth={2.25}>
        <path d="M9.6 3.25 10.18 5.3a7.4 7.4 0 0 0-1.35.78L6.78 5.5 4.5 7.78l.58 2.05a7.4 7.4 0 0 0-.78 1.35l-2.05.58v3.23l2.05.58c.2.48.46.93.78 1.35L4.5 18.97l2.28 2.28 2.05-.58c.42.32.87.58 1.35.78l.58 2.05h3.23l.58-2.05a7.4 7.4 0 0 0 1.35-.78l2.05.58 2.28-2.28-.58-2.05c.32-.42.58-.87.78-1.35l2.05-.58v-3.23l-2.05-.58a7.4 7.4 0 0 0-.78-1.35l.58-2.05-2.28-2.28-2.05.58a7.4 7.4 0 0 0-1.35-.78l-.58-2.05H9.6Z" />
        <circle cx="12" cy="12.38" r="3.25" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <rect x="5" y="11" width="14" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 0 1 8 0v3" />
      </svg>
    );
  }

  if (name === "chevron") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="m9 18 6-6-6-6" />
      </svg>
    );
  }

  if (name === "close") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M6 6l12 12M18 6 6 18" />
      </svg>
    );
  }

  if (name === "play") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="m8 5 11 7-11 7z" />
      </svg>
    );
  }

  if (name === "shuffle") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M16 3h5v5M4 20l17-17M21 16v5h-5M15 15l6 6M4 4l5 5" />
      </svg>
    );
  }

  if (name === "logout") {
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
    );
  }

  return null;
}
