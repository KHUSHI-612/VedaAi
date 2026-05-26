import { Server as HTTPServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';

// Map to keep track of active client connections subscribed to a specific assessmentId
const subscriptions = new Map<string, Set<WebSocket>>();

let wss: WebSocketServer | null = null;

/**
 * Initializes the WebSocket Server, attaching it to the provided Node HTTP server.
 * Handles client subscriptions to specific assessment IDs.
 */
export const initWebSocket = (server: HTTPServer): WebSocketServer => {
  wss = new WebSocketServer({ server });

  wss.on('connection', (ws: WebSocket) => {
    console.log('[WebSocket] New client connected.');

    // Listen for client subscription messages
    ws.on('message', (message: string) => {
      try {
        const parsed = JSON.parse(message);
        
        if (parsed.action === 'subscribe' && parsed.assessmentId) {
          const { assessmentId } = parsed;

          // Initialize the subscription set for this assessmentId if not exists
          if (!subscriptions.has(assessmentId)) {
            subscriptions.set(assessmentId, new Set());
          }
          
          subscriptions.get(assessmentId)!.add(ws);
          console.log(`[WebSocket] Client subscribed to updates for assessment ID: ${assessmentId}`);

          // Acknowledge subscription success
          ws.send(JSON.stringify({ event: 'subscribed', assessmentId }));
        }
      } catch (error) {
        console.error('[WebSocket] Error processing client message:', error);
      }
    });

    // Handle connection closure and garbage collect subscriptions
    ws.on('close', () => {
      console.log('[WebSocket] Client disconnected.');
      
      for (const [assessmentId, clients] of subscriptions.entries()) {
        if (clients.has(ws)) {
          clients.delete(ws);
          console.log(`[WebSocket] Removed disconnected client subscription for assessment ID: ${assessmentId}`);
        }
        // Clean up empty subscription categories
        if (clients.size === 0) {
          subscriptions.delete(assessmentId);
        }
      }
    });

    ws.on('error', (error) => {
      console.error('[WebSocket] Client socket error:', error);
    });
  });

  console.log('[WebSocket] Server attached to HTTP server.');
  return wss;
};

/**
 * Broadcasts a status event to all WebSocket clients subscribed to the specific assessment ID.
 */
export const emitToClient = (
  assessmentId: string,
  event: 'job:queued' | 'job:processing' | 'job:completed' | 'job:failed',
  data: any
): void => {
  const clients = subscriptions.get(assessmentId);
  
  if (clients && clients.size > 0) {
    const payload = JSON.stringify({
      event,
      assessmentId,
      data,
    });

    console.log(`[WebSocket] Broadcasting event '${event}' for assessment ${assessmentId} to ${clients.size} clients.`);
    
    clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(payload);
      }
    });
  } else {
    console.log(`[WebSocket] No active clients subscribed to updates for assessment ${assessmentId}. Event '${event}' skipped.`);
  }
};
