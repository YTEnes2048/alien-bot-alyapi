const express = require("express");
const app = express();
const http = require("http");
app.get(".", (request, response) => {
  console.log(`BOT AKTIF!`);
  response.sendStatus(200);
});
const Discord = require("discord.js");
const client = new Discord.Client({ disableMentions: "everyone" });
const ayarlar = require("./ayarlar.json");
const fs = require("fs");
const moment = require("moment");
const db = require("quick.db");
const queue = new Map();
const YouTube = require("simple-youtube-api");
const ytdl = require("ytdl-core");
client.queue = new Map();
require("./util/eventLoader")(client);
require("moment-duration-format");

var prefix = ayarlar.prefix

const log = message => {
  console.log(`[${moment().format("YYYY-MM-DD HH:mm:ss")}] ${message}`);
};
client.setMaxListeners(30)
/*
client.on("ready", () => {
  var actvs = [
    `🎀 Yardım almak için !yardım`,
    `🔔 Yeni Özellikler İçin !yardım-güncelleme`,
    `🤖 Botu eklemek için !yardım-bot`
  ];

  client.user.setActivity(
    actvs[Math.floor(Math.random() * (actvs.length - 1) + 1)],
    { type: "WATCHING" }
  );
  setInterval(() => {
    client.user.setActivity(
      actvs[Math.floor(Math.random() * (actvs.length - 1) + 1)],
      { type: "WATCHING" }
    );
    // IZLIYOR = WATCHING
    // OYNUYOR = PLAYING
    // YAYINDA = STREAMING
    // AKTIF = ONLINE
    // RAHATSIZ ETMEYIN = DND
    // BOSTA = IDLE
    // CEVRIMDISI = OFFLINE
  }, 15000);
});*/

client.elevation = message => {
  if (!message.guild) {
    return;
  } 
  let permlvl = 0;
  if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
  if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
  if (message.author.id === ayarlar.sahip) permlvl = 4;
  return permlvl;
};

client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
fs.readdir("./komutlar/", (err, files) => {
  if (err) console.error(err);
  log(`${files.length} komut yüklenecek.`);
  files.forEach(f => {
    let props = require(`./komutlar/${f}`);
    log(`Yüklenen komut: ${props.help.name}.`);
    client.commands.set(props.help.name, props);
    props.conf.aliases.forEach(alias => {
      client.aliases.set(alias, props.help.name);
    });
  });
});
client.reload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.load = command => {
  return new Promise((resolve, reject) => {
    try {
      let cmd = require(`./komutlar/${command}`);
      client.commands.set(command, cmd);
      cmd.conf.aliases.forEach(alias => {
        client.aliases.set(alias, cmd.help.name);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};
client.unload = command => {
  return new Promise((resolve, reject) => {
    try {
      delete require.cache[require.resolve(`./komutlar/${command}`)];
      let cmd = require(`./komutlar/${command}`);
      client.commands.delete(command);
      client.aliases.forEach((cmd, alias) => {
        if (cmd === command) client.aliases.delete(alias);
      });
      resolve();
    } catch (e) {
      reject(e);
    }
  });
};


//     [-----------------> BOT ETIKET <---------------] \\
client.on('message', async message => {
const prefixÖ = await db.fetch(`prefix_${message.guild.id}`) || ayarlar.prefix;

  const embed = new Discord.MessageEmbed()
.setThumbnail(client.user.avatarURL())
.setDescription(`
<@${message.author.id}>

Yardım menüsü için **${prefixÖ}yardım** yazman gerekli olacaktır :)`)
.setColor('RANDOM')
  if(message.content == `<@!483273124511744007>`) return message.channel.send(embed);
});


//        [----------------------->  GOREVLER <-----------------]        \\

client.on('message', message  => {


let user = message.author;
let prefixX = db.fetch(`prefix_${message.guild.id}`) || ayarlar.prefix;
if(message.author.bot || message.content.startsWith(prefixX)) return;

db.add(`görevMesajGönder.${message.guild.id}.${user.id}`, 1)
}); 

//     [-----------------> Afk <------------------]  \\

client.on("message", async message => {
  
  let prefix = ayarlar.prefix;
  let kullanıcı = message.mentions.users.first() || message.author;
  let afkdkullanıcı = await db.fetch(`afk_${message.author.id}`);
  let afkkullanıcı = await db.fetch(`afk_${kullanıcı.id}`);
  let sebep = afkkullanıcı;
  if (message.author.bot) return;
  if (message.content.includes(`${prefix}afk`)) return;
  if (message.content.includes(`<@${kullanıcı.id}>`)) {
    if (afkdkullanıcı) {
      message.channel.send(
        new Discord.MessageEmbed().setDescription(`
AFK modundan ayrıldın <@${kullanıcı.id}>.`)
      );
      db.delete(`afk_${message.author.id}`);
    }
    if (afkkullanıcı)
      return message.channel.send(
        `${message.author}\`${kullanıcı.tag}\` şu anda AFK. \n Sebep : \`${sebep}\``
      );
  }
  if (!message.content.includes(`<@${kullanıcı.id}>`)) {
    if (afkdkullanıcı) {
      message.channel.send(
        new Discord.MessageEmbed().setDescription(`
AFK modundan ayrıldın <@${kullanıcı.id}>.`)
      );
      db.delete(`afk_${message.author.id}`);
    }
  }
});


//     [-----------------> Otorol <------------------]  \\
//     [-----------------> Fake <------------------]  \\
client.on('guildMemberAdd', async member => {

  const database = require('quick.db');
  if(member.user.bot) return;
  
  const kanal = member.guild.channels.cache.get(await database.fetch(`fakeK_${member.guild.id}`) || 0);
  const zaman = await database.fetch(`fakeS_${member.guild.id}`);
  const rol = member.guild.roles.cache.get(await database.fetch(`fakeR_${member.guild.id}`) || 0);
  if(!kanal || !zaman || !rol) return;

  if(member.user.createdAt.getTime() < require('ms')(zaman)) {

    member.roles.add(rol.id);
    const embed = new Discord.MessageEmbed()
    .setColor('BLUE')
    .setTitle('Fake Tetikleyici')
    .setDescription(`**${member.user.tag}** Fake sistemine takıldı!`);
    return kanal.send(embed);

  } else return;

});
//     [-----------------> Sayaç <------------------]  \\

client.on("guildMemberAdd", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = member.guild.channels.find("name", skanal9);
  if (!skanal31) return;
  skanal31.send(
    new Discord.MessageEmbed()
      .setDescription(`
:inbox_tray: <@${member.user.id}> sunucuya katıldı, **${sayac}** kişi olmamıza **${sayac -member.guild.members.size}** kişi kaldı.`)
      .setColor("GREEN")
      .setTitle("Zivo Code - Sayaç")
  );
});

client.on("guildMemberRemove", async member => {
  let sayac = await db.fetch(`sayac_${member.guild.id}`);
  let skanal9 = await db.fetch(`sayacK_${member.guild.id}`);
  if (!skanal9) return;
  const skanal31 = member.guild.channels.find("name", skanal9);
  if (!skanal31) return;

  skanal31.send(
    new Discord.MessageEmbed()
      .setDescription(`
:outbox_tray: <@${member.user.id}> adlı kullanıcı sunucudan ayrıldı. **${sayac}** kullanıcı olmaya **${sayac -member.guild.members.size}** kullanıcı kaldı.`
      )
      .setColor("RED")
      .setTitle("Zivo - Sayaç")
  );
});

// ------------------> [Tag Alana Rol Ver] <------------------- \\


//                        OYUNLAR                           \\

// ------------------->  [CAPTCHA] <--------------------------- \\


// --------------------> [Müzik Sistemi] <----------------------- \\

const youtube = new YouTube("API");

client.on("message", async (msg, message) => {
  let prefix = ayarlar.prefix;
  if (msg.author.bot) return undefined;
  if (!msg.content.startsWith(prefix)) return undefined;

  const args = msg.content.split(" ");
  const searchString = args.slice(1).join(" ");
  const url = args[1] ? args[1].replace(/<(.+)>/g, "$1") : "";
  const serverQueue = queue.get(msg.guild.id);
  let command = msg.content.toLowerCase().split(" ")[0];
  command = command.slice(prefix.length);

  if (command === "sadecebotunsahibikullanır") {
    const voiceChannel = msg.member.voiceChannel;
    if (!voiceChannel)
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setColor("BLACK")
          .setDescription(
            ":x: **Bu komutu kullanmak için bir ses kanalında olmanız gerekir.**"
          )
      );
    const permissions = voiceChannel.permissionsFor(msg.client.user);
    if (!permissions.has("CONNECT")) {
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setColor("BLACK")
          .setTitle(
            ":x: **Bu komutu kullanmak için bir ses kanalında olmanız gerekir.**"
          )
      );
    }
    if (!permissions.has("SPEAK")) {
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setColor("BLACK")
          .setTitle(
            ":x: Müziği açamıyorum / kanalda konuşmama izin verilmediğinden veya mikrofonum kapalı olduğundan şarkı çalamıyorum."
          )
      );
    }

    if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
      const playlist = await youtube.getPlaylist(url);
      const videos = await playlist.getVideos();
      for (const video of Object.values(videos)) {
        const video2 = await youtube.getVideoByID(video.id); // eslint-disable-line no-await-in-loop
        await handleVideo(video2, msg, voiceChannel, true); // eslint-disable-line no-await-in-loop
      }
      return msg.channel
        .send(new Discord.MessageEmbed())
        .setTitle(`**Oynatma Listesi **${playlist.title}** Sıraya eklendi!**`);
    } else {
      try {
        var video = await youtube.getVideo(url);
      } catch (error) {
        try {
          var videos = await youtube.searchVideos(searchString, 10);
          let index = 0;

          msg.channel.send(
            new Discord.MessageEmbed()
              .setTitle(":musical_note: Şarkı Seçimi")
              .setThumbnail(
                "https://i.postimg.cc/W1b1LW13/youtube-kids-new-logo.png"
              )
              .setDescription(
                `${videos
                  .map(video2 => `**${++index} -** ${video2.title}`)
                  .join("\n")}`
              )
              .setFooter(
                "Lütfen 1-10 arasında bir rakam seçin ve liste 10 saniye içinde iptal edilecektir.."
              )
              .setColor("BLACK")
          );
          msg.delete(5000);

          try {
            var response = await msg.channel.awaitMessages(
              msg2 => msg2.content > 0 && msg2.content < 11,
              {
                maxMatches: 1,
                time: 10000,
                errors: ["time"]
              }
            );
          } catch (err) {
            console.error(err);
            return msg.channel.send(
              new Discord.MessageEmbed()
                .setColor("BLACK")
                .setDescription(
                  ":x: **Şarkı Değerini belirtmediği için seçim iptal edildi**."
                )
            );
          }
          const videoIndex = parseInt(response.first().content);
          var video = await youtube.getVideoByID(videos[videoIndex - 1].id);
        } catch (err) {
          console.error(err);
          return msg.channel.send(
            new Discord.MessageEmbed()
              .setColor("BLACK")
              .setDescription(":x: **Aradım ama sonuç yok**")
          );
        }
      }
      return handleVideo(video, msg, voiceChannel);
    }
  } else if (command === "volume") {
    if (!msg.member.voiceChannel)
      if (!msg.member.voiceChannel)
        return msg.channel.send(
          new Discord.MessageEmbed()
            .setColor("BLACK")
            .setDescription(
              ":x: **Bu komutu kullanmak için bir ses kanalında olmanız gerekir.**"
            )
        );
    if (!serverQueue)
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setColor("BLACK")
          .setTitle(":x: Şu anda çalan şarkı yok.")
      );
    if (!args[1])
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setTitle(`Current Volume: **${serverQueue.volume}**`)
          .setColor("BLACK")
      );
    serverQueue.volume = args[1];
    serverQueue.connection.dispatcher.setVolumeLogarithmic(args[1] / 5);
    return msg.channel.send(
      new Discord.MessageEmbed()
        .setTitle(`Setting Volume: **${args[1]}**`)
        .setColor("BLACK")
    );
  } else if (command === "now") {
    if (!serverQueue)
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setTitle(":x: **Şu anda çalan şarkı yok.**")
          .setColor("BLACK")
      );
    return msg.channel.send(
      new Discord.MessageEmbed()
        .setColor("BLACK")
        .setTitle(" :headphones: | Şimdi oynuyor")
        .addField(
          "Şarkı Adı",
          `[${serverQueue.songs[0].title}](${serverQueue.songs[0].url})`,
          true
        )
        .addField(
          "Oynamaya kadar tahmini süre",
          `${serverQueue.songs[0].durationm}:${serverQueue.songs[0].durations}`,
          true
        )
    );
  } else if (command === "") {
    let index = 0;
    if (!serverQueue)
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setTitle(":x: **Sırada Müzik Yok**")
          .setColor("BLACK")
      );
    return msg.channel
      .send(
        new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setTitle("Şarkı sırası")
          .setDescription(
            `${serverQueue.songs
              .map(song => `**${++index} -** ${song.title}`)
              .join("\n")}`
          )
      )
      .addField("Şimdi oynuyor: " + `${serverQueue.songs[0].title}`);
  }
});

async function handleVideo(video, msg, voiceChannel, playlist = false) {
  const serverQueue = queue.get(msg.guild.id);
  const song = {
    id: video.id,
    title: video.title,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    durationh: video.duration.hours,
    durationm: video.duration.minutes,
    durations: video.duration.seconds,
    zg: video.raw.snippet.channelId,
    best: video.channel.title,
    views: video.raw.views
  };
  if (!serverQueue) {
    const queueConstruct = {
      textChannel: msg.channel,
      voiceChannel: voiceChannel,
      connection: null,
      songs: [],
      volume: 5,
      playing: true
    };
    queue.set(msg.guild.id, queueConstruct);

    queueConstruct.songs.push(song);

    try {
      var connection = await voiceChannel.join();
      queueConstruct.connection = connection;
      play(msg.guild, queueConstruct.songs[0]);
    } catch (error) {
      console.error(`:x: Ses kanalına giremedim HATA: ${error}**`);
      queue.delete(msg.guild.id);
      return msg.channel.send(
        new Discord.MessageEmbed()
          .setTitle(`:x: Ses kanalına giremedim HATA: ${error}**`)
          .setColor("BLACK")
      );
    }
  } else {
    serverQueue.songs.push(song);
    console.log(serverQueue.songs);
    if (playlist) return undefined;
    return msg.channel.send(
      new Discord.MessageEmbed()
        .setTitle(
          `:arrow_heading_up:  **${song.title}** Sıraya Adlandırılmış Müzik Eklendi!`
        )
        .setColor("BLACK")
    );
  }
  return undefined;
}

function play(guild, song) {
  const serverQueue = queue.get(guild.id);

  if (!song) {
    serverQueue.voiceChannel.leave();
    queue.delete(guild.id);
    return;
  }
  console.log(serverQueue.songs);

  const dispatcher = serverQueue.connection
    .playStream(ytdl(song.url))
    .on("end", reason => {
      if (reason === " :x: **Yayın akış hızı yeterli değil.**")
        console.log("Şarkı Sona Erdi");
      else console.log(reason);
      serverQueue.songs.shift();
      play(guild, serverQueue.songs[0]);
    })
    .on("error", error => console.error(error));
  dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);

  serverQueue.textChannel.send(
    new Discord.MessageEmbed()
      .setTitle("**:microphone: Şarkı Başladı**")
      .setThumbnail(`https://i.ytimg.com/vi/${song.id}/default.jpg`)
      .addField("Şarkı adı", `[${song.title}](${song.url})`, true)
      .addField("Ses", `${serverQueue.volume}%`, true)
      .addField("Süre", `${song.durationm}:${song.durations}`, true)
      .addField("Video ID", `${song.id}`, true)
      .addField("Kanal ID", `${song.zg}`, true)
      .addField("Kanal adı", `${song.best}`, true)
      .addField("Video Link", `${song.url}`, true)
      .setImage(`https://i.ytimg.com/vi/${song.id}/hqdefault.jpg`)
      .setColor("BLACK")
  );
}
client.on("message", (msg, message, guild) => {
  if (msg.content.toLowerCase() === prefix +"invite") {
    const eris = new Discord.MessageEmbed().setDescription(
      `[Destek Sunucum](https://discord.gg/NAzGC2cxXR)`
    );
    msg.channel.send(eris);
  }
});

client.on("guildCreate", async(guild, message) => {

let alındı = `${ayarlar.oldu2}`
let alınıyor = "<a:yükleniyor:839266395308687421>"

  const emmmmbed = new Discord.MessageEmbed()
    .setDescription(`
  **Selamlar chat ben geldim sabahlara kadar kopmaya hazır mısınız? Bende bütün sistemler var rahat olun sadece** \`a!yardım\` **yazarak komutlarıma bakman yeterli. Hatalı komutlar** \`a!yardım-bot\``)

  let defaultChannel = "";
  
  guild.channels.cache.forEach(channel => {
    if (channel.type == "text" && defaultChannel == "") {
      if (channel.permissionsFor(guild.me).has("SEND_MESSAGES")) {
        defaultChannel = channel;
      }
    }
  });
  const alın = await defaultChannel.send("Sunucu Verileri alınıyor.")
  alın.edit("Sunucu Verileri alınıyor..")
  alın.edit("Sunucu Verileri alınıyor...").then(m => m.delete({ timeout: 2542 }))
  defaultChannel.send(emmmmbed);
});
/*
client.on('guildCreate', guild => {
let kanal = guild.channels.filters(c => c.type === "text").random()
const embed = new Discord.MessageEmbed()
.setTitle('Selamlar chat ben geldim sabahlara kadar kopmaya hazır mısınız? Bende bütün sistemler var rahat olun')
kanal.send(embed)
    
});
*/


// ------------------> [Bot Koruma] <-------------------------- \\

client.on("guildMemberAdd", async member => {
  if (db.has(`botkoruma_${member.guild.id}`) === false) return;
  if (member.user.bot === false) return;
  if (db.has(`botİzinli_${member.id}`) === true) return;
let p = db.fetch(`prefix_${member.guild.id}`) || ayarlar.prefix;
  
  member.kick(member, `Bot koruması aktif!`);

return member.guild.owner.send(
    `Sunucunuza bir bot eklendi ve sunucudan otomatik olarak atıldı, sunucuya eklenmesini onaylıyor iseniz \`${p}giriş-izni ${member.id}\``
  );
});


// ----------------> [Resimli Hoşgeldin Hoşçakal] <-------------- \\
client.on("guildMemberRemove", async member => {
  
  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
  if (!canvaskanal) return;

  const request = require("node-superfetch");
  const Canvas = require("canvas"), Image = Canvas.Image, Font = Canvas.Font, path = require("path");

  var randomMsg = ["Sunucudan Ayrıldı."];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://i.hizliresim.com/Wrn1XW.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#D3D3D3`;
  ctx.font = `37px "Warsaw"`;
  ctx.textAlign = "center";
  ctx.fillText(`${member.user.username}`, 300, 342);

  let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 });
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "ro-BOT-güle-güle.png"
  );

    canvaskanal.send(attachment);
    canvaskanal.send(
      msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
    );
    if (member.user.bot)
      return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
  
});

client.on("guildMemberAdd", async member => {
  if (db.has(`gçkanal_${member.guild.id}`) === false) return;
  var canvaskanal = member.guild.channels.cache.get(db.fetch(`gçkanal_${member.guild.id}`));
 if(!canvaskanal) return;
  
  if (!canvaskanal || canvaskanal ===  undefined) return;
  const request = require("node-superfetch");
  const Canvas = require("canvas"),
    Image = Canvas.Image,
    Font = Canvas.Font,
    path = require("path");

  var randomMsg = ["Sunucuya Katıldı."];
  var randomMsg_integer =
    randomMsg[Math.floor(Math.random() * randomMsg.length)];

  let paket = await db.fetch(`pakets_${member.id}`);
  let msj = await db.fetch(`cikisM_${member.guild.id}`);
  if (!msj) msj = `{uye}, ${randomMsg_integer}`;

  const canvas = Canvas.createCanvas(640, 360);
  const ctx = canvas.getContext("2d");

  const background = await Canvas.loadImage(
    "https://i.hizliresim.com/UyVZ4f.jpg"
  );
  ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = "#74037b";
  ctx.strokeRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = `#D3D3D3`;
  ctx.font = `37px "Warsaw"`;
  ctx.textAlign = "center";
  ctx.fillText(`${member.user.username}`, 300, 342);

  let avatarURL = member.user.displayAvatarURL({ format: 'png', dynamic: true, size: 1024 }) ;
  const { body } = await request.get(avatarURL);
  const avatar = await Canvas.loadImage(body);

  ctx.beginPath();
  ctx.lineWidth = 4;
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.arc(250 + 55, 55 + 55, 55, 0, 2 * Math.PI, false);
  ctx.clip();
  ctx.drawImage(avatar, 250, 55, 110, 110);

  const attachment = new Discord.MessageAttachment(
    canvas.toBuffer(),
    "ro-BOT-hosgeldin.png"
  );

  canvaskanal.send(attachment);
  canvaskanal.send(
    msj.replace("{uye}", member).replace("{sunucu}", member.guild.name)
  );
  if (member.user.bot)
    return canvaskanal.send(`🤖 Bu bir bot, ${member.user.tag}`);
});
// ----------------> [kayıt-sistemi] <---------------- \\
client.on("guildMemberAdd", async(member, message) => {
let kanal = db.fetch(`kayıtkanal_${member.guild.id}`)
if(!kanal) return;
let olus = moment.utc(member.createdAt).format("YYYY, MMMM DD **(D.MM.YYYY)**")
/*
${moment.utc(message.author.joinedAt).format("MMMM DD, YYYY").replace("0", "")}
${moment.utc(message.author.createdAt).format("MMMM DD, YYYY").replace("0", "")}
*/
     let süre = olus
     let guven;
     if(süre < 2629800000) guven = ':warning: Tehlikeli!'
     if(süre > 2629800000) guven = ':white_check_mark: Güvenilir.'
return member.guild.channels.cache.get(kanal).send(new Discord.MessageEmbed().setDescription(`
${member}(${member.tag}) Sunucumuza hoşgeldin.

Kayıt olmak için sesli kanala geçip yetkililerin gelmesini beklemen yeterlidir eğer öyle bir oda bulunmuyorsa bulunduğun kanala \`İsim Yaş\` yazman yeterli olucaktır.

Hesap Oluşturulma Tarihi: \`${olus}\`
Güvenirlik: ${guven}`))
})
// ----------------> [Hoşgeldin - Hoşçakal] <---------------- \\
client.on("guildMemberAdd", async(member, message, guild) => {
let kanal = db.fetch(`hoşgeldinK_${member.guild.id}`)

let hoşgeldinK = db.fetch(`hosgeldinK_${member.guild.id}`)
if(!hoşgeldinK) return;
if(!kanal) return;
var hoşglend = new Discord.MessageEmbed()
.setColor("GREEN")
.setTitle(":inbox_tray: Sunucuya yeni bir üye katıldı!")
.setThumbnail(member.user.avatarURL)
.setDescription("Ooo kimleri görüyorum, "+ member +" sunucuya hoşgeldin, seninle beraber "+ member.guild.memberCount+" kişiye ulaştık.")
.addField(`Üye ID:`, `${member.id}`, true)
.addField(`Üye Adı`, `${member}`, true)
return member.guild.channels.cache.get(hoşgeldinK).send(hoşglend) 
});
  
client.on("guildMemberRemove", async(member, message, guild) => {
  let kanal = db.fetch(`hoşgeldinK_${member.guild.id}`)
  if(!kanal) return;
var hoşglend = new Discord.MessageEmbed()
.setColor("RED")
.setTitle(":inbox_tray: Sunucu'dan bir üye ayrıldı!")
.setThumbnail(member.user.avatarURL)
.setDescription("Oof be kanka, "+ member +" sunucu'dan ayrıldı, senin çıkmanla beraber "+ member.guild.memberCount+" kişi kaldık.")
.addField(`Üye ID:`, `${member.id}`, true)
.addField(`Üye Adı`, `${member}`, true)
return member.guild.channels.cache.get(kanal).send(hoşglend) 

}) 
// ----------------> [Güvenlik] <------------------ \\
client.on('guildMemberAdd', member => {
     let kanal = db.fetch(`güvenlik.${member.guild.id}`)
     if(!kanal) return;

       let aylar = {
               "01": "Ocak",
               "02": "Şubat",
               "03": "Mart",
               "04": "Nisan",
               "05": "Mayıs",
               "06": "Haziran",
               "07": "Temmuz",
               "08": "Ağustos",
               "09": "Eylül",
               "10": "Ekim",
               "11": "Kasım",
               "12": "Aralık"
    }

  let bitiş = member.user.createdAt
      let günü = moment(new Date(bitiş).toISOString()).format('DD')
      let ayı = moment(new Date(bitiş).toISOString()).format('MM').replace("01", "Ocak").replace("02","Şubat").replace("03","Mart").replace("04", "Nisan").replace("05", "Mayıs").replace("06", "Haziran").replace("07", "Temmuz").replace("08", "Ağustos").replace("09", "Eylül").replace("10","Ekim").replace("11","Kasım").replace("12","Aralık")
     let yılı =  moment(new Date(bitiş).toISOString()).format('YYYY')
     let saati = moment(new Date(bitiş).toISOString()).format('HH:mm')

let günay = `${günü} ${ayı} ${yılı} ${saati}`  

      let süre = member.user.createdAt
      let gün = moment(new Date(süre).toISOString()).format('DD')
      let hafta = moment(new Date(süre).toISOString()).format('WW')
      let ay = moment(new Date(süre).toISOString()).format('MM')
      let ayy = moment(new Date(süre).toISOString()).format('MM')
      let yıl =  moment(new Date(süre).toISOString()).format('YYYY')
     let yıl2 = moment(new Date().toISOString()).format('YYYY')

     let netyıl = yıl2 - yıl

     let created = ` ${netyıl} yıl  ${ay} ay ${hafta} hafta ${gün} gün önce`

     let kontrol;
     if(süre < 1296000000) kontrol = 'Bu hesap şüpheli!'
     if(süre > 1296000000) kontrol = 'Bu hesap güvenli!'

     let sunoç = new Discord.MessageEmbed()
     .setColor('GREEN')
     .setTitle(`${member.user.username} Katıldı`)
     .setDescription('<@'+member.id+'> Bilgileri : \n\n  Hesap oluşturulma tarihi **[' + created + ']** (`' + günay + '`) \n\n Hesap durumu : **' + kontrol + '**')
     .setTimestamp()
return member.guild.channels.cache.get(kanal).send(sunoç)
})
// ----------------> [Sa-AS] <--------------------- \\
client.on("message", async (msg, member, guild) => {
  let i = await db.fetch(`ss_${msg.guild.id}`);
  if (db.has(`ss_${msg.guild.id}`) === true) {
    if (db.has(`üyelikk_${msg.author.id}`)) {
      if (msg.content.toLowerCase() === "sa") {
        msg.channel.send(
          `:wave: Aleyküm Selam, \`${msg.author.tag}\` Hoşgeldin `
        );
        db.add(`slmal_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "selam") {
        msg.channel.send(
          `:wave: Aleyküm Selam, \`${msg.author.tag}\` Hoşgeldin `
        );
        db.add(`slmal_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "s.a") {
        msg.channel.send(
          `:wave: Aleyküm Selam, \`${msg.author.tag}\` Hoşgeldin `
        );
        db.add(`slmal_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "selamun aleyküm") {
        msg.channel.send(
          `:wave: Aleyküm Selam, \`${msg.author.tag}\` Hoşgeldin `
        );
        db.add(`slmal_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "selamün aleyküm") {
        msg.channel.send(
          `:wave: Aleyküm Selam, \`${msg.author.tag}\` Hoşgeldin `
        );
        db.add(`slmal_${msg.author.id}`, 1);
      }
    } else if (msg.content.toLowerCase() === "sa") {
      msg.channel.send(`Aleyküm Selam Hoşgeldin ${msg.author}`);
      db.add(`slmal_${msg.author.id}`, 1);
    } else if (msg.content.toLowerCase() === "selam") {
      msg.channel.send(`Aleyküm Selam Hoşgeldin ${msg.author}`);
      db.add(`slmal_${msg.author.id}`, 1);
    }
  }
});
client.on("message", async (msg, member, guild) => {
  let i = await db.fetch(`ss_${msg.guild.id}`);
  if (db.has(`ss_${msg.guild.id}`) === true) {
    if (db.has(`üyelikk_${msg.author.id}`)) {
      if (msg.content.toLowerCase() === "as") {
        db.add(`slm_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "a.s") {
        db.add(`slm_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "aleyküm") {
        db.add(`slm_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "selam") {
        db.add(`slm_${msg.author.id}`, 1);
      }
      if (msg.content.toLowerCase() === "aleykümselam") {
        db.add(`slm_${msg.author.id}`, 1);
      }
    } else if (msg.content.toLowerCase() === "as") {
      db.add(`slm_${msg.author.id}`, 1);
    } else if (msg.content.toLowerCase() === "aleyküm selam") {
      db.add(`slm_${msg.author.id}`, 1);
    }
  }
});

// -----------------> [Caps-Engel] <-------------------- \\
client.on("message", async msg => {
  if (msg.channel.type === "dm") return;
  if (msg.author.bot) return;
  if (msg.content.length > 4) {
    if (db.fetch(`capslock_${msg.guild.id}`)) {
      let caps = msg.content.toUpperCase();
      if (msg.content == caps) {
        if (!msg.member.hasPermission("ADMINISTRATOR")) {
          if (!msg.mentions.users.first()) {
            msg.delete();
            return msg.channel
              .send(`<@${msg.author.id}> Lütfen CAPS kapat!`)
              .edit(
                `Bu sunucuda Caps Lock Engelleme sistemi kullanılıyor. Bu yüzden mesajını sildim!`
              )
              .then(m => m.delete(5000));
          }
        }
      }
    }
  }
});
// -------------------> [Snipe] <---------------- \\
// -------------------> [Spam-koruma] <--------------- \\
client.on("message", msg => {
  const antispam = require("discord-anti-spam-tr");
  let spamEngel = JSON.parse(
    fs.readFileSync("./jsonlar/spamEngelle.json", "utf8")
  );
  if (!msg.guild) return;
  if (!spamEngel[msg.guild.id]) return;
  if (spamEngel[msg.guild.id].spamEngel === "kapali") return;
  if (spamEngel[msg.guild.id].spamEngel === "acik") {
    antispam(client, {
      uyarmaSınırı: 3,
      banlamaSınırı: 7,
      aralık: 1000,
      uyarmaMesajı: "Spamı Durdur Yoksa Mutelerim.",
      rolMesajı: "Spam için yasaklandı, başka biri var mı?",
      maxSpamUyarı: 4,
      maxSpamBan: 12,
      zaman: 7,
      rolİsimi: "spamMUTED"
    });
  }
});

// -------------------> [Kufur-Engel] <---------------- \\
client.on("message", message => {
if (db.has(`küfürE_${message.guild.id}`) === true) {
const küfür = [
"sikik","oç","orospu","orospu çocuğu","öröspü çöcüğü","Oç","oÇ","OÇ","sikerim","kafasız","porno","pörnö","pornocu","31","31.",
"31 çeken","am","amcık","am çorbası","amcık çorbası","tam sikmelik","sikiş","sikmek","sik çorbası","sik suyu","am suyu","amcık suyu","yarrak",
"yarrak kafalı","soğan sikli","siki başı sik","yarrağı kara","kara sikli","kara yarraklı","tam oç","tam öç","tem oç","tem öç","öç","yarrak kokusu",
"sik kokusu","ananı sikim","ananı sikiyim","anneni sikim","anneni sikiyim","ablanı sikim","ablanı sikiyim","gacını sikiyim","karını sikiyim",
"babanı sikiyim","aileni sikime oturturayım","muz istermisin","yarrağım","sikim","sik","nah","taşşak","taşak","yarak","yalak","kafasını siktiğim",
"kafası sikik","bira","içki","turbo","amk","sik","Sik","Sİk","SİK"]
 if (küfür.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.delete();
        var ke = new Discord.MessageEmbed()
          .setColor("RED")
          .setAuthor("Küfür Engel (SISTEM)")
          .setDescription(`
Hey <@${message.author.id}>, Bu sunucuda küfürler **<@${client.user.id}>** tarafından engellenmektedir! Küfür etmene izin vermeyeceğim!`);        
        db.add(`küfürEwarn_${message.author.id}`, 1);
        message.channel.send(ke).then(message => message.delete(5000));
}}}});

client.on("messageUptade", message => {
if (db.has(`küfürE_${message.guild.id}`) === true) {
const küfür = [
"sikik","oç","orospu","orospu çocuğu","öröspü çöcüğü","Oç","oÇ","OÇ","sikerim","kafasız","porno","pörnö","pornocu","31","31.",
"31 çeken","am","amcık","am çorbası","amcık çorbası","tam sikmelik","sikiş","sikmek","sik çorbası","sik suyu","am suyu","amcık suyu","yarrak",
"yarrak kafalı","soğan sikli","siki başı sik","yarrağı kara","kara sikli","kara yarraklı","tam oç","tam öç","tem oç","tem öç","öç","yarrak kokusu",
"sik kokusu","ananı sikim","ananı sikiyim","anneni sikim","anneni sikiyim","ablanı sikim","ablanı sikiyim","gacını sikiyim","karını sikiyim",
"babanı sikiyim","aileni sikime oturturayım","muz istermisin","yarrağım","sikim","sik","nah","taşşak","taşak","yarak","yalak","kafasını siktiğim",
"kafası sikik","bira","içki","turbo","amk"]
if (küfür.some(word => message.content.toLowerCase().includes(word))) {
if (!message.member.hasPermssion("ADMINISTRATOR")) {
message.delete();
var ke = new Discord.MessageEmbed()
.setColor("RED")
.setAuthor("Küfür Engel (SISTEM)")
.setDescription(`
Sen kendini akıllımı sanıyorsun ${message.author}
Bu sunucuda küfürler **<@${client.user.id}>** tarafından engellenmektedir! Küfür etmene izin vermeyeceğim!`);
db.add(`küfürEwarn_${message.author.id}`, 1);
message.channel.send(ke).then(message => message.delete(5000));
}}}});
// -------------------> [Reklam-Engel] <---------------- \\
client.on("message", message => {
  if (db.has(`reklamE_${message.guild.id}`) === true) {
      const reklam = [
    ".ml",
    "discord.gg",
    "invite",
    "discordapp",
    "discordgg",
    ".com",
    ".net",
    ".xyz",
    ".tk",
    ".tv",
    ".pw",
    ".io",
    ".me",
    ".gg",
    "www.",
    "https",
    "http",
    ".gl",
    ".org",
    ".com.tr",
    ".biz",
    ".party",
    ".rf.gd",
    ".az",
    "glitch.me",
    "glitch.com"
  ];
    if (reklam.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.delete();
        var ke = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor("Reklam Engel (SISTEM)")
          .setDescription(
            `Hey <@${message.author.id}>, Bu sunucuda reklamlar **${client.user.username}** tarafından engellenmektedir! Reklam yapmana izin vermeyeceğim!`
          );
        
        db.add(`reklamEwarn_${message.author.id}`, 1);
        message.channel.send(ke).then(message => message.delete(5000));
      }}}});
client.on("messageUptade", message => {
    if (db.has(`reklamE_${message.guild.id}`) === true) {
      const reklam = [
    ".ml",
    "discord.gg",
    "invite",
    "discordapp",
    "discordgg",
    ".com",
    ".net",
    ".xyz",
    ".tk",
    ".pw",
    ".io",
    ".me",
    ".gg",
    "www.",
    "https",
    "http",
    ".gl",
    ".org",
    ".com.tr",
    ".biz",
    ".party",
    ".rf.gd",
    ".az",
    "glitch.me",
    "glitch.com"
  ];
    if (reklam.some(word => message.content.toLowerCase().includes(word))) {
      if (!message.member.hasPermission("ADMINISTRATOR")) {
        message.delete();
        var ke = new Discord.MessageEmbed()
          .setColor("RANDOM")
          .setAuthor("Reklam Engel (SISTEM)")
          .setDescription(`
            Sen kendini akıllımı sanıyorsun <@${message.author.id}>
           Bu sunucuda reklamlar **${client.user.username}** tarafından engellenmektedir! Reklam yapmana izin vermeyeceğim!`
          );
        
        db.add(`reklamEwarn_${message.author.id}`, 1);
        message.channel.send(ke).then(message => message.delete(5000));
      }}}});
// -------------------> [ROL-KORUMA] <------------------ \\
client.on("roleCreate", async (rolee, member, guild, message) => {
  let rolkoruma = await db.fetch(`rolK_${rolee.guild.id}`);
  if (rolkoruma == "acik") {
    rolee.delete();
    const embed = new Discord.MessageEmbed()
      .setDescription(
        "Sunucunuzda yeni bir rol oluşturuludu! fakat geri silindi! (Rol Koruma Sistemi)"
      )
      .setColor("BLACK");
    rolee.guild.owner.send(embed);
    return;
  } else {
    return;
  }
});
client.on("roleDelete", async (rol, member, guild, message) => {
  let rolkoruma = await db.fetch(`rolK_${rol.guild.id}`);
  if (rolkoruma == "acik") {
    rol.clone();
    const embed = new Discord.MessageEmbed()
      .setDescription(
        `Sunucunuzda rol silindi ama herşeyi ayarladım! (Rol Koruma Sistemi)`
      )
      .setColor("GREEN");
    rol.guild.owner.send(embed);
    return;
  } else {
    return;
  }
});
client.on("roleUptade", async (roll, member, guild, message) => {
  let rolkoruma = await db.fetch(`rolK_${roll.guild.id}`);
  if (rolkoruma == "acik") {
    roll.old();
    const embed = new Discord.MessageEmbed()
      .setDescription(
        `Sunucunuzda birtane rol'ün adı/rengi/yetkileri değiştirildi ama herşeyi eski haline getirdim! (Rol Koruma Sistemi)`
      )
      .setColor("GREEN");
    roll.guild.owner.send(embed);
    return;
  } else {
    return;
  }
});
// ----------------> {Kanal-Koruma} <------------------------ \\
client.on("channelDelete", async (channel, message) => {
  let kanalkoruma = await db.fetch(`kanalk_${channel.guild.id}`);
  if (kanalkoruma == "acik") {
    if (!channel.guild.me.hasPermission("MANAGE_CHANNELS")) return;
    let guild = channel.guild;
    const logs = await channel.guild.fetchAuditLogs({ type: "CHANNEL_DELETE" });
    let member = channel.members.get(logs.entries.first().executor.id);
    if (!member) return;
    if (member.hasPermission("ADMINISTRATOR")) return;
    channel
      .clone(channel.name, true, true, "Kanal silme koruması sistemi")
      .then(async klon => {
        if (!db.has(`korumalog_${guild.id}`)) return;
        let logs = guild.channels.find(ch => ch.id === db.fetch(`korumalog_${guild.id}`));
        if (!logs) return db.delete(`korumalog_${guild.id}`);
        else {
          const embed = new Discord.MessageEmbed()
            .setDescription(
              `Silinen Kanal: <#${klon.id}> (Yeniden oluşturuldu!)\nSilen Kişi: ${member.user}`
            )
            .setColor("RED")
            .setAuthor(member.user.tag, member.user.displayAvatarURL);
          channel.guild.owner.send(embed);
        }
        await klon.setParent(channel.parent);
        await klon.setPosition(channel.position);
      });
  }
});
client.on("channelCreate", async (channel, message) => {
  let kanalkoruma = await db.fetch(`kanalk_${channel.guild.id}`);
  if (kanalkoruma == "acik") {
    if (!channel.guild.me.hasPermission("MANAGE_CHANNELS")) return;
    let guild = channel.guild;
    const logs = await channel.guild.fetchAuditLogs({ type: "CHANNEL_CREATE" });
    let member = channel.members.get(logs.entries.first().executor.id);
    if (!member) return;
    if (member.hasPermission("ADMINISTRATOR")) return;
    channel.delete();
    const embed = new Discord.MessageEmbed().setDescription(
      `Sunucunuzda kanal oluşturuldu ama silindi! (Kanal Koruma Sistemi)`
    );
    channel.guild.owner.send(embed);
  }
});
client.on("channelUptade", async (channel, message) => {
  let kanalkoruma = await db.fetch(`kanalk_${channel.guild.id}`);
  if (kanalkoruma == "acik") {
    if (!channel.guild.me.hasPermission("MANAGE_CHANNELS")) return;
    let guild = channel.guild;
    const logs = await channel.guild.fetchAuditLogs({ type: "CHANNEL_UPTADE" });
    let member = channel.members.get(logs.entries.first().executor.id);
    if (!member) return;
    if (member.hasPermission("ADMINISTRATOR")) return;
    channel.old();
    const embed = new Discord.MessageEmbed().setDescription(
      `Sunucunuzda kanal adı/rol izinleri/webhook güncellendi ama herşeyi eski haline getirdim! (Kanal Koruma Sistemi)`
    );
    channel.guild.owner.send(embed);
  }
});
// ---------------> [Emoji-Koruma] <------------------- \\
client.on("emojiDelete", async function(emoji, kisi, user, yetkili) {
  const i = await db.fetch(`emojikoruma_${emoji.guild.id}`, true);
  if (i) {
    const entry = await emoji.guild
      .fetchAuditLogs({ type: "EMOJİ_DELETE" })
      .then(audit => audit.entries.first());

    let kisi = emoji.guild.member(entry.executor);
    kisi.roles
      .filter(a => a.hasPermission("ADMINISTRATOR"))
      .forEach(x => kisi.removeRole(x.id));
    kisi.roles
      .filter(a => a.hasPermission("MANAGE_CHANNELS"))
      .forEach(x => kisi.removeRole(x.id));
    kisi.roles
      .filter(a => a.hasPermission("MANAGE_ROLES"))
      .forEach(x => kisi.removeRole(x.id));
    kisi.mute();

    const deleter = emoji.executor;
    const id = emoji.executor.id;

    if (id === client.user.id || id === emoji.guild.ownerID) return;

    emoji.guild.members.forEach(async function(members) {
      if (members.id !== id) return;
      members.roles.forEach(role => {
        if (role.hasPermission(8) || role.hasPermission("MANAGE_EMOJIS")) {
          members.removeRole(role.id);

          emoji.guild.owner.send(
            `**<@${yetkili.id}> İsimli yetkili <@${user.id}>** adlı kişi **${emoji.guild.name}** adlı sunucunuzda emoji sildi ve yetkileri alındı!`
          );
        }
      });
    });
  }
});


// -----------------------> [Davet-Sistemi] <------------------------------ \\
client.on("guildMemberRemove", async member => {
  let kanal = await db.fetch(`davetkanal_${member.guild.id}`);
  if (!kanal) return;
  let veri = await db.fetch(`rol1_${member.guild.id}`);
  let veri12 = await db.fetch(`roldavet1_${member.guild.id}`);
  let veri21 = await db.fetch(`roldavet2_${member.guild.id}`);
  let veri2 = await db.fetch(`rol2_${member.guild.id}`);
  let d = await db.fetch(`bunudavet_${member.id}`);
  const sa = client.users.get(d);
  const sasad = member.guild.members.get(d);
  let sayı2 = await db.fetch(`davet_${d}_${member.guild.id}`);
  db.add(`davet_${d}_${member.guild.id}`, -1);
  db.add(`görevDavetEt.${member.guild.id}.${sa.id}`, -1)

  if (!d) {
    client.channels.get(kanal).send(`<:outbox_tray:  <@${member.user.id}> Sunucudan Ayrıldı.! Davet Eden Kişi: [ **BULUNAMADI**]`);
    return;
  } else {
    client.channels.get(kanal).send(`:outbox_tray:  <@${member.user.id}> Sunucudan Ayrıldı.! Davet Eden Kişi: [ <@${sa.id}> ]`);

    if (!veri) return;

    if (sasad.roles.has(veri)) {
      if (sayı2 <= veri12) {
        sasad.removeRole(veri);
        return;
      }
    }
    if (sasad.roles.has(veri2)) {
      if (!veri2) return;
      if (sayı2 <= veri21) {
        sasad.removeRole(veri2);
        return;
      }
    }
  }
});

client.on("guildMemberAdd", async member => {
  member.guild.fetchInvites().then(async guildInvites => {
    let veri = await db.fetch(`rol1_${member.guild.id}`);
    let veri12 = await db.fetch(`roldavet1_${member.guild.id}`);
    let veri21 = await db.fetch(`roldavet2_${member.guild.id}`);
    let veri2 = await db.fetch(`rol2_${member.guild.id}`);
    let kanal = await db.fetch(`davetkanal_${member.guild.id}`);
    if (!kanal) return;
    let invites;
    const ei = invites[member.guild.id];

    invites[member.guild.id] = guildInvites;

    const invite = guildInvites.find(i => ei.get(i.code).uses < i.uses);
    const sasad = member.guild.members.get(invite.inviter.id);
    const davetçi = client.users.get(invite.inviter.id);
     
    db.add(`görevDavetEt.${member.guild.id}.${invite.inviter.id}`, 1)
    db.add(`davet_${invite.inviter.id}_${member.guild.id}`, +1);
    db.set(`bunudavet_${member.id}`, invite.inviter.id);
    let sayı = await db.fetch(`davet_${invite.inviter.id}_${member.guild.id}`);

    let sayı2;
    if (!sayı) {
      sayı2 = 0;
    } else {
      sayı2 = await db.fetch(`davet_${invite.inviter.id}_${member.guild.id}`);
    }

    client.channels.get(kanal).send(`:inbox_tray:  <@${member.user.id}> Sunucuya Katıldı.! Davet Eden Kişi: <@${davetçi.id}> [**${sayı2}**]`);
    if (!veri) return;

    if (!sasad.roles.has(veri)) {
      if (sayı2 => veri12) {
        sasad.addRole(veri);
        return;
      }
    } else {
      if (!veri2) return;
      if (sayı2 => veri21) {
        sasad.addRole(veri2);
        return;
      }
    }
  });
});

client.login(process.env.token);

client.on('ready', () => 

client.channels.cache.get('984092888268943390').join()
)