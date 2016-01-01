	if (sessionStorage["room"] == undefined) {
	    sessionStorage["room"] = "all"
	};

	function reloadPage() {
	    window.location.hostname = window.location.hostname;
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
	login.noLogin = function () {
		return !login.isLogin()
	}

	var stringLaypass = '<div class="laypass">'+
						'<div class="center">'+
						'<input placeholder="Логин" type="text">'+
						'<input placeholder="Пароль" type="password">'+
						'<button id="login">Войти</button>'+
						'</div>'+
						'</div>';

	function session() {
	    if (login.noLogin()) {
	        showLogin();
	        $('body').css('overflow', 'hidden');
	    } else {       
	    	return true;
	        console.log('Верефикация проверена');
	    }
	}

	function sendVerefication() {
	    // console.log('send^'+$laypass.find('input[type=text]').val()+'---'+CryptoJS.MD5($laypass.find('input[type=password]').val()));
	    sessionStorage["from"] = $('.laypass').find('input[type=text]').val();
	    sessionStorage["pass"] = CryptoJS.MD5($('.laypass').find('input[type=password]').val());
	    var from = sessionStorage["from"];
	    var pass = sessionStorage["pass"];
	    socket.emit("verification", {
	        from,
	        pass
	    });
	}

    function showLogin() {
	var stringLaypass = '<div class="laypass">'+
						'<div class="center">'+
						'<input placeholder="Логин" type="text">'+
						'<input placeholder="Пароль" type="password">'+
						'<button id="login">Войти</button>'+
						'</div>'+
						'</div>';
        $('body').append(stringLaypass);

        $('.laypass #login').click(function() {
            sendVerefication();          
        });
	    $('.laypass').find("input[type=password]").keypress(function(e) {
	        if ((e.keyCode == 13)) {
	            sendVerefication();
	        }
	    });        

    };	

	socket.on('failed', function() {
	    sessionStorage["loginde"] = "failed";
	    console.log('Верификация не пройдена, соединение не разорвано.');
	    $('.laypass').find('input').addClass("redBorder")
	});

	socket.on('success', function() {
	    sessionStorage["loginde"] = "success";
	    reloadPage();
	    console.log('Верификация пройдена');
	});
