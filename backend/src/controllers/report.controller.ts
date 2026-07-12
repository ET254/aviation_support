import { Request, Response } from 'express';
import { prisma } from '../utils/prisma';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';
import { ReportService } from '../services/report.service';

export class ReportController {
  /**
   * Generate weather report
   */
  static async generateWeatherReport(req: Request, res: Response) {
    try {
      const { stationId, startDate, endDate, format = 'json' } = req.query;

      if (!stationId || !startDate || !endDate) {
        throw new AppError('Station ID, start date, and end date are required', 400);
      }

      const report = await ReportService.generateWeatherReport(
        stationId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      if (format === 'pdf') {
        const pdfBuffer = await ReportService.exportToPDF(report);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=weather-report-${Date.now()}.pdf`);
        res.send(pdfBuffer);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Generate weather report error:', error);
      throw new AppError('Failed to generate weather report', 500);
    }
  }

  /**
   * Generate impact report
   */
  static async generateImpactReport(req: Request, res: Response) {
    try {
      const { stationId, startDate, endDate, format = 'json' } = req.query;

      if (!stationId || !startDate || !endDate) {
        throw new AppError('Station ID, start date, and end date are required', 400);
      }

      const report = await ReportService.generateImpactReport(
        stationId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      if (format === 'pdf') {
        const pdfBuffer = await ReportService.exportToPDF(report);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=impact-report-${Date.now()}.pdf`);
        res.send(pdfBuffer);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Generate impact report error:', error);
      throw new AppError('Failed to generate impact report', 500);
    }
  }

  /**
   * Generate operational report
   */
  static async generateOperationalReport(req: Request, res: Response) {
    try {
      const { stationId, startDate, endDate, format = 'json' } = req.query;

      if (!stationId || !startDate || !endDate) {
        throw new AppError('Station ID, start date, and end date are required', 400);
      }

      const report = await ReportService.generateOperationalReport(
        stationId as string,
        new Date(startDate as string),
        new Date(endDate as string)
      );

      if (format === 'pdf') {
        const pdfBuffer = await ReportService.exportToPDF(report);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=operational-report-${Date.now()}.pdf`);
        res.send(pdfBuffer);
      } else {
        res.json({
          success: true,
          data: report,
        });
      }
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Generate operational report error:', error);
      throw new AppError('Failed to generate operational report', 500);
    }
  }

  /**
   * Export data to CSV
   */
  static async exportCSV(req: Request, res: Response) {
    try {
      const { stationId, startDate, endDate, dataType = 'weather' } = req.query;

      if (!stationId || !startDate || !endDate) {
        throw new AppError('Station ID, start date, and end date are required', 400);
      }

      const csvData = await ReportService.exportToCSV(
        stationId as string,
        new Date(startDate as string),
        new Date(endDate as string),
        dataType as string
      );

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=${dataType}-data-${Date.now()}.csv`);
      res.send(csvData);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Export CSV error:', error);
      throw new AppError('Failed to export CSV', 500);
    }
  }

  /**
   * Export data to Excel
   */
  static async exportExcel(req: Request, res: Response) {
    try {
      const { stationId, startDate, endDate, dataType = 'weather' } = req.query;

      if (!stationId || !startDate || !endDate) {
        throw new AppError('Station ID, start date, and end date are required', 400);
      }

      const excelBuffer = await ReportService.exportToExcel(
        stationId as string,
        new Date(startDate as string),
        new Date(endDate as string),
        dataType as string
      );

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename=${dataType}-data-${Date.now()}.xlsx`);
      res.send(excelBuffer);
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Export Excel error:', error);
      throw new AppError('Failed to export Excel', 500);
    }
  }

  /**
   * Get report templates
   */
  static async getTemplates(req: Request, res: Response) {
    try {
      const templates = [
        {
          id: 'weather-summary',
          name: 'Weather Summary Report',
          description: 'Daily weather summary with trends and alerts',
          sections: ['Temperature', 'Wind', 'Visibility', 'Precipitation', 'Alerts'],
        },
        {
          id: 'impact-assessment',
          name: 'Impact Assessment Report',
          description: 'Role-based impact assessment and recommendations',
          sections: ['Weather Conditions', 'Impact Analysis', 'Action Items', 'Priority Levels'],
        },
        {
          id: 'operational-decision',
          name: 'Operational Decision Report',
          description: 'Operational decisions and recommendations',
          sections: ['Flight Operations', 'Ground Operations', 'Safety Concerns', 'Recommendations'],
        },
        {
          id: 'forecast-analysis',
          name: 'Forecast Analysis Report',
          description: 'Detailed forecast analysis with timeline',
          sections: ['TAF Analysis', 'SIGMET', 'Upper Air Data', 'Trends'],
        },
      ];

      res.json({
        success: true,
        data: templates,
      });
    } catch (error) {
      logger.error('Get templates error:', error);
      throw new AppError('Failed to get report templates', 500);
    }
  }
}