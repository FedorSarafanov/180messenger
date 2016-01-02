'use strict';

$(document).ready(function() {

    var attached = []

    var down = 0 //Счетчик страниц сообщений 0=>1-10 msg, 1=>11-20 msg, 2=>21-30 msg, etc
    var maxscroll = 0 //Прокрутка для AJAX-подзагрузки

    var $message_txt = $('#message_text')
    var $to = $('#to')
    var $inp = $('.file_upload').find('input')

    var $main = $('main')
    var $section = $('section')
    var $article = $('#messages')
    var $attach = $('.mess')



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
                        $('.c-title').after(magic.fmsg.format(respond.file, respond.file, respond.from, respond.data, magic.str.BytesToSize(respond.size)));
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
        formData.append('data', magic.dt.data());
        formData.append('desc', '');

        xhr.open('post', '/api/upload', true);
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
        $attach.append(magic.fmsgmsg.format(file));
    }



    ///////////////////////////////////////////////////
    ////////////////Открытие облака////////////////////
    ///////////////////////////////////////////////////
    $('#fromCloud').on('click', function(event) {

        $('.files-insert').remove();
        $section.hide();
        $.get(
            '/cloud',
            function(data) {
                $main.append($(data).find('.files').addClass('files-insert'));
                $('.files-insert').removeClass('hidden');
            }
        )

        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    //////////////Триггерное выделение файлов//////////
    ///////////////////////////////////////////////////
    $main.on('click', '.files a', function(event) {

        $(this).toggleClass('selectable');
        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    /////Добавление выделенных файлов в сообщение//////
    ///////////////////////////////////////////////////
    $main.on('click', '.files #tomsg', function(event) {

        $('.files-insert .selectable').each(function(a, el) {
            attachFile($(el).attr('href').replace('/upload/', ''));
        });
        $section.show();
        $('.files-insert').remove();

        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    ///////////////Закрытие облака/////////////////////
    ///////////////////////////////////////////////////
    $main.on('click', '.files #closeCloud', function(event) {

        $('.files-insert').remove();
        $section.show();
        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    //Удаление выделенных файлов из облака (необратимо)
    ///////////////////////////////////////////////////
    $main.on('click', '.files #removefiles', function(event) {

        var fq = 'Вы собираетесь удалить файлы из облака. Данное действие необратимо! Если файлы были приклеплены к сообщениям, то ссылки на них будут нерабочими. Вы действительно хотите удалить эти файлы?';
        var yesfq = 'Да, эти файлы больше не нужны мне';
        var cancelfq = 'Отмена';

        magic.interface.modal(fq, yesfq, cancelfq, function() {

            $('.selectable').each(function(a, el) {
                var $el = $(el);
                if (($el.find('.c-nick').text() == sessionStorage['from']) | (sessionStorage['from'] == 'fomin')) { //nick
                    $el.remove();
                    socket.emit('removeFile', $el.find('.c-file').text());
                };
                $el = null;
            });

        }, function() {
            return null
        }, 'error');

        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    ////////Нажатие на кнопку загрузки в облако////////
    ///////////////////////////////////////////////////
    $main.on('click', '.files #upload_tocloud', function(event) {

        $inp.attr('to', 'oblako');
        $inp.click();

        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    ///////Нажатие на кнопку загрузки в сообщение//////
    ///////////////////////////////////////////////////
    $main.on('click', '#upload_tomsg', function(event) {

        $inp.attr('to', 'msg');
        $inp.click();

        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    //////Событие подключения файла в input////////////
    ///////////////////////////////////////////////////   
    $('input[name=upload]').on('change', function(event) {
        if (login.isLogin()) {
            if ($inp.attr('to') == 'oblako') {
                uploadFile(event, false)
            } else {
                uploadFile(event, true)
            }
        }
    })



    // ###   #   #   ###   ##### 
    //  #    #   #    #      #   
    //  #    ##  #    #      #   
    //  #    # # #    #      #   
    //  #    #  ##    #      #   
    //  #    #   #    #      #   
    // ###   #   #   ###     #   



    ///////////////////////////////////////////////////
    //////////  ЗАГРУЗКА ПОСЛЕ АУТЕНЦИФИКАЦИИ /////////
    ///////////////////////////////////////////////////
    window.init = function() {

        function rooms(user) {
            $.get(
                '/api/rooms', {
                    user: user,
                },
                function(data) {
                    $('nav').prepend($(data))
                }
            )
            return true;
        }

        function getUsers() {
            $.get(
                '/api/users', {
                    user: sessionStorage['from'],
                },
                function(data) {
                    var json = JSON.parse(data);
                    _.each(json, function(user) {
                        $to.append('<option value=' + user.from + '>' + user.title + '</option>')

                        if (sessionStorage['room'] == 'im') {
                            $('.im').append('<a class="room" href="/{2}"" to="{1}" room="{2}">{0} [{1}]</a>'.format(user.title, user.from, dia(sessionStorage['from'], user.from)));
                        }

                    })

                    $('[room=' + sessionStorage['room'] + ']').addClass('activeRoom');

                    if ($('.activeRoom').attr('to') != undefined) {
                        $('#to').val($('.activeRoom').attr('to'));
                    }

                }
            )
            return true;
        }

        if (sessionStorage['room'] == undefined) {
            sessionStorage['room'] = 'all'
        }

        if (sessionStorage['text'] != undefined) {
            $message_txt.val(sessionStorage['text']);
        }

        if (sessionStorage['attached'] == undefined) {
            sessionStorage['attached'] = JSON.stringify(attached)
        } else {
            attached = JSON.parse(sessionStorage['attached'])

            _.each(attached, function(file) {
                $attach.append(magic.fmsgmsg.format(file))
            })
        }

        rooms(sessionStorage['from']);

        getUsers();
        getMessages(sessionStorage['from'], sessionStorage['room'], down);

        login.hideAuth();

    }



    ///////////////////////////////////////////////////
    /////Выход из учетки и очистка sessionStorage /////
    ///////////////////////////////////////////////////
    $('#logout').click(function() {
        sessionStorage.clear();
        magic.interface.reloadPage();
    })



    // #   #  #####   ###    ###     #     ###   #####   ###  
    // #   #  #      #   #  #   #   # #   #   #  #      #   # 
    // ## ##  #      #      #      #   #  #      #      #     
    // # # #  ####    ###    ###   #   #  #      ####    ###  
    // #   #  #          #      #  #####  #  ##  #          # 
    // #   #  #      #   #  #   #  #   #  #   #  #      #   # 
    // #   #  #####   ###    ###   #   #   ###   #####   ###  



    ///////////////////////////////////////////////////
    //////   Уникальный идентефикатор сообщения ///////
    ///////////////////////////////////////////////////
    function ID() {
        return String(CryptoJS.MD5(String(Math.random() + Math.random() + Math.random() + Math.random())));
    }



    ///////////////////////////////////////////////////
    ///////// Уникальный идентефикатор диалога  ///////
    ///////////////////////////////////////////////////
    function dia(from, to) {
        return CryptoJS.MD5([from, to].sort().join(''));
    }



    ///////////////////////////////////////////////////
    /////////   Загрузка страницы сообщений.    ///////
    ///////////////////////////////////////////////////
    function getMessages(user, room, coff) {
        $.get(
            '/api/get', {
                user: user,
                room: room,
                coff: coff
            },
            function(data) {
                if (data != 'END') {
                    $article.append($(data));
                }
            }
        )
        return true;
    }


    ///////////////////////////////////////////////////
    /////////   AJAX-подзагрузка сообщений      ///////
    ///////////////////////////////////////////////////
    $(window).scroll(function() {

        if (($(window).scrollTop() >= $(document).height() - $(window).height()) & ($(window).scrollTop() > maxscroll)) {
            if (login.isLogin()) {
                maxscroll = $(window).scrollTop();
                down += 1;
                getMessages(sessionStorage['from'], sessionStorage['room'], down);
            }
        }
    })


    ///////////////////////////////////////////////////
    /////////  Сохранение набранного сообщения ////////
    ///////////////////////////////////////////////////
    $(window).unload(function() {
        if ($message_txt.val().replace(/\ /g, '') != '') {
            sessionStorage['text'] = $message_txt.val();
        } else {
            sessionStorage['text'] = '';
        }
    })



    ///////////////////////////////////////////////////
    /////////   Отправка сообщения на сервер    ///////
    ///////////////////////////////////////////////////
    function sendMsg() {
        var text = $message_txt.val();
        if (text.length <= 0)
            return;
        $message_txt.val('');
        // to = 
        var msg = {
            message: text,
            from: sessionStorage['from'],
            room: sessionStorage['room'],
            attach: attached,
            to: $to.val(),
            id: ID()
        };

        socket.emit('message', msg);
        attached = [];
        sessionStorage['attached'] = JSON.stringify(attached);
        $('footer a').remove();
    }

    ///////////////////////////////////////////////////
    //   Вывод сообщения в панель сообщений       /////
    ///////////////////////////////////////////////////
    function writeMessage(msg, prp) {

        if ((msg.room == sessionStorage['room']) & (((sessionStorage['from'] == msg.to) | (msg.from == sessionStorage['from'])) | (msg.to == 'Всем'))) {

            var result = magic.msg.format(msg, sessionStorage['from'], 'ученик');
            if (prp) {
                $article.prepend(result);
            } else {
                $article.append(result);
            }
        }
    }



    ///////////////////////////////////////////////////
    //Авторастягивание textarea при вводе (плагин)/////
    ///////////////////////////////////////////////////
    $('textarea').autoResize({
        animate: true,
        extraSpace: 0
    })



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
    }, '.mess .attached_tree')



    ///////////////////////////////////////////////////
    //Удаление прикрепленного файла в окне ввода сообщ/
    ///////////////////////////////////////////////////
    $attach.on('click', '.attached_tree .icon-trash-empty', function(event) {

        var $msg = $(this).parent();
        attached = _.without(attached, $msg.attr('href').replace('/upload/', ''));
        sessionStorage['attached'] = JSON.stringify(attached);
        $msg.remove();

        event.preventDefault();
    })



    ///////////////////////////////////////////////////
    /////Отправка сообщения по key или click //////////
    ///////////////////////////////////////////////////
    $message_txt.on('keypress', function(event) {

        if ((event.keyCode == 13) & (event.shiftKey)) { //Shift+Enter
            sendMsg();
            event.preventDefault();
        }

    })

    $('#message_btn').on('click', function(event) {

        sendMsg();

        event.preventDefault();
    })

    ///////////////////////////////////////////////////
    /// Тогглирование состояния сообщения: выделение //
    ///////////////////////////////////////////////////
    $article.on('click', '.msg', function(event) {

        $(this).toggleClass('msg-selectable');

        event.preventDefault();
    });



    ///////////////////////////////////////////////////
    //Удаление сообщения и запрос на удаление серверу//
    ///////////////////////////////////////////////////
    $main.on('click', '#rmMsgs', function(event) {

        magic.interface.modal('Вы действительно хотите удалить сообщение?', 'Да', 'Нет', function() {

            $('.msg-selectable').each(function(index, val) {
                var $msg = $(val)
                if ($msg.attr('from') == sessionStorage['from']) {
                    socket.emit('removeMsg', $msg.attr('id'));
                    $msg.remove();
                }
            })

            $('.msg-selectable').toggleClass('msg-selectable')

        }, function() {
            $('.msg-selectable').toggleClass('msg-selectable')
        }, 'error');

        event.preventDefault();
    })

    // #   #    #     ###   #####   ###   #   #   ###           ###    ###    ###   #   #  #####  ##### 
    // #   #   # #     #      #      #    #   #  #   #         #   #  #   #  #   #  #  #   #        #   
    // #   #  #   #    #      #      #    ##  #  #             #      #   #  #      # #    #        #   
    // # # #  #   #    #      #      #    # # #  #              ###   #   #  #      ##     ####     #   
    // # # #  #####    #      #      #    #  ##  #  ##             #  #   #  #      # #    #        #   
    // ## ##  #   #    #      #      #    #   #  #   #         #   #  #   #  #   #  #  #   #        #   
    // #   #  #   #   ###     #     ###   #   #   ###           ###    ###    ###   #   #  #####    #   

    if (window.socket !== undefined) {

        socket.on('connect', function() {}) // Не удалять. Необходимо для работы socket.io


        socket.on('connection', function() {}) // Не удалять. Необходимо для работы socket.io


        socket.on('message', function(data, prepend) {

            if ($('.msg').length >= 10) {
                $('.msg').last().remove()
            }

            writeMessage(data, prepend);
            $message_txt.focus();
        })


        socket.on('removeMsg', function(id) {
            $('[id=' + id + ']').remove()
        })
    }

    login.session(init)

})
