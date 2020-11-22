
const { GuildCommand } = require('../../lib')

const prefix = require('./prefix')
const mod = require('./mod')
const admin = require('./admin')
const dj = require('./dj')
const keeproleswhenlevel = require("./keepRolesWhenLevel");
module.exports = new GuildCommand({
  name: 'settings',
  description: 'Change some settings for your server :)',
  options: {
    subCommands: [
      prefix,
      mod,
      dj,
      admin,
      keeproleswhenlevel,
    ]
  },
  run: async function (bot, context) {
    return {
      embed: {
        description: ':gear: Settings',
        thumbnail: { url: bot.user.avatarURL },
        timestamp: require('dateformat')(Date.now(), 'isoDateTime'),
        color: 0x3498db,
        fields: await Promise.all(this.subCommands.map(async (sub) => ({
          name: sub.displayName,
          value: await sub.getValue(bot, context),
          inline: true
        })))
      }
    }
  }
})
