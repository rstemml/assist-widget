import type { FastifyInstance } from 'fastify';
import type { WebSocket } from 'ws';
import type { WebSocketMessage, Message } from '@assist-widget/shared';
import { AzureAIService } from '../services/azure-ai.service';
import { SessionService } from '../services/session.service';
import { RateLimiter } from '../middleware/rate-limiter';
import { getCustomerConfig } from '../config/customers';

interface ChatRouteOptions {
  azureAI: AzureAIService;
  sessionService: SessionService;
  rateLimiter: RateLimiter;
}

export async function chatRoute(
  fastify: FastifyInstance,
  options: ChatRouteOptions,
): Promise<void> {
  const { azureAI, sessionService, rateLimiter } = options;

  fastify.get('/chat', { websocket: true }, (connection, req) => {
    const ws = connection as unknown as WebSocket;
    const params = req.query as { customerId?: string; sessionId?: string };

    const customerId = params.customerId || 'default';
    const sessionId = params.sessionId || `${Date.now()}-${Math.random()}`;

    console.log(`[Chat] New connection - Customer: ${customerId}, Session: ${sessionId}`);

    // Get customer config
    const config = getCustomerConfig(customerId);

    if (!config) {
      ws.send(
        JSON.stringify({
          type: 'error',
          payload: { message: 'Invalid customer ID' },
        } as WebSocketMessage),
      );
      ws.close();
      return;
    }

    // Initialize session
    const session = sessionService.getSession(sessionId, customerId);

    // Send connection confirmation and config
    ws.send(
      JSON.stringify({
        type: 'connected',
        sessionId,
      } as WebSocketMessage),
    );

    ws.send(
      JSON.stringify({
        type: 'config',
        payload: config,
      } as WebSocketMessage),
    );

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message: WebSocketMessage = JSON.parse(data.toString());

        if (message.type === 'message' && message.payload?.content) {
          await handleUserMessage(
            ws,
            sessionId,
            customerId,
            message.payload.content,
            config.behavior.maxMessagesPerMinute,
          );
        }
      } catch (error) {
        console.error('[Chat] Error handling message:', error);
        ws.send(
          JSON.stringify({
            type: 'error',
            payload: { message: 'Failed to process message' },
          } as WebSocketMessage),
        );
      }
    });

    ws.on('close', () => {
      console.log(`[Chat] Connection closed - Session: ${sessionId}`);
    });

    ws.on('error', (error) => {
      console.error('[Chat] WebSocket error:', error);
    });

    async function handleUserMessage(
      ws: WebSocket,
      sessionId: string,
      customerId: string,
      content: string,
      maxMessagesPerMinute: number,
    ): Promise<void> {
      // Rate limiting check
      const rateLimitKey = `${customerId}:${sessionId}`;
      if (!rateLimiter.check(rateLimitKey, maxMessagesPerMinute)) {
        ws.send(
          JSON.stringify({
            type: 'error',
            payload: { message: 'Rate limit exceeded. Please wait a moment.' },
          } as WebSocketMessage),
        );
        return;
      }

      // Add user message to session
      const userMessage: Message = {
        id: `${Date.now()}-user`,
        role: 'user',
        content,
        timestamp: Date.now(),
      };

      sessionService.addMessage(sessionId, userMessage);

      // Send typing indicator
      ws.send(
        JSON.stringify({
          type: 'typing',
          payload: { isTyping: true },
        } as WebSocketMessage),
      );

      try {
        // Get all messages from session for context
        const allMessages = sessionService.getMessages(sessionId);

        // Generate AI response
        const aiResponse = await azureAI.generateResponse(allMessages);

        // Stop typing indicator
        ws.send(
          JSON.stringify({
            type: 'typing',
            payload: { isTyping: false },
          } as WebSocketMessage),
        );

        // Add AI message to session
        const assistantMessage: Message = {
          id: `${Date.now()}-assistant`,
          role: 'assistant',
          content: aiResponse,
          timestamp: Date.now(),
        };

        sessionService.addMessage(sessionId, assistantMessage);

        // Send AI response
        ws.send(
          JSON.stringify({
            type: 'message',
            payload: assistantMessage,
          } as WebSocketMessage),
        );
      } catch (error) {
        console.error('[Chat] Error generating AI response:', error);

        // Stop typing indicator
        ws.send(
          JSON.stringify({
            type: 'typing',
            payload: { isTyping: false },
          } as WebSocketMessage),
        );

        ws.send(
          JSON.stringify({
            type: 'error',
            payload: { message: 'Failed to generate response. Please try again.' },
          } as WebSocketMessage),
        );
      }
    }
  });
}
