import { generateJobsMarkdown } from "../../src/markdown-generator.js";

const baseCompany = {
  id: "52200796",
  company: "SOBIS AP S.R.L.",
  brand: "SOBIS",
  status: "activ",
  location: ["Sibiu"],
  website: ["https://sobis-ap.ro"],
  career: ["https://sobis-ap.ro/cariere/"],
  lastScraped: "2026-07-21"
};

const baseJob = {
  url: "https://sobis-ap.ro/cariere/#job-1",
  title: "Senior Node.js Developer",
  workmode: "hybrid",
  location: ["Sibiu"],
  tags: ["node.js", "javascript"],
  status: "scraped"
};

describe("generateJobsMarkdown", () => {
  describe("company section", () => {
    it("includes company name as h1", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("# SOBIS AP S.R.L.");
    });

    it("includes CIF", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("52200796");
    });

    it("includes brand", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("SOBIS AP");
    });

    it("includes status", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("activ");
    });

    it("includes website as markdown link", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("[https://sobis-ap.ro](https://sobis-ap.ro)");
    });

    it("includes career page as markdown link", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("[https://sobis-ap.ro/cariere/](https://sobis-ap.ro/cariere/)");
    });

    it("includes lastScraped date", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("2026-07-21");
    });

    it("omits optional fields when not present", () => {
      const minimal = { id: "52200796", company: "SOBIS AP S.R.L." };
      const md = generateJobsMarkdown(minimal, []);
      expect(md).toContain("# SOBIS AP S.R.L.");
      expect(md).not.toContain("Brand");
      expect(md).not.toContain("Last Scraped");
    });
  });

  describe("jobs section", () => {
    it("shows job count in heading", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("## Current Job Listings (1)");
    });

    it("shows 0 when no jobs", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toContain("## Current Job Listings (0)");
    });

    it("includes job title as h3", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("### Senior Node.js Developer");
    });

    it("includes job URL as markdown link", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("[https://sobis-ap.ro/cariere/#job-1]");
    });

    it("includes workmode", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("hybrid");
    });

    it("includes location", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("Sibiu");
    });

    it("includes tags", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("node.js, javascript");
    });

    it("includes status", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(md).toContain("scraped");
    });

    it("renders multiple jobs", () => {
      const job2 = { ...baseJob, title: "DevOps Engineer", url: "https://sobis-ap.ro/cariere/#job-2" };
      const md = generateJobsMarkdown(baseCompany, [baseJob, job2]);
      expect(md).toContain("### Senior Node.js Developer");
      expect(md).toContain("### DevOps Engineer");
      expect(md).toContain("## Current Job Listings (2)");
    });

    it("handles job with no optional fields", () => {
      const minimal = { url: "https://sobis-ap.ro/cariere/#job-999", title: "QA Engineer" };
      const md = generateJobsMarkdown(baseCompany, [minimal]);
      expect(md).toContain("### QA Engineer");
      expect(md).not.toContain("Work Mode");
      expect(md).not.toContain("Tags");
    });
  });

  describe("output format", () => {
    it("returns a non-empty string", () => {
      const md = generateJobsMarkdown(baseCompany, [baseJob]);
      expect(typeof md).toBe("string");
      expect(md.length).toBeGreaterThan(0);
    });

    it("includes a generated timestamp", () => {
      const md = generateJobsMarkdown(baseCompany, []);
      expect(md).toMatch(/_Generated: \d{4}-\d{2}-\d{2}/);
    });
  });
});
