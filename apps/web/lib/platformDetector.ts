import type { JobPlatformId, JobPlatformInfo } from "@resume-ai/types";

/**
 * Registry of supported job recruitment platforms with brand colors,
 * domains, and display metadata.
 */
export const SUPPORTED_JOB_PLATFORMS: Record<JobPlatformId, JobPlatformInfo> = {
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    domain: "linkedin.com",
    iconKey: "linkedin",
    badgeColor: "#0a66c2",
    sampleUrlPattern: "https://www.linkedin.com/jobs/view/...",
  },
  gupy: {
    id: "gupy",
    name: "Gupy",
    domain: "gupy.io",
    iconKey: "gupy",
    badgeColor: "#00c3a5",
    sampleUrlPattern: "https://company.gupy.io/job/...",
  },
  nerdin: {
    id: "nerdin",
    name: "Nerdin",
    domain: "nerdin.com.br",
    iconKey: "nerdin",
    badgeColor: "#6c5ce7",
    sampleUrlPattern: "https://nerdin.com.br/vagas/...",
  },
  programathor: {
    id: "programathor",
    name: "Programathor",
    domain: "programathor.com.br",
    iconKey: "programathor",
    badgeColor: "#27ae60",
    sampleUrlPattern: "https://programathor.com.br/jobs/...",
  },
  micro1: {
    id: "micro1",
    name: "Micro1",
    domain: "micro1.ai",
    iconKey: "micro1",
    badgeColor: "#ff4757",
    sampleUrlPattern: "https://jobs.micro1.ai/...",
  },
  glassdoor: {
    id: "glassdoor",
    name: "Glassdoor",
    domain: "glassdoor.com",
    iconKey: "glassdoor",
    badgeColor: "#0caa41",
    sampleUrlPattern: "https://www.glassdoor.com/job-listing/...",
  },
  geekhunter: {
    id: "geekhunter",
    name: "GeekHunter",
    domain: "geekhunter.com.br",
    iconKey: "geekhunter",
    badgeColor: "#1e3799",
    sampleUrlPattern: "https://www.geekhunter.com.br/vagas/...",
  },
  revelo: {
    id: "revelo",
    name: "Revelo",
    domain: "revelo.com.br",
    iconKey: "revelo",
    badgeColor: "#3867d6",
    sampleUrlPattern: "https://app.revelo.com.br/vagas/...",
  },
  catho: {
    id: "catho",
    name: "Catho",
    domain: "catho.com.br",
    iconKey: "catho",
    badgeColor: "#fa8231",
    sampleUrlPattern: "https://www.catho.com.br/vagas/...",
  },
  indeed: {
    id: "indeed",
    name: "Indeed",
    domain: "indeed.com",
    iconKey: "indeed",
    badgeColor: "#2164f3",
    sampleUrlPattern: "https://www.indeed.com/viewjob?jk=...",
  },
  generic: {
    id: "generic",
    name: "Web Opportunity",
    domain: "generic",
    iconKey: "link",
    badgeColor: "#718096",
    sampleUrlPattern: "https://company.com/careers/...",
  },
};

/**
 * Ordered list of the 10 explicitly supported job recruitment platforms.
 */
export const SUPPORTED_PLATFORMS_LIST: JobPlatformInfo[] = [
  SUPPORTED_JOB_PLATFORMS.linkedin,
  SUPPORTED_JOB_PLATFORMS.gupy,
  SUPPORTED_JOB_PLATFORMS.nerdin,
  SUPPORTED_JOB_PLATFORMS.programathor,
  SUPPORTED_JOB_PLATFORMS.micro1,
  SUPPORTED_JOB_PLATFORMS.glassdoor,
  SUPPORTED_JOB_PLATFORMS.geekhunter,
  SUPPORTED_JOB_PLATFORMS.revelo,
  SUPPORTED_JOB_PLATFORMS.catho,
  SUPPORTED_JOB_PLATFORMS.indeed,
];

/**
 * Detects the platform of a job opportunity URL in real-time.
 */
export function detectJobPlatform(rawUrl: string): JobPlatformInfo {
  if (!rawUrl || typeof rawUrl !== "string") {
    return SUPPORTED_JOB_PLATFORMS.generic;
  }

  const urlLower = rawUrl.toLowerCase().trim();

  try {
    const parsed = new URL(urlLower.startsWith("http") ? urlLower : `https://${urlLower}`);
    const host = parsed.hostname;

    if (host.includes("linkedin.com")) return SUPPORTED_JOB_PLATFORMS.linkedin;
    if (host.includes("gupy.io")) return SUPPORTED_JOB_PLATFORMS.gupy;
    if (host.includes("nerdin.com.br")) return SUPPORTED_JOB_PLATFORMS.nerdin;
    if (host.includes("programathor.com.br")) return SUPPORTED_JOB_PLATFORMS.programathor;
    if (host.includes("micro1.ai")) return SUPPORTED_JOB_PLATFORMS.micro1;
    if (host.includes("glassdoor.com") || host.includes("glassdoor.com.br")) return SUPPORTED_JOB_PLATFORMS.glassdoor;
    if (host.includes("geekhunter.com.br")) return SUPPORTED_JOB_PLATFORMS.geekhunter;
    if (host.includes("revelo.com.br") || host.includes("revelo.com")) return SUPPORTED_JOB_PLATFORMS.revelo;
    if (host.includes("catho.com.br")) return SUPPORTED_JOB_PLATFORMS.catho;
    if (host.includes("indeed.com") || host.includes("indeed.com.br")) return SUPPORTED_JOB_PLATFORMS.indeed;
  } catch {
    // String matching fallback
    if (urlLower.includes("linkedin.com")) return SUPPORTED_JOB_PLATFORMS.linkedin;
    if (urlLower.includes("gupy.io")) return SUPPORTED_JOB_PLATFORMS.gupy;
    if (urlLower.includes("nerdin.com.br")) return SUPPORTED_JOB_PLATFORMS.nerdin;
    if (urlLower.includes("programathor.com.br")) return SUPPORTED_JOB_PLATFORMS.programathor;
    if (urlLower.includes("micro1.ai")) return SUPPORTED_JOB_PLATFORMS.micro1;
    if (urlLower.includes("glassdoor.com")) return SUPPORTED_JOB_PLATFORMS.glassdoor;
    if (urlLower.includes("geekhunter.com.br")) return SUPPORTED_JOB_PLATFORMS.geekhunter;
    if (urlLower.includes("revelo.com")) return SUPPORTED_JOB_PLATFORMS.revelo;
    if (urlLower.includes("catho.com.br")) return SUPPORTED_JOB_PLATFORMS.catho;
    if (urlLower.includes("indeed.com")) return SUPPORTED_JOB_PLATFORMS.indeed;
  }

  return SUPPORTED_JOB_PLATFORMS.generic;
}
