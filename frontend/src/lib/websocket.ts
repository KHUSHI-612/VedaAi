// WebSocket Client Helper Placeholder
export class WebSocketClient {
  private ws: WebSocket | null = null;
  private url: string;

  constructor(url: string = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:5000') {
    this.url = url;
  }

  connect(onMessage: (data: any) => void) {
    try {
      this.ws = new WebSocket(this.url);

      this.ws.onopen = () => {
        console.log('Connected to WebSocket server');
      };

      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        onMessage(data);
      };

      this.ws.onclose = () => {
        console.log('WebSocket connection closed');
      };
    } catch (err) {
      console.error('WebSocket connection failed:', err);
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}
