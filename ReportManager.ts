import { ReportAdapter } from "./ReportAdapter";
import { JsonReportAdapter } from "./JsonReportAdapter";
import { CsvReportAdapter } from "./CsvReportAdapter";
import { XmlReportAdapter } from "./XmlReportAdapter";
import { AnalyzerFacade } from "./AnalyzerFacade";
import * as fs from "fs";
import * as path from "path";

export class ReportManager {
  private static readonly REPORTS_DIR = "reports";
  private adapter: ReportAdapter;
  private fileExtension: string;
  private facade: AnalyzerFacade;

  constructor(format: string = "json") {
    try {
      this.initReportsDirectory();
      [this.adapter, this.fileExtension] = this.getAdapter(format);
      this.facade = new AnalyzerFacade(this.adapter);
    } catch (error) {
      console.error(error);
      process.exit(1);
    }
  }

  private initReportsDirectory(): void {
    if (!fs.existsSync(ReportManager.REPORTS_DIR)) {
      fs.mkdirSync(ReportManager.REPORTS_DIR, { recursive: true });
    }
  }

  private getAdapter(format: string): [ReportAdapter, string] {
    switch (format.toLowerCase()) {
      case "json":
        return [new JsonReportAdapter(), "json"];
      case "csv":
        return [new CsvReportAdapter(), "csv"];
      case "xml":
        return [new XmlReportAdapter(), "xml"];
      default:
        throw new Error(
          `Unsupported format: ${format}. Supported formats: json, csv, xml`
        );
    }
  }

  private generateFileName(): string {
    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\./g, "-");
    return `report-${timestamp}.${this.fileExtension}`;
  }

  generateReport(targetPath: string): void {
    try {
      console.log(`Analyzing directory: ${targetPath}`);

      const reportContent = this.facade.generateReport(targetPath);
      const fileName = this.generateFileName();
      const filePath = path.join(ReportManager.REPORTS_DIR, fileName);

      fs.writeFileSync(filePath, reportContent, "utf8");

      console.log(`Report successfully generated and saved to: ${filePath}`);
    } catch (error) {
      console.error(
        `Error generating report: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
      process.exit(1);
    }
  }
}
