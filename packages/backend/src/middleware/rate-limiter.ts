/**
 * Simple in-memory rate limiter
 * In production, use Redis for distributed rate limiting
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export class RateLimiter {
  private limits = new Map<string, RateLimitEntry>();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 10) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;

    // Cleanup old entries periodically
    setInterval(() => this.cleanup(), 60000);
  }

  check(identifier: string, customLimit?: number): boolean {
    const now = Date.now();
    const limit = customLimit || this.maxRequests;

    let entry = this.limits.get(identifier);

    if (!entry || now >= entry.resetAt) {
      // Create new entry or reset expired one
      entry = {
        count: 1,
        resetAt: now + this.windowMs,
      };
      this.limits.set(identifier, entry);
      return true;
    }

    if (entry.count >= limit) {
      return false;
    }

    entry.count++;
    return true;
  }

  getRemainingRequests(identifier: string): number {
    const entry = this.limits.get(identifier);
    if (!entry || Date.now() >= entry.resetAt) {
      return this.maxRequests;
    }
    return Math.max(0, this.maxRequests - entry.count);
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    this.limits.forEach((entry, key) => {
      if (now >= entry.resetAt) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach((key) => {
      this.limits.delete(key);
    });

    if (keysToDelete.length > 0) {
      console.log(`[RateLimiter] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }
}
