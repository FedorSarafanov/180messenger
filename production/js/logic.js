"use strict";

function loade(user, room, coff) {
    $.get(
        "/api/get", {
            user: user,
            room: room,
            coff: coff
        },
        APP
    )
    return true;
}

function rooms(user) {
    $.get(
        "/api/rooms", {
            user: user,
        },
        addroom
    )
    return true;
}

function addroom(data) {
    $('nav').prepend($(data));
}

function APP(data) {
    // $('body').append($(data));
    if (data != 'END') {
        $('article').append($(data));
    } else {
        $('#readmore').remove();
    }
    // if ($('.msg').is('[index=0]')) {
    //     $('#readmore').remove();
    // };
    // scrollToDiv($('#readmore'));

}

function ID() {
    return String(CryptoJS.MD5(String(Math.random() + Math.random() + Math.random() + Math.random())));
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

$(document).ready(function() {

    var maxscroll = 0;

    $(window).scroll(function() {
        if (($(window).scrollTop() >= $(document).height() - $(window).height())&($(window).scrollTop()>maxscroll)) {
            maxscroll = $(window).scrollTop();
            down += 1;
            loade(sessionStorage["from"], sessionStorage["room"], down);
        }
    });

    // ###   #   #   ###   #####   ###     #    #       ###    ###     #    #####   ###    ###   #   # 
    //  #    #   #    #      #      #     # #   #        #    #   #   # #     #      #    #   #  #   # 
    //  #    ##  #    #      #      #    #   #  #        #    #      #   #    #      #    #   #  ##  # 
    //  #    # # #    #      #      #    #   #  #        #     ###   #   #    #      #    #   #  # # # 
    //  #    #  ##    #      #      #    #####  #        #        #  #####    #      #    #   #  #  ## 
    //  #    #   #    #      #      #    #   #  #        #    #   #  #   #    #      #    #   #  #   # 
    // ###   #   #   ###     #     ###   #   #  #####   ###    ###   #   #    #     ###    ###   #   # 



    // var socket = io.connect('https://0191928b.ngrok.io/');
    
    // var socket = io.connect('http://' + '192.168.1.120' + ':' + '8008');

    // var socket = io.connect('http://' + '89.109.55.34' + ':' + '8008');

    if (sessionStorage["room"] == undefined) { 
        sessionStorage["room"] = "all"
    } //DEP

    var users = [];
    var to = "Всем"
    var attached = [];

    var down = 0; //Определяет, на сколько дней назад будут прогружаться сообщения // DEPRECATED COMMENT

    var $messages = $("#messages");
    var $message_txt = $("#message_text")
    var $logout = $('#logout');
    var $komu = $("#to");
    var $body = $(document.body);
    var $inp = $(".file_upload").find("input");

    // session();


    if (sessionStorage["text"] != undefined) {
        $message_txt.val(sessionStorage["text"]);
    }

    if (sessionStorage["attached"] == undefined) {
        sessionStorage['attached'] = JSON.stringify(attached);
    } else {
        attached = JSON.parse(sessionStorage['attached']);
        _.each(attached, function(file) {
            // $(".mess").append("<a class='attached_tree' target='_blank' href='/upload/" + file + "'>" + file + "<i class='icon-trash-empty'></i></a>");
            $('.mess').append(magic.magic.fmsgmsg.format(file));
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
                        $('.c-title').after(magic.fmsg.format(respond.file, respond.file, respond.from, respond.data, formatSize(respond.size)));
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

        xhr.open('post', "/api/upload", true);
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
        $('.mess').append(magic.magic.fmsgmsg.format(file));
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
                if (($el.find('.c-nick').text() == sessionStorage["from"]) | (sessionStorage["from"] == "fomin")) { //nick
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
    //////////  INIT                          /////////
    ///////////////////////////////////////////////////
    window.init = function() {

        socket.emit("get_users");

        rooms(sessionStorage["from"]);    

        socket.emit("dialog", down, sessionStorage["room"], false);

    }



    ///////////////////////////////////////////////////
    /////Выход из учетки и очистка sessionStorage /////
    ///////////////////////////////////////////////////
    $logout.click(function() {
        sessionStorage.clear();
        reloadPage();
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
        if (text.length <= 0)
            return;
        $message_txt.val("");
        to = $komu.val();
        socket.emit("message", {
            message: text,
            from: sessionStorage["from"],
            room: sessionStorage["room"],
            attach: attached,
            to: to,
            id: ID()
        });
        attached = [];
        sessionStorage['attached'] = JSON.stringify(attached);
        $('footer a').remove();
    }

    ///////////////////////////////////////////////////
    //   Вывод сообщения в панель сообщений       /////
    ///////////////////////////////////////////////////
    function writeMessage(msg, prp) {

        if ((msg.room == sessionStorage["room"]) & (((sessionStorage["from"] == msg.to) | (msg.from == sessionStorage["from"])) | (msg.to == "Всем"))) {

            var result = magic.msg.format(msg, sessionStorage["from"], 'ученик');
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
    ///////////////////////////////////////////////////
    ///////////////////////////////////////////////////
    $('article').on('click', '.msg .user', function(event) {

        var $msg = $(this).parent();
        $msg.toggleClass('selectable');
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

        loade(sessionStorage["from"], sessionStorage["room"], down);

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

        var $msg = $(this).parent();
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

        var $msg = $(this).parent();
        var text = $msg.children('textarea').val();
        $msg.children('textarea').remove();
        $msg.find('br').first().after(text);

        socket.emit('editMsg', $msg.attr('id'), text);
        $msg.attr('msg', text);

        event.preventDefault();
    });


    ///////////////////////////////////////////////////
    ///Сброс редактирования сообщения и убр. textarea//
    ///////////////////////////////////////////////////
    $('article').on('keyup', '.msg textarea', function(event) {

        if (event.keyCode == 27) { //Если клавиша ESCAPE
            var $msg = $(this).parent();
            $msg.children('textarea').remove();
            $msg.find('br').first().after($msg.attr('msg'));

        }

    });



    ///////////////////////////////////////////////////
    //Удаление сообщения и запрос на удаление серверу//
    ///////////////////////////////////////////////////
    $('article').on('click', '.msg .icon-trash-empty', function(event) {

        var $msg = $(this).parent();

        modal("Вы действительно хотите удалить сообщение?", "Да", "Нет", function() {
            socket.emit('removeMsg', $msg.attr("id"));
            // socket.emit('removeMsg', $msg.attr("time"), $msg.attr("msg"), $msg.find(".aka").text().replace(' @', ""));
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
        $('.laypass').find('input').removeClass('redBorder');
        $('.laypass').find('input:text').addClass("redBorder")
    });

    socket.on('failed-pass', function() {
        sessionStorage["loginde"] = "failed";
        console.log('Верификация не пройдена, соединение не разорвано.');
        $('.laypass').find('input').removeClass('redBorder');
        $('.laypass').find('input:password').addClass("redBorder")
    });

    socket.on('success', function() {

        sessionStorage["loginde"] = "success";
        // rooms(sessionStorage["from"]);
        login.hideAuth();
        $('.laypass').find('input').removeClass('redBorder');
        console.log('Верификация пройдена');
        init();
        // loade (sessionStorage["from"], sessionStorage["room"], down);   

    });


    socket.on('message', function(data, prepend) {
        $('.msg').last().remove();
        writeMessage(data, prepend);
        $message_txt.focus();
    });

    socket.on('message-dialog', function(data, prepend) {
        writeMessage(data, prepend);
        $message_txt.focus();
    });

    socket.on('removeMsg', function(id) {
        $('[id="' + id + '"]').remove();
    });


    socket.on('clearbase', function(data) {
        $('.msg').remove();
    });

    socket.on('file_to_cloud', function(data) {
        $('.c-title').after(magic.fmsg.format(data.file, data.file, data.from, data.data, formatSize(data.size)));
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


login.session(init);

});
