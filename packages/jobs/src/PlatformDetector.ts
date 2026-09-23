import type { JobPlatformId, JobPlatformInfo } from "@resume-ai/types";

/**
 * Registry of supported job recruitment platforms with design and parsing metadata.
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
 * Detects the job platform matching a given URL.
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
    if (host.includes("gupy.io") || host.includes("gupy.com")) return SUPPORTED_JOB_PLATFORMS.gupy;
    if (host.includes("nerdin.com")) return SUPPORTED_JOB_PLATFORMS.nerdin;
    if (host.includes("programathor.com")) return SUPPORTED_JOB_PLATFORMS.programathor;
    if (host.includes("micro1.ai") || host.includes("micro1.")) return SUPPORTED_JOB_PLATFORMS.micro1;
    if (host.includes("glassdoor.")) return SUPPORTED_JOB_PLATFORMS.glassdoor;
    if (host.includes("geekhunter.com")) return SUPPORTED_JOB_PLATFORMS.geekhunter;
    if (host.includes("revelo.com") || host.includes("revelo.io")) return SUPPORTED_JOB_PLATFORMS.revelo;
    if (host.includes("catho.com")) return SUPPORTED_JOB_PLATFORMS.catho;
    if (host.includes("indeed.")) return SUPPORTED_JOB_PLATFORMS.indeed;
  } catch {
    // If URL parsing fails, perform resilient substring checks
    if (urlLower.includes("linkedin.com")) return SUPPORTED_JOB_PLATFORMS.linkedin;
    if (urlLower.includes("gupy.io") || urlLower.includes("gupy.com")) return SUPPORTED_JOB_PLATFORMS.gupy;
    if (urlLower.includes("nerdin.com")) return SUPPORTED_JOB_PLATFORMS.nerdin;
    if (urlLower.includes("programathor.com")) return SUPPORTED_JOB_PLATFORMS.programathor;
    if (urlLower.includes("micro1.ai") || urlLower.includes("micro1.")) return SUPPORTED_JOB_PLATFORMS.micro1;
    if (urlLower.includes("glassdoor.")) return SUPPORTED_JOB_PLATFORMS.glassdoor;
    if (urlLower.includes("geekhunter.com")) return SUPPORTED_JOB_PLATFORMS.geekhunter;
    if (urlLower.includes("revelo.com") || urlLower.includes("revelo.io")) return SUPPORTED_JOB_PLATFORMS.revelo;
    if (urlLower.includes("catho.com")) return SUPPORTED_JOB_PLATFORMS.catho;
    if (urlLower.includes("indeed.")) return SUPPORTED_JOB_PLATFORMS.indeed;
  }

  return SUPPORTED_JOB_PLATFORMS.generic;
}

/**
 * Returns an array of target supported platforms excluding the generic fallback.
 */
export function getSupportedPlatformsList(): JobPlatformInfo[] {
  return [
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
}

/**
 * Extracts best-effort metadata (Title, Company) directly from URL patterns and slugs.
 */
export function extractUrlMetadata(rawUrl: string): { title?: string; company?: string; location?: string } {
  if (!rawUrl || typeof rawUrl !== "string") {
    return {};
  }

  const result: { title?: string; company?: string; location?: string } = {};

  try {
    const urlLower = rawUrl.toLowerCase().trim();
    const parsed = new URL(urlLower.startsWith("http") ? urlLower : `https://${urlLower}`);
    const host = parsed.hostname;
    const pathname = decodeURIComponent(parsed.pathname);

    // Gupy: Subdomain often represents company name (e.g. nubank.gupy.io)
    if (host.includes("gupy.io")) {
      const parts = host.split(".");
      const firstPart = parts[0];
      if (parts.length >= 3 && firstPart && firstPart !== "www" && firstPart !== "login" && firstPart !== "app") {
        result.company = firstPart.charAt(0).toUpperCase() + firstPart.slice(1);
      }
      const slugMatch = pathname.match(/\/job\/(?:[0-9]+-)?([a-z0-9-]+)/i);
      if (slugMatch?.[1]) {
        result.title = slugMatch[1].replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
      }
      return result;
    }

    // LinkedIn: /jobs/view/title-at-company-12345
    if (host.includes("linkedin.com")) {
      const match = pathname.match(/\/jobs\/view\/([^/?#]+)/i);
      if (match?.[1]) {
        let slug = match[1];
        slug = slug.replace(/-[0-9]+$/, "");
        if (slug.includes("-at-")) {
          const [titlePart, compPart] = slug.split("-at-");
          if (titlePart) {
            result.title = titlePart.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
          }
          if (compPart) {
            result.company = compPart.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
          }
          return result;
        }
        result.title = slug.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        return result;
      }
    }

    // Programathor: /jobs/1234-title
    if (host.includes("programathor.com")) {
      const match = pathname.match(/\/jobs\/(?:[0-9]+-)?([a-z0-9-]+)/i);
      if (match?.[1]) {
        result.title = match[1].replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        result.company = "Programathor Opportunity";
        return result;
      }
    }

    // GeekHunter: /vagas/1234-title
    if (host.includes("geekhunter.com")) {
      const match = pathname.match(/\/vagas\/(?:[0-9]+-)?([a-z0-9-]+)/i);
      if (match?.[1]) {
        result.title = match[1].replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        result.company = "GeekHunter Opportunity";
        return result;
      }
    }

    // Nerdin: /vagas/title
    if (host.includes("nerdin.com")) {
      const match = pathname.match(/\/vagas\/(?:[0-9]+-)?([a-z0-9-]+)/i);
      if (match?.[1]) {
        result.title = match[1].replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        result.company = "Nerdin Opportunity";
        return result;
      }
    }

    // Catho: /vagas/title/12345
    if (host.includes("catho.com")) {
      const match = pathname.match(/\/vagas\/([a-z0-9-]+)/i);
      if (match?.[1]) {
        result.title = match[1].replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()).trim();
        result.company = "Catho Opportunity";
        return result;
      }
    }
  } catch {
    // Return empty if parsing fails
  }

  return result;
}
