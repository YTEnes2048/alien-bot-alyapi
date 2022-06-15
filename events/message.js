const ayarlar = require('../ayarlar.json');
const Discord = require('discord.js');
const db = require('quick.db');
const ms = require('parse-ms')

let talkedRecently = new Set();
module.exports = async (message, args) => {
if(message.author.bot) return

  if (talkedRecently.has(message.author.id)) {
    return;
  }
  talkedRecently.add(message.author.id);
	setTimeout(() => {
    talkedRecently.delete(message.author.id);
  }, 2500);
  let client = message.client;
  let prefix = ayarlar.prefix;
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = message.content.split(' ')[0].slice(prefix.length);
  let params = message.content.split(' ').slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }

  
    if (db.has(`karalist_${message.author.id}`) === true) {
    let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setDescription(`Karalistedesin!`)
    message.channel.send({embed: embed})
    return
  };


  
  if (cmd) {
const member = message.guild.member(client.user)
if(!member.hasPermission("SEND_MESSAGE")){
message.member.send(new Discord.MessageEmbed().setDescription(`${message.channel ? "<#"+message.channel.id+">" : "`"+message.channel.name+"`"} adlı kanalda mesaj göndermeye iznim yok! Ya iznimi aç yada Kurucum olan \`zelvos#2649\` iletişime geç!`))
}
  let bakım = await db.fetch('bakım');
  if(message.author.id !== ayarlar.ownerID)
  if(message.author.id !== ayarlar.ownerİD){

    if(bakım){
 let bakımTIME = new Date("2021-11-30:20:30")
 let time = ms(bakımTIME - Date.now())
  return message.channel.send(new Discord.MessageEmbed().setDescription(`
${message.author}
Bot şuan bakımdadır!!
[LINK](https://zivocodes.tk/)

  `).setColor("RANDOM"))
     /*
**:gear: Sizlere En İyi Hizmeti Verebilmek İçin Bakımdayız.\n**❓**Bakım Sebebi:** `{bakım}`\n⏱️**Tahmini Süre:** **{time.days}** gün, **{time.hours}** saat, **{time.minutes}** dakika, **%{time.seconds}** saniye\n\n:arrows_counterclockwise: **Lütfen Daha Sonra Tekrar Deneyin.**
     */                         }}
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms,);
  }
};

/*
const Discord = require('discord.js');
const ayarlar = require("../ayarlar.json");
const db = require("quick.db");
let talkedRecently = new Set();
module.exports = async message => {
  if (talkedRecently.has(message.author.id)) {
    return;
  }
  talkedRecently.add(message.author.id);
  setTimeout(() => {
    talkedRecently.delete(message.author.id);
  }, 5000);
  let client = message.client;
  let prefix = await db.fetch(`prefix_${message.guild.id}`) || ayarlar.prefix
  if (message.author.bot) return;
  if (!message.content.startsWith(prefix)) return;
  let command = message.content.split(" ")[0].slice(prefix.length);
  let params = message.content.split(" ").slice(1);
  let perms = client.elevation(message);
  let cmd;
  if (db.has(`karalist_${message.author.id}`) === true) {
    let embed = new Discord.MessageEmbed()
    .setColor("RANDOM")
    .setDescription("Komutlarımı kullanamazsın çünkü karalistedesin!")
    message.channel.send({embed: embed})
    return
  };
  if (client.commands.has(command)) {
    cmd = client.commands.get(command);
  } else if (client.aliases.has(command)) {
    cmd = client.commands.get(client.aliases.get(command));
  }
  
  if (cmd) {
    if (perms < cmd.conf.permLevel) return;
    cmd.run(client, message, params, perms);
  }
  
};
*/