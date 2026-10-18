"use client";

import { useEffect, useId, useState } from "react";

export function Mermaid({ chart, alt }: { chart: string; alt: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let latest = 0;
    const draw = async () => {
      const run = ++latest;
      const { default: mermaid } = await import("mermaid");
      const dark = document.documentElement.classList.contains("dark");
      mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", fontFamily: "inherit" });
      try {
        const { svg } = await mermaid.render(`m${id}-${run}`, chart);
        if (run === latest) {
          setSvg(svg);
          setFailed(false);
        }
      } catch {
        document.getElementById(`dm${id}-${run}`)?.remove();
        if (run === latest) setFailed(true);
      }
    };
    draw();
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      latest = -1;
      observer.disconnect();
    };
  }, [chart, id]);

  return (
    <figure className="not-prose my-8 overflow-x-auto">
      {svg && !failed ? (
        <div role="img" aria-label={alt} className="flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="text-sm text-stone-600 dark:text-stone-400">
          {failed && <strong>Diagram failed to render. </strong>}
          {alt}
        </p>
      )}
    </figure>
  );
}
