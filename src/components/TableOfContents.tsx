import { useEffect, useState } from "react";
import { useLocation } from "react-router";

type Heading = { id: string; text: string };

export function TableOfContents() {
  const { pathname } = useLocation();
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState("");

  useEffect(() => {
    let observer: IntersectionObserver | undefined;
    let frame = 0;
    let signature = "";

    const scan = () => {
      const elements = Array.from(document.querySelectorAll<HTMLElement>("main section[id]"));
      const next = elements.map((element) => element.id).join("|");
      if (next === signature) return;
      signature = next;

      setHeadings(
        elements.map((element) => ({
          id: element.id,
          text: element.querySelector("h2")?.textContent ?? element.id,
        })),
      );
      observer?.disconnect();
      observer = new IntersectionObserver(
        (entries) => {
          const visible = entries.filter((entry) => entry.isIntersecting);
          if (visible.length > 0) setActiveId(visible[0].target.id);
        },
        { rootMargin: "-80px 0px -70% 0px" },
      );
      elements.forEach((element) => observer?.observe(element));
    };

    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    };

    // Lazy-loaded pages render after navigation, so re-scan when the content changes.
    const main = document.querySelector("main");
    const mutations = new MutationObserver(schedule);
    if (main) mutations.observe(main, { childList: true, subtree: true });
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer?.disconnect();
    };
  }, [pathname]);

  if (headings.length === 0) return null;

  return (
    <div className="text-sm">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">On this page</div>
      <ul className="space-y-1 border-l border-white/5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`-ml-px block border-l py-1 pl-3 leading-5 transition ${
                activeId === heading.id
                  ? "border-fuchsia-400 text-fuchsia-200"
                  : "border-transparent text-slate-500 hover:text-slate-300"
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
