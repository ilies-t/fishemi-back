import * as amqplib from 'amqplib';
import { Injectable } from '@nestjs/common';
import { Logger } from '@nestjs/common';
import globalConfig from '@config/global.config';

@Injectable()
export class QueueService {
  private connection: amqplib.Connection;
  private channel: amqplib.Channel;

  constructor() {
    this.connect();
  }

  private async connect() {
    this.connection = await amqplib.connect(globalConfig().amqpurl);
    this.channel = await this.connection.createChannel();
  }

  public async publishInQueue(queue: string, message: any) {
    try {
      message = JSON.stringify(message);
    } catch (error) {
      Logger.error('Failed to stringify message', error);
    }
    this.channel.assertQueue(queue);
    this.channel.sendToQueue(queue, Buffer.from(message));
  }
}
