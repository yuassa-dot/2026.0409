import nodemailer, { Transporter } from 'nodemailer'
import { logger } from '@/common/utils/logger'
import { config } from '@/config/env'
import { FundNetBuyData } from '@/common/types'

interface EmailConfig {
  host: string
  port: number
  secure: boolean
  auth: {
    user: string
    pass: string
  }
}

interface DailySummaryData {
  date: string
  stocks: FundNetBuyData[]
  statistics: any
}

interface AlertEmailData {
  symbol: string
  name: string
  reason: string
  currentValue: number
  threshold: number
}

class EmailService {
  private transporter: Transporter | null = null

  constructor() {
    this.initializeTransporter()
  }

  /**
   * Initialize email transporter
   */
  private initializeTransporter(): void {
    try {
      const emailConfig: EmailConfig = {
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
          user: process.env.SMTP_USER || '',
          pass: process.env.SMTP_PASS || '',
        },
      }

      if (emailConfig.auth.user && emailConfig.auth.pass) {
        this.transporter = nodemailer.createTransport(emailConfig)
        logger.info('Email service initialized')
      } else {
        logger.warn('Email service not configured - missing SMTP credentials')
      }
    } catch (error) {
      logger.error('Failed to initialize email service:', error)
    }
  }

  /**
   * Send daily summary email
   */
  async sendDailySummary(data: DailySummaryData): Promise<void> {
    try {
      if (!this.transporter) {
        logger.warn('Email service not available')
        return
      }

      const htmlContent = this.generateDailySummaryHtml(data)

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@twstock-screener.com',
        to: process.env.NOTIFICATION_EMAIL || 'admin@example.com',
        subject: `Taiwan Stock Fund Net Buy Report - ${data.date}`,
        html: htmlContent,
      }

      const info = await this.transporter.sendMail(mailOptions)
      logger.info(`Daily summary email sent: ${info.messageId}`)
    } catch (error) {
      logger.error('Failed to send daily summary email:', error)
    }
  }

  /**
   * Send alert email
   */
  async sendAlert(data: AlertEmailData): Promise<void> {
    try {
      if (!this.transporter) {
        logger.warn('Email service not available')
        return
      }

      const htmlContent = this.generateAlertHtml(data)

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@twstock-screener.com',
        to: process.env.NOTIFICATION_EMAIL || 'admin@example.com',
        subject: `Alert: ${data.symbol} - ${data.reason}`,
        html: htmlContent,
      }

      const info = await this.transporter.sendMail(mailOptions)
      logger.info(`Alert email sent for ${data.symbol}: ${info.messageId}`)
    } catch (error) {
      logger.error(`Failed to send alert email for ${data.symbol}:`, error)
    }
  }

  /**
   * Send batch emails to multiple recipients
   */
  async sendBatch(
    recipients: string[],
    subject: string,
    htmlContent: string
  ): Promise<void> {
    try {
      if (!this.transporter) {
        logger.warn('Email service not available')
        return
      }

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@twstock-screener.com',
        bcc: recipients,
        subject,
        html: htmlContent,
      }

      const info = await this.transporter.sendMail(mailOptions)
      logger.info(`Batch email sent to ${recipients.length} recipients`)
    } catch (error) {
      logger.error('Failed to send batch emails:', error)
    }
  }

  /**
   * Send subscription confirmation email
   */
  async sendSubscriptionConfirmation(
    email: string,
    subscriptionType: string
  ): Promise<void> {
    try {
      if (!this.transporter) {
        logger.warn('Email service not available')
        return
      }

      const htmlContent = this.generateSubscriptionConfirmationHtml(
        subscriptionType
      )

      const mailOptions = {
        from: process.env.SMTP_FROM || 'noreply@twstock-screener.com',
        to: email,
        subject: 'Subscription Confirmation',
        html: htmlContent,
      }

      const info = await this.transporter.sendMail(mailOptions)
      logger.info(`Subscription confirmation sent to ${email}`)
    } catch (error) {
      logger.error(
        `Failed to send subscription confirmation to ${email}:`,
        error
      )
    }
  }

  /**
   * Generate daily summary HTML
   */
  private generateDailySummaryHtml(data: DailySummaryData): string {
    const stocksHtml = data.stocks
      .slice(0, 10)
      .map(
        (stock, index) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${index + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${stock.symbol}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${stock.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">NT$${stock.buyAmount.toLocaleString()}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; color: ${stock.changePercent >= 0 ? 'green' : 'red'}">${stock.changePercent.toFixed(2)}%</td>
      </tr>
    `
      )
      .join('')

    return `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2563eb; color: white; padding: 20px; border-radius: 5px; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #f3f4f6; padding: 10px; text-align: left; }
            .stats { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin: 20px 0; }
            .stat-box { background-color: #f3f4f6; padding: 15px; border-radius: 5px; }
            .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Taiwan Stock Fund Net Buy Report</h1>
              <p>Report Date: ${data.date}</p>
            </div>

            <div class="stats">
              <div class="stat-box">
                <strong>Total Buy Amount:</strong><br>
                NT$${data.statistics.total_buy_amount?.toLocaleString() || 0}
              </div>
              <div class="stat-box">
                <strong>Average Buy Amount:</strong><br>
                NT$${data.statistics.avg_buy_amount?.toLocaleString() || 0}
              </div>
              <div class="stat-box">
                <strong>Avg Change %:</strong><br>
                ${data.statistics.avg_change_percent?.toFixed(2) || 0}%
              </div>
              <div class="stat-box">
                <strong>Total Stocks:</strong><br>
                ${data.statistics.total_stocks || 0}
              </div>
            </div>

            <h2>Top 10 Stocks</h2>
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Symbol</th>
                  <th>Name</th>
                  <th>Buy Amount</th>
                  <th>Change %</th>
                </tr>
              </thead>
              <tbody>
                ${stocksHtml}
              </tbody>
            </table>

            <div class="footer">
              <p>This is an automated report. Please do not reply to this email.</p>
              <p>Taiwan Stock Fund Screening System</p>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate alert HTML
   */
  private generateAlertHtml(data: AlertEmailData): string {
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .alert { background-color: #fee2e2; border-left: 4px solid #dc2626; padding: 20px; border-radius: 5px; }
            .alert h2 { color: #dc2626; margin: 0 0 10px 0; }
            .details { margin-top: 20px; }
            .detail-row { display: grid; grid-template-columns: 150px 1fr; margin: 10px 0; }
            .detail-label { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="alert">
              <h2>Alert: ${data.symbol}</h2>
              <p>${data.name}</p>
            </div>

            <div class="details">
              <div class="detail-row">
                <div class="detail-label">Reason:</div>
                <div>${data.reason}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Current Value:</div>
                <div>NT$${data.currentValue.toLocaleString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Threshold:</div>
                <div>NT$${data.threshold.toLocaleString()}</div>
              </div>
              <div class="detail-row">
                <div class="detail-label">Time:</div>
                <div>${new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
        </body>
      </html>
    `
  }

  /**
   * Generate subscription confirmation HTML
   */
  private generateSubscriptionConfirmationHtml(
    subscriptionType: string
  ): string {
    return `
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .success { background-color: #d1fae5; border-left: 4px solid #10b981; padding: 20px; border-radius: 5px; }
            .success h2 { color: #10b981; margin: 0 0 10px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="success">
              <h2>Subscription Confirmed!</h2>
              <p>Thank you for subscribing to Taiwan Stock Fund Screening System.</p>
              <p>Subscription Type: <strong>${subscriptionType}</strong></p>
              <p>You will receive notifications according to your preferences.</p>
            </div>
          </div>
        </body>
      </html>
    `
  }
}

export default new EmailService()
