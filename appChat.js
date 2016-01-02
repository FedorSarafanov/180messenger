var magic = require('./production/js/magic.js');

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
    silly: 'rainbow',
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

var bodyParser = require("body-parser");

//Here we are configuring express to use body-parser as middle-ware.
siteApp.use(bodyParser.urlencoded({
    extended: false
}));
siteApp.use(bodyParser.json());

// var livereload = require('connect-livereload'); //LiveReload, отключить на продакшне

// siteApp.use(require('connect-livereload')({
//     port: livereloadPort
// }));

site_server.listen(webPort); //Веб-сервер на неком порту

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////КОЛЛЕКЦИИ ДАННЫХ////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

var mysql = require('mysql');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'osabio',
    password: '999',
    database: 'db'
});

connection.connect();

var messages = users = cloudfiles = colors = names = rooms = [];

////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////ROUTES//////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////

siteApp.use('/upload', express.static(__dirname + '/upload'));
siteApp.use('/img', express.static(__dirname + '/img'));

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

var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";


siteApp.engine('html', function(filePath, options, callback) { // движок

    fs.readFile(filePath, function(err, content) {

        if (err) return callback(new Error(err));

        var rendered = content.toString();

        switch (options.generate) {
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
    var coff = req.query.coff;
    var room = req.query.room;
    var user = req.query.user;

    res.writeHead(200, {
        "Content-Type": "text/html",
        "Content-Encoding": "utf8"
    })

    var i = 0;

    connection.query('SELECT * from `messages` WHERE room="' + room + '" ORDER BY `num` DESC LIMIT ' + coff * 10 + ',10', function(err, rows, fields) {
        _.each(rows, function(message, idx) {
            i++;
            res.write(magic.msg.format(message, user, names[user].role));
        })
        if (i == 0) {
            res.write('END');
        }
        res.end()
    })
})

siteApp.get('/api/users', function(req, res) {

    var user = req.query.user;

    // console.log(logTime()+"Произведена успешная попытка загрузки таблицы пользователей (без паролей) с IP "+String(req.headers.host).use+" пользователем "+user.use);

    res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Encoding": "utf8"
    });

    try {
        var usersArray = [];

        for (var i = 0; i < users.length; i++) {
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
    res.end();
})

siteApp.get('/api/auth', function(req, res) {

    var user = String(req.query.from);
    var pass = String(req.query.pass);
    var ip = String(req.headers.host);

    // console.log(logTime()+"Произведена успешная попытка загрузки таблицы пользователей (без паролей) с IP "+.use+" пользователем "+user.use);

    res.writeHead(200, {
        "Content-Type": "text/plain",
        "Content-Encoding": "utf8"
    });


    try {
        console.log(logTime() + 'Попытка входа с IP ' + ip.use + ' под данными: md5(pass)=' + pass.use + ', login=' + user.use);
        if (names[user] != undefined) {
            if (md5(names[user]["pass"]) != pass) {
                res.write('failed-pass')
                console.log(logTime() + 'Неверный пароль. Не аутенфицирован.'.warn);
            } else {
                res.write('success')
                console.log(logTime() + 'Успешная аутенфикация'.info);
            }
        } else {
            res.write('failed-login')
            console.log(logTime() + 'Неверное имя пользователя. Не аутенфицирован.'.warn);
        }
    } catch (e) {
        console.log(logTime() + e);
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

        if (names[user].role == "администратор") {
            res.write('<a class="room" style="text-align: center" href="/cpanel"><i class="i-config"></i> Панель управления</a>\n');
        }
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

function logTime() {
    return '[' + String(magic.dt.data() + '--' + magic.dt.time()).time + '] ';
}

var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";

function genFilesList() {
    var d = cloudfiles.length;
    var result = '';
    for (var i = d - 1; i >= 0; i--) {
        var data = cloudfiles[i];
        result += fmsg.format(data.file, data.file, data.from, data.data, magic.str.BytesToSize(data.size)) + '\n';
    }
    return result;
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

// readBase();
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


    client.on('message', function(message) {
        //Событие   п р и ш е д ш е г о   сообщения.
        //Данные сообщения детализируются по времени сервера. 
        //!: это не допустит ошибок с некорректным временем на client's computer.
        try {

            message.time = magic.dt.time();
            message.day = magic.dt.day();
            message.month = magic.dt.month();
            message.year = magic.dt.year();
            message.ip = ip;
            message.attach = JSON.stringify(message.attach);
            message.color = names[message.from]["role"];

            message.family = names[message.from]["фамилия"]; // Фамилия отправителя
            message.title = names[message.from]["имя"]; // Имя отправителя
            message.patronymic = names[message.from]["отчество"]; // Отчество отправителя
            var temp = "insert into `messages` (`message`, `from`, `room`, `attach`, `to`, `id`, `time`, `day`, `month`, `year`, `ip`, `color`, `family`, `title`, `patronymic`) values('<%= message %>', '<%= from %>', '<%= room %>', '<%= attach %>', '<%= to %>', '<%= id %>', '<%= time %>', '<%= day %>', '<%= month %>', '<%= year %>', '<%= ip %>', '<%= color %>', '<%= family %>', '<%= title %>', '<%= patronymic %>')";

            var compiled = _.template(temp);
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
            connection.query(str);


            client.emit('message', message, true); //Отправить отправившему запрос
            client.broadcast.emit('message', message, true); //Отправить всем клиентам ,кроме отправившего, сообщение
        } catch (e) {
            console.log(logTime() + e);
        }
    });

    client.on('removeMsg', function(id) {
        try {

            connection.query('DELETE FROM `messages` WHERE id="' + id + '"');
            client.broadcast.emit('removeMsg', id);

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


    client.on('get_users_table', function(user) { //Выполним только если у user есть админская группа
        try {
            console.log(logTime() + 'Произведена успешная попытка загрузки управления пользователями с IP ' + ip.use + ' пользователем ' + user.use);
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
            console.log(logTime() + 'Произведена успешная попытка изменения таблицы пользователей с IP ' + ip.use);
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

    client.on('editMsg', function(id, out) {
        try {

            connection.query('UPDATE `messages` SET message="' + out + '" WHERE id="' + id + '"');

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
