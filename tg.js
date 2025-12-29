
// const { Telegraf, Markup } = require('telegraf');
// const { Client } = require('ssh2');

// const fs = require('fs');
// const path = require('path');

// const BOT_TOKEN = '8337257601:AAG7WlsrBkZXQQUP5_H-eWEfYld3WHpdDHE';
// const ALLOWED_USERS = [ 8080777513 ];

// const SSH_CONFIG = {
//     host: '192.168.0.194',
//     port: 32,
//     username: 'bedrock',
//     password: '0304'
// };

// const userStates = new Map();

//     class TelegramSSHBot {
//         constructor() {
//             this.bot = new Telegraf(BOT_TOKEN);
//             this.setupBot();
//             this.setupSSHConnection();
//         }

//         setupBot() {
//             // Команда /start
//             this.bot.start(async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) {
//                     return ctx.reply('⛔ Доступ запрещён. Обратитесь к администратору.');
//                 }
                
//                 const welcomeMessage = `👋 Добро пожаловать в SSH Console Bot!\n\n` +
//                                     `🌐 Подключение к: ${SSH_CONFIG.host}:${SSH_CONFIG.port}\n` +
//                                     `👤 Пользователь: ${SSH_CONFIG.username}\n\n` +
//                                     `📋 Доступные команды:\n` +
//                                     `/connect - Подключиться к серверу\n` +
//                                     `/disconnect - Отключиться\n` +
//                                     `/shell - Открыть терминал\n` +
//                                     `/screen - Подключиться к screen сессии\n` +
//                                     `/status - Статус подключения\n` +
//                                     `/help - Справка\n` +
//                                     `/control - Панель управления\n\n` +
//                                     `⚡ Используйте /shell для доступа к консоли`;

//                 await ctx.reply(welcomeMessage, this.getMainKeyboard());
//                 this.initUserState(ctx.from.id);
//             });

//             // Команда /connect
//             this.bot.command('connect', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 const userId = ctx.from.id;
//                 try {
//                     await ctx.reply('🔄 Подключаюсь к SSH серверу...');
//                     await this.connectSSH(userId);
//                     await ctx.reply('✅ Подключение установлено!\nИспользуйте /shell для доступа к терминалу');
//                 } catch (error) {
//                     await ctx.reply(`❌ Ошибка подключения: ${error.message}`);
//                 }
//             });

//             // Команда /disconnect
//             this.bot.command('disconnect', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 const userId = ctx.from.id;
//                 this.disconnectSSH(userId);
//                 await ctx.reply('🔌 Отключено от SSH сервера');
//             });

//             // Команда /shell
//             this.bot.command('shell', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 const userId = ctx.from.id;
//                 const userState = userStates.get(userId);
                
//                 if (!userState || !userState.sshClient) {
//                     return ctx.reply('❌ Сначала подключитесь к серверу: /connect');
//                 }
                
//                 if (!userState.shellStream) {
//                     await this.startShell(userId);
//                 }
                
//                 await ctx.reply('💻 Терминал активирован\nОтправляйте команды как обычные сообщения\n\n' +
//                             '🎮 Специальные команды:\n' +
//                             '::ctrl c - Отправить Ctrl+C\n' +
//                             '::ctrl d - Отправить Ctrl+D\n' +
//                             '::ctrl z - Отправить Ctrl+Z\n' +
//                             '::exit - Выйти из терминала\n\n' +
//                             '💡 Введите команду:',
//                             this.getShellKeyboard());
//             });

//             // Команда /screen
//             this.bot.command('screen', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 const userId = ctx.from.id;
//                 const userState = userStates.get(userId);
                
//                 if (!userState || !userState.sshClient) {
//                     return ctx.reply('❌ Сначала подключитесь к серверу: /connect');
//                 }
                
//                 await ctx.reply('Выберите screen сессию:', Markup.inlineKeyboard([
//                     [Markup.button.callback('🔷 bedrock (основная)', 'screen_bedrock')],
//                     [Markup.button.callback('➕ Новая сессия', 'screen_new')],
//                     [Markup.button.callback('📋 Список сессий', 'screen_list')],
//                     [Markup.button.callback('❌ Отмена', 'screen_cancel')]
//                 ]));
//             });

//             // Команда /status
//             this.bot.command('status', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 const userId = ctx.from.id;
//                 const userState = userStates.get(userId);
                
//                 let statusMessage = '📊 **Статус подключения:**\n\n';
                
//                 if (!userState) {
//                     statusMessage += '🔴 Пользователь не инициализирован\nИспользуйте /start';
//                 } else {
//                     statusMessage += `👤 Пользователь: ${userState.username}\n`;
//                     statusMessage += `🌐 SSH: ${userState.sshClient ? '🟢 Подключено' : '🔴 Отключено'}\n`;
//                     statusMessage += `💻 Терминал: ${userState.shellStream ? '🟢 Активен' : '🔴 Не активен'}\n`;
//                     statusMessage += `🎬 Screen: ${userState.currentSessionType}\n`;
//                     statusMessage += `📡 Сервер: ${SSH_CONFIG.host}:${SSH_CONFIG.port}`;
//                 }
                
//                 await ctx.reply(statusMessage);
//             });

//             // Команда /control
//             this.bot.command('control', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 await ctx.reply('🎮 Панель управления', this.getControlPanelKeyboard());
//             });

//             // Команда /help
//             this.bot.command('help', async (ctx) => {
//                 const helpMessage = `📖 **SSH Console Bot - Справка**\n\n` +
//                                 `**Основные команды:**\n` +
//                                 `/start - Начало работы\n` +
//                                 `/connect - Подключение к SSH\n` +
//                                 `/shell - Открыть терминал\n` +
//                                 `/screen - Управление screen сессиями\n` +
//                                 `/status - Статус подключения\n` +
//                                 `/disconnect - Отключиться\n` +
//                                 `/control - Панель управления\n\n` +
//                                 `**В терминале:**\n` +
//                                 `• Отправляйте команды как обычные сообщения\n` +
//                                 `• ::ctrl c - Отправить Ctrl+C\n` +
//                                 `• ::ctrl d - Отправить Ctrl+D\n` +
//                                 `• ::ctrl z - Отправить Ctrl+Z\n` +
//                                 `• ::exit - Выйти из терминала\n\n` +
//                                 `**Screen команды:**\n` +
//                                 `Ctrl+A D - Отключиться от screen\n` +
//                                 `Ctrl+A C - Создать новое окно\n` +
//                                 `Ctrl+A N - Следующее окно\n` +
//                                 `Ctrl+A P - Предыдущее окно`;
                
//                 await ctx.reply(helpMessage);
//             });

//             // Обработка обычных сообщений (команды в терминал)
//             this.bot.on('text', async (ctx) => {
//                 if (!this.isUserAllowed(ctx.from.id)) return;
                
//                 const userId = ctx.from.id;
//                 const userState = userStates.get(userId);
//                 const text = ctx.message.text;
                
//                 if (!userState || !userState.shellStream) {
//                     return; // Не в режиме терминала
//                 }
                
//                 // Обработка специальных команд
//                 if (text.startsWith('::')) {
//                     await this.handleSpecialCommand(userId, text, ctx);
//                     return;
//                 }
                
//                 // Выход из терминала
//                 if (text.toLowerCase() === 'exit' || text.toLowerCase() === 'выход') {
//                     userState.shellStream.end();
//                     userState.shellStream = null;
//                     await ctx.reply('🚪 Выход из терминала', this.getMainKeyboard());
//                     return;
//                 }
                
//                 // Отправка команды в SSH
//                 this.sendToSSH(userId, text);
//             });

//             // Обработка callback-запросов
//             this.bot.on('callback_query', async (ctx) => {
//                 const userId = ctx.from.id;
//                 const data = ctx.callbackQuery.data;
                
//                 if (!this.isUserAllowed(userId)) return;
                
//                 try {
//                     await ctx.answerCbQuery();
                    
//                     switch (true) {
//                         case data.startsWith('screen_'):
//                             await this.handleScreenCallback(userId, data, ctx);
//                             break;
                            
//                         case data.startsWith('ctrl_'):
//                             await this.handleControlCallback(userId, data, ctx);
//                             break;
                            
//                         case data.startsWith('cmd_'):
//                             await this.handleCommandCallback(userId, data, ctx);
//                             break;
//                     }
//                 } catch (error) {
//                     console.error('Callback error:', error);
//                     await ctx.reply(`❌ Ошибка: ${error.message}`);
//                 }
//             });

//             // Обработка ошибок
//             this.bot.catch((err, ctx) => {
//                 console.error('Bot error:', err);
//                 ctx.reply('❌ Произошла ошибка. Попробуйте ещё раз.');
//             });

//             // Запуск бота
//             this.bot.launch().then(() => {
//                 console.log('🤖 SSH Bot запущен!');
//                 console.log(`🌐 Подключение к SSH: ${SSH_CONFIG.host}:${SSH_CONFIG.port}`);
//             });
//         }

//         setupSSHConnection() {
//             // Инициализация SSH клиента при запуске
//             console.log('🔄 Инициализация SSH соединения...');
//         }

//         initUserState(userId) {
//             if (!userStates.has(userId)) {
//                 userStates.set(userId, {
//                     sshClient: null,
//                     shellStream: null,
//                     screenStream: null,
//                     currentSessionType: 'none',
//                     username: 'user_' + userId,
//                     buffer: '',
//                     isConnected: false
//                 });
//             }
//         }

//         isUserAllowed(userId) {
//             return ALLOWED_USERS.includes(Number(userId));
//         }

//         async connectSSH(userId) {
//             const userState = userStates.get(userId);
            
//             if (userState.sshClient && userState.isConnected) {
//                 return; // Уже подключен
//             }
            
//             return new Promise((resolve, reject) => {
//                 const sshClient = new Client();
                
//                 sshClient.on('ready', () => {
//                     console.log(`✅ SSH подключен для пользователя ${userId}`);
//                     userState.sshClient = sshClient;
//                     userState.isConnected = true;
//                     resolve();
//                 });
                
//                 sshClient.on('error', (err) => {
//                     console.error(`❌ SSH ошибка для ${userId}:`, err);
//                     userState.sshClient = null;
//                     userState.isConnected = false;
//                     reject(err);
//                 });
                
//                 sshClient.on('close', () => {
//                     console.log(`🔌 SSH отключен для пользователя ${userId}`);
//                     userState.sshClient = null;
//                     userState.isConnected = false;
//                     userState.shellStream = null;
//                     userState.currentSessionType = 'none';
//                 });
                
//                 try {
//                     sshClient.connect({
//                         ...SSH_CONFIG,
//                         readyTimeout: 10000
//                     });
//                 } catch (error) {
//                     reject(error);
//                 }
//             });
//         }

//         async startShell(userId) {
//             const userState = userStates.get(userId);
            
//             if (!userState.sshClient) {
//                 throw new Error('SSH не подключен');
//             }
            
//             return new Promise((resolve, reject) => {
//                 userState.sshClient.shell((err, stream) => {
//                     if (err) {
//                         reject(err);
//                         return;
//                     }
                    
//                     userState.shellStream = stream;
//                     userState.currentSessionType = 'shell';
                    
//                     stream.on('data', (data) => {
//                         this.handleSSHOutput(userId, data.toString());
//                     });
                    
//                     stream.on('close', () => {
//                         console.log(`💻 Shell закрыт для пользователя ${userId}`);
//                         userState.shellStream = null;
//                         userState.currentSessionType = 'none';
//                     });
                    
//                     resolve();
//                 });
//             });
//         }

//         async attachToScreen(userId, sessionName = 'bedrock') {
//             const userState = userStates.get(userId);
            
//             if (!userState.sshClient) {
//                 throw new Error('SSH не подключен');
//             }
            
//             return new Promise((resolve, reject) => {
//                 userState.sshClient.exec(`screen -r ${sessionName}`, (err, stream) => {
//                     if (err) {
//                         reject(err);
//                         return;
//                     }
                    
//                     userState.shellStream = stream;
//                     userState.currentSessionType = 'screen';
                    
//                     stream.on('data', (data) => {
//                         this.handleSSHOutput(userId, data.toString());
//                     });
                    
//                     stream.on('close', () => {
//                         console.log(`🎬 Screen сессия закрыта для пользователя ${userId}`);
//                         userState.shellStream = null;
//                         userState.currentSessionType = 'none';
//                     });
                    
//                     this.sendToBot(userId, `✅ Подключен к screen сессии "${sessionName}"\n💡 Используйте Ctrl+A D для отключения`);
//                     resolve();
//                 });
//             });
//         }

//         sendToSSH(userId, command) {
//             const userState = userStates.get(userId);
            
//             if (!userState || !userState.shellStream) {
//                 this.sendToBot(userId, '❌ Нет активного терминала. Используйте /shell');
//                 return;
//             }
            
//             userState.shellStream.write(command + '\n');
            
//             // Логирование команды
//             console.log(`📤 [${userId}] Отправлено: ${command.substring(0, 50)}${command.length > 50 ? '...' : ''}`);
//         }

//         handleSSHOutput(userId, output) {
//             // Отправляем вывод пользователю
//             this.sendToBot(userId, this.formatOutput(output));
//         }

//         async handleSpecialCommand(userId, command, ctx) {
//             const userState = userStates.get(userId);
//             const cmd = command.substring(2).toLowerCase();
            
//             if (!userState || !userState.shellStream) {
//                 await ctx.reply('❌ Нет активного терминала');
//                 return;
//             }
            
//             switch (cmd) {
//                 case 'ctrl c':
//                     userState.shellStream.write('\x03');
//                     await ctx.reply('✅ Отправлен Ctrl+C (прерывание)');
//                     break;
                    
//                 case 'ctrl d':
//                     userState.shellStream.write('\x04');
//                     await ctx.reply('✅ Отправлен Ctrl+D (выход)');
//                     break;
                    
//                 case 'ctrl z':
//                     userState.shellStream.write('\x1a');
//                     await ctx.reply('✅ Отправлен Ctrl+Z (приостановка)');
//                     break;
                    
//                 case 'ctrl a':
//                     userState.shellStream.write('\x01');
//                     await ctx.reply('✅ Отправлен Ctrl+A');
//                     break;
                    
//                 case 'ctrl l':
//                     userState.shellStream.write('\x0c');
//                     await ctx.reply('✅ Отправлен Ctrl+L (очистка экрана)');
//                     break;
                    
//                 default:
//                     await ctx.reply('❌ Неизвестная специальная команда\nДоступно: ctrl c, ctrl d, ctrl z, ctrl a, ctrl l');
//                     break;
//             }
//         }

//         async handleScreenCallback(userId, data, ctx) {
//             const action = data.split('_')[1];
            
//             switch (action) {
//                 case 'bedrock':
//                     await ctx.reply('🔄 Подключаюсь к сессии bedrock...');
//                     try {
//                         await this.attachToScreen(userId, 'bedrock');
//                     } catch (error) {
//                         await ctx.reply(`❌ Ошибка: ${error.message}\nПроверьте, запущена ли сессия: screen -ls`);
//                     }
//                     break;
                    
//                 case 'new':
//                     this.sendToSSH(userId, 'screen -S telegram_session');
//                     await ctx.reply('🆕 Создаётся новая screen сессия...');
//                     break;
                    
//                 case 'list':
//                     this.sendToSSH(userId, 'screen -ls');
//                     await ctx.reply('📋 Запрашиваю список сессий...');
//                     break;
                    
//                 case 'cancel':
//                     await ctx.reply('❌ Отменено', this.getMainKeyboard());
//                     break;
//             }
//         }

//         async handleControlCallback(userId, data, ctx) {
//             const controlChar = data.split('_')[1];
//             const userState = userStates.get(userId);
            
//             if (!userState || !userState.shellStream) {
//                 await ctx.reply('❌ Нет активного терминала');
//                 return;
//             }
            
//             const controlMap = {
//                 'c': '\x03', // Ctrl+C
//                 'd': '\x04', // Ctrl+D
//                 'z': '\x1a', // Ctrl+Z
//                 'a': '\x01', // Ctrl+A
//                 'l': '\x0c', // Ctrl+L
//                 'u': '\x15', // Ctrl+U
//                 'k': '\x0b', // Ctrl+K
//                 'w': '\x17', // Ctrl+W
//             };
            
//             if (controlMap[controlChar]) {
//                 userState.shellStream.write(controlMap[controlChar]);
//                 await ctx.reply(`✅ Отправлен Ctrl+${controlChar.toUpperCase()}`);
//             }
//         }

//         async handleCommandCallback(userId, data, ctx) {
//             const command = data.split('_')[1];
//             const userState = userStates.get(userId);
            
//             if (!userState || !userState.shellStream) {
//                 await ctx.reply('❌ Нет активного терминала');
//                 return;
//             }
            
//             const commandMap = {
//                 'ls': 'ls -la',
//                 'pwd': 'pwd',
//                 'top': 'top -n 1',
//                 'df': 'df -h',
//                 'free': 'free -h',
//                 'ps': 'ps aux | head -20',
//                 'uptime': 'uptime',
//                 'date': 'date',
//                 'whoami': 'whoami',
//             };
            
//             if (commandMap[command]) {
//                 this.sendToSSH(userId, commandMap[command]);
//                 await ctx.reply(`📤 Выполняется: ${command}`);
//             }
//         }

//         disconnectSSH(userId) {
//             const userState = userStates.get(userId);
            
//             if (userState) {
//                 if (userState.shellStream) {
//                     userState.shellStream.end();
//                     userState.shellStream = null;
//                 }
                
//                 if (userState.sshClient) {
//                     userState.sshClient.end();
//                     userState.sshClient = null;
//                 }
                
//                 userState.currentSessionType = 'none';
//                 userState.isConnected = false;
//             }
//         }

//         sendToBot(userId, message) {
//             // Форматируем длинные сообщения
//             const formattedMessage = this.formatOutput(message);
            
//             // Отправляем пользователю
//             this.bot.telegram.sendMessage(userId, formattedMessage, {
//                 parse_mode: 'HTML',
//                 disable_web_page_preview: true
//             }).catch(console.error);
//         }

//         formatOutput(output) {
//             // Ограничиваем длину вывода для Telegram
//             if (output.length > 4000) {
//                 output = output.substring(0, 4000) + '\n\n... (вывод обрезан)';
//             }
            
//             // Экранируем специальные символы для HTML
//             output = output
//                 .replace(/&/g, '&amp;')
//                 .replace(/</g, '&lt;')
//                 .replace(/>/g, '&gt;');
            
//             // Форматируем как код
//             return `<pre>${output}</pre>`;
//         }

//         getMainKeyboard() {
//             return Markup.keyboard([
//                 ['/connect', '/status'],
//                 ['/shell', '/screen'],
//                 ['/control', '/help'],
//                 ['/disconnect']
//             ]).resize();
//         }

//         getShellKeyboard() {
//             return Markup.keyboard([
//                 ['::ctrl c', '::ctrl d', '::ctrl z'],
//                 ['ls', 'pwd', 'top'],
//                 ['Выйти (exit)', '/status'],
//                 ['Назад (/control)']
//             ]).resize();
//         }

//         getControlPanelKeyboard() {
//             return Markup.inlineKeyboard([
//                 [
//                     Markup.button.callback('Ctrl+C', 'ctrl_c'),
//                     Markup.button.callback('Ctrl+D', 'ctrl_d'),
//                     Markup.button.callback('Ctrl+Z', 'ctrl_z')
//                 ],
//                 [
//                     Markup.button.callback('ls -la', 'cmd_ls'),
//                     Markup.button.callback('pwd', 'cmd_pwd'),
//                     Markup.button.callback('top', 'cmd_top')
//                 ],
//                 [
//                     Markup.button.callback('df -h', 'cmd_df'),
//                     Markup.button.callback('free -h', 'cmd_free'),
//                     Markup.button.callback('ps aux', 'cmd_ps')
//                 ],
//                 [
//                     Markup.button.callback('uptime', 'cmd_uptime'),
//                     Markup.button.callback('date', 'cmd_date'),
//                     Markup.button.callback('whoami', 'cmd_whoami')
//                 ],
//                 [
//                     Markup.button.callback('🔙 Назад', 'control_back')
//                 ]
//             ]);
//         }
//     }

//     // Запуск бота
//     const sshBot = new TelegramSSHBot();

//     // Обработка завершения работы
//     process.once('SIGINT', () => {
//         console.log('🛑 Завершение работы бота...');
//         sshBot.bot.stop('SIGINT');
//         process.exit();
//     });

//     process.once('SIGTERM', () => {
//         console.log('🛑 Завершение работы бота...');
//         sshBot.bot.stop('SIGTERM');
//         process.exit();
//     });

const { Telegraf, Markup } = require('telegraf');
const { Client } = require('ssh2');
const fs = require('fs');
const path = require('path');

const BOT_TOKEN = '8337257601:AAG7WlsrBkZXQQUP5_H-eWEfYld3WHpdDHE';
const ALLOWED_USERS = [8080777513];
const ADMIN_ID = 8080777513; // Ваш ID для уведомлений

// Файл для хранения сессий
const SESSIONS_FILE = 'ssh_sessions.json';

// Загружаем сохранённые сессии
let sshSessions = {};
if (fs.existsSync(SESSIONS_FILE)) {
    try {
        sshSessions = JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf8'));
    } catch (error) {
        console.error('Ошибка загрузки сессий:', error);
    }
}

// Состояния пользователей
const userStates = new Map();

// Сохранение сессий в файл
function saveSessions() {
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sshSessions, null, 2));
}

// Утилита для очистки escape-последовательностей
function cleanEscapeSequences(text) {
    return text
        .replace(/\x1b\[\?2004[hl]/g, '')
        .replace(/\x1b\[[0-9;]*[a-zA-Z]/g, '')
        .replace(/\x1b\]133;[A-Z];[^\x07]*\x07/g, '')
        .replace(/\x1b[\[\]()#;?]*(?:\d{1,4}(?:;\d{0,4})*)?[\dA-PR-TZcf-ntqry=><~]/g, '')
        .replace(/\r\n/g, '\n')
        .replace(/\x1b/g, '');
}

class TelegramSSHBot {
    constructor() {
        this.bot = new Telegraf(BOT_TOKEN);
        this.setupBot();
    }

    setupBot() {
        // Команда /start
        this.bot.start(async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) {
                return ctx.reply('⛔ Доступ запрещён. Обратитесь к администратору.');
            }
            
            const welcomeMessage = `🤖 **SSH Console Bot запущен!**\n\n` +
                                  `✅ Бот активен и готов к работе\n` +
                                  `📊 Сохранённых сессий: ${Object.keys(sshSessions).length}\n\n` +
                                  `📋 Основные команды:\n` +
                                  `/sessions - Управление SSH сессиями\n` +
                                  `/connect - Подключиться к серверу\n` +
                                  `/shell - Открыть терминал\n` +
                                  `/status - Статус подключения\n` +
                                  `/help - Справка`;

            await ctx.reply(welcomeMessage, this.getMainKeyboard());
            this.initUserState(ctx.from.id);
            
            // Логируем активного пользователя
            console.log(`👤 Пользователь ${ctx.from.username || ctx.from.id} запустил бота`);
        });

        // Команда /sessions - управление SSH сессиями
        this.bot.command('sessions', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            await ctx.reply(
                '🗄️ Управление SSH сессиями',
                Markup.inlineKeyboard([
                    [Markup.button.callback('➕ Добавить сессию', 'session_add')],
                    [Markup.button.callback('📋 Список сессий', 'session_list')],
                    [Markup.button.callback('⚙️ Настройки', 'session_settings')],
                    [Markup.button.callback('🔙 Назад', 'session_back')]
                ])
            );
        });

        // Команда /connect - подключение к SSH
        this.bot.command('connect', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const sessions = Object.keys(sshSessions);
            if (sessions.length === 0) {
                return ctx.reply(
                    '❌ Нет сохранённых SSH сессий.\n' +
                    'Сначала добавьте сессию через /sessions',
                    this.getMainKeyboard()
                );
            }
            
            const buttons = sessions.map(name => 
                [Markup.button.callback(`🔗 ${name}`, `connect_${name}`)]
            );
            buttons.push([Markup.button.callback('❌ Отмена', 'connect_cancel')]);
            
            await ctx.reply(
                '🔌 Выберите SSH сессию для подключения:',
                Markup.inlineKeyboard(buttons)
            );
        });

        // Команда /shell
        this.bot.command('shell', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const userId = ctx.from.id;
            const userState = userStates.get(userId);
            
            if (!userState || !userState.sshClient) {
                return ctx.reply(
                    '❌ Сначала подключитесь к серверу: /connect',
                    this.getMainKeyboard()
                );
            }
            
            if (!userState.shellStream) {
                try {
                    await this.startShell(userId);
                } catch (error) {
                    return ctx.reply(`❌ Ошибка запуска терминала: ${error.message}`);
                }
            }
            
            await ctx.reply(
                '💻 **Терминал активирован!**\n\n' +
                '✅ Теперь можете отправлять команды напрямую\n\n' +
                '🎮 Быстрые команды:\n' +
                '`::exit` - Выйти из терминала\n' +
                '`::ctrl c` - Отправить Ctrl+C\n' +
                '`::ctrl d` - Отправить Ctrl+D\n' +
                '`::ctrl z` - Отправить Ctrl+Z\n\n' +
                '💡 Просто введите команду и нажмите Enter',
                this.getShellKeyboard()
            );
        });

        // Команда /status
        this.bot.command('status', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const userId = ctx.from.id;
            const userState = userStates.get(userId);
            
            let statusMessage = '📊 **Статус системы:**\n\n';
            
            if (!userState) {
                statusMessage += '🔴 Пользователь не инициализирован\nИспользуйте /start';
            } else {
                statusMessage += `👤 Пользователь: ${ctx.from.username || ctx.from.id}\n`;
                statusMessage += `🌐 SSH: ${userState.sshClient ? '🟢 Подключено' : '🔴 Отключено'}\n`;
                statusMessage += `💻 Терминал: ${userState.shellStream ? '🟢 Активен' : '🔴 Не активен'}\n`;
                statusMessage += `🎬 Session: ${userState.currentSessionType}\n`;
                
                if (userState.currentSession && sshSessions[userState.currentSession]) {
                    const session = sshSessions[userState.currentSession];
                    statusMessage += `📡 Сервер: ${session.host}:${session.port}\n`;
                    statusMessage += `🔑 Логин: ${session.username}`;
                }
            }
            
            statusMessage += '\n\n🤖 **Статус бота:** 🟢 Активен';
            
            await ctx.reply(statusMessage);
        });

        // Команда /disconnect
        this.bot.command('disconnect', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const userId = ctx.from.id;
            const userState = userStates.get(userId);
            
            if (userState && userState.sshClient) {
                this.disconnectSSH(userId);
                await ctx.reply('🔌 Отключено от SSH сервера', this.getMainKeyboard());
            } else {
                await ctx.reply('❌ Нет активного подключения');
            }
        });

        // Команда /help
        this.bot.command('help', async (ctx) => {
            const helpMessage = `📖 **SSH Console Bot - Справка**\n\n` +
                `**Основные команды:**\n` +
                `/start - Начало работы\n` +
                `/sessions - Управление SSH сессиями\n` +
                `/connect - Подключение к SSH\n` +
                `/shell - Открыть терминал\n` +
                `/status - Статус подключения\n` +
                `/disconnect - Отключиться\n\n` +
                `**В терминале:**\n` +
                `• Отправляйте команды как обычные сообщения\n` +
                `• \`::exit\` - Выйти из терминала\n` +
                `• \`::ctrl c\` - Отправить Ctrl+C\n` +
                `• \`::ctrl d\` - Отправить Ctrl+D\n` +
                `• \`::ctrl z\` - Отправить Ctrl+Z\n\n` +
                `**Управление сессиями:**\n` +
                `• /sessions - Добавить/удалить SSH сессии\n` +
                `• Сессии сохраняются автоматически`;
            
            await ctx.reply(helpMessage, { parse_mode: 'Markdown' });
        });

        // Команда /ping - проверка работы бота
        this.bot.command('ping', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const start = Date.now();
            await ctx.reply('🏓 Понг!');
            const latency = Date.now() - start;
            
            await ctx.reply(`📊 Статистика:\n` +
                           `• Задержка: ${latency}мс\n` +
                           `• Пользователей: ${userStates.size}\n` +
                           `• Сессий SSH: ${Object.keys(sshSessions).length}`);
        });

        // Команда /botinfo - информация о боте
        this.bot.command('botinfo', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const uptime = process.uptime();
            const hours = Math.floor(uptime / 3600);
            const minutes = Math.floor((uptime % 3600) / 60);
            const seconds = Math.floor(uptime % 60);
            
            const info = `🤖 **Информация о боте:**\n\n` +
                        `• Время работы: ${hours}ч ${minutes}м ${seconds}с\n` +
                        `• Активных пользователей: ${userStates.size}\n` +
                        `• Сохранённых сессий: ${Object.keys(sshSessions).length}\n` +
                        `• Память: ${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)} MB\n` +
                        `• Node.js: ${process.version}\n` +
                        `• Платформа: ${process.platform}`;
            
            await ctx.reply(info);
        });

        // Обработка обычных сообщений (команды в терминал)
        this.bot.on('text', async (ctx) => {
            if (!this.isUserAllowed(ctx.from.id)) return;
            
            const userId = ctx.from.id;
            const userState = userStates.get(userId);
            const text = ctx.message.text;
            
            // Если пользователь в режиме добавления сессии
            if (userState && userState.awaitingSessionInput) {
                await this.handleSessionInput(userId, text, ctx);
                return;
            }
            
            if (!userState || !userState.shellStream) {
                // Если не в терминале, показываем подсказку
                if (text.startsWith('/')) {
                    return; // Это команда, обработается автоматически
                }
                await ctx.reply(
                    'ℹ️ Вы не в режиме терминала.\n' +
                    'Используйте /shell для открытия терминала\n' +
                    'Или /help для списка команд',
                    this.getMainKeyboard()
                );
                return;
            }
            
            // Обработка специальных команд
            if (text.startsWith('::')) {
                await this.handleSpecialCommand(userId, text, ctx);
                return;
            }
            
            // Выход из терминала
            if (text.toLowerCase() === 'exit' || text.toLowerCase() === 'выход') {
                userState.shellStream.end();
                userState.shellStream = null;
                await ctx.reply('🚪 Выход из терминала', this.getMainKeyboard());
                return;
            }
            
            // Отправка команды в SSH
            this.sendToSSH(userId, text);
            
            // Подтверждение отправки
            if (text.length <= 100) {
                await ctx.reply(`📤 Отправлено: \`${text}\``, { parse_mode: 'Markdown' });
            }
        });

        // Обработка callback-запросов
        this.bot.on('callback_query', async (ctx) => {
            const userId = ctx.from.id;
            const data = ctx.callbackQuery.data;
            
            if (!this.isUserAllowed(userId)) return;
            
            try {
                await ctx.answerCbQuery();
                
                switch (true) {
                    case data.startsWith('session_'):
                        await this.handleSessionCallback(userId, data, ctx);
                        break;
                        
                    case data.startsWith('connect_'):
                        await this.handleConnectCallback(userId, data, ctx);
                        break;
                        
                    case data.startsWith('ctrl_'):
                        await this.handleControlCallback(userId, data, ctx);
                        break;
                        
                    case data.startsWith('cmd_'):
                        await this.handleCommandCallback(userId, data, ctx);
                        break;
                        
                    case data === 'control_back':
                        await ctx.reply('🔙 Главное меню', this.getMainKeyboard());
                        break;
                }
            } catch (error) {
                console.error('Callback error:', error);
                await ctx.reply(`❌ Ошибка: ${error.message}`);
            }
        });

        // Обработка ошибок
        this.bot.catch((err, ctx) => {
            console.error('Bot error:', err);
            if (ctx && ctx.reply) {
                ctx.reply('❌ Произошла ошибка. Попробуйте ещё раз.');
            }
        });

        // Запуск бота с уведомлением
        this.startBot();
    }

    async startBot() {
        try {
            await this.bot.launch();
            console.log('🤖 SSH Bot успешно запущен!');
            console.log(`📊 Загружено сессий: ${Object.keys(sshSessions).length}`);
            console.log(`👥 Разрешённые пользователи: ${ALLOWED_USERS.join(', ')}`);
            
            // Отправляем уведомление админу о запуске бота
            await this.sendStartupNotification();
            
        } catch (error) {
            console.error('❌ Ошибка запуска бота:', error);
            process.exit(1);
        }
    }

    async sendStartupNotification() {
        try {
            const now = new Date();
            const timeString = now.toLocaleString('ru-RU');
            
            const message = `🚀 **SSH Console Bot запущен!**\n\n` +
                           `⏰ Время: ${timeString}\n` +
                           `📊 Сессий: ${Object.keys(sshSessions).length}\n` +
                           `🖥️ Хост: ${require('os').hostname()}\n` +
                           `✅ Бот готов к работе`;
            
            await this.bot.telegram.sendMessage(ADMIN_ID, message, { parse_mode: 'Markdown' });
            console.log('📨 Отправлено уведомление администратору');
        } catch (error) {
            console.error('Не удалось отправить уведомление:', error.message);
        }
    }

    // === Управление сессиями ===

    async handleSessionCallback(userId, data, ctx) {
        const action = data.split('_')[1];
        
        switch (action) {
            case 'add':
                await this.startAddSession(userId, ctx);
                break;
                
            case 'list':
                await this.showSessionList(userId, ctx);
                break;
                
            case 'settings':
                await ctx.reply(
                    '⚙️ Настройки сессий\n\n' +
                    'Файл сессий: ssh_sessions.json\n' +
                    `Всего сессий: ${Object.keys(sshSessions).length}`,
                    Markup.inlineKeyboard([
                        [Markup.button.callback('🗑️ Очистить все', 'session_clear_all')],
                        [Markup.button.callback('🔙 Назад', 'session_back')]
                    ])
                );
                break;
                
            case 'back':
                await ctx.reply('🔙 Главное меню', this.getMainKeyboard());
                break;
                
            case 'clear_all':
                sshSessions = {};
                saveSessions();
                await ctx.reply('✅ Все сессии удалены', this.getMainKeyboard());
                break;
                
            default:
                // Удаление конкретной сессии
                if (action.startsWith('delete_')) {
                    const sessionName = action.replace('delete_', '');
                    delete sshSessions[sessionName];
                    saveSessions();
                    await ctx.reply(`✅ Сессия "${sessionName}" удалена`);
                    await this.showSessionList(userId, ctx);
                }
                break;
        }
    }

    async startAddSession(userId, ctx) {
        const userState = userStates.get(userId);
        userState.awaitingSessionInput = true;
        userState.sessionStep = 'name';
        
        await ctx.reply(
            '➕ **Добавление новой SSH сессии**\n\n' +
            'Шаг 1/4: Введите имя для сессии\n' +
            'Например: *Домашний сервер* или *VPS*',
            { parse_mode: 'Markdown' }
        );
    }

    async handleSessionInput(userId, text, ctx) {
        const userState = userStates.get(userId);
        
        if (text.toLowerCase() === '/cancel') {
            userState.awaitingSessionInput = false;
            delete userState.sessionStep;
            delete userState.sessionData;
            await ctx.reply('❌ Отменено', this.getMainKeyboard());
            return;
        }
        
        if (!userState.sessionStep) {
            userState.sessionStep = 'name';
        }
        
        switch (userState.sessionStep) {
            case 'name':
                if (sshSessions[text]) {
                    await ctx.reply('❌ Сессия с таким именем уже существует\nВведите другое имя:');
                    return;
                }
                userState.sessionData = { name: text };
                userState.sessionStep = 'host';
                await ctx.reply('Шаг 2/4: Введите хост или IP адрес:');
                break;
                
            case 'host':
                userState.sessionData.host = text;
                userState.sessionStep = 'port';
                await ctx.reply('Шаг 3/4: Введите порт (по умолчанию 22):');
                break;
                
            case 'port':
                const port = parseInt(text) || 22;
                if (port < 1 || port > 65535) {
                    await ctx.reply('❌ Неверный порт. Введите число от 1 до 65535:');
                    return;
                }
                userState.sessionData.port = port;
                userState.sessionStep = 'username';
                await ctx.reply('Шаг 4/4: Введите имя пользователя:');
                break;
                
            case 'username':
                userState.sessionData.username = text;
                userState.sessionStep = 'password';
                await ctx.reply(
                    '🔒 Введите пароль:\n' +
                    '⚠️ *Внимание:* пароль сохранится в открытом виде!\n' +
                    'Для безопасности рекомендуется использовать SSH ключи.',
                    { parse_mode: 'Markdown' }
                );
                break;
                
            case 'password':
                userState.sessionData.password = text;
                
                // Сохраняем сессию
                const { name, ...config } = userState.sessionData;
                sshSessions[name] = config;
                saveSessions();
                
                // Сбрасываем состояние
                userState.awaitingSessionInput = false;
                delete userState.sessionStep;
                delete userState.sessionData;
                
                await ctx.reply(
                    `✅ **Сессия "${name}" успешно добавлена!**\n\n` +
                    `📡 Хост: ${config.host}\n` +
                    `🔌 Порт: ${config.port}\n` +
                    `👤 Пользователь: ${config.username}\n\n` +
                    `Теперь можете подключиться через /connect`,
                    this.getMainKeyboard()
                );
                break;
        }
    }

    async showSessionList(userId, ctx) {
        const sessions = Object.keys(sshSessions);
        
        if (sessions.length === 0) {
            return ctx.reply(
                '📋 **Список SSH сессий пуст**\n\n' +
                'Добавьте сессию через кнопку ниже:',
                Markup.inlineKeyboard([
                    [Markup.button.callback('➕ Добавить сессию', 'session_add')],
                    [Markup.button.callback('🔙 Назад', 'session_back')]
                ])
            );
        }
        
        let message = '📋 **Сохранённые SSH сессии:**\n\n';
        const buttons = [];
        
        sessions.forEach((name, index) => {
            const session = sshSessions[name];
            message += `${index + 1}. **${name}**\n`;
            message += `   📡 ${session.host}:${session.port}\n`;
            message += `   👤 ${session.username}\n\n`;
            
            buttons.push([
                Markup.button.callback(`🔗 ${name}`, `connect_${name}`),
                Markup.button.callback(`🗑️ ${name}`, `session_delete_${name}`)
            ]);
        });
        
        buttons.push([Markup.button.callback('🔙 Назад', 'session_back')]);
        
        await ctx.reply(message, {
            parse_mode: 'Markdown',
            ...Markup.inlineKeyboard(buttons)
        });
    }

    // === Подключение к SSH ===

    async handleConnectCallback(userId, data, ctx) {
        const sessionName = data.replace('connect_', '');
        
        if (sessionName === 'cancel') {
            await ctx.reply('❌ Отменено', this.getMainKeyboard());
            return;
        }
        
        const session = sshSessions[sessionName];
        if (!session) {
            return ctx.reply(`❌ Сессия "${sessionName}" не найдена`);
        }
        
        await ctx.reply(`🔄 Подключаюсь к "${sessionName}"...`);
        
        try {
            await this.connectSSH(userId, sessionName, session);
            await ctx.reply(
                `✅ **Подключение установлено!**\n\n` +
                `🌐 Сессия: ${sessionName}\n` +
                `📡 ${session.host}:${session.port}\n` +
                `👤 ${session.username}\n\n` +
                `Теперь используйте /shell для доступа к терминалу`,
                this.getMainKeyboard()
            );
        } catch (error) {
            await ctx.reply(`❌ Ошибка подключения: ${error.message}`);
        }
    }

    // === Основные методы SSH ===

    initUserState(userId) {
        if (!userStates.has(userId)) {
            userStates.set(userId, {
                sshClient: null,
                shellStream: null,
                currentSession: null,
                currentSessionType: 'none',
                username: 'user_' + userId,
                isConnected: false,
                awaitingSessionInput: false
            });
        }
    }

    isUserAllowed(userId) {
        return ALLOWED_USERS.includes(Number(userId));
    }

    async connectSSH(userId, sessionName, config) {
        const userState = userStates.get(userId);
        
        if (userState.sshClient && userState.isConnected) {
            await this.disconnectSSH(userId);
        }
        
        return new Promise((resolve, reject) => {
            const sshClient = new Client();
            
            sshClient.on('ready', () => {
                console.log(`✅ SSH подключен: ${userId} -> ${sessionName}`);
                userState.sshClient = sshClient;
                userState.currentSession = sessionName;
                userState.isConnected = true;
                resolve();
            });
            
            sshClient.on('error', (err) => {
                console.error(`❌ SSH ошибка: ${userId} -> ${sessionName}:`, err.message);
                userState.sshClient = null;
                userState.currentSession = null;
                userState.isConnected = false;
                reject(new Error(`Не удалось подключиться: ${err.message}`));
            });
            
            sshClient.on('close', () => {
                console.log(`🔌 SSH отключен: ${userId} -> ${sessionName}`);
                userState.sshClient = null;
                userState.shellStream = null;
                userState.currentSession = null;
                userState.currentSessionType = 'none';
                userState.isConnected = false;
            });
            
            try {
                sshClient.connect({
                    host: config.host,
                    port: config.port || 22,
                    username: config.username,
                    password: config.password,
                    readyTimeout: 15000,
                    keepaliveInterval: 30000,
                    keepaliveCountMax: 3
                });
            } catch (error) {
                reject(new Error(`Ошибка соединения: ${error.message}`));
            }
        });
    }

    async startShell(userId) {
        const userState = userStates.get(userId);
        
        if (!userState.sshClient) {
            throw new Error('SSH не подключен');
        }
        
        return new Promise((resolve, reject) => {
            userState.sshClient.shell({ term: 'xterm-256color' }, (err, stream) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                userState.shellStream = stream;
                userState.currentSessionType = 'shell';
                
                stream.on('data', (data) => {
                    const cleanData = cleanEscapeSequences(data.toString());
                    if (cleanData.trim()) {
                        this.handleSSHOutput(userId, cleanData);
                    }
                });
                
                stream.on('close', () => {
                    console.log(`💻 Shell закрыт для пользователя ${userId}`);
                    userState.shellStream = null;
                    userState.currentSessionType = 'none';
                });
                
                stream.stderr.on('data', (data) => {
                    const error = cleanEscapeSequences(data.toString());
                    if (error.trim()) {
                        this.sendToBot(userId, `❌ Ошибка: ${error}`);
                    }
                });
                
                resolve();
            });
        });
    }

    sendToSSH(userId, command) {
        const userState = userStates.get(userId);
        
        if (!userState || !userState.shellStream) {
            this.sendToBot(userId, '❌ Нет активного терминала. Используйте /shell');
            return;
        }
        
        userState.shellStream.write(command + '\n');
        console.log(`📤 [${userId}] Отправлено: ${command.substring(0, 50)}${command.length > 50 ? '...' : ''}`);
    }

    handleSSHOutput(userId, output) {
        if (output.trim()) {
            this.sendToBot(userId, output);
        }
    }

    async handleSpecialCommand(userId, command, ctx) {
        const userState = userStates.get(userId);
        const cmd = command.substring(2).toLowerCase();
        
        if (!userState || !userState.shellStream) {
            await ctx.reply('❌ Нет активного терминала');
            return;
        }
        
        const controlMap = {
            'ctrl c': '\x03',
            'ctrl d': '\x04',
            'ctrl z': '\x1a',
            'ctrl a': '\x01',
            'ctrl l': '\x0c',
            'ctrl u': '\x15',
            'ctrl k': '\x0b'
        };
        
        if (controlMap[cmd]) {
            userState.shellStream.write(controlMap[cmd]);
            await ctx.reply(`✅ Отправлено: ${cmd}`);
        } else if (cmd === 'clear') {
            await ctx.reply('🗑️ Очистка чата...');
            userState.shellStream.write('clear\n');
        } else {
            await ctx.reply('❌ Неизвестная команда\nДоступно: ctrl c, ctrl d, ctrl z, ctrl a, ctrl l, clear');
        }
    }

    async handleControlCallback(userId, data, ctx) {
        const controlChar = data.split('_')[1];
        const userState = userStates.get(userId);
        
        if (!userState || !userState.shellStream) {
            await ctx.reply('❌ Нет активного терминала');
            return;
        }
        
        const controlMap = {
            'c': '\x03',
            'd': '\x04',
            'z': '\x1a',
            'a': '\x01',
            'l': '\x0c'
        };
        
        if (controlMap[controlChar]) {
            userState.shellStream.write(controlMap[controlChar]);
            await ctx.reply(`✅ Отправлен Ctrl+${controlChar.toUpperCase()}`);
        }
    }

    async handleCommandCallback(userId, data, ctx) {
        const command = data.split('_')[1];
        const userState = userStates.get(userId);
        
        if (!userState || !userState.shellStream) {
            await ctx.reply('❌ Нет активного терминала');
            return;
        }
        
        const commandMap = {
            'ls': 'ls -la\n',
            'pwd': 'pwd\n',
            'df': 'df -h\n',
            'free': 'free -h\n',
            'top': 'top -n 1 -b\n',
            'ps': 'ps aux | head -20\n'
        };
        
        if (commandMap[command]) {
            userState.shellStream.write(commandMap[command]);
            await ctx.reply(`📤 Выполняется: ${command}`);
        }
    }

    disconnectSSH(userId) {
        const userState = userStates.get(userId);
        
        if (userState) {
            if (userState.shellStream) {
                userState.shellStream.end();
                userState.shellStream = null;
            }
            
            if (userState.sshClient) {
                userState.sshClient.end();
                userState.sshClient = null;
            }
            
            userState.currentSession = null;
            userState.currentSessionType = 'none';
            userState.isConnected = false;
        }
    }

    sendToBot(userId, message) {
        // Очищаем escape-последовательности
        const cleanMessage = cleanEscapeSequences(message);
        
        // Форматируем и отправляем
        const formattedMessage = this.formatOutput(cleanMessage);
        
        this.bot.telegram.sendMessage(userId, formattedMessage, {
            parse_mode: 'HTML',
            disable_web_page_preview: true
        }).catch(error => {
            if (error.code !== 403) { // Игнорируем ошибку "бот заблокирован"
                console.error('Ошибка отправки сообщения:', error.message);
            }
        });
    }

    formatOutput(output) {
        // Ограничиваем длину
        if (output.length > 3500) {
            output = output.substring(0, 3500) + '\n\n... (вывод обрезан)';
        }
        
        // Экранируем HTML
        output = output
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
        
        // Обрезаем лишние пустые строки
        output = output.replace(/\n{4,}/g, '\n\n');
        
        return `<pre>${output}</pre>`;
    }

    getMainKeyboard() {
        return Markup.keyboard([
            ['/sessions', '/connect'],
            ['/shell', '/status'],
            ['/help', '/disconnect'],
            ['/ping', '/botinfo']
        ]).resize();
    }

    getShellKeyboard() {
        return Markup.keyboard([
            ['::exit', '::ctrl c'],
            ['ls', 'pwd', 'df'],
            ['/status', '/disconnect']
        ]).resize();
    }
}

// Запуск бота
console.log('🚀 Запуск SSH Console Bot...');
const sshBot = new TelegramSSHBot();

// Обработка завершения работы
process.once('SIGINT', async () => {
    console.log('\n🛑 Завершение работы бота...');
    
    // Отключаем всех пользователей
    userStates.forEach((state, userId) => {
        if (state.sshClient) {
            state.sshClient.end();
        }
    });
    
    // Отправляем уведомление о выключении
    try {
        await sshBot.bot.telegram.sendMessage(
            ADMIN_ID,
            '🛑 **SSH Console Bot остановлен**\n\n' +
            '⏰ Время: ' + new Date().toLocaleString('ru-RU') + '\n' +
            '👥 Активных пользователей: ' + userStates.size,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('Не удалось отправить уведомление о выключении:', error.message);
    }
    
    await sshBot.bot.stop('SIGINT');
    console.log('✅ Бот успешно остановлен');
    process.exit(0);
});

process.once('SIGTERM', async () => {
    console.log('\n🛑 Завершение работы бота (SIGTERM)...');
    
    userStates.forEach((state, userId) => {
        if (state.sshClient) {
            state.sshClient.end();
        }
    });
    
    await sshBot.bot.stop('SIGTERM');
    process.exit(0);
});