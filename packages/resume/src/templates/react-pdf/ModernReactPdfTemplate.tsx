import React, { Fragment, type FC, type ReactNode } from "react";
void React;
import { Document, Page, Text, View, StyleSheet, Link } from "@react-pdf/renderer";
import type { ResumeDocument } from "@resume-ai/types";
import type { RenderOptions } from "../../providers/PDFProvider.js";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    color: "#111827",
  },
  header: {
    alignItems: "center",
    marginBottom: 8,
  },
  name: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    marginBottom: 2,
  },
  title: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Oblique",
    color: "#334155",
    marginBottom: 4,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    fontSize: 8.5,
    color: "#475569",
  },
  contactItem: {
    fontSize: 8.5,
    color: "#475569",
    textDecoration: "none",
  },
  bulletDot: {
    fontSize: 7,
    color: "#94a3b8",
  },
  section: {
    marginTop: 10,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 10.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
    textTransform: "uppercase",
    borderBottomWidth: 0.75,
    borderBottomColor: "#cbd5e1",
    paddingBottom: 2,
    marginBottom: 5,
  },
  summaryText: {
    fontSize: 9,
    lineHeight: 1.4,
    color: "#1e293b",
  },
  experienceBlock: {
    marginBottom: 6,
  },
  subheadingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 1,
  },
  companyName: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  locationText: {
    fontSize: 8.5,
    color: "#64748b",
  },
  roleText: {
    fontSize: 9,
    fontFamily: "Helvetica-Oblique",
    color: "#334155",
  },
  dateText: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: "#64748b",
  },
  bulletList: {
    marginTop: 2,
    paddingLeft: 4,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bulletSymbol: {
    width: 10,
    fontSize: 8,
    color: "#64748b",
  },
  bulletContent: {
    flex: 1,
    fontSize: 8.5,
    lineHeight: 1.35,
    color: "#334155",
  },
  skillRow: {
    flexDirection: "row",
    marginBottom: 3,
  },
  skillCategory: {
    width: 120,
    fontSize: 8.5,
    fontFamily: "Helvetica-Bold",
    color: "#1e293b",
  },
  skillItems: {
    flex: 1,
    fontSize: 8.5,
    color: "#334155",
  },
  educationBlock: {
    marginBottom: 5,
  },
  projectBlock: {
    marginBottom: 6,
  },
  projectName: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#0f172a",
  },
  projectLink: {
    fontSize: 9.5,
    fontFamily: "Helvetica-Bold",
    color: "#2563eb",
    textDecoration: "none",
  },
  projectTech: {
    fontSize: 8.5,
    fontFamily: "Helvetica-Oblique",
    color: "#64748b",
  },
});

export interface ModernReactPdfTemplateProps {
  document: ResumeDocument;
  options?: RenderOptions | undefined;
}

/**
 * High-fidelity React-PDF resume document template.
 */
export const ModernReactPdfTemplate: FC<ModernReactPdfTemplateProps> = ({ document: doc, options }) => {
  const paperSize = options?.paperSize === "a4" ? "A4" : "LETTER";
  const { basics, summary, experiences, skills, education, projects } = doc;

  const contacts: ReactNode[] = [];
  if (basics.email) {
    contacts.push(
      <Link key="email" src={`mailto:${basics.email}`} style={styles.contactItem}>
        {basics.email}
      </Link>
    );
  }
  if (basics.phone) {
    contacts.push(
      <Text key="phone" style={styles.contactItem}>
        {basics.phone}
      </Text>
    );
  }
  if (basics.location) {
    contacts.push(
      <Text key="location" style={styles.contactItem}>
        {basics.location}
      </Text>
    );
  }
  if (basics.website) {
    contacts.push(
      <Link key="website" src={basics.website} style={styles.contactItem}>
        {basics.website.replace(/^https?:\/\//, "")}
      </Link>
    );
  }
  if (basics.linkedin) {
    contacts.push(
      <Link key="linkedin" src={basics.linkedin} style={styles.contactItem}>
        LinkedIn
      </Link>
    );
  }
  if (basics.github) {
    contacts.push(
      <Link key="github" src={basics.github} style={styles.contactItem}>
        GitHub
      </Link>
    );
  }

  return (
    <Document title={`${basics.fullName} - Resume`} author={basics.fullName}>
      <Page size={paperSize} style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{basics.fullName}</Text>
          {basics.title ? <Text style={styles.title}>{basics.title}</Text> : null}
          <View style={styles.contactRow}>
            {contacts.map((contact, idx) => (
              <Fragment key={idx}>
                {idx > 0 && <Text style={styles.bulletDot}>•</Text>}
                {contact}
              </Fragment>
            ))}
          </View>
        </View>

        {/* Professional Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summaryText}>{summary}</Text>
        </View>

        {/* Work Experience */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Experience</Text>
          {experiences.map((exp, idx) => (
            <View key={idx} style={styles.experienceBlock}>
              <View style={styles.subheadingRow}>
                <Text style={styles.companyName}>{exp.company}</Text>
                <Text style={styles.locationText}>{exp.location}</Text>
              </View>
              <View style={styles.subheadingRow}>
                <Text style={styles.roleText}>{exp.role}</Text>
                <Text style={styles.dateText}>
                  {exp.startDate} – {exp.endDate}
                </Text>
              </View>
              <View style={styles.bulletList}>
                {exp.bulletPoints.map((bp, bpIdx) => (
                  <View key={bpIdx} style={styles.bulletRow}>
                    <Text style={styles.bulletSymbol}>•</Text>
                    <Text style={styles.bulletContent}>{bp}</Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>

        {/* Skills & Competencies */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Competencies</Text>
          {skills.map((skillGroup, idx) => (
            <View key={idx} style={styles.skillRow}>
              <Text style={styles.skillCategory}>{skillGroup.category}:</Text>
              <Text style={styles.skillItems}>{skillGroup.items.join(", ")}</Text>
            </View>
          ))}
        </View>

        {/* Education */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Education</Text>
          {education.map((edu, idx) => (
            <View key={idx} style={styles.educationBlock}>
              <View style={styles.subheadingRow}>
                <Text style={styles.companyName}>{edu.institution}</Text>
                <Text style={styles.locationText}>{edu.location}</Text>
              </View>
              <View style={styles.subheadingRow}>
                <Text style={styles.roleText}>
                  {edu.degree}
                  {edu.percentageOrGpa ? ` (Grade: ${edu.percentageOrGpa})` : ""}
                </Text>
                <Text style={styles.dateText}>
                  {edu.startDate && edu.endDate ? `${edu.startDate} – ${edu.endDate}` : ""}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Projects */}
        {projects && projects.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((proj, idx) => (
              <View key={idx} style={styles.projectBlock}>
                <View style={styles.subheadingRow}>
                  {proj.link ? (
                    <Link src={proj.link} style={styles.projectLink}>
                      {proj.name}
                    </Link>
                  ) : (
                    <Text style={styles.projectName}>{proj.name}</Text>
                  )}
                  {proj.technologies && proj.technologies.length > 0 ? (
                    <Text style={styles.projectTech}>({proj.technologies.join(", ")})</Text>
                  ) : null}
                </View>
                <Text style={styles.summaryText}>{proj.description}</Text>
                {proj.bulletPoints && proj.bulletPoints.length > 0 ? (
                  <View style={styles.bulletList}>
                    {proj.bulletPoints.map((bp, bpIdx) => (
                      <View key={bpIdx} style={styles.bulletRow}>
                        <Text style={styles.bulletSymbol}>•</Text>
                        <Text style={styles.bulletContent}>{bp}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
};
