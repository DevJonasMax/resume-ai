import type { ResumeDocument } from "@resume-ai/types";
import type { RenderOptions } from "../../providers/PDFProvider.js";

/**
 * Escapes characters that have special syntactic meaning in Typst markup.
 */
export function escapeTypst(text: string): string {
  if (!text) return "";
  return text
    .replace(/\\/g, "\\\\")
    .replace(/#/g, "\\#")
    .replace(/\$/g, "\\$")
    .replace(/@/g, "\\@")
    .replace(/\*/g, "\\*")
    .replace(/_/g, "\\_")
    .replace(/\[/g, "\\[")
    .replace(/\]/g, "\\]");
}

/**
 * Renders a canonical ResumeDocument into elegant, ATS-friendly Typst markup.
 */
export function renderTypstTemplate(doc: ResumeDocument, options?: RenderOptions): string {
  const paper = options?.paperSize === "a4" ? "a4" : "us-letter";
  const { basics, summary, experiences, skills, education, projects } = doc;

  const contactItems: string[] = [];
  if (basics.email) {
    contactItems.push(`#link("mailto:${basics.email}")[${escapeTypst(basics.email)}]`);
  }
  if (basics.phone) {
    contactItems.push(`[${escapeTypst(basics.phone)}]`);
  }
  if (basics.location) {
    contactItems.push(`[${escapeTypst(basics.location)}]`);
  }
  if (basics.website) {
    contactItems.push(`#link("${basics.website}")[${escapeTypst(basics.website.replace(/^https?:\/\//, ""))}]`);
  }
  if (basics.linkedin) {
    contactItems.push(`#link("${basics.linkedin}")[LinkedIn]`);
  }
  if (basics.github) {
    contactItems.push(`#link("${basics.github}")[GitHub]`);
  }

  const contactSeparator = ' #text(fill: rgb("#94a3b8"))[•] ';
  const contactLine = contactItems.join(contactSeparator);

  const experienceBlocks = experiences
    .map((exp) => {
      const bulletItems = exp.bulletPoints
        .map((point) => `  [${escapeTypst(point)}]`)
        .join(",\n");

      return `#subheading(
  [${escapeTypst(exp.company)}],
  [${escapeTypst(exp.location)}],
  [${escapeTypst(exp.role)}],
  [${escapeTypst(exp.startDate)} – ${escapeTypst(exp.endDate)}],
)
#v(2pt)
#list(
${bulletItems}
)
#v(4pt)`;
    })
    .join("\n\n");

  const skillRows = skills
    .map((group) => {
      return `  text(weight: "bold")[${escapeTypst(group.category)}:], [${escapeTypst(group.items.join(", "))}],`;
    })
    .join("\n");

  const educationBlocks = education
    .map((edu) => {
      const dates = edu.startDate && edu.endDate ? `${escapeTypst(edu.startDate)} – ${escapeTypst(edu.endDate)}` : "";
      const degreeText = edu.percentageOrGpa
        ? `${escapeTypst(edu.degree)} (Grade: ${escapeTypst(edu.percentageOrGpa)})`
        : escapeTypst(edu.degree);

      return `#subheading(
  [${escapeTypst(edu.institution)}],
  [${escapeTypst(edu.location)}],
  [${degreeText}],
  [${dates}],
)`;
    })
    .join("\n\n");

  const projectsBlock = projects && projects.length > 0
    ? `
#section("Projects")
${projects
  .map((p) => {
    const techText = p.technologies && p.technologies.length > 0 ? ` (${escapeTypst(p.technologies.join(", "))})` : "";
    const nameWithLink = p.link ? `#link("${p.link}")[${escapeTypst(p.name)}]` : `[${escapeTypst(p.name)}]`;
    const bullets = p.bulletPoints && p.bulletPoints.length > 0
      ? `\n#list(\n${p.bulletPoints.map((b) => `  [${escapeTypst(b)}]`).join(",\n")}\n)`
      : "";

    return `#text(weight: "bold")[${nameWithLink}]${techText ? `#text(style: "italic", fill: rgb("#475569"))[${techText}]` : ""}\n\n${escapeTypst(p.description)}${bullets}\n#v(4pt)`;
  })
  .join("\n\n")}
`
    : "";

  return `// Canonical Typst Resume Template
#set page(
  paper: "${paper}",
  margin: (x: 1.5cm, top: 1.5cm, bottom: 1.5cm),
)

#set text(
  font: ("Linux Libertine", "PT Serif", "Times New Roman", "DejaVu Serif"),
  size: 10pt,
  fill: rgb("#111827"),
)

#set par(justify: false, leading: 0.55em)

#let section(title) = {
  v(8pt)
  text(weight: "bold", size: 11pt, fill: rgb("#0f172a"), upper(title))
  v(-5pt)
  line(length: 100%, stroke: 0.75pt + rgb("#cbd5e1"))
  v(3pt)
}

#let subheading(left-title, right-title, left-sub, right-sub) = {
  grid(
    columns: (1fr, auto),
    align: (left, right),
    text(weight: "bold", size: 10pt, left-title),
    text(weight: "medium", size: 9pt, fill: rgb("#475569"), right-title),
    text(style: "italic", size: 9.5pt, fill: rgb("#334155"), left-sub),
    text(style: "italic", size: 9pt, fill: rgb("#64748b"), right-sub),
  )
}

// Header
#align(center)[
  #text(size: 18pt, weight: "bold", fill: rgb("#0f172a"))[${escapeTypst(basics.fullName)}]
  ${basics.title ? `\n  #v(-4pt)\n  #text(size: 10.5pt, weight: "medium", fill: rgb("#334155"))[${escapeTypst(basics.title)}]` : ""}
  #v(2pt)
  #text(size: 8.5pt, fill: rgb("#475569"))[
    ${contactLine}
  ]
]

#section("Professional Summary")
${escapeTypst(summary)}

#section("Experience")
${experienceBlocks}

#section("Skills & Competencies")
#grid(
  columns: (auto, 1fr),
  column-gutter: 8pt,
  row-gutter: 5pt,
${skillRows}
)

#section("Education")
${educationBlocks}
${projectsBlock}`;
}
