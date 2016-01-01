(function functions() {


var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";
var fmsgmsg = "<a class='attached_tree nohover' target='_blank' href='/upload/{0}'>{0}<i class='icon-trash-empty'></i></a>";
 
var _ = require('./underscore-min.js');

module.exports.safe = function safe(str) {
    return _.escape(str);
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

module.exports.formatMSG = function formatMSG(msg, user) {

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
        return (module.exports.safe(msg.title)[0] + '.' + ' ' + module.exports.safe(msg.patronymic)[0] + '.' + ' ' + module.exports.safe(msg.family));
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
            return module.exports.safe(msg.time)
        }
    })();

    var attachFiles = (function() {
        var MSGattach = JSON.parse(msg.attach);
        var attach = '';
        if (MSGattach.length != 0) {
            attach += '<br>';
            _.each(MSGattach, function(file) {
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

}).call(this);