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
      const style = getComputedStyle(document.documentElement);
      const token = (name: string) => style.getPropertyValue(`--${name}`).trim();
      mermaid.initialize({
        startOnLoad: false,
        theme: "base",
        fontFamily: "inherit",
        themeVariables: {
          darkMode: document.documentElement.classList.contains("dark"),
          background: token("paper"),
          primaryColor: token("paper-deep"),
          primaryTextColor: token("ink"),
          primaryBorderColor: token("ink-soft"),
          secondaryColor: token("accent-wash"),
          tertiaryColor: token("paper"),
          lineColor: token("accent"),
          textColor: token("ink"),
          clusterBkg: token("paper"),
          clusterBorder: token("rule"),
          edgeLabelBackground: token("paper"),
          titleColor: token("ink-soft"),
          noteBkgColor: token("accent-wash"),
          noteTextColor: token("ink"),
          noteBorderColor: token("accent"),
          actorBkg: token("paper-deep"),
          actorBorder: token("ink-soft"),
          actorTextColor: token("ink"),
          signalColor: token("ink"),
          signalTextColor: token("ink"),
        },
      });
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
        <p className="text-base italic text-ink-soft">
          {failed && <strong>Diagram failed to render. </strong>}
          {alt}
        </p>
      )}
    </figure>
  );
}
