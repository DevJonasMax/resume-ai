import type { CandidateProfile, ExperienceItem } from "@resume-ai/types";

/**
 * Sanitizes raw text for safe inclusion in LaTeX documents without breaking syntax.
 */
export function sanitizeLatex(text: string): string {
  return text
    .replace(/\\/g, "\\textbackslash{}")
    .replace(/([&%$#_{}])/g, "\\$1")
    .replace(/~/g, "\\textasciitilde{}")
    .replace(/\^/g, "\\textasciicircum{}");
}

/**
 * LaTeX resume generation engine matching the clean typography and macros of resume-example-01.tex.
 */
export class LaTeXEngine {
  /**
   * Compiles tailored candidate data into canonical LaTeX source code.
   */
  public renderDocument(options: {
    candidate: CandidateProfile;
    summary: string;
    experiences: ExperienceItem[];
  }): string {
    const { candidate, summary, experiences } = options;

    const safeName = sanitizeLatex(candidate.fullName);
    const safeEmail = sanitizeLatex(candidate.email);
    const safePhone = sanitizeLatex(candidate.phone);
    const safeSummary = sanitizeLatex(summary);

    const experienceBlocks = experiences
      .map((exp) => {
        const safeCompany = sanitizeLatex(exp.company);
        const safeLocation = sanitizeLatex(exp.location);
        const safeRole = sanitizeLatex(exp.role);
        const safeDates = sanitizeLatex(`${exp.startDate} -- ${exp.endDate}`);

        const items = exp.bulletPoints
          .map((point) => `      \\resumeItem{Contribution: }{${sanitizeLatex(point)}}`)
          .join("\n");

        return `    \\resumeSubheading
      {${safeCompany}}{${safeLocation}}
      {${safeRole}}{${safeDates}}
      \\resumeItemListStart
${items}
      \\resumeItemListEnd`;
      })
      .join("\n\n");

    const skillsBlocks = Object.entries(candidate.skills)
      .map(([category, list]) => {
        const safeCategory = sanitizeLatex(category);
        const safeList = sanitizeLatex(list.join(", "));
        return `    \\item{\\textbf{${safeCategory}}{: ${safeList}}}`;
      })
      .join("\n");

    const educationBlocks = candidate.education
      .map((edu) => {
        const safeInstitution = sanitizeLatex(edu.institution);
        const safeLocation = sanitizeLatex(edu.location);
        const safeDegree = sanitizeLatex(
          edu.percentageOrGpa ? `${edu.degree}; Grade: ${edu.percentageOrGpa}` : edu.degree
        );
        const safeDates = sanitizeLatex(
          edu.startDate && edu.endDate ? `${edu.startDate} -- ${edu.endDate}` : ""
        );

        return `    \\resumeSubheading
      {${safeInstitution}}{${safeLocation}}
      {${safeDegree}}{${safeDates}}`;
      })
      .join("\n\n");

    return `\\documentclass[letterpaper,11pt]{article}

\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[pdftex]{hyperref}
\\usepackage{fancyhdr}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

% Adjust margins
\\addtolength{\\oddsidemargin}{-0.375in}
\\addtolength{\\evensidemargin}{-0.375in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}
\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

% Section formatting
\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

% Custom commands
\\newcommand{\\resumeItem}[2]{
  \\item\\small{
    \\textbf{#1}{: #2 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-1pt}\\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-5pt}
}

\\newcommand{\\resumeSubItem}[2]{\\resumeItem{#1}{#2}\\vspace{-4pt}}
\\renewcommand{\\labelitemii}{$\\circ$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=*]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}

\\begin{document}

%----------HEADING-----------------
\\begin{tabular*}{\\textwidth}{l@{\\extracolsep{\\fill}}r}
  \\textbf{{\\Large ${safeName}}} & Email : \\href{mailto:${safeEmail}}{${safeEmail}}\\\\
   & Mobile : ${safePhone}\\\\
\\end{tabular*}

%-----------Professional Summary-----------------
\\section{Professional Summary}
\\resumeItemListStart
  \\resumeItem{Profile: }{${safeSummary}}
\\resumeItemListEnd

%-----------EXPERIENCE-----------------
\\section{Experience}
\\resumeSubHeadingListStart
${experienceBlocks}
\\resumeSubHeadingListEnd

%--------PROGRAMMING SKILLS------------
\\section{Skills \\& Competencies}
\\resumeSubHeadingListStart
${skillsBlocks}
\\resumeSubHeadingListEnd

%-----------EDUCATION-----------------
\\section{Education}
\\resumeSubHeadingListStart
${educationBlocks}
\\resumeSubHeadingListEnd

\\end{document}
`;
  }
}
