#!/usr/bin/env node
import { input, select } from "@inquirer/prompts";
import { ApplicationAgentRunner } from "@resume-ai/browser";
import { appConfig } from "@resume-ai/config";
import {
  AgentRunRepository,
  ApplicationRepository,
  CandidateRepository,
  JobRepository,
  ResumeRepository,
  seedDatabase,
} from "@resume-ai/database";
import { JobAnalysisService } from "@resume-ai/jobs";
import { ResumeTailoringService } from "@resume-ai/resume";
import type { Job } from "@resume-ai/types";
import { Command } from "commander";
import pc from "picocolors";

const program = new Command();
const jobRepo = new JobRepository();
const resumeRepo = new ResumeRepository();
const appRepo = new ApplicationRepository();
const candidateRepo = new CandidateRepository();
const runRepo = new AgentRunRepository();

const analysisService = new JobAnalysisService(jobRepo, candidateRepo);
const tailoringService = new ResumeTailoringService(jobRepo, candidateRepo, resumeRepo);
const agentRunner = new ApplicationAgentRunner(undefined, undefined, jobRepo, candidateRepo, resumeRepo, runRepo);

// Seed if candidate profile missing
const activeCandidate = await candidateRepo.getActiveProfile();
if (!activeCandidate) {
  await seedDatabase();
}

program
  .name("job-agent")
  .description("AI Job Application Agent CLI: Analyze jobs, tailor LaTeX resumes, and safely automate applications")
  .version("0.1.0");

/**
 * List jobs command
 */
program
  .command("list")
  .description("List all job opportunities and their current status")
  .action(async () => {
    const jobs = await jobRepo.findAll();
    if (jobs.length === 0) {
      console.log(pc.yellow("No jobs found. Use 'job-agent add' to register a job posting."));
      return;
    }

    console.log(pc.bold("\n--- Job Pipeline Status ---"));
    for (const j of jobs) {
      const statusColor =
        j.status === "applied"
          ? pc.green(j.status)
          : j.status === "resume_ready"
          ? pc.cyan(j.status)
          : pc.yellow(j.status);

      console.log(`[${pc.dim(j.id)}] ${pc.bold(j.title)} at ${pc.blue(j.company)} (${statusColor})`);
    }
    console.log();
  });

/**
 * Add job command
 */
program
  .command("add")
  .description("Add a new job opportunity")
  .option("-t, --title <title>", "Job title")
  .option("-c, --company <company>", "Company name")
  .option("-u, --url <url>", "Job posting URL")
  .option("-d, --description <desc>", "Job description text")
  .action(async (options: { title?: string; company?: string; url?: string; description?: string }) => {
    const title = options.title || (await input({ message: "Job title:" }));
    const company = options.company || (await input({ message: "Company name:" }));
    const url = options.url || (await input({ message: "Job URL (optional):" }));
    const description = options.description || (await input({ message: "Job Description:" }));

    const now = new Date().toISOString();
    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      company,
      url: url || "",
      location: "Remote",
      source: "cli",
      description,
      status: "discovered",
      createdAt: now,
      updatedAt: now,
    };

    await jobRepo.save(newJob);
    console.log(pc.green(`\nJob successfully added! ID: ${newJob.id}`));
  });

/**
 * Analyze job command
 */
program
  .command("analyze")
  .description("Extract structured requirements and perform candidate gap analysis")
  .requiredOption("-j, --job <id>", "Job ID to analyze")
  .action(async (options: { job: string }) => {
    console.log(pc.cyan(`Analyzing job ${options.job}...`));
    const reqs = await analysisService.analyzeJob(options.job);

    console.log(pc.bold("\n=== Structured Job Analysis ==="));
    console.log(`Seniority Level: ${pc.green(reqs.seniorityLevel)}`);
    console.log(`Work Model: ${pc.green(reqs.workModel)}`);
    console.log(`Years Experience: ${pc.yellow(String(reqs.experienceYearsRequired || "N/A"))}`);

    console.log(pc.bold("\nKey Requirements Identified:"));
    for (const skill of reqs.skills) {
      const crit = "★".repeat(skill.criticalityScore) + "☆".repeat(5 - skill.criticalityScore);
      console.log(`  - ${skill.name} (${crit}) [${skill.category}] ${skill.required ? pc.red("*required*") : ""}`);
    }

    if (reqs.gapAnalysis) {
      console.log(pc.bold("\nCandidate Match Assessment:"));
      console.log(`Match Score: ${pc.bold(pc.green(`${reqs.gapAnalysis.matchPercentage}%`))}`);
      console.log(`Matching: ${reqs.gapAnalysis.matchingSkills.join(", ")}`);
      console.log(`Missing / Growth: ${reqs.gapAnalysis.missingSkills.join(", ") || "None"}`);
    }
    console.log();
  });

/**
 * Tailor resume command
 */
program
  .command("resume")
  .description("Generate tailored LaTeX resume grounded in candidate profile")
  .requiredOption("-j, --job <id>", "Job ID to tailor resume for")
  .action(async (options: { job: string }) => {
    console.log(pc.cyan(`Tailoring resume for job ${options.job}...`));
    const version = await tailoringService.generateTailoredResume(options.job);

    console.log(pc.green(`\nResume Version ${version.versionNumber} generated successfully!`));
    console.log(pc.bold("\nTailored Professional Summary:"));
    console.log(pc.dim(version.tailoredSummary));

    console.log(pc.bold("\nKey Improvements Made:"));
    for (const diff of version.diffItems) {
      console.log(`  [${pc.cyan(diff.section)}] ${diff.rationalization}`);
    }
    console.log();
  });

/**
 * Apply command
 */
program
  .command("apply")
  .description("Run automated browser application agent with visible window by default")
  .requiredOption("-j, --job <id>", "Job ID to apply for")
  .option("--headless", "Run in headless mode (defaults to visible window)")
  .action(async (options: { job: string; headless?: boolean }) => {
    const isHeadless = options.headless ?? appConfig.browserHeadless;
    console.log(pc.cyan(`Launching browser application agent (Headless: ${isHeadless})...`));
    const run = await agentRunner.startApplication(options.job, isHeadless);

    console.log(pc.bold("\n=== Execution Summary ==="));
    console.log(`Status: ${run.status === "succeeded" ? pc.green(run.status) : pc.yellow(run.status)}`);
    console.log(`Events Recorded: ${run.events.length}`);

    for (const evt of run.events) {
      console.log(`  [Step ${evt.stepIndex}] ${pc.dim(evt.actionType)}: ${evt.details}`);
    }

    if (run.intervention) {
      console.log(pc.yellow(`\nHuman Intervention Required: ${run.intervention.description}`));
    } else if (run.submissionProof) {
      console.log(pc.green(`\nApplication Submitted with verified proof: ${run.submissionProof}`));
    }
    console.log();
  });

/**
 * Status command
 */
program
  .command("status")
  .description("Check full status, latest resume, and application history for a job")
  .requiredOption("-j, --job <id>", "Job ID")
  .action(async (options: { job: string }) => {
    const job = await jobRepo.findById(options.job);
    if (!job) {
      console.log(pc.red(`Job not found: ${options.job}`));
      return;
    }

    const reqs = await jobRepo.getRequirements(options.job);
    const resume = await resumeRepo.getLatestVersion(options.job);
    const app = await appRepo.findByJobId(options.job);

    console.log(pc.bold(`\nJob: ${job.title} at ${job.company}`));
    console.log(`Status: ${pc.green(job.status)}`);
    console.log(`Requirements Analyzed: ${reqs ? pc.green("Yes") : pc.red("No")}`);
    console.log(`Resume Generated: ${resume ? pc.green(`v${resume.versionNumber}`) : pc.red("No")}`);
    console.log(`Application Verified: ${app?.submissionVerified ? pc.green("Yes") : pc.yellow("No")}`);
    console.log();
  });

/**
 * Interactive wizard if no args passed
 */
async function runInteractiveWizard() {
  console.log(pc.bold(pc.cyan("\n=== AI Job Application Agent Terminal Wizard ===")));

  const action = await select({
    message: "Select an action:",
    choices: [
      { name: "1. List Jobs & Pipeline Status", value: "list" },
      { name: "2. Add New Job Opportunity", value: "add" },
      { name: "3. Analyze Job Requirements", value: "analyze" },
      { name: "4. Generate Tailored LaTeX Resume", value: "resume" },
      { name: "5. Run Browser Application Agent", value: "apply" },
      { name: "6. Exit", value: "exit" },
    ],
  });

  if (action === "list") {
    const jobs = await jobRepo.findAll();
    console.log(pc.bold("\n--- Jobs in Pipeline ---"));
    for (const j of jobs) {
      console.log(`[${j.id}] ${j.title} at ${j.company} - ${pc.cyan(j.status)}`);
    }
    console.log();
  } else if (action === "add") {
    const title = await input({ message: "Job title:" });
    const company = await input({ message: "Company name:" });
    const description = await input({ message: "Job description:" });

    const newJob: Job = {
      id: `job-${Date.now()}`,
      title,
      company,
      url: "",
      location: "Remote",
      source: "cli",
      description,
      status: "discovered",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await jobRepo.save(newJob);
    console.log(pc.green(`Job saved with ID: ${newJob.id}`));
  } else if (action === "analyze") {
    const jobs = await jobRepo.findAll();
    const choices = jobs.map((j) => ({ name: `${j.title} (${j.company}) [${j.id}]`, value: j.id }));
    const selectedJobId = await select({ message: "Choose job to analyze:", choices });
    console.log(pc.cyan("Analyzing requirements..."));
    const reqs = await analysisService.analyzeJob(selectedJobId);
    console.log(pc.green(`Requirements extracted: ${reqs.skills.length} skills identified.`));
  } else if (action === "resume") {
    const jobs = await jobRepo.findAll();
    const choices = jobs.map((j) => ({ name: `${j.title} (${j.company}) [${j.id}]`, value: j.id }));
    const selectedJobId = await select({ message: "Choose job to tailor resume for:", choices });
    console.log(pc.cyan("Generating tailored LaTeX resume..."));
    const version = await tailoringService.generateTailoredResume(selectedJobId);
    console.log(pc.green(`Resume version ${version.versionNumber} created!`));
  } else if (action === "apply") {
    const jobs = await jobRepo.findAll();
    const choices = jobs.map((j) => ({ name: `${j.title} (${j.company}) [${j.id}]`, value: j.id }));
    const selectedJobId = await select({ message: "Choose job to apply to:", choices });
    console.log(pc.cyan("Running browser application agent..."));
    const run = await agentRunner.startApplication(selectedJobId);
    console.log(pc.green(`Agent run finished with status: ${run.status}`));
  }
}

if (process.argv.length <= 2) {
  runInteractiveWizard().catch((err) => {
    console.error(pc.red(err instanceof Error ? err.message : String(err)));
  });
} else {
  program.parse();
}
