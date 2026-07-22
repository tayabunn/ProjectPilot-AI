export class Logger {
  private static formatMessage(level: string, message: string): string {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}] ${message}`;
  }

  public static info(message: string): void {
    console.log(this.formatMessage('info', message));
  }

  public static warn(message: string): void {
    console.warn(this.formatMessage('warn', message));
  }

  public static error(message: string, error?: any): void {
    console.error(this.formatMessage('error', message));
    if (error) {
      console.error(error);
    }
  }

  public static debug(message: string): void {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('debug', message));
    }
  }
}
