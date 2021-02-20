import Discord from 'discord.js';
import {promises as fs} from 'fs';

const client = new Discord.Client();

type BotConfig = {
    rileyId: string,
    token: string
}

var rileyId:string;

fs.readFile('config.json').then(file => {
    var config:BotConfig = JSON.parse(file.toString());
    rileyId = config.rileyId;
    client.login(config.token);
});

client.on('ready', () => {
    console.log('Ready to rock and Riley!');
});

client.on('message', message => {
    if (message.channel.type == 'dm' && message.author.id != client.user!.id) {
        if (message.author.id == rileyId) {
            message.reply('RILEY!!');
        }
        else {
            message.reply('Riley!');
        }
    }
});

client.on('voiceStateUpdate', (oldState, newState) => {
    var channel = newState.channel;
    if (newState.id == rileyId && oldState.channel !== newState.channel) {
        if (newState.deaf || newState.mute) {
            client.on('voiceStateUpdate', awaitSpeak);
            console.log('Awaiting unmute/undeafen...')
        }
        else {
            yellRiley(channel!);
            console.log('Scenario 1');
        }
    }
});

var awaitSpeak = function(oldState:Discord.VoiceState, newState:Discord.VoiceState) {
    if (newState.id == rileyId) {
        if (!newState.deaf && !newState.mute && oldState.channel == newState.channel) {
            client.off('voiceStateUpdate', awaitSpeak);
            yellRiley(newState.channel!);
            console.log('Scenario 2');
        }
        else if (oldState.channel !== newState.channel) {
            client.off('voiceStateUpdate', awaitSpeak);
            console.log('Scenario 2 cancelled');
        }
    }
}

async function yellRiley(channel:Discord.VoiceChannel) {
    if (channel) {
        var connection = await channel.join().catch(err => {
            console.error(err);
        });
    }
    if (connection) {
        var dispatcher = connection.play('riley.wav');
        dispatcher.on('finish', () => {
            channel.leave();
        });
    }
    
}