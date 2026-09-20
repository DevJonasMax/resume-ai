import type { CandidateProfile, Job } from "@resume-ai/types";
import { CandidateRepository } from "./repositories/CandidateRepository.js";
import { JobRepository } from "./repositories/JobRepository.js";

/**
 * Seeds the database with the candidate profile derived from resume-example-01.tex
 * and provides sample jobs for immediate Kanban board and tailoring testing.
 */
export async function seedDatabase(): Promise<void> {
  const candidateRepo = new CandidateRepository();
  const jobRepo = new JobRepository();

  const now = new Date().toISOString();

  const profile: CandidateProfile = {
    id: "candidate-default",
    fullName: "Vidushi Wahal",
    email: "vidushi22@gmail.com",
    phone: "+91-9811405837",
    location: "Gurgaon, Haryana",
    summary:
      "6+ years of diverse experience in Information Technology with emphasis on Software Quality Assurance (Automation and Manual Testing) for various domains like insurance, e-commerce, ERP.",
    experiences: [
      {
        company: "G4S Technologies",
        location: "Gurgaon, Haryana",
        role: "Senior QA Engineer",
        startDate: "Oct 2016",
        endDate: "Present",
        bulletPoints: [
          "Led end-to-end ERP testing for Javelin enterprise platform, ensuring daily regression coverage and weekly release reporting.",
          "Partnered with Business Analysts and Product Owners to translate functional requirements into high-value test suites.",
          "Architected automated test suites using SOAP UI, Selenium with Java, and MongoDB for complex web applications.",
          "Awarded Silver (2018) and Bronze (2018) awards for exceptional product delivery quality and international release support.",
        ],
      },
      {
        company: "On Demand Agility Software Solutions",
        location: "Gurgaon, Haryana",
        role: "Senior Software Engineer",
        startDate: "Jun 2014",
        endDate: "Oct 2016",
        bulletPoints: [
          "Engineered automation frameworks for high-volume e-commerce platforms (horizonhobby.com and forcerc.com).",
          "Supervised a QA team of 3 engineers across test estimation, execution, and issue tracking.",
          "Created automated regression suites utilizing CodedUI in C# and Selenium WebDriver.",
          "Conducted mobile responsiveness and cross-browser validation via BrowserStack emulators.",
          "Executed security testing including cross-site scripting (XSS) vulnerability assessments.",
        ],
      },
      {
        company: "Infogain India Pvt. Ltd.",
        location: "Noida, Uttar Pradesh",
        role: "Software Engineer",
        startDate: "Jan 2013",
        endDate: "Jun 2014",
        bulletPoints: [
          "Developed scenario-based automated test cases using Coded UI with C# for Mitchell insurance solutions.",
          "Refactored legacy manual test assets into high-throughput automated test frameworks.",
          "Conducted weekly Test Impact Analysis and executed automated regression suites via Microsoft Test Manager (MTM).",
          "Authored unit and integration tests using Telerik JustMock, achieving high code coverage.",
        ],
      },
    ],
    skills: {
      Languages: ["C#", "Java", "Javascript", "SQL", "Groovy"],
      "Testing Tools": [
        "CodedUI",
        "MTM (Microsoft Test Manager)",
        "TFS",
        "Visual Studio",
        "Selenium",
        "SOAPUI",
        "Google Cloud Console",
        "JIRA",
        "TestNG",
        "QTest",
        "MongoDB",
      ],
      "Mocking Framework": ["Telerik Mock"],
    },
    education: [
      {
        institution: "Apeejay College Of Engineering",
        location: "Gurgaon, Haryana",
        degree: "Bachelor of Technology in IT",
        percentageOrGpa: "67%",
        startDate: "Aug 2008",
        endDate: "Dec 2012",
      },
    ],
    createdAt: now,
    updatedAt: now,
  };

  await candidateRepo.save(profile);

  const sampleJobs: Job[] = [
    {
      id: "job-001",
      title: "Senior QA Automation Engineer",
      company: "FinTech Payments Corp",
      url: "https://example.com/careers/fintech-qa-senior",
      location: "Remote",
      source: "LinkedIn",
      description: `We are looking for a Senior QA Automation Engineer to lead our payment gateway validation suite.
Key Requirements:
- 5+ years experience in automated testing with Selenium, Java, or C#.
- Extensive experience testing REST and SOAP APIs.
- Experience with CI/CD automation pipelines and SQL database verification.
- Strong grounding in Agile practices and defect lifecycle management.`,
      status: "discovered",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "job-002",
      title: "Lead SDET - E-Commerce",
      company: "Global Retail Platforms",
      url: "https://example.com/jobs/retail-lead-sdet",
      location: "Hybrid (New York / Remote)",
      source: "Indeed",
      description: `Seeking a Lead SDET to own quality across our international commerce checkout flow.
Responsibilities:
- Design scalable UI automation using Selenium, Playwright, or Cypress.
- Mentor a team of QA engineers.
- Perform load testing, cross-browser compatibility, and mobile validation.
- Experience with cloud testing infrastructure (BrowserStack, GCP, or AWS).`,
      status: "analyzed",
      createdAt: now,
      updatedAt: now,
    },
    {
      id: "job-003",
      title: "Software Engineer in Test",
      company: "Enterprise Cloud Systems",
      url: "https://example.com/careers/sdet-cloud",
      location: "Remote",
      source: "Company Portal",
      description: `Looking for a Software Engineer in Test to automate our enterprise cloud service offerings.
Required:
- Strong programming background in C# or Java.
- Hands-on experience building unit test mocking frameworks and integration suites.
- Experience with MongoDB, SQL, and distributed service architectures.`,
      status: "resume_ready",
      createdAt: now,
      updatedAt: now,
    },
  ];

  for (const job of sampleJobs) {
    await jobRepo.save(job);
  }
}

if (process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => {
      process.exit(0);
    })
    .catch((err: unknown) => {
      console.error("Database seed failed:", err);
      process.exit(1);
    });
}
