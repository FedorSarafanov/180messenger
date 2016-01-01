(function() {

    // Baseline setup
    // ————–
    // Establish the root object, `window` in the browser, or `exports` on the server.

    var root = this;
    // console.log(typeof root);

    var magic = {};

    // Export the module object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we’re in
    // the browser, add `magic` as a global object.


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = magic;
        }
        exports.magic = magic;
    } else {
        root.magic = magic;
    }

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }


    var clock = {};
    clock.day = function() {
        return (new Date).getDate();
    }
    clock.month = function() {
        return (new Date).getMonth() + 1;
    }
    clock.year = function() {
        return (new Date).getFullYear();
    };
    clock.time = function() {
        return (new Date).toLocaleTimeString();
    }
    clock.data = function() {
        return String(clock.day() + '.' + clock.month() + '.' + clock.year());
    }

    magic.dt = clock;


    magic.fmsgmsg = "<a class='attached_tree nohover' target='_blank' href='/upload/{0}'>{0}<i class='icon-trash-empty'></i></a>";
    magic.fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";

    function safe(str) {
        return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function formatMSG(message, user, role) {

        var iconPrivate = (function() {
            if (typeof message.to !== 'undefined') {
                if (message.to != "Всем") {
                    return '<i class="icon-private"></i>'
                } else {
                    return ""
                }
            } else {
                return ""
            }
        })();

        var index = (function() {
            if (typeof message.index !== 'undefined') {
                return message.index;
            } else {
                return "0"
            }
        })();

        var id = (function() {
            if (typeof message.id !== 'undefined') {
                if (message.id != undefined) {
                    return message.id;
                } else {
                    return '';
                }
            } else {
                return "ERROR"
            }
        })();

        var shortName = (function() {
            return (safe(message.title)[0] + '.' + ' ' + safe(message.patronymic)[0] + '.' + ' ' + safe(message.family));
        })();

        var color = (function() {
            if (message.color != undefined) {
                return message.color;
            } else {
                return "";
            }
        })();

        var timeDate = (function() {
            if ((clock.year() != message.year) | (clock.day() != message.day) | (clock.month() != message.month)) {
                return message.day + '.' + message.month + '.' + message.year
            } else {
                return safe(message.time)
            }
        })();

        var attachFiles = (function() {
            if (typeof message.attach !== 'undefined') {
                var MSGattach = JSON.parse(message.attach);
                var attach = '';
                if (MSGattach.length != 0) {
                    attach += '<br>';

                    for (var i = 0; i < MSGattach.length; i++) {                    	
						attach += magic.fmsgmsg.format(MSGattach[i]);                    	
                    }

                    // _.each(MSGattach, function(file) {
                    //     attach += fmsgmsg.format(file);
                    // });
                }
                return attach;
            } else {
                return ""
            }
        })();

        var trash = (function() {
            if ((message.from == user) | (role == "администратор")  | (user == "fomin")) {
                return '<i title="Редактировать сообщение" class="icon-edit"></i><i title="Сохранить сообщение" class="icon-save"></i><i title="Удалить сообщение" class="icon-trash-empty"></i>'
            } else {
                return ""
            }
        })();


        var fromPeople = message.from;
        var textMessage = (message['message']).replace(/\n/g, '<br>');

        // {0} - icon private {1} - shortName(message) -- имя {2} - message.from {3} - time or date {4} - message {5} - attach
        // var tempMsg = '<div class="message" time="{6}" index={A} message="{8}" from="{2}">{0}<span class="user {9}">{1}</span><span class="aka"> @{2}</span> <span class="time">[{3}]</span>{7}<br>{4}{5}</div>';
        // return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, message.time, trash, message.message, color);
        // return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, message.time, trash, message.message, color).replace('index={A}','index="'+index+'"');
        var tempMsg = '<div class="msg" index={A} id={B} from="{2}">{0}<span class="user {9}">{1}</span><span class="aka"> @{2}</span> <span class="time">[{3}]</span>{7}<br>{4}{5}</div>';
        return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, message.time, trash, message.message, color).replace('index={A}', 'index="' + index + '"').replace('id={B}', 'id="' + id + '"');
    }

    magic.msg = {}

    magic.msg.format = function(message, user, role) {
        return formatMSG(message, user, role)
    }

    magic.str = {}

    magic.str.safe = function(argument) {
        return safe(argument)
    }

    magic.str.BytesToSize = function(length) {
        var i = 0,
            type = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб'];
        while ((length / 1000 | 0) && i < type.length - 1) {
            length /= 1024;
            i++;
        }
        return Math.round(length) + ' ' + type[i]; //length.toFixed(2) + ' ' + type[i];
    }

    magic.magic = function () {
    	alert(ff(2))
    }

}.call(this));
