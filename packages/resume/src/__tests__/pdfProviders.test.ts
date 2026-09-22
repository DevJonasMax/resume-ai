import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { ResumeDocument } from "@resume-ai/types";
import { ReactPdfProvider } from "../providers/ReactPdfProvider.js";
import { TypstProvider } from "../providers/TypstProvider.js";
import { PDFProviderResolver, getPDFProvider } from "../providers/PDFProviderResolver.js";
import { LegacyLaTeXProvider } from "../providers/LegacyLaTeXProvider.js";

const sampleDocument: ResumeDocument = {
  basics: {
    fullName: "Alex Rivera",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    title: "Senior Full Stack Engineer",
    website: "https://alexrivera.dev",
    linkedin: "https://linkedin.com/in/alexrivera",
    github: "https://github.com/alexrivera",
  },
  summary:
    "Distinguished Full Stack Engineer with 8+ years architecting distributed web platforms and high-throughput microservices. Proven expertise in TypeScript, React, Node.js, and cloud automation.",
  experiences: [
    {
      company: "CloudScale Technologies",
      location: "San Francisco, CA",
      role: "Staff Software Engineer",
      startDate: "2022-03",
      endDate: "Present",
      bulletPoints: [
        "Architected real-time streaming pipeline processing 250M daily events with 99.99% uptime.",
        "Spearheaded migration of legacy monolith to containerized TypeScript microservices.",
        "Mentored team of 8 engineers and instituted strict architectural design reviews.",
      ],
    },
    {
      company: "Apex Systems",
      location: "Austin, TX",
      role: "Senior Full Stack Developer",
      startDate: "2019-01",
      endDate: "2022-02",
      bulletPoints: [
        "Delivered reactive dashboard serving 500k monthly active enterprise users.",
        "Reduced p95 API latency by 42% through query optimization and distributed caching.",
      ],
    },
  ],
  skills: [
    {
      category: "Languages",
      items: ["TypeScript", "JavaScript", "Python", "Go", "SQL"],
    },
    {
      category: "Frameworks & Libraries",
      items: ["React", "Next.js", "Node.js", "Express", "TailwindCSS"],
    },
    {
      category: "Infrastructure & Tools",
      items: ["Docker", "Kubernetes", "AWS", "PostgreSQL", "Redis", "Git"],
    },
  ],
  education: [
    {
      institution: "University of California, Berkeley",
      location: "Berkeley, CA",
      degree: "B.S. in Computer Science",
      percentageOrGpa: "3.85 GPA",
      startDate: "2014-08",
      endDate: "2018-05",
    },
  ],
  projects: [
    {
      name: "Distributed Event Mesh",
      description: "High-performance event routing library written in TypeScript with zero dependencies.",
      technologies: ["TypeScript", "WebSockets", "Node.js"],
      link: "https://github.com/alexrivera/event-mesh",
      bulletPoints: ["Benchmarked at 120k ops/sec on single core with minimal memory footprint."],
    },
  ],
};

describe("PDF Providers Multi-Provider Architecture", () => {
  it("TypstProvider generates valid non-empty PDF binary buffer", async () => {
    const provider = new TypstProvider();
    const pdfBuffer = await provider.renderPdf(sampleDocument);

    assert.ok(Buffer.isBuffer(pdfBuffer), "Result should be a Buffer");
    assert.ok(pdfBuffer.length > 1000, "PDF buffer should contain compiled binary data");
    assert.equal(
      pdfBuffer.subarray(0, 4).toString("utf-8"),
      "%PDF",
      "PDF binary must start with '%PDF' magic header"
    );
  });

  it("ReactPdfProvider generates valid non-empty PDF binary buffer", async () => {
    const provider = new ReactPdfProvider();
    const pdfBuffer = await provider.renderPdf(sampleDocument);

    assert.ok(Buffer.isBuffer(pdfBuffer), "Result should be a Buffer");
    assert.ok(pdfBuffer.length > 1000, "PDF buffer should contain compiled binary data");
    assert.equal(
      pdfBuffer.subarray(0, 4).toString("utf-8"),
      "%PDF",
      "PDF binary must start with '%PDF' magic header"
    );
  });

  it("PDFProviderResolver correctly provides Typst, React-PDF, and Legacy LaTeX providers", () => {
    const typstProvider = PDFProviderResolver.getProvider("typst");
    assert.equal(typstProvider.name, "typst");

    const reactPdfProvider = PDFProviderResolver.getProvider("react-pdf");
    assert.equal(reactPdfProvider.name, "react-pdf");

    const latexProvider = PDFProviderResolver.getProvider("latex");
    assert.equal(latexProvider.name, "latex");

    const defaultProvider = getPDFProvider();
    assert.ok(defaultProvider.name === "typst" || defaultProvider.name === "react-pdf");
  });

  it("LegacyLaTeXProvider renders valid LaTeX source without throwing", () => {
    const provider = new LegacyLaTeXProvider();
    const source = provider.renderSource(sampleDocument);

    assert.ok(source.includes("\\documentclass"), "Should produce LaTeX document structure");
    assert.ok(source.includes("Alex Rivera"), "Should include candidate name");
  });
});
