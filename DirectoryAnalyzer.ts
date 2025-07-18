import * as fs from "fs";
import * as path from "path";
import { DirectoryReport } from "./DirectoryReport";

export class DirectoryAnalyzer {
  analyze(dirPath: string): DirectoryReport {
    const report: DirectoryReport = {
      files: 0,
      directories: 0,
      totalSize: 0,
      extensions: {},
    };

    this.analyzeRecursively(dirPath, report);
    return report;
  }

  private analyzeRecursively(
    currentPath: string,
    report: DirectoryReport
  ): void {
    try {
      const stats = fs.statSync(currentPath);

      if (stats.isDirectory()) {
        report.directories++;

        const items = fs.readdirSync(currentPath);

        for (const item of items) {
          const itemPath = path.join(currentPath, item);
          this.analyzeRecursively(itemPath, report);
        }
      } else if (stats.isFile()) {
        report.files++;
        report.totalSize += stats.size;

        const extension = path.extname(currentPath);
        if (extension) {
          report.extensions[extension] =
            (report.extensions[extension] || 0) + 1;
        }
      }
    } catch (error) {
      console.log(`Warning: Could not access ${currentPath}`);
    }
  }
}
