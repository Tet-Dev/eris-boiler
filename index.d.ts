declare module 'eris-boiler' {
  import {
    Client,
    Message,
    Collection,
    Member,
    ExtendedUser,
    TextChannel,
    GuildChannel,
    PrivateChannel,
    TextableChannel
  } from 'eris'

  import {
    ExtendedMap,
    Status
  } from 'eris-boiler/util'

  type CommandData<T extends DataClient, C extends CommandContext> = {
    name: string
    description: string
    run: CommandAction<T, C>
    options?: CommandOptions<T, C>
  }

  type CommandOptions<T extends DataClient, C extends CommandContext> = {
    aliases?: string[]
    parameters?: string[]
    permission?: Permission<T>
    deleteInvoking?: boolean
    deleteResponse?: boolean
    deleteResponseDelay?: number
    subCommands?: Command<T, C>[]
    dmOnly?: boolean
    guildOnly?: boolean
  }

  type CommandAction<T extends DataClient, C extends CommandContext> = (bot: T, context: C) => CommandResults

  interface CommandContext {
    params: string[]
    msg: Message
    channel: TextableChannel | GuildChannel
  }

  interface GuildCommandContext extends CommandContext {
    channel: GuildChannel
  }

  interface PrivateCommandContext extends CommandContext {
    channel: PrivateChannel
  }

  type CommandResults = MessageData | string | Promise<CommandResults>

  type MessageData = {
    content: string
  }

  class Command<T extends DataClient = DataClient, C extends CommandContext = CommandContext> {
    constructor(data: CommandData<T, C>)
    name: string
    description: string
    run: CommandAction<T, C>
    aliases: string[]
    parameters: string[]
    middleware: CommandMiddleware<T>[]
    deleteInvoking: boolean
    deleteResponse: boolean
    deleteResponseDelay: number
    permission: Permission<T>
    dmOnly: boolean
    guildOnly: boolean
    subCommands: ExtendedMap<string, Command<T, C>>
    info: string
  }

  class GuildCommand<T extends DataClient = DataClient> extends Command<T, GuildCommandContext> {}
  class PrivateCommand<T extends DataClient = DataClient> extends Command<T, PrivateCommandContext> {}
  type AnyCommand<T extends DataClient = DataClient> = Command<T> | PrivateCommand<T> | GuildCommand<T>

  class CommandMiddleware<T extends DataClient, C extends CommandContext = CommandContext> {
    constructor(data: CommandMiddlewareData<T, C>)
    run: MiddlewareRun<T, C>
  }

  type CommandMiddlewareData<T extends DataClient, C extends CommandContext> = {
    run?: MiddlewareRun<T, C>
  }

  type MiddlewareRun<T extends DataClient, C extends CommandContext> = (bot: T, context: C) => Promise<void>

  type DataClientOptions = {
    databaseManager?: DatabaseManager
    oratorOptions?: OratorOptions
    statusManagerOptions?: StatusManagerOptions
  }

  type Loadable<T extends DataClient> = string | LoadableObject<T> | (string | LoadableObject<T>)[]

  type LoadableObject<T extends DataClient> = Command | DiscordEvent | Permission

  class DataClient extends Client {
    constructor(token: string, options?: DataClientOptions)
    dbm: DatabaseManager
    ora: Orator
    sm: StatusManager
    commands: ExtendedMap<string, AnyCommand<this>>
    permissions: ExtendedMap<string, Permission<this>>
    connect(): Promise<void>
    findCommand(name: string, commands: ExtendedMap<string, AnyCommand<this>>): AnyCommand<this> | void
    addCommands(...commands: (string | AnyCommand<this> | (string | AnyCommand<this>)[])[]): DataClient
    addEvents(...events: (string | DiscordEvent<this> | (string | DiscordEvent<this>)[])[]): DataClient
    addPermissions(...permissions: (string | Permission<this> | (string | Permission<this>)[])[]): DataClient
  }

  type DatabaseManagerOptions = {
    DataObject: DatabaseObjectBuilder
    DataQuery: DatabaseQueryBuilder
  }

  type DatabaseObjectBuilder = (...params: any[]) => DatabaseObject

  type DatabaseQueryBuilder = (...params: any[]) => DatabaseQuery

  abstract class DatabaseManager {
    newObject(type: string, data: any, isNew?: boolean): DatabaseObject
    newQuery(type: string): DatabaseQuery
    abstract add(type: string, data: any): Promise<any>
    abstract delete(object: DatabaseObject): Promise<void>
    abstract update(object: DatabaseObject): Promise<any>
    abstract get(query: DatabaseQuery): Promise<any>
    abstract find(query: DatabaseQuery): Promise<any[]>
  }

  type DatabaseObjectOptions = {
    isNew?: boolean
  }

  class DatabaseObject {
    constructor(databaseManager: DatabaseManager, type: string, data?: any, options?: DatabaseObjectOptions)
    type: string
    id: string
    get(prop: string): any
    set(prop: string, val: any): DatabaseObject
    toJSON(): any
    delete(): Promise<void>
    save(data?: any): Promise<DatabaseObject>
  }


  type SubQueryType = 'and' | 'or'

  type SubQuery = {
    type: SubQueryType
    query: DatabaseQuery
  }

  class DatabaseQuery {
    constructor(databaseManager: DatabaseManager, type: string)
    type: string
    maxResults: number
    conditions: any
    sort: any
    getId: string
    subQueries: SubQuery[]
    static or(queries: DatabaseQuery[]): DatabaseQuery
    static and(queries: DatabaseQuery[]): DatabaseQuery
    or(queries: DatabaseQuery[]): this
    and(queries: DatabaseQuery[]): this
    limit(num: number): this
    equalTo(prop: string, val: any): this
    notEqualTo(prop: string, val: any): this
    lessThan(prop: string, num: number): this
    greaterThan(prop: string, num: number): this
    find(): Promise<DatabaseObject[]>
    get(id: string): Promise<DatabaseObject | void>
  }

  type DiscordEventData<T extends DataClient> = {
    name: string
    run: DiscordEventRunner<T>
  }

  type DiscordEventRunner<T> = (bot: T, ...rest: any[]) => void

  class DiscordEvent<T extends DataClient = DataClient> {
    constructor(data: DiscordEventData<T>)
    name: string
    run: DiscordEventRunner<T>
  }

  class Orator<T extends DataClient = DataClient> {
    constructor(defaultPrefix: string, oratorOptions: OratorOptions)
    defaultPrefix: string
    permissions: Permission<T>[]
    tryMessageDelete(me: ExtendedUser, msg: Message): Promise<void> | void
    tryCreateMessage(me: ExtendedUser, channel: TextChannel, content: string | any, file: any): Promise<Message | void> | void
    tryDMCreateMessage(me: ExtendedUser, msg: Message, content: string | any, file: any): Promise<void>
    processMessage(bot: T, msg: Message): void
    hasPermission<C extends CommandContext = CommandContext>(bot: T, context: C): Promise<boolean>
  }

  type OratorOptions = {
    defaultPrefix?: string
    deleteInvoking?: boolean
    deleteResponse?: boolean
    deleteResponseDelay?: number
  }

  type PermissionData<T extends DataClient, C extends CommandContext> = {
    level?: number
    reason?: string
    run?: MiddlewareRun<T, C>
  }

  class Permission<T extends DataClient = DataClient, C extends CommandContext = CommandContext> extends CommandMiddleware<T, C> {
    constructor(data: PermissionData<T, C>)
    run: MiddlewareRun<T, C>
  }

  class RAMManager extends DatabaseManager {
    constructor()
    add(type: string, data: any): Promise<any>
    delete(object: DatabaseObject): Promise<void>
    update(object: DatabaseObject): Promise<any>
    get(query: DatabaseQuery): Promise<any>
    find(query: DatabaseQuery): Promise<any[]>
  }

  type ConnectionData = {
    connectionInfo: ConnectionInfo
    client: string
  }

  type ConnectionInfo = {
    database: string
    user: string
    password?: string
    host: string
  }

  class SQLManager extends DatabaseManager {
    constructor(connection: ConnectionData, options?: DatabaseManagerOptions)
    protected readonly _qb: any
    add(type: string, data: any): Promise<any>
    delete(object: DatabaseObject): Promise<void>
    update(object: DatabaseObject): Promise<any>
    get(query: DatabaseQuery): Promise<any>
    find(query: DatabaseQuery): Promise<any[]>
  }

  type StatusManagerOptions = {
    mode?: string
    interval?: number
    defaultStatus: Status
  }

  class StatusManager {
    constructor(bot: DataClient, databaseManager: DatabaseManager, options?: StatusManagerOptions)
    defaultStatus: Status
    current: Status
    initialize(): Promise<void>
    getStatuses(): Promise<DatabaseObject[]>
    findStatusByName(name: string): Promise<DatabaseObject[]>
    addStatus(status: Status): Promise<void>
    deleteStatus(dbStatus: DatabaseObject): Promise<void>
    setStatus(status?: Status): Promise<void>
    timerStart(): void
    timerEnd(): void
  }
}

