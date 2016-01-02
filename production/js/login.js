(function() {


    // Baseline setup
    // ————–
    // Establish the root object, `window` in the browser, or `exports` on the server.

    var root = this;
    // console.log(typeof root);

    var login = {};

    // Export the module object for **Node.js**, with
    // backwards-compatibility for the old `require()` API. If we’re in
    // the browser, add `login` as a global object.


    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = login;
        }
        exports.login = login;
    } else {
        root.login = login;
    }



    $(document).ready(function() {

        login.isLogin = function() {
            if (sessionStorage["loginde"] == "success") {
                return true
            } else {
                return false
            }
        }

        login.reloadPage = function() {
            window.location.hostname = window.location.hostname;
        }


        if (sessionStorage["room"] == undefined) {
            sessionStorage["room"] = "all"
        }

        var $body = $(document.body);

        ///////////////////////////////////////////////////
        //////////  Управление показом окна Auth  /////////
        ///////////////////////////////////////////////////
        login.showAuth = function showAuth() {
            $('.laypass').removeClass('hidden');
            $body.css('overflow', 'hidden');
        }

        login.hideAuth = function hideAuth() {
            $('.laypass').addClass('hidden');
            $body.css('overflow', 'visible');
        }

        login.cod = '<div class="laypass hidden">' + '<div class="center">' + '<input placeholder="Логин" type="text">' + '<input placeholder="Пароль" type="password">' + '<button id="login">Войти</button>' + '</div>' + '</div>';

        ///////////////////////////////////////////////////
        //////  Проверка на залогиненную сессию  //////////
        ///////////////////////////////////////////////////
        login.session = function(inits) {
            
            // window.inits = inits();
            if ($('.laypass').length == 0) {
                $('body').append(login.cod);
            }
            if (!login.isLogin()) {
                login.showAuth();
            } else {
                console.log('Верефикация проверена');
                inits();
                // login.hideAuth();                
                // login.reloadPage();
            }
        }


        ///////////////////////////////////////////////////
        /////Отправка на верефикацию сервером /////////////
        ///////////////////////////////////////////////////
        function sendVerefication() {
            sessionStorage["from"] = $('.laypass').find('input[type=text]').val();
            sessionStorage["pass"] = CryptoJS.MD5($('.laypass').find('input[type=password]').val());
            var from = sessionStorage["from"];
            var pass = sessionStorage["pass"];
            // socket.emit("verification", {
            //     from,
            //     pass
            // });

            $.get(
                '/api/auth', {
                    from: from,
                    pass: pass
                },
                function(data) {

                    switch (data) {
                        case "success":
                            {
                                sessionStorage['loginde'] = 'success';
                                $('.laypass').find('input').removeClass('redBorder')
                                console.log('Верификация пройдена')
                                // inits()
                                login.reloadPage();

                                break
                            }
                        case "failed-pass":
                            {
                                sessionStorage['loginde'] = 'failed';

                                console.log('Верификация не пройдена, соединение не разорвано.')

                                $('.laypass').find('input').removeClass('redBorder')
                                $('.laypass').find('input:password').addClass('redBorder')

                                break
                            }
                        case "failed-login":
                            {
                                sessionStorage['loginde'] = 'failed';

                                console.log('Верификация не пройдена, соединение не разорвано.')

                                $('.laypass').find('input').removeClass('redBorder')
                                $('.laypass').find('input:text').addClass('redBorder')

                                break
                            }

                        default:
                            {
                                console.log('ERROR AUTH!');
                            }
                    }

                }
            )
        }


        ///////////////////////////////////////////////////
        /////Запуск верефикации по вводе пароля////////////
        ///////////////////////////////////////////////////
        $('body').on('keypress', " .laypass input[type=password]", function(event) {

            if ((event.keyCode == 13)) {
                sendVerefication();
            }

        });

        $('body').on('click', '#login', function(event) {

            sendVerefication();

            event.preventDefault();
        });

    });

}.call(this));
