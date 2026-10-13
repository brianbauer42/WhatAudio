const base = { viewBox: '0 0 24 24', 'aria-hidden': true, focusable: false };

export function PlayIcon() {
  return (
    <svg {...base}>
      <path d="M7 4.5v15l12-7.5z" />
    </svg>
  );
}

export function PauseIcon() {
  return (
    <svg {...base}>
      <path d="M6 4.5h4v15H6zM14 4.5h4v15h-4z" />
    </svg>
  );
}

export function NextIcon() {
  return (
    <svg {...base}>
      <path d="M5 4.5v15l10-7.5zM17 4.5h2.5v15H17z" />
    </svg>
  );
}

export function PrevIcon() {
  return (
    <svg {...base}>
      <path d="M19 4.5v15L9 12zM4.5 4.5H7v15H4.5z" />
    </svg>
  );
}
