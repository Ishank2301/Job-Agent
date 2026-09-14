"use client";

import type { MasterResume } from "@/lib/types";
import type { ResumeTemplate } from "@/lib/resumeTemplates";

/**
 * Renders a resume in an A4-proportioned sheet, parameterized by template.
 * Pure presentational — safe for print export.
 */

const FONT_STACKS: Record<ResumeTemplate["font"], string> = {
  serif: "Georgia, 'Times New Roman', serif",
  sans: "Inter, ui-sans-serif, system-ui, sans-serif",
  mono: "'Cascadia Code', ui-monospace, Menlo, monospace",
};

function Sheet({
  children,
  tpl,
}: {
  children: React.ReactNode;
  tpl: ResumeTemplate;
}) {
  return (
    <div
      className="print-sheet mx-auto w-full max-w-[210mm] bg-white text-[#1c1917] shadow-[var(--shadow-pop)]"
      style={{
        fontFamily: FONT_STACKS[tpl.font],
        aspectRatio: "210 / 297",
        overflow: "hidden",
      }}
    >
      {children}
    </div>
  );
}

function Heading({
  children,
  tpl,
}: {
  children: React.ReactNode;
  tpl: ResumeTemplate;
}) {
  return (
    <p
      style={{
        color: tpl.accent,
        fontSize: tpl.density === "compact" ? "10px" : "11px",
        letterSpacing: tpl.uppercaseHeadings ? "0.12em" : "0.02em",
        textTransform: tpl.uppercaseHeadings ? "uppercase" : "none",
        fontWeight: 700,
        borderBottom: `1.5px solid ${tpl.accent}22`,
        paddingBottom: "3px",
        marginBottom: "8px",
      }}
    >
      {children}
    </p>
  );
}

function Contact({ r, tpl }: { r: MasterResume; tpl: ResumeTemplate }) {
  const bits = [
    r.personal.email,
    r.personal.phone,
    r.personal.linkedin,
    r.personal.github,
  ].filter(Boolean);
  return (
    <p style={{ fontSize: "10.5px", color: "#57534e", lineHeight: 1.5 }}>
      {bits.join("  ·  ")}
    </p>
  );
}

export function ResumePreview({
  data,
  template,
}: {
  data: MasterResume;
  template: ResumeTemplate;
}) {
  const pad = template.density === "compact" ? 26 : 40;
  const nameSize = template.density === "compact" ? 26 : 30;
  const sectionGap = template.density === "compact" ? "10px" : "16px";

  const experience = (
    <section style={{ marginBottom: sectionGap }}>
      <Heading tpl={template}>Experience</Heading>
      {data.experience_entries.map((e, i) => (
        <div key={i} style={{ marginBottom: template.density === "compact" ? 7 : 12 }}>
          <div className="flex items-baseline justify-between gap-2">
            <p style={{ fontWeight: 700, fontSize: "12.5px" }}>{e.title}</p>
            <p style={{ fontSize: "10px", color: "#78716c", whiteSpace: "nowrap" }}>{e.dates}</p>
          </div>
          <p style={{ fontSize: "11px", color: template.accent, fontWeight: 600 }}>{e.company}</p>
          <ul style={{ margin: "4px 0 0 14px", fontSize: "10.5px", lineHeight: 1.5, color: "#44403c" }}>
            {e.bullets.filter(Boolean).map((b, j) => (
              <li key={j} style={{ marginBottom: 2 }}>{b}</li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );

  const projects = data.projects.length > 0 && (
    <section style={{ marginBottom: sectionGap }}>
      <Heading tpl={template}>Projects</Heading>
      {data.projects.map((p, i) => (
        <div key={i} style={{ marginBottom: 8 }}>
          <div className="flex items-baseline justify-between gap-2">
            <p style={{ fontWeight: 700, fontSize: "12px" }}>{p.name}</p>
            {p.tech.length > 0 && (
              <p style={{ fontSize: "9.5px", color: "#78716c" }}>{p.tech.join(" · ")}</p>
            )}
          </div>
          <p style={{ fontSize: "10.5px", color: "#44403c", lineHeight: 1.5 }}>{p.description}</p>
          {p.bullets.filter(Boolean).length > 0 && (
            <ul style={{ margin: "3px 0 0 14px", fontSize: "10px", lineHeight: 1.5, color: "#57534e" }}>
              {p.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
            </ul>
          )}
        </div>
      ))}
    </section>
  );

  const education = (
    <section style={{ marginBottom: sectionGap }}>
      <Heading tpl={template}>Education</Heading>
      {data.education.map((e, i) => (
        <div key={i} className="flex items-baseline justify-between gap-2" style={{ marginBottom: 6 }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: "12px" }}>{e.degree}</p>
            <p style={{ fontSize: "10.5px", color: "#57534e" }}>{e.institution}</p>
          </div>
          <p style={{ fontSize: "10px", color: "#78716c", whiteSpace: "nowrap" }}>
            {e.dates}
            {e.score ? ` · ${e.score}` : ""}
          </p>
        </div>
      ))}
    </section>
  );

  const achievements =
    data.achievements.filter(Boolean).length > 0 && (
      <section style={{ marginBottom: sectionGap }}>
        <Heading tpl={template}>Achievements</Heading>
        <ul style={{ margin: 0, paddingLeft: 14, fontSize: "10.5px", lineHeight: 1.6, color: "#44403c" }}>
          {data.achievements.filter(Boolean).map((a, i) => <li key={i}>{a}</li>)}
        </ul>
      </section>
    );

  /* ---------- Layout: classic ---------- */
  if (template.layout === "classic") {
    return (
      <Sheet tpl={template}>
        <div style={{ padding: pad }}>
          <header
            style={{
              textAlign: template.headerAlign,
              marginBottom: template.density === "compact" ? 12 : 18,
              borderBottom: `2px solid ${template.accent}`,
              paddingBottom: 10,
            }}
          >
            <p
              style={{
                fontSize: nameSize,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                lineHeight: 1.1,
              }}
            >
              {data.personal.name || "Your Name"}
            </p>
            <Contact r={data} tpl={template} />
          </header>

          {data.summary && (
            <section style={{ marginBottom: sectionGap }}>
              <Heading tpl={template}>Summary</Heading>
              <p style={{ fontSize: "10.5px", lineHeight: 1.6, color: "#44403c" }}>{data.summary}</p>
            </section>
          )}

          {experience}
          {projects}
          {education}
          {achievements}

          {data.skills.length > 0 && (
            <section>
              <Heading tpl={template}>Skills</Heading>
              <p style={{ fontSize: "10.5px", lineHeight: 1.7, color: "#44403c" }}>
                {data.skills.join("  ·  ")}
              </p>
            </section>
          )}
        </div>
      </Sheet>
    );
  }

  /* ---------- Layout: banner ---------- */
  if (template.layout === "banner") {
    return (
      <Sheet tpl={template}>
        <header style={{ background: template.accent, color: "#ffffff", padding: pad }}>
          <p style={{ fontSize: nameSize, fontWeight: 700, lineHeight: 1.1, textAlign: template.headerAlign }}>
            {data.personal.name || "Your Name"}
          </p>
          {data.summary && (
            <p style={{ fontSize: "10px", lineHeight: 1.5, marginTop: 6, opacity: 0.92, maxWidth: "80%", textAlign: template.headerAlign }}>
              {data.summary}
            </p>
          )}
          <p style={{ fontSize: "10px", marginTop: 8, opacity: 0.9, textAlign: template.headerAlign }}>
            {[data.personal.email, data.personal.phone, data.personal.linkedin, data.personal.github]
              .filter(Boolean)
              .join("  ·  ")}
          </p>
        </header>

        <div style={{ padding: pad, paddingTop: template.density === "compact" ? 16 : 24 }}>
          {data.skills.length > 0 && (
            <section style={{ marginBottom: sectionGap }}>
              <Heading tpl={template}>Skills</Heading>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                {data.skills.filter(Boolean).map((s, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: "9.5px",
                      border: `1px solid ${template.accent}44`,
                      borderRadius: 99,
                      padding: "2px 8px",
                      color: "#44403c",
                    }}
                  >
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
          {experience}
          {projects}
          {education}
          {achievements}
        </div>
      </Sheet>
    );
  }

  /* ---------- Layout: sidebar ---------- */
  if (template.layout === "sidebar") {
    return (
      <Sheet tpl={template}>
        <div className="flex" style={{ minHeight: "100%" }}>
          <aside
            style={{
              width: "34%",
              background: `${template.accent}0d`,
              borderRight: `2px solid ${template.accent}`,
              padding: pad,
            }}
          >
            <p style={{ fontSize: nameSize - 4, fontWeight: 700, lineHeight: 1.15 }}>
              {data.personal.name || "Your Name"}
            </p>
            <p style={{ fontSize: "10px", color: "#78716c", marginTop: 10 }}>
              {[data.personal.email, data.personal.phone, data.personal.linkedin, data.personal.github]
                .filter(Boolean)
                .map((c, i) => (
                  <span key={i} style={{ display: "block", marginBottom: 3 }}>
                    {c}
                  </span>
                ))}
            </p>

            {data.skills.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <Heading tpl={template}>Skills</Heading>
                <ul style={{ margin: 0, paddingLeft: 12, fontSize: "10px", lineHeight: 1.7, color: "#44403c" }}>
                  {data.skills.filter(Boolean).map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
            )}

            {data.education.length > 0 && (
              <div style={{ marginTop: 18 }}>
                <Heading tpl={template}>Education</Heading>
                {data.education.map((e, i) => (
                  <div key={i} style={{ marginBottom: 8 }}>
                    <p style={{ fontSize: "10.5px", fontWeight: 700 }}>{e.degree}</p>
                    <p style={{ fontSize: "9.5px", color: "#78716c" }}>
                      {e.institution}
                      <br />
                      {e.dates}
                      {e.score ? ` · ${e.score}` : ""}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </aside>

          <div style={{ width: "66%", padding: pad }}>
            {data.summary && (
              <section style={{ marginBottom: sectionGap }}>
                <Heading tpl={template}>Profile</Heading>
                <p style={{ fontSize: "10.5px", lineHeight: 1.6, color: "#44403c" }}>{data.summary}</p>
              </section>
            )}
            {experience}
            {projects}
            {achievements}
          </div>
        </div>
      </Sheet>
    );
  }

  /* ---------- Layout: twin ---------- */
  return (
    <Sheet tpl={template}>
      <div style={{ padding: pad }}>
        <header style={{ marginBottom: sectionGap }}>
          <div className="flex items-baseline justify-between gap-3">
            <p style={{ fontSize: nameSize, fontWeight: 800, lineHeight: 1.05 }}>
              {data.personal.name || "Your Name"}
            </p>
            <p
              style={{
                fontSize: 22,
                fontWeight: 800,
                color: `${template.accent}22`,
                lineHeight: 1,
              }}
              aria-hidden="true"
            >
              CV
            </p>
          </div>
          <Contact r={data} tpl={template} />
        </header>

        {data.summary && (
          <p
            style={{
              fontSize: "10.5px",
              lineHeight: 1.6,
              color: "#44403c",
              borderLeft: `3px solid ${template.accent}`,
              paddingLeft: 10,
              marginBottom: sectionGap,
            }}
          >
            {data.summary}
          </p>
        )}

        {experience}
        {projects}
        {education}
        {achievements}

        {data.skills.length > 0 && (
          <section>
            <Heading tpl={template}>Skills</Heading>
            <p style={{ fontSize: "10.5px", lineHeight: 1.7, color: "#44403c" }}>
              {data.skills.join("  ·  ")}
            </p>
          </section>
        )}
      </div>
    </Sheet>
  );
}
