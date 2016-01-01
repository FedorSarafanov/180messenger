var messageBase = './json/base.json';
var _ = require('./production/js/underscore-min.js'); //Underscore, известная библиотека, оптимизирующая работу с коллекциями


var mysql = require('mysql');
var fs = require('fs');
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'osabio',
    password: '999',
    database: 'db'
});

connection.connect();

var messages = [];
var contents = fs.readFileSync(messageBase);
messages = JSON.parse(contents);

var temp = "insert into `messages` (`message`, `from`, `room`, `attach`, `to`, `id`, `time`, `day`, `month`, `year`, `ip`, `color`, `family`, `title`, `patronymic`) values('<%= message %>', '<%= from %>', '<%= room %>', '<%= attach %>', '<%= to %>', '<%= id %>', '<%= time %>', '<%= day %>', '<%= month %>', '<%= year %>', '<%= ip %>', '<%= color %>', '<%= family %>', '<%= title %>', '<%= patronymic %>')";

var compiled = _.template(temp);

_.each(messages, function(message, key) {

    var str = compiled({
        message: message.message,
        from: message.from,
        room: message.room,
        attach: JSON.stringify(message.attach),
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
});

// var  crypto = require('crypto');

// function rand () {
//     return crypto.createHash('md5').update(String(Math.random()+Math.random())).digest("hex");
// }

// var clock = new Object;
// clock.day = function() {
//     return (new Date).getDate();
// };
// clock.month = function() {
//     return (new Date).getMonth() + 1;
// };
// clock.year = function() {
//     return (new Date).getFullYear();
// };
// clock.time = function() {
//     return (new Date).toLocaleTimeString();
// };
// clock.data = function() {
//     return String(clock.day() + '.' + clock.month() + '.' + clock.year());
// };

// for (var i = 0; i < 100000; i++) {
//     var str = compiled({
//         message: rand(),
//         from: 'fomin',
//         room: 'all',
//         attach: '[]',
//         to: 'Всем',
//         id: rand(),
//         time: clock.time(),
//         day: clock.day(),
//         month: clock.month(),
//         year: clock.year(),
//         ip: '127.0.0.1',
//         color: "admin",
//         family: rand(),
//         title: rand(),
//         patronymic: rand()
//     });

//     connection.query(str);    
// };

// for (var i = 0; i < 500000; i++) {
//     var str = compiled({
//         message: rand(),
//         from: 'admin',
//         room: 'site',
//         attach: '[]',
//         to: 'Всем',
//         id: rand(),
//         time: clock.time(),
//         day: clock.day(),
//         month: clock.month(),
//         year: clock.year(),
//         ip: '127.0.0.1',
//         color: "admin",
//         family: rand(),
//         title: rand(),
//         patronymic: rand()
//     });

//     connection.query(str);    
// };

console.log('Finish!');