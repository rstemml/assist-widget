import { AzureOpenAI } from 'openai';
import type { Message } from '@assist-widget/shared';

export interface AzureAIConfig {
  endpoint: string;
  apiKey: string;
  deploymentName: string;
}

export class AzureAIService {
  private client: AzureOpenAI;
  private deploymentName: string;

  constructor(config: AzureAIConfig) {
    this.client = new AzureOpenAI({
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      apiVersion: '2024-08-01-preview',
    });
    this.deploymentName = config.deploymentName;
  }

  async generateResponse(messages: Message[]): Promise<string> {
    try {
      // Convert our message format to OpenAI format
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const result = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
        top_p: 0.95,
        frequency_penalty: 0,
        presence_penalty: 0,
      });

      return result.choices[0]?.message?.content || 'Entschuldigung, ich konnte keine Antwort generieren.';
    } catch (error) {
      console.error('[AzureAI] Error generating response:', error);
      throw new Error('Failed to generate AI response');
    }
  }

  async streamResponse(
    messages: Message[],
    onChunk: (chunk: string) => void,
    onComplete: () => void,
  ): Promise<void> {
    try {
      const formattedMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const stream = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: formattedMessages,
        temperature: 0.7,
        max_tokens: 800,
        stream: true,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content;
        if (content) {
          onChunk(content);
        }
      }

      onComplete();
    } catch (error) {
      console.error('[AzureAI] Error streaming response:', error);
      throw new Error('Failed to stream AI response');
    }
  }
}
