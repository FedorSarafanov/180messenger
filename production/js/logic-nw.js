"use strict";

function loade(user, room, length) {
    $.get(
        "/upload/get", {
            user: user,
            room: room,
            length: length,
        },
        APP
    )
    return true;
}


function APP(data) {
    // $('body').append($(data));
    console.log($(data));
    $('article').append($(data));
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

function modal(textq, yes, no, cbYes, cbNo, type) {
    var question = '<div class="layq">' +
        '<div class="center">' +
        '<div class="warning">{0}</div>' +
        '<div class="buttons">' +
        '<button class="warn" id="yes">{1}</button>' +
        '<button class="norm" id="cancel">{2}</button>' +
        '</div>' +
        '</div>' +
        '</div>';
    if (type == "error") {
        $('body').append(question.format(textq, yes, no)).find('.center').addClass('bshdw-error');
    } else {
        $('body').append(question.format(textq, yes, no)).find('.center').addClass('bshdw-norm');
    }


    $('.layq #yes').click(function() {
        cbYes();
        $('.layq').remove();
    });

    $('.layq #cancel').click(function() {
        cbNo();
        $('.layq').remove();
    });
};

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

function dia(from, to) {
    return CryptoJS.MD5([from, to].sort().join(""));
}

var login = new Object;
login.isLogin = function() {
    if (sessionStorage["loginde"] == "failed") {
        return false
    }
    if (sessionStorage["loginde"] == undefined) {
        return false
    }
    if (sessionStorage["loginde"] == "success") {
        return true
    }
}

function reloadPage() {
    window.location.hostname = window.location.hostname;
}

function scrollToDiv(element) {
    // var navheight = element.height();
    var offset = element.offset();
    // var offsetTop = offset.top;
    // var totalScroll = offsetTop - navheight;

    $('body,html').animate({
        scrollTop: offset
    }, 0);
}


function safe(str) {
    return _.escape(str);
}

function shortName(msg) {
    return safe(msg.title)[0] + '.' + ' ' + safe(msg.patronymic)[0] + '.' + ' ' + safe(msg.family);
}

var gui = require('nw.gui'); //or global.window.nwDispatcher.requireNwGui()

// Get the current window
var win = gui.Window.get();
var tray;

// var mainWindow = global.mainWindow;
// var GUI        = global.gui;

win.on('close', function() {
    this.hide(); // Pretend to be closed already
    console.log("We're closing...");
    this.close(true);
});

sessionStorage["loginde"] = "success";
sessionStorage["room"] = "all";
sessionStorage["from"] = "osabio";
sessionStorage["pass"] = "765ba18edd2844db2db95fba25d2f3e7";

var tray_menu = new gui.Menu();
// var win_menu = new gui.Menu({ 'type': 'menubar' });

tray_menu.append(new gui.MenuItem({
    label: 'Закрыть приложение'
}));
tray_menu.append(new gui.MenuItem({
    label: 'Открыть окно'
}));
tray_menu.append(new gui.MenuItem({
    type: 'separator'
}));
tray_menu.append(new gui.MenuItem({
    label: 'Настройки'
}));

tray_menu.items[0].click = function() {
    killApp();
}

tray_menu.items[1].click = function() {
    win.show();
    tray.remove();
    tray = null;
}

function killApp() {
    win.close();
    gui.App.quit();
}

win.on('unmaximize', function() {
    currWinMode = 'float';
});

win.on('maximize', function() {
    currWinMode = 'max';
});

win.on('minimize', function() {
    currWinMode = 'min';
    // Hide window
    this.hide();

    // Show tray
    tray = new gui.Tray({
        tooltip: 'Лицейский мессенджер',
        icon: 'favicon.png',
        menu: tray_menu
    });

    // Show window and remove tray when clicked
    tray.on('click', function() {
        win.show();
        this.remove();
        tray = null;
    });
});

// var notify = gui.Window.open('notify.html', {
//     // position: 'center',
//     right: 0,
//     bottom: 0,
//     width: 600,
//     height: 200,
//     toolbar: false,
//     frame: false,
//     resizable: false,
//     show: false,
//     // "show_in_taskbar" : false
// });

// function notifyMe() {
//   if (Notification.permission !== "granted")
//     Notification.requestPermission();
//   else {
//     var notification = new Notification('Notification title', {
//       icon: 'http://cdn.sstatic.net/stackexchange/img/logos/so/so-icon.png',
//       body: "Hey there! You've been notified!",
//     });

//     notification.onclick = function () {
//       console.log('____________ashafjkgak');
//       win.open("http://stackoverflow.com/a/13328397/1269037");      
//     };

//   }

// }

// notifyMe();

// notify.setAlwaysOnTop(true);
// notify.moveTo(window.screen.availWidth - 600, 40);
// notify.show();
// notify.setShowInTaskbar(false);

// Create a tray icon
// var tray = new gui.Tray({ title: 'Tray', icon: 'img/icon.png' });

// Give it a menu
// var menu = new gui.Menu();
// menu.append(new gui.MenuItem({ type: 'checkbox', label: 'box1' }));
// tray.menu = menu;


var nwNotify = require('nw-notify');

var currWinMode = 'float';

// Change config options

nwNotify.setConfig({
    // appIcon: nwNotify.getAppPath() + 'img/max.png',
    displayTime: -1,
    defaultStyleContainer: {
        backgroundColor: '#333333',
        overflow: 'hidden',
        padding: 8,
        border: '1px solid #CCC',
        fontFamily: 'Arial',
        fontSize: 18,
        position: 'relative',
        lineHeight: '15px'
    }
});

var gulp = require('gulp');
gulp.task('reloading', function() {
    if (location) {
        location.reload();
    }
});

gulp.watch(['/home/osabio/CHAT-R/production/js/*.js', '/home/osabio/CHAT-R/production/css/*.css', '/home/osabio/CHAT-R/html/main.html'], ['reloading']);

// win.toggleKioskMode(); 
win.setShowInTaskbar(false);
// Send simple notification
// nwNotify.notify('Some title', 'Some text');

$(document).ready(function() {

    $('#d180').on('click', function(event) {
        $('nav').toggleClass('menur');
    });

    $('#run').on('click', function(event) {
        $('.run').toggleClass('hidden');
    });    

    // ###   #   #   ###   #####   ###     #    #       ###    ###     #    #####   ###    ###   #   # 
    //  #    #   #    #      #      #     # #   #        #    #   #   # #     #      #    #   #  #   # 
    //  #    ##  #    #      #      #    #   #  #        #    #      #   #    #      #    #   #  ##  # 
    //  #    # # #    #      #      #    #   #  #        #     ###   #   #    #      #    #   #  # # # 
    //  #    #  ##    #      #      #    #####  #        #        #  #####    #      #    #   #  #  ## 
    //  #    #   #    #      #      #    #   #  #        #    #   #  #   #    #      #    #   #  #   # 
    // ###   #   #   ###     #     ###   #   #  #####   ###    ###   #   #    #     ###    ###   #   # 



    var socket = io.connect('http://' + '127.0.0.1' + ':' + '8008');
    // var socket = io.connect('http://' + '192.168.1.120' + ':' + '8008');

    if (sessionStorage["room"] == undefined) {
        sessionStorage["room"] = "all"
    }

    var users = [];
    var to = "Всем"
    var attached = [];

    var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";
    var fmsgmsg = "<a class='attached_tree nohover' target='_blank' href='/upload/{0}'>{0}<i class='icon-trash-empty'></i></a>";

    var down = 7; //Определяет, на сколько дней назад будут прогружаться сообщения

    var $messages = $("#messages");
    var $laypass = $('.laypass');
    var $message_txt = $("#message_text")
    var $logout = $('#logout');
    var $komu = $("#to");
    var $body = $(document.body);
    var $inp = $(".file_upload").find("input");

    session();
    gui.Window.get().show();

    if (sessionStorage["text"] != undefined) {
        $message_txt.val(sessionStorage["text"]);
    }

    if (sessionStorage["attached"] == undefined) {
        sessionStorage['attached'] = JSON.stringify(attached);
    } else {
        attached = JSON.parse(sessionStorage['attached']);
        _.each(attached, function(file) {
            // $(".mess").append("<a class='attached_tree' target='_blank' href='/upload/" + file + "'>" + file + "<i class='icon-trash-empty'></i></a>");
            $('.mess').append(fmsgmsg.format(file));
        });
    }

    $(window).unload(function() {
        if ($message_txt.val().replace(/\ /g, '') != "") {
            sessionStorage["text"] = $message_txt.val();
        } else {
            sessionStorage["text"] = "";
        }
    });



    // #   #  ####   #       ###     #    ####          #####   ###   ####   #   # 
    // #   #  #   #  #      #   #   # #    #  #         #      #   #  #   #  #   # 
    // #   #  #   #  #      #   #  #   #   #  #         #      #   #  #   #  ## ## 
    // #   #  ####   #      #   #  #   #   #  #         ####   #   #  ####   # # # 
    // #   #  #      #      #   #  #####   #  #         #      #   #  # #    #   # 
    // #   #  #      #      #   #  #   #   #  #         #      #   #  #  #   #   # 
    //  ###   #      #####   ###   #   #  ####          #       ###   #   #  #   # 



    function uploadFile(e, addmsg) {

        var formData = new FormData();
        var xhr = new XMLHttpRequest();
        var progress = $('progress');

        xhr.upload.onprogress = function(e) {
            var percentComplete = (e.loaded / e.total) * 100;
            progress.val(percentComplete);
            if (percentComplete == 100) {
                progress.val(0)
            }
        }

        var onReady = function(e) {
            if (this.readyState == this.DONE) {
                if (this.status != 200) {
                    console.log('error !!!');
                } else {
                    var respond = JSON.parse(xhr.responseText);
                    if (addmsg) {
                        attachFile(respond.file)
                    } else {
                        $('.c-title').after(fmsg.format(respond.file, respond.file, respond.from, respond.data, formatSize(respond.size)));
                    }
                }
            }
        };

        var onError = function(err) {
            console.log('error ...');
        };

        formData.append('files', e.target.files[0]);
        formData.append('size', e.target.files[0].size);
        formData.append('from', sessionStorage['from']);
        formData.append('data', clock.data());
        formData.append('desc', '');

        xhr.open('post', "/files/upload", true);
        xhr.addEventListener('error', onError, false);

        xhr.send(formData);

        xhr.addEventListener('readystatechange', onReady, false);
    }



    //  ###   #       ###   #   #  ####           ###   #   #  #####  #####  ####   #####    #     ###   ##### 
    // #   #  #      #   #  #   #   #  #           #    #   #    #    #      #   #  #       # #   #   #  #     
    // #      #      #   #  #   #   #  #           #    ##  #    #    #      #   #  #      #   #  #      #     
    // #      #      #   #  #   #   #  #           #    # # #    #    ####   ####   ####   #   #  #      ####  
    // #      #      #   #  #   #   #  #           #    #  ##    #    #      # #    #      #####  #      #     
    // #   #  #      #   #  #   #   #  #           #    #   #    #    #      #  #   #      #   #  #   #  #     
    //  ###   #####   ###    ###   ####           ###   #   #    #    #####  #   #  #      #   #   ###   ##### 



    ///////////////////////////////////////////////////
    //////////Прикрипление файла к сообщению///////////
    ///////////////////////////////////////////////////
    function attachFile(file) {
        attached.push(file);
        sessionStorage['attached'] = JSON.stringify(attached);
        $('.mess').append(fmsgmsg.format(file));
    }



    ///////////////////////////////////////////////////
    ////////////////Открытие облака////////////////////
    ///////////////////////////////////////////////////
    $("#fromCloud").on('click', function(event) {

        $('.files-insert').remove();
        $('section').hide();
        $.get(
            "/cloud",
            onSuccess
        );

        function onSuccess(data) {
            $('main').append($(data).find('.files').addClass('files-insert'));
            $('.files-insert').removeClass('hidden');
        }

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    //////////////Триггерное выделение файлов//////////
    ///////////////////////////////////////////////////
    $('main').on('click', '.files a', function(event) {

        $(this).toggleClass('selectable');
        event.preventDefault();
    });

    $("main").on('scroll', function(e) {
        console.log(e.originalEvent.pageY);
    });


    ///////////////////////////////////////////////////
    /////Добавление выделенных файлов в сообщение//////
    ///////////////////////////////////////////////////
    $('main').on('click', '.files #tomsg', function(event) {

        $('.files-insert .selectable').each(function(a, el) {
            attachFile($(el).attr('href').replace('/upload/', ''));
        });
        $('section').show();
        $('.files-insert').remove();

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    ///////////////Закрытие облака/////////////////////
    ///////////////////////////////////////////////////
    $('main').on('click', '.files #closeCloud', function(event) {

        $('.files-insert').remove();
        $('section').show();
        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    //Удаление выделенных файлов из облака (необратимо)
    ///////////////////////////////////////////////////
    $('main').on('click', '.files #removefiles', function(event) {

        var fq = "Вы собираетесь удалить файлы из облака. Данное действие необратимо! Если файлы были приклеплены к сообщениям, то ссылки на них будут нерабочими. Вы действительно хотите удалить эти файлы?";
        var yesfq = "Да, эти файлы больше не нужны мне";
        var cancelfq = "Отмена";

        modal(fq, yesfq, cancelfq, function() {

            $('.selectable').each(function(a, el) {
                var $el = $(el);
                if (($el.find('.c-nick').text() == sessionStorage["from"]) | (sessionStorage["from"] == "admin")) { //nick
                    $el.remove();
                    socket.emit('removeFile', $el.find('.c-file').text());
                };
            });

        }, function() {
            return null
        }, 'error');

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    ////////Нажатие на кнопку загрузки в облако////////
    ///////////////////////////////////////////////////
    $('main').on('click', '.files #upload_tocloud', function(event) {

        $inp.attr('to', 'oblako');
        $inp.click();

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    ///////Нажатие на кнопку загрузки в сообщение//////
    ///////////////////////////////////////////////////
    $('main').on('click', '#upload_tomsg', function(event) {

        $inp.attr('to', 'msg');
        $inp.click();

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    //////Событие подключения файла в input////////////
    ///////////////////////////////////////////////////   
    $("input[name=upload]").on('change', function(event) {
        if (login.isLogin()) {
            if ($inp.attr('to') == "oblako") {
                uploadFile(event, false)
            } else {
                uploadFile(event, true)
            }
        }
    });

    //   #    #   #  #####  #   #          ###   #   #  #####  #####  ####   #####    #     ###   ##### 
    //  # #   #   #    #    #   #           #    #   #    #    #      #   #  #       # #   #   #  #     
    // #   #  #   #    #    #   #           #    ##  #    #    #      #   #  #      #   #  #      #     
    // #   #  #   #    #    #####           #    # # #    #    ####   ####   ####   #   #  #      ####  
    // #####  #   #    #    #   #           #    #  ##    #    #      # #    #      #####  #      #     
    // #   #  #   #    #    #   #           #    #   #    #    #      #  #   #      #   #  #   #  #     
    // #   #   ###     #    #   #          ###   #   #    #    #####  #   #  #      #   #   ###   ##### 



    ///////////////////////////////////////////////////
    //////////  Управление показом окна Auth  /////////
    ///////////////////////////////////////////////////
    function showAuth() {
        $laypass.removeClass('hidden');
        $body.css('overflow', 'hidden');
    }

    function hideAuth() {
        $laypass.addClass('hidden');
        $body.css('overflow', 'visible');
    }


    ///////////////////////////////////////////////////
    //////  Проверка на залогиненную сессию  //////////
    ///////////////////////////////////////////////////
    function session() {
        if (!login.isLogin()) {
            showAuth();
        } else {
            hideAuth();
            console.log('Verefication succes');
            socket.emit("get_users");
            socket.emit("dialog", down, sessionStorage["room"], false); //Сработает при обновлении страницы
            // console.log(sessionStorage["from"], sessionStorage["room"], down);
            // loade (sessionStorage["from"], sessionStorage["room"], down);
            // loade (sessionStorage["from"], sessionStorage["room"], down);
            // console.log('loade is pushed');
        }
    }


    ///////////////////////////////////////////////////
    /////Отправка на верефикацию сервером /////////////
    ///////////////////////////////////////////////////
    function sendVerefication() {
        sessionStorage["from"] = $laypass.find('input[type=text]').val();
        sessionStorage["pass"] = CryptoJS.MD5($laypass.find('input[type=password]').val());
        var from = sessionStorage["from"];
        var pass = sessionStorage["pass"];
        socket.emit("verification", {
            from,
            pass
        });
    }



    ///////////////////////////////////////////////////
    /////Запуск верефикации по вводе пароля////////////
    ///////////////////////////////////////////////////
    $laypass.find("input[type=password]").on('keypress', function(event) {

        if ((event.keyCode == 13)) {
            sendVerefication();
        }

    });

    $('#login').on('click', function() {

        sendVerefication();

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    /////Выход из учетки и очистка sessionStorage /////
    ///////////////////////////////////////////////////
    $logout.click(function() {
        // sessionStorage.clear();
        // win.close();
        killApp();
        // reloadPage();
    });

    $('#appMinimize').on('click', function(event) {
        win.minimize();
        // event.preventDefault();        
    });

    $('#appClose').on('click', function(event) {
        killApp();
        // event.preventDefault();        
    });

    $('#appMaximize').on('click', function(event) {
        switch (currWinMode) {
            case "float":
                {
                    win.maximize();
                    break
                }
            case "max":
                {
                    win.unmaximize();
                    break
                }

            default:
                {}
        }
        // event.preventDefault();        
    });



    // #   #  #####   ###    ###     #     ###   #####   ###  
    // #   #  #      #   #  #   #   # #   #   #  #      #   # 
    // ## ##  #      #      #      #   #  #      #      #     
    // # # #  ####    ###    ###   #   #  #      ####    ###  
    // #   #  #          #      #  #####  #  ##  #          # 
    // #   #  #      #   #  #   #  #   #  #   #  #      #   # 
    // #   #  #####   ###    ###   #   #   ###   #####   ###  



    ///////////////////////////////////////////////////
    /////////   Отправка сообщения на сервер    ///////
    ///////////////////////////////////////////////////
    function sendMsg() {
        var text = $("#message_text").val();
        console.log(text);
        if (text.length <= 0)
            return;
        $message_txt.val("");
        to = $komu.val();
        socket.emit("message", {
            message: text,
            from: sessionStorage["from"],
            room: sessionStorage["room"],
            attach: attached,
            to: to
        });
        attached = [];
        sessionStorage['attached'] = JSON.stringify(attached);
        $('footer a').remove();
    }



    function formatMSG(user, msg) {

        var iconPrivate = (function() {
            if (msg.to != "Всем") {
                return '<i class="icon-private"></i>'
            } else {
                return ""
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
        var tempMsg = '<div class="msg" time="{6}" msg="{8}" from="{2}">{0}<span class="user {9}">{1}</span><span class="aka"> @{2}</span> <span class="time">[{3}]</span>{7}<br>{4}{5}</div>';
        return tempMsg.format(iconPrivate, shortName, fromPeople, timeDate, textMessage, attachFiles, msg.time, trash, msg.message, color);

    }


    ///////////////////////////////////////////////////
    //   Вывод сообщения в панель сообщений       /////
    ///////////////////////////////////////////////////
    function writeMessage(msg, prp) {

        if ((msg.room == sessionStorage["room"]) & (((sessionStorage["from"] == msg.to) | (msg.from == sessionStorage["from"])) | (msg.to == "Всем"))) {

            var result = formatMSG(sessionStorage["from"], msg);
            if (prp) {
                $messages.prepend(result);
            } else {
                $messages.append(result);
            }
        }
    }



    ///////////////////////////////////////////////////
    //Авторастягивание textarea при вводе (плагин)/////
    ///////////////////////////////////////////////////
    $('textarea').autoResize({
        animate: true,
        extraSpace: 0
    });



    ///////////////////////////////////////////////////
    //Показ кнопки del attached файла в окне ввода msg/
    ///////////////////////////////////////////////////
    $(document).on({
        mouseenter: function() {
            $(this).children('.icon-trash-empty').show();
        },
        mouseleave: function() {
            $(this).children('.icon-trash-empty').hide();
        }
    }, ".mess .attached_tree");



    ///////////////////////////////////////////////////
    //Удаление прикрепленного файла в окне ввода сообщ/
    ///////////////////////////////////////////////////
    $('.mess').on('click', '.attached_tree .icon-trash-empty', function(event) {

        var $msg = $(this).parent();
        attached = _.without(attached, $msg.attr('href').replace('/upload/', ''));
        sessionStorage['attached'] = JSON.stringify(attached);
        $msg.remove();

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    /////Отправка сообщения по key или click //////////
    ///////////////////////////////////////////////////
    $("#message_text").on('keypress', function(event) {
        if ((event.keyCode == 13) & (event.shiftKey)) {
            sendMsg();
            event.preventDefault();
        }
    });
    $("#message_btn").on('click', function(event) {

        sendMsg();

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    /////Догрузка сообщений в окно по нажатии /////////
    ///////////////////////////////////////////////////
    $("#readmore").on('click', function(event) {

        down += 1;
        $('article').empty();
        // socket.emit("dialog", down, sessionStorage["room"], true);
        loade(sessionStorage["from"], sessionStorage["room"], down);
        // console.log('loade is readmore');
        scrollToDiv($('#readmore'));
        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    /// Показ панели управления сообщением по hover ///
    ///////////////////////////////////////////////////
    $(document).on({
        mouseenter: function() {
            $(this).children('.icon-trash-empty').show();
            $(this).children('.icon-save').show();
            $(this).children('.icon-edit').show();
        },
        mouseleave: function() {
            $(this).children('.icon-trash-empty').hide();
            $(this).children('.icon-save').hide();
            $(this).children('.icon-edit').hide();
        }
    }, ".msg");



    ///////////////////////////////////////////////////
    /// Запуск редактирования сообщения в textarea ////
    ///////////////////////////////////////////////////
    $('article').on('click', '.msg .icon-edit', function(event) {

        $msg = $(this).parent();
        $msg.html($msg.html().replace($msg.attr('msg'), ''));
        if (!$msg.children().is('textarea')) {
            $msg.append('<textarea>' + $msg.attr('msg') + '</textarea>');
        }

        event.preventDefault();
    });


    ///////////////////////////////////////////////////
    /// Сохранение отредактированного сообщения ///////
    ///////////////////////////////////////////////////
    $('article').on('click', '.msg .icon-save', function(event) {

        $msg = $(this).parent();
        var text = $msg.children('textarea').val();
        $msg.children('textarea').remove();
        $msg.find('br').first().after(text);
        socket.emit('editMsg', $msg.attr('msg'), $msg.attr('time'), $msg.attr('from'), text);
        $msg.attr('msg', text);

        event.preventDefault();
    });


    ///////////////////////////////////////////////////
    ///Сброс редактирования сообщения и убр. textarea//
    ///////////////////////////////////////////////////
    $('article').on('keyup', '.msg textarea', function(e) {

        if (e.keyCode == 27) { //Если клавиша ESCAPE
            $msg = $(this).parent();
            $msg.children('textarea').remove();
            $msg.find('br').first().after($msg.attr('msg'));

        }

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    //Удаление сообщения и запрос на удаление серверу//
    ///////////////////////////////////////////////////
    $('article').on('click', '.msg .icon-trash-empty', function(event) {

        var $msg = $(this).parent();

        modal("Вы действительно хотите удалить сообщение?", "Да", "Нет", function() {
            socket.emit('removeMsg', $msg.attr("time"), $msg.attr("msg"), $msg.find(".aka").text().replace(' @', ""));
            $msg.remove();
        }, function() {}, "error");

        event.preventDefault();
    });


    // #   #    #     ###   #####   ###   #   #   ###           ###    ###    ###   #   #  #####  ##### 
    // #   #   # #     #      #      #    #   #  #   #         #   #  #   #  #   #  #  #   #        #   
    // #   #  #   #    #      #      #    ##  #  #             #      #   #  #      # #    #        #   
    // # # #  #   #    #      #      #    # # #  #              ###   #   #  #      ##     ####     #   
    // # # #  #####    #      #      #    #  ##  #  ##             #  #   #  #      # #    #        #   
    // ## ##  #   #    #      #      #    #   #  #   #         #   #  #   #  #   #  #  #   #        #   
    // #   #  #   #   ###     #     ###   #   #   ###           ###    ###    ###   #   #  #####    #   



    socket.on('connecting', function() {});

    socket.on('connect', function() {
        $('.msg').remove();
    });

    socket.on('failed-login', function() {
        sessionStorage["loginde"] = "failed";
        console.log('Верификация не пройдена, соединение не разорвано.');
        $laypass.find('input').removeClass('redBorder');
        $laypass.find('input:text').addClass("redBorder")
    });

    socket.on('failed-pass', function() {
        sessionStorage["loginde"] = "failed";
        console.log('Verefication not success. Disconnected.');
        $laypass.find('input').removeClass('redBorder');
        $laypass.find('input:password').addClass("redBorder")
    });

    socket.on('success', function() {

        sessionStorage["loginde"] = "success";
        hideAuth();
        $laypass.find('input').removeClass('redBorder');
        console.log('Verefication success');

        socket.emit("get_users");
        socket.emit("dialog", down, sessionStorage["room"], false);
        // loade (sessionStorage["from"], sessionStorage["room"], down);   

    });


    socket.on('message-dialog', function(data, prepend) {
        writeMessage(data, prepend);
        $message_txt.focus();
    });


    socket.on('message', function(data, prepend) {
        writeMessage(data, prepend);
        if (data.from != sessionStorage['from']) {
            nwNotify.notify('Cообщение от ' + data.from, data.message);
        }
        $message_txt.focus();
    });

    socket.on('removeMsg', function(from, time) {
        $('[from="' + from + '"]').filter('[time="' + time + '"]').remove();
    });


    socket.on('clearbase', function(data) {
        $('.msg').remove();
    });

    socket.on('file_to_cloud', function(data) {
        $('.c-title').after(fmsg.format(data.file, data.file, data.from, data.data, formatSize(data.size)));
    });

    socket.on('add_users', function(data) {

        _.each(data, function(obj) {

            $komu.append('<option value="' + obj.from + '">' + obj.title + '</option>');
            $('.im').append('<a class="room" href="/{2}" to="{1}" room="{2}">{0} [{1}]</a>'.format(obj.title, obj.from, dia(sessionStorage["from"], obj.from)));

            users.push(obj.from);
        })

        $('[room=' + sessionStorage["room"] + ']').addClass('activeRoom');

        if ($('.activeRoom').attr("to") != undefined) {
            $('#to').val($('.activeRoom').attr("to"));
        }

    });

    socket.on('scrollBottom', function() {
        scrollToDiv($("#readmore"));
    });

    socket.on('lockBottom', function() {
        $("#readmore").hide();
    });

});