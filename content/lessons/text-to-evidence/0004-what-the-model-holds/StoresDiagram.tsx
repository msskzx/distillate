export default function StoresDiagram() {
  return (
    <figure className="not-prose my-6 overflow-x-auto">
      <svg
        viewBox="0 0 680 300"
        className="w-full min-w-[520px] text-stone-800 dark:text-stone-200"
        role="img"
        aria-label="Page store and batches feed the catalog; the catalog projects to PostgreSQL and Neo4j; batches import to PostgreSQL"
      >
        <defs>
          <marker id="stores-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
          </marker>
        </defs>
        <g fill="none" stroke="currentColor" strokeWidth="1.2">
          <rect x="10" y="20" width="190" height="60" rx="4" />
          <rect x="10" y="120" width="190" height="60" rx="4" />
          <rect x="250" y="120" width="190" height="60" rx="4" stroke="#b45309" strokeWidth="2" />
          <rect x="490" y="60" width="180" height="60" rx="4" />
          <rect x="490" y="200" width="180" height="60" rx="4" />
          <path d="M105,80 L105,118" markerEnd="url(#stores-arrow)" />
          <path d="M200,150 L248,150" markerEnd="url(#stores-arrow)" strokeDasharray="4 3" />
          <path d="M440,140 L488,100" markerEnd="url(#stores-arrow)" />
          <path d="M440,165 L488,225" markerEnd="url(#stores-arrow)" />
          <path d="M105,180 C105,260 300,260 488,95" markerEnd="url(#stores-arrow)" />
          <path d="M200,45 C380,30 440,60 488,80" markerEnd="url(#stores-arrow)" />
        </g>
        <g fontFamily="ui-monospace,monospace" fontSize="12" fill="currentColor">
          <text x="20" y="45">1 page store (authored)</text>
          <text x="20" y="64" fontSize="10">sources/&lt;src&gt;/v4/41.md</text>
          <text x="20" y="145">2 batches (authored)</text>
          <text x="20" y="164" fontSize="10">claims + citations + approval</text>
          <text x="260" y="145">3 catalog (authored)</text>
          <text x="260" y="164" fontSize="10">value + claims: [keys]</text>
          <text x="500" y="85">4 PostgreSQL (copy)</text>
          <text x="500" y="225">5 Neo4j (copy)</text>
          <text x="110" y="104" fontSize="10">anchors derived</text>
          <text x="205" y="140" fontSize="10">key ref</text>
          <text x="250" y="250" fontSize="10">history:import</text>
          <text x="260" y="30" fontSize="10">pages imported</text>
          <text x="445" y="120" fontSize="10">catalog:project</text>
          <text x="445" y="200" fontSize="10">project-graph</text>
        </g>
      </svg>
      <figcaption className="mt-2 text-sm text-stone-600 dark:text-stone-400">
        The dashed arrow is the only link between evidence and value: a string key. Nothing flows text from a batch into the catalog.
      </figcaption>
    </figure>
  );
}
