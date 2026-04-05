import { useState } from "react";
import { getGuidesByCategory } from "../../content/guides";
import type { Guide } from "../../content/guides";

export function TipsGuides() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const guidesByCategory = getGuidesByCategory();

  function toggleGuide(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  return (
    <div className="min-h-screen bg-transparent p-4">
      <h1 className="text-[#f0f0fa] text-2xl font-bold mb-6">Tips &amp; Guides</h1>

      <div className="flex flex-col gap-6">
        {Array.from(guidesByCategory.entries()).map(([category, guides]) => (
          <section key={category}>
            <h2 className="text-[#f0f0fa]/40 text-sm font-semibold uppercase tracking-widest mb-2 px-1">
              {category}
            </h2>
            <div className="bg-[rgba(240,240,250,0.03)] rounded-2xl overflow-hidden divide-y divide-[rgba(240,240,250,0.06)]">
              {guides.map((guide: Guide) => {
                const isExpanded = expandedId === guide.id;
                return (
                  <div key={guide.id}>
                    <button
                      type="button"
                      onClick={() => toggleGuide(guide.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left text-[#f0f0fa] text-sm font-medium hover:bg-[rgba(240,240,250,0.04)] transition-colors"
                      aria-expanded={isExpanded}
                    >
                      <span>{guide.title}</span>
                      <span className="text-[#f0f0fa]/50 ml-2 shrink-0">{isExpanded ? "▲" : "▼"}</span>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 text-[#f0f0fa]/50 text-sm leading-relaxed">
                        {guide.body}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
