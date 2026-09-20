import type { z } from "zod";
import type { AIProvider } from "./interfaces.js";

/**
 * Deterministic Mock AI Provider for offline development and local validation.
 */
export class MockAIProvider implements AIProvider {
  public async generateStructured<T>(options: {
    schema: z.ZodType<T>;
    prompt: string;
    systemPrompt?: string;
  }): Promise<T> {
    const isResumeTailoring =
      options.prompt.toLowerCase().includes("tailor") ||
      options.prompt.toLowerCase().includes("diff");
    const isJobAnalysis =
      !isResumeTailoring &&
      (options.prompt.toLowerCase().includes("extract") ||
        options.prompt.toLowerCase().includes("requirement") ||
        options.prompt.toLowerCase().includes("analyze"));

    if (isJobAnalysis) {
      const mockAnalysis = {
        seniorityLevel: "Senior",
        workModel: "remote",
        locationRequirements: "Remote or Hybrid",
        educationRequirement: "Bachelor's degree in Computer Science, IT or related field",
        experienceYearsRequired: 5,
        skills: [
          {
            name: "Selenium WebDriver",
            category: "framework",
            required: true,
            criticalityScore: 5,
            evidenceFound: "Lead payment gateway validation with automated testing in Selenium",
          },
          {
            name: "Java / C#",
            category: "language",
            required: true,
            criticalityScore: 5,
            evidenceFound: "5+ years experience in automated testing with Java or C#",
          },
          {
            name: "REST / SOAP API Testing",
            category: "tool",
            required: true,
            criticalityScore: 4,
            evidenceFound: "Extensive experience testing REST and SOAP APIs",
          },
          {
            name: "CI/CD & SQL",
            category: "methodology",
            required: false,
            criticalityScore: 3,
            evidenceFound: "CI/CD automation pipelines and SQL database verification",
          },
        ],
        responsibilities: [
          "Architect and maintain scalable automated regression test suites.",
          "Perform API contract verification and end-to-end payment workflow validation.",
          "Collaborate with engineering and product teams to uphold release quality standards.",
        ],
        keywords: ["Test Automation", "Selenium", "C#", "Java", "SOAP UI", "API Testing", "CI/CD", "Regression"],
      };

      return options.schema.parse(mockAnalysis);
    }

    // Default mock response for tailored resume content
    const mockTailoredResume = {
      tailoredSummary:
        "Results-driven Senior QA Automation Engineer with 6+ years of specialized experience in architecting scalable automation frameworks using Selenium, Java, and C#. Proven expertise in REST and SOAP API validation, ERP payment flows, and continuous integration pipelines.",
      tailoredExperience: [
        {
          company: "G4S Technologies",
          location: "Gurgaon, Haryana",
          role: "Senior QA Engineer",
          startDate: "Oct 2016",
          endDate: "Present",
          bulletPoints: [
            "Architected comprehensive automated testing suites utilizing SOAP UI, Selenium with Java, and MongoDB for business-critical ERP web platforms.",
            "Formulated end-to-end quality assurance strategies and automated daily regression cycles for continuous release delivery.",
            "Collaborated directly with product owners to convert acceptance criteria into robust automated test scenarios.",
            "Honored with prestigious Silver (2018) and Bronze (2018) quality awards for outstanding release delivery and zero-defect deployments.",
          ],
        },
        {
          company: "On Demand Agility Software Solutions",
          location: "Gurgaon, Haryana",
          role: "Senior Software Engineer",
          startDate: "Jun 2014",
          endDate: "Oct 2016",
          bulletPoints: [
            "Engineered high-throughput automated test frameworks using Selenium with C# for enterprise-scale e-commerce applications.",
            "Spearheaded a quality engineering team of 3 members, ensuring 100% adherence to release verification benchmarks.",
            "Automated cross-browser compatibility and mobile responsiveness validations via BrowserStack cloud environments.",
          ],
        },
      ],
      diffItems: [
        {
          section: "Professional Summary",
          originalText: "6+ years of diverse experience in Information Technology...",
          tailoredText: "Results-driven Senior QA Automation Engineer with 6+ years of specialized experience...",
          rationalization: "Highlighted Selenium, Java, and C# explicitly in the summary to match core job requirements.",
          targetedRequirement: "Selenium WebDriver & C#/Java proficiency",
        },
        {
          section: "G4S Technologies Experience",
          originalText: "Using SOAP UI and Selenium with Java and MongoDB for web applications",
          tailoredText: "Architected comprehensive automated testing suites utilizing SOAP UI, Selenium with Java, and MongoDB...",
          rationalization: "Emphasized architecture and automated testing scope to align with senior-level expectations.",
          targetedRequirement: "Scalable automated regression test suites",
        },
      ],
    };

    return options.schema.parse(mockTailoredResume);
  }

  public async generateText(options: {
    prompt: string;
    systemPrompt?: string;
  }): Promise<string> {
    return `Mock AI response generated for prompt: "${options.prompt.slice(0, 80)}..."`;
  }
}
