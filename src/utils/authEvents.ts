type AuthEventCallback = () => void;

class AuthEventEmitter {
  private listeners: Record<string, AuthEventCallback[]> = {};

  on(event: 'unauthorized', callback: AuthEventCallback): void {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
  }

  off(event: 'unauthorized', callback: AuthEventCallback): void {
    if (!this.listeners[event]) return;
    this.listeners[event] = this.listeners[event].filter(
      (cb) => cb !== callback
    );
  }

  emit(event: 'unauthorized'): void {
    this.listeners[event]?.forEach((cb) => cb());
  }
}

export const authEvents = new AuthEventEmitter();
