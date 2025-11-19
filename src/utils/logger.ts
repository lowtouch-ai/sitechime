type LogType = 'log' | 'info' | 'warn' | 'error';

interface LogEntry {
  type: LogType;
  args: any[];
}

class LoggerService {
  private isConsoleEnabled: boolean = true;
  private isConfigured: boolean = false;
  private buffer: LogEntry[] = [];

  configure(options: { console?: boolean }) {
    if (options.console !== undefined) {
      this.isConsoleEnabled = options.console;
    }
    this.isConfigured = true;
    
    if (this.isConsoleEnabled) {
      this.flushBuffer();
    } else {
      this.buffer = []; // Clear buffer if disabled
    }
  }

  private flushBuffer() {
    this.buffer.forEach(entry => {
      switch (entry.type) {
        case 'log': console.log(...entry.args); break;
        case 'info': console.info(...entry.args); break;
        case 'warn': console.warn(...entry.args); break;
        case 'error': console.error(...entry.args); break;
      }
    });
    this.buffer = [];
  }

  private handleLog(type: LogType, args: any[]) {
    if (this.isConfigured) {
      if (this.isConsoleEnabled) {
        switch (type) {
          case 'log': console.log(...args); break;
          case 'info': console.info(...args); break;
          case 'warn': console.warn(...args); break;
          case 'error': console.error(...args); break;
        }
      }
    } else {
      this.buffer.push({ type, args });
    }
  }

  log(...args: any[]) {
    this.handleLog('log', args);
  }

  info(...args: any[]) {
    this.handleLog('info', args);
  }

  warn(...args: any[]) {
    this.handleLog('warn', args);
  }

  error(...args: any[]) {
    this.handleLog('error', args);
  }
}

export const Logger = new LoggerService();
