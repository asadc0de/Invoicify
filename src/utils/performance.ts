// Performance monitoring utility
export const performanceMonitor = {
  startTime: 0,
  
  start(label: string) {
    this.startTime = performance.now();
    console.log(`🚀 Starting: ${label}`);
  },
  
  end(label: string) {
    const endTime = performance.now();
    const duration = endTime - this.startTime;
    console.log(`✅ Completed: ${label} in ${duration.toFixed(2)}ms`);
    return duration;
  },
  
  measure<T>(label: string, fn: () => T | Promise<T>): T | Promise<T> {
    this.start(label);
    const result = fn();
    
    if (result instanceof Promise) {
      return result.finally(() => this.end(label));
    } else {
      this.end(label);
      return result;
    }
  }
};

// Debounce utility for performance optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle utility for performance optimization
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};
