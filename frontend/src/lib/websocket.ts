export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;
  private callback: ((data: any) => void) | null = null;

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000') {
    this.url = url;
  }

  connect(assessmentId: string) {
    this.disconnect();
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WS] Connected successfully, subscribing to assessment ID:', assessmentId);
      this.ws?.send(
        JSON.stringify({
          action: 'subscribe',
          assessmentId,
        })
      );
    };

    this.ws.onmessage = (event) => {
      try {
        const parsedData = JSON.parse(event.data);
        console.log('[WS] Message received:', parsedData);
        if (this.callback) {
          this.callback(parsedData);
        }
      } catch (err) {
        console.error('[WS] Failed to parse WebSocket message event data:', err);
      }
    };

    this.ws.onclose = (event) => {
      console.log('[WS] Connection closed:', event.reason || 'Normal close');
    };

    this.ws.onerror = (error) => {
      console.error('[WS] Connection encountered an error:', error);
    };
  }

  onMessage(callback: (data: any) => void) {
    this.callback = callback;
  }

  disconnect() {
    if (this.ws) {
      console.log('[WS] Disconnecting WebSocket client...');
      this.ws.close();
      this.ws = null;
    }
  }
}
