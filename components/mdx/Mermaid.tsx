"use client";

import { useEffect, useId, useState } from "react";

export function Mermaid({ chart, alt }: { chart: string; alt: string }) {
  const id = useId().replace(/:/g, "");
  const [svg, setSvg] = useState<string>();

  useEffect(() => {
    let live = true;
    const draw = async () => {
      const { default: mermaid } = await import("mermaid");
      const dark = document.documentElement.classList.contains("dark");
      mermaid.initialize({ startOnLoad: false, theme: dark ? "dark" : "neutral", fontFamily: "inherit" });
      const { svg } = await mermaid.render(`m${id}`, chart);
      if (live) setSvg(svg);
    };
    draw();
    const observer = new MutationObserver(draw);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      live = false;
      observer.disconnect();
    };
  }, [chart, id]);

  return (
    <figure className="not-prose my-8 overflow-x-auto">
      {svg ? (
        <div role="img" aria-label={alt} className="flex justify-center" dangerouslySetInnerHTML={{ __html: svg }} />
      ) : (
        <p className="text-sm text-stone-600 dark:text-stone-400">{alt}</p>
      )}
    </figure>
  );
}
