import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import jsPDF from 'jspdf';
import { Workbook } from 'exceljs';
import { ImpactService } from './impact.service';

export class ReportService {
  /**
   * Generate weather report
   */
  static async generateWeatherReport(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
    });

    const weatherData = await prisma.weatherData.findMany({
      where: {
        stationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    const stats = this.calculateWeatherStats(weatherData);

    return {
      reportType: 'WEATHER',
      generatedAt: new Date(),
      station: {
        name: station?.name,
        code: station?.code,
        wmoId: station?.wmoId,
      },
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalRecords: weatherData.length,
        ...stats,
      },
      data: weatherData.slice(0, 100), // Limit for report
    };
  }

  /**
   * Calculate weather statistics
   */
  static calculateWeatherStats(data: any[]): any {
    if (data.length === 0) {
      return {
        temperature: { avg: 0, min: 0, max: 0 },
        wind: { avg: 0, max: 0 },
        visibility: { avg: 0, min: 0, max: 0 },
      };
    }

    const temps = data.map(d => d.temperature).filter(t => t !== null);
    const winds = data.map(d => d.windSpeed).filter(w => w !== null);
    const vis = data.map(d => d.visibility).filter(v => v !== null);

    return {
      temperature: {
        avg: temps.length > 0 ? this.average(temps) : 0,
        min: temps.length > 0 ? Math.min(...temps) : 0,
        max: temps.length > 0 ? Math.max(...temps) : 0,
      },
      wind: {
        avg: winds.length > 0 ? this.average(winds) : 0,
        max: winds.length > 0 ? Math.max(...winds) : 0,
      },
      visibility: {
        avg: vis.length > 0 ? this.average(vis) : 0,
        min: vis.length > 0 ? Math.min(...vis) : 0,
        max: vis.length > 0 ? Math.max(...vis) : 0,
      },
    };
  }

  /**
   * Generate impact report
   */
  static async generateImpactReport(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const logs = await prisma.impactLog.findMany({
      where: {
        stationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
      orderBy: {
        timestamp: 'desc',
      },
    });

    const severityCounts = this.countSeverities(logs);
    const resolvedCount = logs.filter(l => l.isResolved).length;

    return {
      reportType: 'IMPACT',
      generatedAt: new Date(),
      period: {
        startDate,
        endDate,
      },
      summary: {
        totalImpacts: logs.length,
        resolved: resolvedCount,
        unresolved: logs.length - resolvedCount,
        bySeverity: severityCounts,
      },
      details: logs.slice(0, 50),
    };
  }

  /**
   * Generate operational report
   */
  static async generateOperationalReport(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const station = await prisma.station.findUnique({
      where: { id: stationId },
    });

    const weatherData = await prisma.weatherData.findMany({
      where: {
        stationId,
        timestamp: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        timestamp: 'asc',
      },
    });

    // Generate operational recommendations
    const recommendations = await this.generateOperationalRecommendations(
      stationId,
      weatherData
    );

    return {
      reportType: 'OPERATIONAL',
      generatedAt: new Date(),
      station: {
        name: station?.name,
        code: station?.code,
      },
      period: {
        startDate,
        endDate,
      },
      weatherSummary: this.calculateWeatherStats(weatherData),
      recommendations,
      operationalStatus: this.determineOperationalStatus(weatherData),
    };
  }

  /**
   * Count severities
   */
  static countSeverities(logs: any[]): any {
    const counts: any = {};
    for (const log of logs) {
      counts[log.severity] = (counts[log.severity] || 0) + 1;
    }
    return counts;
  }

  /**
   * Calculate average
   */
  static average(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Generate operational recommendations
   */
  static async generateOperationalRecommendations(
    stationId: string,
    weatherData: any[]
  ): Promise<any[]> {
    const recommendations = [];
    
    if (weatherData.length === 0) {
      return [{ message: 'No data available for recommendations' }];
    }

    const latest = weatherData[weatherData.length - 1];

    // Visibility recommendations
    if (latest.visibility < 3000) {
      recommendations.push({
        category: 'VISIBILITY',
        priority: 'HIGH',
        message: 'Reduced visibility operations required',
        actions: ['Deploy additional ground personnel', 'Implement low visibility procedures'],
      });
    }

    // Wind recommendations
    if (latest.windSpeed > 30) {
      recommendations.push({
        category: 'WIND',
        priority: 'HIGH',
        message: 'Strong winds affecting operations',
        actions: ['Secure ground equipment', 'Review aircraft limitations'],
      });
    }

    // Temperature recommendations
    if (latest.temperature > 35) {
      recommendations.push({
        category: 'TEMPERATURE',
        priority: 'MEDIUM',
        message: 'High temperature affecting performance',
        actions: ['Calculate density altitude', 'Adjust takeoff weights'],
      });
    }

    return recommendations;
  }

  /**
   * Determine operational status
   */
  static determineOperationalStatus(weatherData: any[]): string {
    if (weatherData.length === 0) return 'UNKNOWN';

    const latest = weatherData[weatherData.length - 1];
    const status = [];

    if (latest.visibility < 3000) status.push('REDUCED_VISIBILITY');
    if (latest.windSpeed > 30) status.push('HIGH_WIND');
    if (latest.temperature > 35) status.push('HIGH_TEMP');

    if (status.length === 0) return 'NORMAL';
    if (status.length === 1) return 'MONITOR';
    return 'RESTRICTED';
  }

  /**
   * Export to PDF
   */
  static async exportToPDF(report: any): Promise<Buffer> {
    const doc = new jsPDF();
    const margin = 20;
    let y = margin;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 128);
    doc.text(`Aviation Impact Dashboard - ${report.reportType} Report`, margin, y);
    y += 15;

    // Metadata
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text(`Generated: ${report.generatedAt.toLocaleString()}`, margin, y);
    y += 10;

    if (report.station) {
      doc.text(`Station: ${report.station.name} (${report.station.code})`, margin, y);
      y += 10;
    }

    doc.text(`Period: ${report.period.startDate.toLocaleDateString()} - ${report.period.endDate.toLocaleDateString()}`, margin, y);
    y += 15;

    // Summary
    doc.setFontSize(16);
    doc.text('Summary', margin, y);
    y += 10;

    doc.setFontSize(12);
    if (report.summary) {
      for (const [key, value] of Object.entries(report.summary)) {
        if (typeof value === 'object') {
          doc.text(`${key}:`, margin, y);
          y += 5;
          for (const [subKey, subValue] of Object.entries(value as any)) {
            doc.text(`  ${subKey}: ${subValue}`, margin + 5, y);
            y += 5;
          }
        } else {
          doc.text(`${key}: ${value}`, margin, y);
          y += 5;
        }
      }
    }

    // Data table
    if (report.data && report.data.length > 0) {
      y += 10;
      doc.setFontSize(14);
      doc.text('Detailed Data (First 10 Records)', margin, y);
      y += 10;

      doc.setFontSize(10);
      const headers = ['Time', 'Temp', 'Wind', 'Visibility'];
      const colWidths = [50, 30, 30, 50];
      let x = margin;

      // Headers
      doc.setFont('helvetica', 'bold');
      for (let i = 0; i < headers.length; i++) {
        doc.text(headers[i], x, y);
        x += colWidths[i];
      }
      y += 5;
      doc.setFont('helvetica', 'normal');

      // Data rows
      const limit = Math.min(10, report.data.length);
      for (let i = 0; i < limit; i++) {
        if (y > doc.internal.pageSize.getHeight() - margin) {
          doc.addPage();
          y = margin;
        }
        
        const record = report.data[i];
        x = margin;
        doc.text(new Date(record.timestamp).toLocaleTimeString(), x, y);
        x += colWidths[0];
        doc.text(record.temperature?.toFixed(1) || '-', x, y);
        x += colWidths[1];
        doc.text(record.windSpeed?.toFixed(1) || '-', x, y);
        x += colWidths[2];
        doc.text(record.visibility?.toFixed(0) || '-', x, y);
        y += 7;
      }
    }

    return Buffer.from(doc.output('arraybuffer'));
  }

  /**
   * Export to CSV
   */
  static async exportToCSV(
    stationId: string,
    startDate: Date,
    endDate: Date,
    dataType: string
  ): Promise<string> {
    let data: any[] = [];

    if (dataType === 'weather') {
      data = await prisma.weatherData.findMany({
        where: {
          stationId,
          timestamp: { gte: startDate, lte: endDate },
        },
        orderBy: { timestamp: 'asc' },
      });
    } else if (dataType === 'impact') {
      data = await prisma.impactLog.findMany({
        where: {
          stationId,
          timestamp: { gte: startDate, lte: endDate },
        },
        orderBy: { timestamp: 'asc' },
      });
    }

    if (data.length === 0) {
      return 'No data available for the selected period';
    }

    // Generate CSV header
    const headers = Object.keys(data[0]).filter(key => 
      !['id', 'stationId', 'userId', 'station', 'user'].includes(key)
    );
    let csv = headers.join(',') + '\n';

    // Add data rows
    for (const record of data) {
      const row = headers.map(header => {
        const value = record[header];
        if (value === null || value === undefined) return '';
        if (value instanceof Date) return value.toISOString();
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value;
      });
      csv += row.join(',') + '\n';
    }

    return csv;
  }

  /**
   * Export to Excel - FIXED VERSION
   */
  static async exportToExcel(
    stationId: string,
    startDate: Date,
    endDate: Date,
    dataType: string
  ): Promise<Buffer> {
    try {
      const workbook = new Workbook();
      const worksheet = workbook.addWorksheet('Data');

      let data: any[] = [];

      if (dataType === 'weather') {
        data = await prisma.weatherData.findMany({
          where: {
            stationId,
            timestamp: { gte: startDate, lte: endDate },
          },
          orderBy: { timestamp: 'asc' },
          include: {
            station: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        });
      } else if (dataType === 'impact') {
        data = await prisma.impactLog.findMany({
          where: {
            stationId,
            timestamp: { gte: startDate, lte: endDate },
          },
          orderBy: { timestamp: 'asc' },
          include: {
            user: {
              select: {
                name: true,
                role: true,
              },
            },
            station: {
              select: {
                name: true,
                code: true,
              },
            },
          },
        });
      }

      if (data.length === 0) {
        worksheet.addRow(['No data available for the selected period']);
      } else {
        // Add headers
        const firstRecord = data[0];
        const headers = Object.keys(firstRecord).filter(key => 
          !['id', 'stationId', 'userId'].includes(key)
        );
        
        const headerRow = worksheet.addRow(headers);
        headerRow.font = { bold: true };
        headerRow.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFE0E0E0' },
        };

        // Add data
        for (const record of data) {
          const row = headers.map(header => {
            const value = record[header];
            if (value === null || value === undefined) return '';
            if (value instanceof Date) return value;
            return value;
          });
          worksheet.addRow(row);
        }
      }

      // Auto-fit columns
      worksheet.columns.forEach((column: any) => {
        let maxLength = 0;
        column.eachCell({ includeEmpty: true }, (cell: any) => {
          const cellValue = cell.value;
          const length = cellValue ? cellValue.toString().length : 0;
          if (length > maxLength) maxLength = length;
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // FIX: Get buffer and convert to proper Node.js Buffer
      const buffer = await workbook.xlsx.writeBuffer();
      return Buffer.from(buffer);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error generating Excel';
      logger.error(`Excel generation error: ${errorMessage}`);
      throw new Error(`Failed to generate Excel: ${errorMessage}`);
    }
  }

  /**
   * Generate combined report
   */
  static async generateCombinedReport(
    stationId: string,
    startDate: Date,
    endDate: Date
  ): Promise<any> {
    const [weatherReport, impactReport, operationalReport] = await Promise.all([
      this.generateWeatherReport(stationId, startDate, endDate),
      this.generateImpactReport(stationId, startDate, endDate),
      this.generateOperationalReport(stationId, startDate, endDate),
    ]);

    return {
      reportType: 'COMBINED',
      generatedAt: new Date(),
      period: {
        startDate,
        endDate,
      },
      weather: weatherReport,
      impacts: impactReport,
      operational: operationalReport,
    };
  }

  /**
   * Export report to file
   */
  static async exportReportToFile(
    stationId: string,
    startDate: Date,
    endDate: Date,
    format: 'pdf' | 'excel' | 'csv',
    dataType: string
  ): Promise<Buffer | string> {
    try {
      switch (format) {
        case 'pdf': {
          const report = await this.generateWeatherReport(stationId, startDate, endDate);
          return await this.exportToPDF(report);
        }
        case 'excel': {
          return await this.exportToExcel(stationId, startDate, endDate, dataType);
        }
        case 'csv': {
          return await this.exportToCSV(stationId, startDate, endDate, dataType);
        }
        default: {
          throw new Error(`Unsupported format: ${format}`);
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error exporting report';
      logger.error(`Export report error: ${errorMessage}`);
      throw new Error(`Failed to export report: ${errorMessage}`);
    }
  }

  /**
   * Get report types
   */
  static getReportTypes(): string[] {
    return ['weather', 'impact', 'operational', 'combined'];
  }

  /**
   * Get export formats
   */
  static getExportFormats(): string[] {
    return ['pdf', 'excel', 'csv'];
  }

  /**
   * Validate report options
   */
  static validateReportOptions(
    stationId: string,
    startDate: Date,
    endDate: Date,
    format: string,
    dataType: string
  ): void {
    if (!stationId) {
      throw new Error('Station ID is required');
    }

    if (!startDate || !endDate) {
      throw new Error('Start date and end date are required');
    }

    if (startDate > endDate) {
      throw new Error('Start date must be before end date');
    }

    const validFormats = this.getExportFormats();
    if (!validFormats.includes(format)) {
      throw new Error(`Invalid format. Must be one of: ${validFormats.join(', ')}`);
    }

    const validTypes = this.getReportTypes();
    if (!validTypes.includes(dataType) && dataType !== 'combined') {
      throw new Error(`Invalid data type. Must be one of: ${validTypes.join(', ')}`);
    }
  }
}

export default ReportService;