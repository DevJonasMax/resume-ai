import type { z } from "zod";
import type { AIProvider } from "./interfaces.js";

/**
 * Deterministic Mock AI Provider for offline development and local validation.
 */
export class MockAIProvider implements AIProvider {
  public readonly isMock = true;
  public readonly providerName = "mock";

  public async generateStructured<T>(options: {
    schema: z.ZodType<T>;
    prompt: string;
    systemPrompt?: string;
    model?: string;
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

    const isPtBr =
      options.prompt.toLowerCase().includes("pt-br") ||
      options.prompt.toLowerCase().includes("português") ||
      options.prompt.toLowerCase().includes("portugues");

    // Default mock response for tailored resume content
    const mockTailoredResume = isPtBr
      ? {
          thoughtProcess:
            "1. Analisada a experiência comprovada do candidato em automação de testes e engenharia de software.\n2. Identificados requisitos prioritários: Selenium WebDriver, C#/Java e validação de APIs escaláveis.\n3. Tradução e adaptação técnica para o português do Brasil (PT-BR) com terminologia ATS padrão da indústria.\n4. Alinhamento de ATS projetado em 94% de compatibilidade após refinamento estruturado.",
          strategicDecisions: [
            "Localizado o currículo integralmente para PT-BR mantendo termos técnicos essenciais em inglês",
            "Quantificados resultados de automação em plataformas ERP e comércio eletrônico",
            "Enfatizadas competências-chave (Selenium, Java, APIs REST/SOAP) no sumário executivo",
          ],
          tailoredSummary:
            "Engenheiro Sênior de Automação de QA orientado a resultados, com mais de 6 anos de experiência especializada na criação de frameworks de automação com Selenium, Java e C#. Especialista comprovado em validação de APIs REST e SOAP, fluxos de pagamento em ERPs e pipelines de integração contínua (CI/CD).",
          tailoredExperience: [
            {
              company: "G4S Technologies",
              location: "Gurgaon, Haryana",
              role: "Engenheiro de QA Sênior",
              startDate: "Out 2016",
              endDate: "Presente",
              bulletPoints: [
                "Projetou suítes abrangentes de testes automatizados utilizando SOAP UI, Selenium com Java e MongoDB para sistemas web ERP de missão crítica.",
                "Formulou estratégias de garantia de qualidade ponta a ponta e automatizou ciclos diários de regressão para entregas contínuas.",
                "Colaborou diretamente com Product Owners para converter critérios de aceitação em cenários robustos de testes automatizados.",
                "Premiado com distinções de qualidade Prata (2018) e Bronze (2018) pela entrega com zero defeitos em produção.",
              ],
            },
            {
              company: "On Demand Agility Software Solutions",
              location: "Gurgaon, Haryana",
              role: "Engenheiro de Software Sênior",
              startDate: "Jun 2014",
              endDate: "Out 2016",
              bulletPoints: [
                "Desenvolveu frameworks de testes automatizados de alto rendimento utilizando Selenium com C# para aplicações de e-commerce em escala corporativa.",
                "Liderou equipe de engenharia da qualidade de 3 membros, garantindo 100% de conformidade com os benchmarks de homologação.",
                "Automatizou validações de compatibilidade entre navegadores e responsividade móvel através do BrowserStack.",
              ],
            },
          ],
          diffItems: [
            {
              section: "Resumo Profissional",
              originalText: "6+ years of diverse experience in Information Technology...",
              tailoredText: "Engenheiro Sênior de Automação de QA com mais de 6 anos de experiência...",
              rationalization: "Traduzido e adaptado para PT-BR destacando competências nucleares de automação de acordo com a solicitação do usuário.",
              targetedRequirement: "Transcrição e localização em PT-BR",
            },
          ],
        }
      : {
          thoughtProcess:
            "1. Analyzed candidate's 6+ years of verified software QA and automation experience.\n2. Identified target requirements: Selenium WebDriver, C#/Java, and scalable API validation.\n3. Formulated strategic enhancement: Elevated quantitative metrics and test suite architecture in recent roles.\n4. Assessed ATS alignment: Projected compatibility score improved from 74% to 92%.",
          strategicDecisions: [
            "Elevated core language proficiencies (Java, C#) into prominent summary positioning",
            "Quantified high-throughput ERP and e-commerce automated testing outcomes",
            "Aligned testing frameworks explicitly with job posting requirements",
          ],
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
    model?: string;
  }): Promise<string> {
    return `Mock AI response generated for prompt: "${options.prompt.slice(0, 80)}..."`;
  }

  public async streamText(options: {
    prompt: string;
    systemPrompt?: string;
    model?: string;
  }): Promise<AsyncIterable<string>> {
    const fullText = await this.generateText(options);
    const words = fullText.split(" ");
    return {
      async *[Symbol.asyncIterator]() {
        for (const word of words) {
          yield `${word} `;
          await new Promise((resolve) => setTimeout(resolve, 30));
        }
      },
    };
  }
}
