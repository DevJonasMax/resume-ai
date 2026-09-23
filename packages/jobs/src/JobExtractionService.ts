import { type AIProvider, getAIProvider } from "@resume-ai/ai";
import type { ExtractedJobData } from "@resume-ai/types";
import * as cheerio from "cheerio";
import { z } from "zod";
import { detectJobPlatform, extractUrlMetadata } from "./PlatformDetector.js";

const JobExtractionOutputSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  description: z.string(),
});

interface LdJsonJobPosting {
  "@type"?: string | string[];
  title?: string;
  name?: string;
  hiringOrganization?:
    | {
        name?: string;
        legalName?: string;
      }
    | string;
  jobLocation?:
    | {
        address?:
          | {
              addressLocality?: string;
              addressRegion?: string;
              addressCountry?: string;
            }
          | string;
      }
    | string
    | Array<unknown>;
  jobLocationType?: string;
  applicantLocationRequirements?:
    | {
        name?: string;
      }
    | string;
  description?: string;
}

/**
 * Converts raw HTML markup into readable, structured plain text preserving paragraph and list breaks.
 */
function htmlToPlainText(rawHtml: string): string {
  if (!rawHtml || typeof rawHtml !== "string") return "";
  const $ = cheerio.load(rawHtml);
  $("script, style, noscript, svg, iframe").remove();

  $("br").replaceWith("\n");
  $("p, div, li, tr, h1, h2, h3, h4, h5, h6, blockquote, section, article").each((_, el) => {
    $(el).append("\n");
  });

  return $.text()
    .split("\n")
    .map((line) => line.trim())
    .filter((line, i, arr) => {
      const prev = arr[i - 1];
      return line.length > 0 || (i > 0 && typeof prev === "string" && prev.length > 0);
    })
    .join("\n")
    .trim();
}

/**
 * Checks whether an item type matches schema.org JobPosting.
 */
function isJobPostingType(type: unknown): boolean {
  if (typeof type === "string") {
    return (
      type === "JobPosting" ||
      type.endsWith("/JobPosting") ||
      type.endsWith(":JobPosting") ||
      type.toLowerCase() === "jobposting"
    );
  }
  if (Array.isArray(type)) {
    return type.some((t) => isJobPostingType(t));
  }
  return false;
}

/**
 * Recursively collects JobPosting objects from parsed JSON-LD.
 */
function collectJobPostings(obj: unknown, list: LdJsonJobPosting[] = []): LdJsonJobPosting[] {
  if (!obj || typeof obj !== "object") return list;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      collectJobPostings(item, list);
    }
    return list;
  }

  const record = obj as Record<string, unknown>;

  if (isJobPostingType(record["@type"])) {
    list.push(record as LdJsonJobPosting);
  }

  if (record["@graph"]) {
    collectJobPostings(record["@graph"], list);
  }

  if (record["mainEntity"]) {
    collectJobPostings(record["mainEntity"], list);
  }

  return list;
}

/**
 * Parses location details from JSON-LD jobLocation structures.
 */
function parseLdLocation(loc: unknown, locType?: unknown): string {
  let resolved = "";
  if (typeof loc === "string") {
    resolved = loc.trim();
  } else if (Array.isArray(loc) && loc.length > 0) {
    resolved = parseLdLocation(loc[0]);
  } else if (typeof loc === "object" && loc !== null) {
    const locObj = loc as Record<string, unknown>;
    const rawAddress = locObj["address"];
    if (typeof rawAddress === "string") {
      resolved = rawAddress.trim();
    } else if (typeof rawAddress === "object" && rawAddress !== null) {
      const addr = rawAddress as Record<string, unknown>;
      const locality = addr["addressLocality"];
      const region = addr["addressRegion"];
      const country = addr["addressCountry"];
      const parts = [locality, region, country].filter(
        (p): p is string => typeof p === "string" && p.trim().length > 0
      );
      if (parts.length > 0) {
        resolved = parts.join(", ");
      }
    }
  }

  const isTelecommute =
    locType === "TELECOMMUTE" ||
    (typeof locType === "string" && locType.toLowerCase().includes("telecommute"));

  if (isTelecommute) {
    return resolved ? `${resolved} (Remote)` : "Remote";
  }

  return resolved;
}

/**
 * Normalizes job title by stripping common platform noise and suffixes.
 */
function cleanJobTitle(title: string): string {
  if (!title) return "";
  return title
    .replace(
      /\s*(?:\||-|•)\s*(?:LinkedIn|Gupy|Nerdin|Programathor|Micro1|Glassdoor|GeekHunter|Revelo|Catho|Indeed).*$/i,
      ""
    )
    .replace(/^Vaga(?:\s+de)?\s+/i, "")
    .replace(/^Emprego(?:\s+de)?\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Service that extracts verified job posting details from URLs across the 10 major job boards.
 */
export class JobExtractionService {
  private readonly ai: AIProvider;

  constructor(ai?: AIProvider) {
    this.ai = ai || getAIProvider();
  }

  /**
   * Extracts job opportunity details from a live URL across target platforms with multi-layer fallback.
   */
  public async extractFromUrl(url: string): Promise<ExtractedJobData> {
    const platform = detectJobPlatform(url);
    const urlMetadata = extractUrlMetadata(url);

    let html = "";
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,pt-BR;q=0.8,pt;q=0.7",
          "Cache-Control": "no-cache",
          "Sec-Ch-Ua": '"Chromium";v="124", "Google Chrome";v="124", "Not-A.Brand";v="99"',
          "Sec-Ch-Ua-Mobile": "?0",
          "Sec-Ch-Ua-Platform": '"Windows"',
          "Sec-Fetch-Dest": "document",
          "Sec-Fetch-Mode": "navigate",
        },
        signal: AbortSignal.timeout(12000),
      });

      if (!response.ok) {
        // If protected by anti-bot or requiring auth, provide fallback if URL heuristics exist
        if (response.status === 403 || response.status === 429 || response.status === 999) {
          if (urlMetadata.title || urlMetadata.company) {
            return {
              url,
              platform,
              title: urlMetadata.title || `${platform.name} Opportunity`,
              company: urlMetadata.company || platform.name,
              location: "Remote",
              description: `Job opportunity on ${platform.name} at ${url}. Content is behind platform authentication or anti-bot verification. Review and adjust requirements.`,
            };
          }
        }
        throw new Error(`HTTP Error ${response.status} fetching job URL: ${response.statusText}`);
      }

      html = await response.text();
    } catch (fetchErr: unknown) {
      if (urlMetadata.title || urlMetadata.company) {
        return {
          url,
          platform,
          title: urlMetadata.title || `${platform.name} Opportunity`,
          company: urlMetadata.company || platform.name,
          location: "Remote",
          description: `Job opportunity on ${platform.name} at ${url}. Direct access was protected. Please review job details.`,
        };
      }
      const msg = fetchErr instanceof Error ? fetchErr.message : String(fetchErr);
      throw new Error(`Could not access job link: ${msg}`);
    }

    const $ = cheerio.load(html);

    let extractedTitle = "";
    let extractedCompany = "";
    let extractedLocation = "";
    let extractedDescription = "";

    // 1. JSON-LD Schema (JobPosting) extraction (Industry standard across LinkedIn, Indeed, Glassdoor, Gupy, Catho)
    const jsonLdPostings: LdJsonJobPosting[] = [];
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const rawJson = $(elem).html();
        if (!rawJson) return;
        const parsed = JSON.parse(rawJson);
        collectJobPostings(parsed, jsonLdPostings);
      } catch {
        // Continue to next script
      }
    });

    for (const posting of jsonLdPostings) {
      if (!extractedTitle && (posting.title || posting.name)) {
        extractedTitle = posting.title || posting.name || "";
      }
      if (!extractedCompany) {
        if (typeof posting.hiringOrganization === "object" && posting.hiringOrganization !== null) {
          extractedCompany = posting.hiringOrganization.name || posting.hiringOrganization.legalName || "";
        } else if (typeof posting.hiringOrganization === "string") {
          extractedCompany = posting.hiringOrganization;
        }
      }
      if (!extractedLocation && posting.jobLocation) {
        extractedLocation = parseLdLocation(posting.jobLocation, posting.jobLocationType);
      }
      if (!extractedDescription && posting.description) {
        extractedDescription = htmlToPlainText(posting.description);
      }
    }

    // 2. Platform-Specific DOM & Next.js extraction
    if (platform.id === "gupy") {
      const nextDataRaw = $("#__NEXT_DATA__").html();
      if (nextDataRaw) {
        try {
          const nextData = JSON.parse(nextDataRaw);
          const job = nextData.props?.pageProps?.job;
          if (job) {
            extractedTitle = job.name || extractedTitle;
            extractedCompany = job.careerPageName || job.companyName || extractedCompany;
            if (job.city || job.state) {
              const loc = [job.city, job.state].filter(Boolean).join(", ");
              extractedLocation = job.isRemote ? `${loc} (Remote)` : loc;
            } else if (job.isRemote) {
              extractedLocation = "Remote";
            }

            const sections = [
              job.description,
              job.responsibilities ? `Responsabilidades:\n${job.responsibilities}` : "",
              job.requirements ? `Requisitos:\n${job.requirements}` : "",
              job.additionalInfo ? `Informações Adicionais:\n${job.additionalInfo}` : "",
            ]
              .filter(Boolean)
              .join("\n\n");

            if (sections) {
              const fullDesc = htmlToPlainText(sections);
              if (fullDesc.length > extractedDescription.length) {
                extractedDescription = fullDesc;
              }
            }
          }
        } catch {
          // ignore
        }
      }

      if (!extractedTitle) {
        extractedTitle = $('[data-testid="job-title"], h1[data-testid="job-name"], h1').first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $('[data-testid="job-company-name"], .career-page-name').first().text().trim();
      }
      if (!extractedLocation) {
        extractedLocation = $(
          '[data-testid="job-location"], [data-testid="job-city-state"], span[data-testid="job-workplace-type"]'
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedDescription) {
        const descElem = $('[data-testid="job-description"], div[data-testid="text-section"]').first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "linkedin") {
      if (!extractedTitle) {
        extractedTitle = $(
          "h1.top-card-layout__title, h1.topcard__title, .job-details-jobs-unified-top-card__job-title, h1"
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedCompany) {
        extractedCompany = $(
          "a.topcard__org-name-link, .top-card-layout__first-sub-section a, .job-details-jobs-unified-top-card__company-name, span.topcard__flavor"
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedLocation) {
        extractedLocation = $(
          ".topcard__flavor--bullet, .top-card-layout__first-sub-section .topcard__flavor:nth-child(2), .job-details-jobs-unified-top-card__bullet"
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedDescription) {
        const descElem = $(
          ".show-more-less-html__markup, .description__text, #job-details, .jobs-description-content__text"
        ).first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "nerdin") {
      if (!extractedTitle) {
        extractedTitle = $("h1.vaga-titulo, h1.job-title, .titulo-vaga, h1").first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $(".vaga-empresa, .nome-empresa, .company-name, .empresa").first().text().trim();
      }
      if (!extractedLocation) {
        extractedLocation = $(".vaga-local, .vaga-cidade, .cidade-estado, .local").first().text().trim();
      }
      if (!extractedDescription) {
        const descElem = $(".vaga-descricao, .job-description, .descricao-vaga, #descricao").first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "programathor") {
      if (!extractedTitle) {
        extractedTitle = $(".wrapper-content-job h1, div.wrapper-header-job h1, h1").first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $(
          '.wrapper-content-job a[href*="/empresas/"], .wrapper-content-job .company-name, div.wrapper-header-job a'
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedLocation) {
        extractedLocation = $(
          ".wrapper-content-job span:has(i.fa-map-marker), .wrapper-content-job .fa-map-marker-alt + span, .fa-map-marker + span"
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedDescription) {
        const descElem = $(".line-height-24, .wrapper-content-job div.description").first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "micro1") {
      if (!extractedTitle) {
        extractedTitle = $("h1.job-title, h1.heading-role, [data-role='job-title'], h1").first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $("[data-role='company-name'], .company-name").first().text().trim() || "micro1";
      }
      if (!extractedLocation) {
        extractedLocation = $(".job-location, .location-tag, [data-role='location']").first().text().trim() || "Remote";
      }
      if (!extractedDescription) {
        const descElem = $(".job-description, .rich-text, [class*='job-description'], div.description-body").first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "glassdoor") {
      if (!extractedTitle) {
        extractedTitle = $('[data-test="job-title"], h1.job-title, h1').first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $('[data-test="employer-name"], .css-87uc0g, .e1tk4hg71').first().text().trim();
      }
      if (!extractedLocation) {
        extractedLocation = $('[data-test="location"], .css-56kyx5, .e1tk4hg72').first().text().trim();
      }
      if (!extractedDescription) {
        const descElem = $('[data-test="job-description-text"], #JobDescriptionContainer').first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "geekhunter") {
      if (!extractedTitle) {
        extractedTitle = $("h1.job-title, .job-header h1, h1").first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $(
          ".job-company, .company-name, .job-header .company, span.company-name"
        )
          .first()
          .text()
          .trim() || "GeekHunter Opportunity";
      }
      if (!extractedLocation) {
        extractedLocation = $(".job-location, .job-header .location, span:has(.icon-location)").first().text().trim();
      }
      if (!extractedDescription) {
        const descElem = $(".job-description, .job-details, #job-description, .description-content").first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "revelo") {
      if (!extractedTitle) {
        extractedTitle = $('h1[data-testid="job-title"], h1.job-title, h1').first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $('[data-testid="company-name"], .company-name').first().text().trim() || "Revelo Opportunity";
      }
      if (!extractedLocation) {
        extractedLocation = $('[data-testid="job-location"], .job-location').first().text().trim() || "Remote";
      }
      if (!extractedDescription) {
        const descElem = $('[data-testid="job-description"], .job-description').first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "catho") {
      if (!extractedTitle) {
        extractedTitle = $('h1[class*="Title"], h1.job-title, h1[data-gtm-dimension-38], h1').first().text().trim();
      }
      if (!extractedCompany) {
        extractedCompany = $('[class*="Company"], [class*="companyName"], h2[class*="Company"]').first().text().trim();
      }
      if (!extractedLocation) {
        extractedLocation = $('[class*="Location"], span[class*="location"], a[title*="Vagas em"]').first().text().trim();
      }
      if (!extractedDescription) {
        const descElem = $('[class*="JobDescription"], article[class*="Description"], #job-description').first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    } else if (platform.id === "indeed") {
      if (!extractedTitle) {
        extractedTitle = $('h1.jobsearch-JobInfoHeader-title, h1[data-testid="jobsearch-JobInfoHeader-title"], h1')
          .first()
          .text()
          .trim();
      }
      if (!extractedCompany) {
        extractedCompany = $(
          '[data-testid="inlineHeader-companyName"], .jobsearch-CompanyInfoContainer a, .jobsearch-InlineCompanyRating-companyHeader'
        )
          .first()
          .text()
          .trim();
      }
      if (!extractedLocation) {
        extractedLocation = $('[data-testid="inlineHeader-companyLocation"], [data-testid="job-location"]')
          .first()
          .text()
          .trim();
      }
      if (!extractedDescription) {
        const descElem = $("#jobDescriptionText, .jobsearch-jobDescriptionText").first();
        if (descElem.length) {
          extractedDescription = htmlToPlainText(descElem.html() || "");
        }
      }
    }

    // 3. Generic Meta and OpenGraph fallbacks
    if (!extractedTitle) {
      extractedTitle =
        $('meta[property="og:title"]').attr("content") ||
        $('meta[name="twitter:title"]').attr("content") ||
        $('meta[name="title"]').attr("content") ||
        $("title").text().split(/[-|•]/)[0]?.trim() ||
        "";
    }

    if (!extractedCompany) {
      extractedCompany =
        $('meta[property="og:site_name"]').attr("content") ||
        $('meta[name="author"]').attr("content") ||
        $('[class*="company-name"], [class*="companyName"], [class*="employer"]').first().text().trim() ||
        "";
    }

    if (!extractedLocation) {
      extractedLocation =
        $('meta[name="geo.placename"]').attr("content") ||
        $('[class*="job-location"], [class*="location"], [class*="jobLocation"]').first().text().trim() ||
        "";
    }

    if (!extractedDescription) {
      const genericDescElem = $(
        '[class*="job-description"], [class*="jobDescription"], [itemprop="description"], article, main'
      ).first();
      if (genericDescElem.length) {
        extractedDescription = htmlToPlainText(genericDescElem.html() || "");
      }
    }

    if (!extractedDescription) {
      extractedDescription =
        $('meta[property="og:description"]').attr("content") ||
        $('meta[name="description"]').attr("content") ||
        "";
    }

    // 4. URL slug heuristics fallback
    if (!extractedTitle && urlMetadata.title) {
      extractedTitle = urlMetadata.title;
    }
    if (!extractedCompany && urlMetadata.company) {
      extractedCompany = urlMetadata.company;
    }

    // 5. Clean up fields
    extractedTitle = cleanJobTitle(extractedTitle);
    extractedCompany = extractedCompany.replace(/\s+/g, " ").trim();
    extractedLocation = extractedLocation.replace(/\s+/g, " ").trim() || "Remote";
    extractedDescription = extractedDescription.replace(/\s+/g, " ").trim();

    // 6. AI Fallback: if description is too sparse or essential fields missing, synthesize via structured AI
    if (!extractedTitle || !extractedDescription || extractedDescription.length < 100) {
      $("script, style, noscript, nav, footer, header, svg, iframe").remove();
      const bodyText = $("body").text().replace(/\s+/g, " ").trim().slice(0, 4000);

      if (bodyText.length > 50) {
        try {
          const aiExtracted = await this.ai.generateStructured({
            schema: JobExtractionOutputSchema,
            prompt: `Extract structured job posting details from this webpage text:
URL: ${url}
Platform: ${platform.name}
Page Content:
${bodyText}

Extract Title, Company Name, Location (or "Remote"), and Full Job Description.`,
            systemPrompt:
              "You are an expert recruitment parser. Extract clean and accurate job details from raw webpage text. Do not invent information.",
          });

          if (!extractedTitle && aiExtracted.title) extractedTitle = cleanJobTitle(aiExtracted.title);
          if (!extractedCompany && aiExtracted.company) extractedCompany = aiExtracted.company;
          if ((!extractedLocation || extractedLocation === "Remote") && aiExtracted.location) {
            extractedLocation = aiExtracted.location;
          }
          if (!extractedDescription || extractedDescription.length < aiExtracted.description.length) {
            extractedDescription = aiExtracted.description;
          }
        } catch {
          // Keep best-effort extraction
        }
      }
    }

    // Final safety defaults
    if (!extractedTitle) extractedTitle = urlMetadata.title || "Software Engineering Role";
    if (!extractedCompany) extractedCompany = urlMetadata.company || (platform.name !== "Web Opportunity" ? platform.name : "Target Company");
    if (!extractedDescription) {
      extractedDescription = `Job opportunity imported from ${url}. Review and refine requirements before tailoring.`;
    }

    return {
      url,
      platform,
      title: extractedTitle,
      company: extractedCompany,
      location: extractedLocation,
      description: extractedDescription,
    };
  }
}
