export function Star() {
  return (
    <div aria-hidden="true" className="not-prose mb-5 mt-12 flex items-center gap-3.5 text-accent before:h-px before:flex-1 before:bg-rule after:h-px after:flex-1 after:bg-rule">
      <svg viewBox="-10 -10 20 20" className="size-3.5">
        <rect x="-6.2" y="-6.2" width="12.4" height="12.4" fill="currentColor" />
        <rect x="-6.2" y="-6.2" width="12.4" height="12.4" fill="currentColor" transform="rotate(45)" />
        <circle r="2.6" className="fill-paper" />
      </svg>
    </div>
  );
}
