    var ioIP = "127.0.0.1";
    var ioPORT = "8008";

    //Загрузим логику только после подключения к сокету
    yepnope.injectJs('http://' + ioIP + ':' + ioPORT + '/socket.io/socket.io.js', function() {
        window.socket = io.connect('http://' + ioIP + ':' + ioPORT);        
        // yepnope.injectJs('js/login.js');    
        yepnope.injectJs('js/' + jsfile + '.js');        
    })
