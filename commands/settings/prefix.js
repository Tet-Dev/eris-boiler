const { SettingCommand } = require('../../lib')

module.exports = new SettingCommand({
  name: 'prefix',
  description: 'set prefix for server',
  options: {
    parameters: [ 'desired prefix' ]
  },
  displayName: 'Prefix',
  getValue: async (bot, { channel }) => {
    const prefix = await bot.SQLHandler.getGuild(msg.guildID);
    return "`"+(perfix.prefix || bot.ora.defaultPrefix) + "` do \n`"+(dbGuild.get('prefix') || bot.ora.defaultPrefix)+" settings prefix new_prefix` to change the prefix!"
  },
  run: async (bot, { msg, params }) => {
    const fullParam = params.join(' ')
    if (!fullParam) {
      return 'Please provide a prefix!'
    }

    const guildData = await bot.SQLHandler.getGuild(msg.guildID);
    if (fullParam === guildData.prefix) {
      return `Prefix is already set to "${fullParam}"`
    }

    await bot.SQLHandler.updateGuild(msg.guildID,{ prefix: fullParam })
    return 'Prefix set!'
  }
})
