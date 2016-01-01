var socketPort = 8008,
    webPort = 80,
    livereloadPort = 35729;

var messageBase = './json/base.json';
var cloudBase = './json/cloud.json';
var configBase = './json/config.json';
var roomsBase = './json/rooms.json';


var IOoptions = { //Настройки socket.io
    'log level': 1
};

var colors = require('colors');

colors.setTheme({
    // silly: 'rainbow',
    // input: 'grey',
    // verbose: 'cyan',
    // prompt: 'grey',
    info: 'green',
    time: 'grey',
    use: 'cyan',
    // help: 'cyan',
    warn: 'yellow',
    debug: 'blue',
    error: 'red'
});


var _ = require('./production/js/underscore-min.js'), //Underscore, известная библиотека, оптимизирующая работу с коллекциями
    crypto = require('crypto'); //MD5-хэш STRING по: crypto.createHash('md5').update(STRING).digest("hex")

var formidable = require('formidable'), //Парсинг ajax-формы с файлами
    iconv = require('iconv-lite'), //Перекодировка имен файлов в UTF-8
    fs = require('fs');


////////////////////////////////////////////////////////////////////////////////
///////////////////WEB-SERVER, LIVERELOAD, SOCKET.IO-SERVER/////////////////////
////////////////////////////////////////////////////////////////////////////////

var http = require('http'),
    express = require('express');

var socketApp = express(),
    socket_server = http.createServer(socketApp);

var io = require('socket.io').listen(socket_server, IOoptions);

socket_server.listen(socketPort); //Сервер-сокет

var siteApp = express(),
    site_server = http.createServer(siteApp);

// var livereload = require('connect-livereload'); //LiveReload, отключить на продакшне

// siteApp.use(require('connect-livereload')({
//     port: livereloadPort
// }));

site_server.listen(webPort); //Веб-сервер на неком порту

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////КОЛЛЕКЦИИ ДАННЫХ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var mysql      = require('mysql');
var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'osabio',
  password : '999',
  database : 'db'
});
 
connection.connect();

var messages = users = cloudfiles = colors = names = rooms = [];

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////ROUTES//////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

siteApp.use('/upload', express.static(__dirname + '/upload'));

//Для подключения папки с физическим адресом на виртуальный сделать:
// siteApp.use('/css',    express.static(__dirname + '/static/css'));
// siteApp.use('/font',   express.static(__dirname + '/static/font'));
// siteApp.use('/js',     express.static(__dirname + '/static/js'));
// Более простой вариант просто пробрасывает в / сайта физический адрес:
siteApp.use(express.static(__dirname + '/production'));
siteApp.use(express.static(__dirname + '/html'));

// siteApp.use(express.bodyParser());
siteApp.get('/', function(req, res) {
    res.sendFile(__dirname + '/html/departament.html');
});

// siteApp.get('/cloud.html', function(req, res) {
//     res.sendFile(__dirname + '/html/cloud.html');
// });

var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";


siteApp.engine('html', function(filePath, options, callback) { // движок

    fs.readFile(filePath, function(err, content) {

        if (err) return callback(new Error(err));

        var rendered = content.toString();

        switch (options.generate) {
            case "loremipsumdolorimet":
                {
                    rendered = rendered
                        .replace('<!-- setroom -->', '<script> sessionStorage["room"]="' + options.room + '"; </script>')
                        .replace('<!-- endscript -->', '<script>$("section").hide();$(".files").find(".attached_tree").remove();socket.emit("cloud");$("#tomsg, #closeCloud").remove();$(".files").removeClass("hidden");</script>');
                    break
                }
            case "im":
                {
                    rendered = rendered
                        .replace('<!-- setroom -->', '<script> sessionStorage["room"]="' + options.room + '"; </script>')
                        .replace('<!-- endscript -->', '<script>$("section").hide();$(".im").removeClass("hidden");</script>');
                    break
                }
            case "cloud":
                {
                    rendered = rendered
                        .replace('<!-- setroom -->', '<script> sessionStorage["room"]="' + options.room + '"; </script>')
                        .replace('<!-- endscript -->', '<script>$("section").hide();$("#tomsg, #closeCloud").remove();$(".files").removeClass("hidden");</script>')
                        .replace('<!-- files -->', genFilesList());
                    break
                }
            case "default":
                {

                    rendered = rendered
                        .replace('<!-- setroom -->', '<script> sessionStorage["room"]="' + options.room + '"; </script>');
                    break
                }
            default:
                {}
        }

        return callback(null, rendered)
    })
})

siteApp.set('views', __dirname + '/'); // Только для views directory
siteApp.set('view engine', 'html'); // зарегистрируем движок


siteApp.get('/api/get', function(req, res) {

    // console.log(req);

    var length = req.query.length;
    var room = req.query.room;
    var user = req.query.user;
    var s = req.query.s;
    // readBase(); //В случае некорректной работы раскомментировать
    res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Encoding": "utf8"
    });

    var counter = 0;

    for (var i = s - 1; i >= 0; i--) {
        // if ((messages[i].day >= clock.day() - length) & (messages[i].month == clock.month()) & (messages[i].year == clock.year())) {
        if (counter <= 10) {
            if (messages[i].room == room) {
                if (JSON.stringify(_.findWhere(messages, {
                        "room": room
                    })) == JSON.stringify(messages[i])) {
                    // console.log(logTime()+'Отослано последнее сообщение');
                    // client.emit('lockBottom');
                }
                // client.emit('message', messages[i], false);
                // str+=formatMSG(messages[i], );
                messages[i].index = i;
                counter++;
                res.write(formatMSG(messages[i], user));
            }
        }
    }
    res.end();
})

siteApp.get('/api/users', function(req, res) {

    var user = req.query.user;

    res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Encoding": "utf8"
    });

    if (names[user].role == "администратор") {

        try {
            var usersArray = [];

            for (var i = 0; i < users.length; i++) {
                // console.log(users[i]);
                usersArray.push({
                    title: nick2fio(users[i]),
                    role: names[users[i]].role,
                    from: users[i]
                })
            }
            res.write(JSON.stringify(usersArray));

        } catch (e) {
            console.log(logTime() + e);
        }
        
        // res.write(JSON.stringify(rooms));

    } else {
        res.write('no auth');
    }
    res.end();
})

siteApp.get('/api/allrooms', function(req, res) {

    var user = req.query.user;

    res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Encoding": "utf8"
    });

    if (names[user].role == "администратор") {
        res.write(JSON.stringify(rooms));
    } else {
        res.write('no auth');
    }


    res.end();
})

siteApp.get('/api/rooms', function(req, res) {
    try {
        var user = req.query.user;

        res.writeHead(200, {
            "Content-Type": "text/plain",
            "Content-Encoding": "utf8"
        });

        _.each(rooms, function(room, id) {

            var emptyFor = (JSON.stringify(room['for']) == "[]");
            var emptyForgroup = (JSON.stringify(room['forgroup']) == "[]");

            function writeRES() {
                res.write('<a class="room" href="/{0}" room="{0}">{1}</a>\n'.format(id, room.title));
            }

            if (emptyFor) {
                if (_.contains(room['forgroup'], names[user].role)) {
                    writeRES();
                }
                if (emptyForgroup) {
                    writeRES();
                }

            } else {
                if (_.contains(room['for'], user)) {
                    writeRES();
                }
            }

        });

        res.end();
    } catch (e) {
        console.log(logTime() + e);
    }
})

siteApp.get('/:room', function(req, res) {

    switch (req.params.room) {
        case "im":
            {
                res.render('./html/departament', {
                    "generate": "im",
                    "room": req.params.room
                });
                break
            }
        case "cloud":
            {
                res.render('./html/departament', {
                    "generate": "cloud",
                    "room": req.params.room
                });
                break
            }
        case "admineditableonlyforadmin":
            {
                res.sendFile(__dirname + '/html//admin.html');
                break
            }
        case "cpanel":
            {
                res.sendFile(__dirname + '/html//cpanel.html');
                break
            }
        case "exit":
            {
                writeBase();
                writeCloud();
                writeSettings();
                console.log(logTime() + "Завершение работы");
                res.sendFile(__dirname + '/html//exit.html');
                break
            }
        case "roomseditableonlyforadmin":
            {
                res.sendFile(__dirname + '/html//rooms.html');
                break
            }
        default:
            {
                res.render('./html/departament', {
                    "generate": "default",
                    "room": req.params.room
                });
            }
    }
})

siteApp.post('/api/upload', function(req, res) {

    var form = new formidable.IncomingForm();

    form.uploadDir = __dirname + '/upload/';
    form.encoding = 'binary';

    var file = new Object;


    //TODO: Может ли быть такое, что parse выполниться позже end? 
    //Если это произойдет, то будет критическая ошибка с вылетом базы cloud.JSON,
    //которую придется править вручную.

    //ПРОВЕРЕНО:
    //Экспериментально, даже для файла с размером 0 бит и при одинаковом времени:
    //console.log(logTime()+'parse-'+new Date().getTime());
    //порядок выполнения кода и порядок функций parse, end совпадают.
    //TODO - ВЫПОЛНЕНО

    form.parse(req, function(err, fields, files) { //При присылке формы распасим её
        try {
            file.desc = fields.desc;
            file.size = fields.size;
            file.from = fields.from;
            file.file = files.files.name;
            file.path = files.files.path;
            file.data = fields.data;

            var buff = new Buffer(file.file, 'binary');
            file.file = iconv.decode(buff, 'utf8'); //Сразу в UTF-8 перегоним имя файла


            while (fs.existsSync(form.uploadDir + file.file)) {
                file.file = '_' + file.file;
            }
            //Костыль с переименованием файла.
            //TODO: придумать более элегантное версионирование, напр. по дате/времени.
        } catch (e) {
            console.log(logTime() + e);
        }
    });

    form.on('end', function() { //Событие по завершении загрузки

        try {
            console.log(file.path);
            console.log(form.uploadDir + file.file);
            fs.rename(file.path, form.uploadDir + file.file, function(err) {
                if (err) console.log(logTime() + 'ERROR: ' + err);
            });

            console.log(logTime() + "Загружен файл " + file.file.use + " в папку " + String(form.uploadDir).use + "пользователем " + file.from.info);

            var afile = {
                file: file.file,
                desc: file.desc,
                size: file.size,
                from: file.from,
                data: file.data
            }

            res.end(JSON.stringify(afile)); //Отправим на клиента ответ о загрузке файла
            cloudfiles.push(afile); //Добавим в коллекцию файл
            writeCloud(); //Запишем коллекцию на HDD

        } catch (e) {
            console.log(logTime() + " ERROR END " + e);
            //Тут должен быть какой-то client.emit, чтобы пользователь знал о ошибке,
            // а не ждал загрузки файла, хотя он уже не загружается из-за сбоя сервера.
        }
    });

});


////////////////////////////////////////////////////////////////////////////////
////////////////////////////ФУНКЦИИ, УЛУЧШАЮЩИЕ КОД/////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function md5(name) {
    return crypto.createHash('md5').update(name).digest("hex");
}

function nick2fio(nick) {
    return names[nick]["фамилия"] + ' ' + names[nick]["имя"][0] + '. ' + names[nick]["отчество"][0] + '.';
}

// Функция для форматирования вида "{0} and {1}".format("drink","drive") ==> "drink and drive"
if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}

var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";
var fmsgmsg = "<a class='attached_tree nohover' target='_blank' href='/upload/{0}'>{0}<i class='icon-trash-empty'></i></a>";


function formatMSG(msg, user) {

    var iconPrivate = (function() {
        if (msg.to != "Всем") {
            return '<i class="icon-private"></i>'
        } else {
            return ""
        }
    })();

    var index = (function() {
        return msg.index;
    })();

    var id = (function() {
        if (msg.id != undefined) {
            return msg.id;
        } else {
            return '';
        }
    })();

    var shortName = (function() {
        return (safe(msg.title)[0] + '.' + ' ' + safe(msg.patronymic)[0] + '.' + ' ' + safe(msg.family));
    })();

    var color = (function() {
        if (msg.color != undefined) {
            return msg.color;
        } else {
            return "";
        }
    })();

    var timeDate = (function() {
        if ((clock.year() != msg.year) | (clock.day() != msg.day) | (clock.month() != msg.month)) {
            return msg.day + '.' + msg.month + '.' + msg.year
        } else {
            return safe(msg.time)
        }
    })();

    var attachFiles = (function() {
        var attach = '';
        if (msg.attach.length != 0) {
            attach += '<br>';
            _.each(msg.attach, function(file) {
                attach += fmsgmsg.format(file);
            });
        }
        return attach;
    })();

    var trash = (function() {
        if ((msg.from == user) | (user == "admin")) {
            return '<i title="Редактировать сообщение" class="icon-edit"></i><i title="Сохранить сообщение" class="icon-save"></i><i title="Удалить сообщение" class="icon-trash-empty"></i>'
        } else {
            return ""
        }
    })();

    var fromPeople = msg.from;

    var textMessage = msg.message.replace(/\n/g, '<br>');

    // {0} - icon private {1} - shortName(msg) -- имя {2} - msg.from {3} - time or date {4} - message {5} - attach
    // var tempMsg = '<div class="msg" time="{6}" index={A} msg="{8}" from="{2}">{0}<span class="user {9}">{1}</span><span class="aka"> @{2}</span> <span class="time">[{3}]</span>{7}<br>{4}{5}</div>';
    // return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, msg.time, trash, msg.message, color);
    // return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, msg.time, trash, msg.message, color).replace('index={A}','index="'+index+'"');
    var tempMsg = '<div class="msg" index={A} id={B} from="{2}">{0}<span class="user {9}">{1}</span><span class="aka"> @{2}</span> <span class="time">[{3}]</span>{7}<br>{4}{5}</div>';
    return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, msg.time, trash, msg.message, color).replace('index={A}', 'index="' + index + '"').replace('id={B}', 'id="' + id + '"');
}

function formatSize(length) {
    var i = 0,
        type = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб'];
    while ((length / 1000 | 0) && i < type.length - 1) {
        length /= 1024;
        i++;
    }
    return Math.round(length) + ' ' + type[i]; //length.toFixed(2) + ' ' + type[i];
}

var clock = new Object;
clock.day = function() {
    return (new Date).getDate();
};
clock.month = function() {
    return (new Date).getMonth() + 1;
};
clock.year = function() {
    return (new Date).getFullYear();
};
clock.time = function() {
    return (new Date).toLocaleTimeString();
};
clock.data = function() {
    return String(clock.day() + '.' + clock.month() + '.' + clock.year());
};

function logTime() {
    return '[' + String(clock.data() + '--' + clock.time()).time + '] ';
}

function genFilesList() {
    var d = cloudfiles.length;
    var result = '';
    for (var i = d - 1; i >= 0; i--) {
        var data = cloudfiles[i];
        result += fmsg.format(data.file, data.file, data.from, data.data, formatSize(data.size)) + '\n';
    }
    return result;
}


function safe(str) {
    return _.escape(str);
}

////////////////////////////////////////////////////////////////////////////////
////////////////////////////ФУНКЦИИ СБРОСА НА HDD///////////////////////////////
////////////////////////////////////////////////////////////////////////////////

function writeBase() {
    fs.writeFile(messageBase, JSON.stringify(messages, null, 4), function(err) {
        if (err) {
            console.log(logTime() + err);
        }
    })
}

function ID() {
    return String(md5(String(Math.random() + Math.random() + Math.random() + Math.random())));
}

function readBase() {
    messages = [];
    var contents = fs.readFileSync(messageBase);
    messages = JSON.parse(contents);
}

function IDDD() {
    for (var i = 0; i < messages.length; i++) {
        messages[i].id = ID();
    };
    writeBase();
}


function readCloud() {
    cloudfiles = [];
    var cloudBaseStr = fs.readFileSync(cloudBase);
    cloudJSON = JSON.parse(cloudBaseStr);
    _.each(cloudJSON, function(content, number) {
        cloudfiles.push(content);
    });
}

function writeCloud() {
    fs.writeFile(cloudBase, JSON.stringify(cloudfiles, null, 4), function(err) {
        if (err) {
            console.log(logTime() + err);
        }
    })
}

function readSettings() {
    settings = users = names = colors = [];

    var contents = fs.readFileSync(configBase);
    settings = JSON.parse(contents);

    colors = settings[1];
    _.each(settings[0], function(num, key) {
        users.push(key);
        names[key] = num;
    });

    rooms = settings[2];
}

function writeSettings() {
    fs.writeFile(configBase, JSON.stringify(settings, null, 4), function(err) {
        if (err) {
            console.log(logTime() + err);
        }
    })
}

////////////////////////////////////////////////////////////////////////////////
/////////////////////////ПРИ ЗАПУСКЕ ПРОЧТЕМ ВСЕ ИЗ ФАЙЛА///////////////////////
////////////////////////////////////////////////////////////////////////////////

readBase();
// IDDD();
readSettings();
readCloud();


console.log(logTime() + "Запущен сервер".info);

////////////////////////////////////////////////////////////////////////////////
/////////////////////////////РАБОТА С КЛИЕНТАМИ/////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

io.sockets.on('connection', function(client) { //Всего 10 обработчиков

    var id = client.id;

    var ip = client.request.connection.remoteAddress;
    //Осторожно: это получение неоднократно менялось при обновлении node.js.

    if (1 != 1) {
        //Проверка на конец света, в положительном случае отключим клиента, чтобы не засорять
        //чистый пространственно-временной континиум какими-то левыми HTTP-сокет-пакетами.
        console.log(logTime() + 'Ошибка №42');
        client.disconnect();
    };

    client.on('verification', function(data) {
        //Верефикация login&pass. 
        //TODO: Приписывать client.id верефикационные данные, 
        //чтобы не костылить с небезопасной проверкой по имени залогиненного пользователя на клиента.
        try {
            console.log(logTime() + 'Попытка входа с IP ' + ip + ', ID ' + id + ' под данными: md5(pass)=' + data["pass"] + ', login=' + data["from"]);
            if (names[data["from"]] != undefined) {
                if (md5(names[data["from"]]["pass"]) != data["pass"]) {
                    client.emit('failed-pass');
                    console.log(logTime() + 'Неверный пароль. Не аутенфицирован.'.warn);
                } else {
                    client.emit('success');
                    console.log(logTime() + 'Успешная аутенфикация'.info);
                }
            } else {
                client.emit('failed-login');
                console.log(logTime() + 'Неверное имя пользователя. Не аутенфицирован.'.warn);
            }
        } catch (e) {
            console.log(logTime() + e);
        }
    });


    client.on('message', function(message) {
        //Событие   п р и ш е д ш е г о   сообщения.
        //Данные сообщения детализируются по времени сервера. 
        //!: это не допустит ошибок с некорректным временем на client's computer.
        try {

            message.time = clock.time();
            message.day = clock.day();
            message.month = clock.month();
            message.year = clock.year();
            message.ip = ip;
            message.color = names[message.from]["role"];

            message.family = names[message.from]["фамилия"]; // Фамилия отправителя
            message.title = names[message.from]["имя"]; // Имя отправителя
            message.patronymic = names[message.from]["отчество"]; // Отчество отправителя
            var temp = "insert into `messages` (`message`, `from`, `room`, `attach`, `to`, `id`, `time`, `day`, `month`, `year`, `ip`, `color`, `family`, `title`, `patronymic`) values('<%= message %>', '<%= from %>', '<%= room %>', '<%= attach %>', '<%= to %>', '<%= id %>', '<%= time %>', '<%= day %>', '<%= month %>', '<%= year %>', '<%= ip %>', '<%= color %>', '<%= family %>', '<%= title %>', '<%= patronymic %>')";
            
            var compiled=_.template(temp);
            var str = compiled({
                    message: message.message,
                    from: message.from,
                    room: message.room,
                    attach: message.attach,
                    to: message.to,
                    id: message.id,
                    time: message.time,
                    day: message.day,
                    month: message.month,
                    year: message.year,
                    ip: message.ip,
                    color: message.color,
                    family: message.family,
                    title: message.title,
                    patronymic: message.patronymic
                });
            // console.log(str);
            connection.query(str);
            // messages.push(message);

            //Записать базу, добавив сообщение
            //TODO: писать базу только при завершении сервера или по таймеру.
            //Кстати, именно этим объясняется неповоротливость на 100'000 сообщений
            // writeBase();

            client.emit('message', message, true); //Отправить отправившему запрос
            client.broadcast.emit('message', message, true); //Отправить всем клиентам сообщение
        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('dialog', function(length, room, bottom) {
        try {

            // readBase(); //В случае некорректной работы раскомментировать
            // console.log(length, room, bottom);
            var c = 1;
            for (var i = messages.length - 1; i >= 0; i--) {
                // if ((messages[i].day >= clock.day() - length) & (messages[i].month == clock.month()) & (messages[i].year == clock.year())) {
                if (c <= 10) {
                    if (messages[i].room == room) {
                        if (JSON.stringify(_.findWhere(messages, {
                                "room": room
                            })) == JSON.stringify(messages[i])) {
                            // console.log(logTime()+'Отослано последнее сообщение');
                            client.emit('lockBottom');
                        }
                        messages[i].index = i;
                        c++;
                        client.emit('message-dialog', messages[i], false);
                        if (bottom) {
                            client.emit('scrollBottom')
                        }
                    }
                } else {
                    if (bottom) {
                        client.emit('scrollBottom')
                    }
                    break;
                }
            }
        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('dialog-old', function(length, room, bottom) {
        try {

            // readBase(); //В случае некорректной работы раскомментировать
            var counter = 0;
            for (var i = messages.length - 1; i >= 0; i--) {
                // if (counter<=length) {
                if ((messages[i].room == room) & (counter < length)) {
                    counter += 1;
                    console.log(counter);
                    // if (JSON.stringify(_.findWhere(messages, {
                    //         "room": room
                    //     })) == JSON.stringify(messages[i])) {
                    //     // console.log(logTime()+'Отослано последнее сообщение');
                    //     client.emit('lockBottom');
                    // }
                    client.emit('message-dialog', messages[i], false);
                    // if (bottom) {
                    //     client.emit('scrollBottom')
                    // }
                }
                // } else {
                //     if (bottom) {
                //         client.emit('scrollBottom')

                //     }
                //     break;
                // }
            }
        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('removeMsg', function(id) {
        try {
            messages = _.compact(_.without(messages, _.findWhere(messages, {
                id: id
                    // "time": time,
                    // "from": from
            })));

            client.broadcast.emit('removeMsg', id);
            writeBase(); //Записать базу, удалив сообщение.
            //TODO: писать базу только при завершении сервера или по таймеру.

        } catch (e) {
            console.log(logTime() + e);
        }
    })

    client.on('removeFile', function(file) {
        try {
            console.log(logTime() + "Удален файл " + file + " из папки '" + __dirname + "/upload/'");

            cloudfiles = _.compact(_.without(cloudfiles, _.findWhere(cloudfiles, {
                "file": file
            })));

            fs.rename(__dirname + '/upload/' + file, __dirname + '/upload/deleted/' + file, function(err) {
                if (err) console.log(logTime() + 'ERROR: ' + err);
            });

            writeCloud();

        } catch (e) {
            console.log(logTime() + e);
        }
    })


    client.on('cloud', function(length) {
        try {

            cloudfiles = [];
            readCloud();
            var d = cloudfiles.length;
            for (var i = 0; i <= d - 1; i++) {
                // console.log(logTime()+cloudfiles[i]);
                // if ((messages[i].day>=(new Date).getDate()-length)&(messages[i].month==(new Date).getMonth()+1)&(messages[i].year==(new Date).getFullYear())){
                client.emit('file_to_cloud', cloudfiles[i]);
                // }
            };

        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('get_users', function() {
        try {
            var usersArray = [];
            // console.log(users);
            for (var i = 0; i < users.length; i++) {
                // console.log(users[i]);
                usersArray.push({
                    title: nick2fio(users[i]),
                    from: users[i]
                });
            };
            client.emit('add_users', usersArray);

        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('get_users_table', function(user) { //Выполним только если у user есть админская группа
        try {
            console.log(logTime() + 'Запрос таблицы пользователей с IP ' + ip + ', ID ' + id + ' пользователем ' + user);
            if (names[user].role == "администратор") {
                client.emit('set_users_table', settings[0]);
            } else {
                client.emit('failed_get_userstable');                
                // client.disconnect();
            }
        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('write_users_table', function(usersArr) {
        try {
            console.log(logTime() + 'Запрос записи таблицы пользователей с IP ' + ip + ', ID ' + id);
            settings[0] = usersArr;
            writeSettings();

            users = [];
            names = [];

            _.each(settings[0], function(num, key) {
                users.push(key);
                names[key] = num;
            });

        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('save_rooms', function(data) {
        rooms = data;
        settings[2] = data;
        writeSettings();
    });

    client.on('editMsg', function(src, time, from, out) {
        try {
            //Найдем первое вхождение такого сообщения с конца,
            //для экономии памяти
            var index = _.findLastIndex(messages, {
                from: from,
                time: time,
                message: src
            });

            messages[index].message = out;

            //Записать базу, добавив сообщение 
            //TODO: писать базу только при завершении сервера или по таймеру.
            writeBase();
        } catch (e) {
            console.log(logTime() + e);
        }
    });


    client.on("error", function(err) { //Пока эта функция не нужна, но в будущем, возможно, понадобится
        try {
            console.log(logTime() + "Универсальный обработчик ошибки вернул: " + err);
        } catch (e) {
            console.log(logTime() + "Ошибка при выводе ошибки! Что-то несусветное.");
        }
    });

});
