import { Client } from '@modules/client'
import { Message } from 'eris'

export type PrefixGenerator = (id: string) => string | Promise<string>

export class Orator {

  private readonly getPrefix: PrefixGenerator

  constructor (
    prefix: PrefixGenerator | string,
  ) {
    this.getPrefix = typeof prefix === 'string' ? (): string => prefix : prefix
  }

  public async processMessage (
    client: Client,
    message: Message,
  ): Promise<void> {
    return Promise.resolve()
  }

}
