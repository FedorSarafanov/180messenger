"use strict";

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
    })

    $('.layq #cancel').click(function() {
        cbNo();
        $('.layq').remove();
    })
}



function reloadPage() {
    window.location.hostname = window.location.hostname;
}

window.rooms = {};

$(document).ready(function() {

    var $logout = $('.logout');
    var $body = $('body');

    function init(argument) {

        login.hideAuth();

        $.get(
            "/api/users", {
                user: sessionStorage["from"],
            },
            function(data) {
                if (data!='no auth') {
                    var userSTR = '<span class="user" nick="{0}">{1}</span>\n';
                    _.each(JSON.parse(data), function(user, index) {
                        $('main .users, main .userswithout').append(userSTR.format(user.from, user.title + ' - ' + user.role));
                    });
                }
            }
        )

        $.get(
            "/api/allrooms", {
                user: sessionStorage["from"],
            },
            function(req) {
                if (req!='no auth') {
                    window.rooms = JSON.parse(req);
                    _.each(window.rooms, function(value, key) {
                        $('main .rooms').append('<span class="room" addr="{0}">{1}</span>'.format(key, value.title));
                    });                
                    $('.room[addr="all"]').addClass('selectable');
                    sel('all');
                }else{
                    $('body').empty();
                    $('body').html('<center><h1>ACCESS DENIED</h1><br><button onclick="sessionStorage.clear();reloadPage();">Зайти под другой учетной записью</button></center>')

                }
            }
        )        

        return true;
    }

    function sel(room) {
        $('.users, .usersgroup, .userswithout').find('.selectable').toggleClass('selectable');

        _.each(window.rooms[room]['for'], function(value, key) {
            $('.users .user[nick="'+value+'"]').toggleClass('selectable');
        });
        _.each(window.rooms[room]['forgroup'], function(value, key) {
            $('.group[group="'+value+'"]').toggleClass('selectable');
        });
        _.each(window.rooms[room]['without'], function(value, key) {
            $('.userswithout .user[nick="'+value+'"]').toggleClass('selectable');
        });
    }


    $('.users').keypress(function(e) {
        if ((e.keyCode == 13)) {
            return false;
        }
    });

    $('.add').click(function(e) {
        var group = "";
        var address = "";

        while ((group == "")) {
            group = prompt("Введите название чата", "Чат");
        }
        while (address == "") {
            address = prompt("Введите адрес чата маленькими латинскими буквами", "");
        }

        rooms[address]={
            "title": group,
            "pass": "",
            "for": [],
            "forgroup": [],              
            "without": []            
        };
        $('.room').removeClass('selectable')        
        $('main .rooms').append('<span class="room" addr="{0}">{1}</span>'.format(address, group));
        $('main .rooms .room').last().click();
    });

    $('.users, .usersgroup, .userswithout').on('click', 'span', function(e) {
        $(this).toggleClass('selectable');

        if ($(this).parent().hasClass('users')) {
            if ($(this).hasClass('selectable')) {
                rooms[$('main .rooms .selectable').attr('addr')]["for"].push($(this).attr('nick'))
            }else{
                var forr = [];
                forr = rooms[$('main .rooms .selectable').attr('addr')]["for"];
                rooms[$('main .rooms .selectable').attr('addr')]["for"] = 
                    _.compact(_.without(forr, $(this).attr('nick')))
            }
        };

        if ($(this).parent().hasClass('usersgroup')) {
            if ($(this).hasClass('selectable')) {
                rooms[$('main .rooms .selectable').attr('addr')]["forgroup"].push($(this).attr('group'))
            }else{
                var forr = [];
                forr = rooms[$('main .rooms .selectable').attr('addr')]["forgroup"];
                rooms[$('main .rooms .selectable').attr('addr')]["forgroup"] = 
                    _.compact(_.without(forr, $(this).attr('group')))
            }
        };    

        if ($(this).parent().hasClass('userswithout')) {
            if ($(this).hasClass('selectable')) {
                rooms[$('main .rooms .selectable').attr('addr')]["without"].push($(this).attr('nick'))
            }else{
                var forr = [];
                forr = rooms[$('main .rooms .selectable').attr('addr')]["without"];
                rooms[$('main .rooms .selectable').attr('addr')]["without"] = 
                    _.compact(_.without(forr, $(this).attr('nick')))
            }
        };             

        e.preventDefault();
        return false;
    });

    $('.rooms').on('click', '.room', function(e) {
        $('.room').removeClass('selectable')
        $(this).toggleClass('selectable');
        sel($(this).attr('addr'));
        e.preventDefault();
        return false;
    });    

    $('.delete').click(function(e) {
        modal('Вы действительно хотите удалить чат? Это действие необратимо!', 'Да', 'Нет',
        function(){
            delete rooms[$('main .rooms .selectable').attr('addr')];
            $('main .rooms .selectable').remove();
            $('main .rooms .room').first().toggleClass('selectable');
            sel($('main .rooms .selectable').attr('addr'));
        }, function(){}, 'error');
    });


    socket.on('connect', function() {});

    $logout.click(function() {
        sessionStorage.clear();
        reloadPage();
    });

    socket.on('failed', function() {
        sessionStorage["loginde"] = "failed";
        console.log('Верификация не пройдена, соединение не разорвано.');
        $('.laypass').find('input').addClass("redBorder")
    });

    socket.on('success', function() {
        init();        
        sessionStorage["loginde"] = "success";
        $('.laypass').find('input').removeClass('redBorder');
        console.log('Верификация пройдена');
    });

    $('.test').click(function() {
        socket.emit('save_rooms', rooms);
        reloadPage();
    });

    login.session(init);    
});
