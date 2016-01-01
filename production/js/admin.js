"use strict";

// Функция для форматирования вида "{0} and {1}".format("drink","drive") ==> "drink and drive"


function reloadPage() {
    window.location.hostname = window.location.hostname;
}


$(document).ready(function() {


    var $logout=$('.logout');
    var $body = $('body');
  

    function init () {
        socket.emit('get_users_table', sessionStorage["from"]);
    }

    socket.on('connecting', function() {
        // $('.msg').remove();
    });

    $('.users').keypress(function(e) {
        // return false;
        console.log(e);
        if ( (e.keyCode == 13) ) {
            return false; 
        }
    });     

    $('.add').click(function(e) {
        var nick="";
        var name="";
        var otch="";
        var family="";
        var pass="";
        var type = "";
        var nicks=[];
        $(".user").each(function(indx, element){
             nicks.push($(element).find('.nick').text());
        });  
        while ((nick=="")|(_.include(nicks, nick.replace(/\ /g, "")))){            
            nick=prompt("Введите логин пользователя", "логин");
        }
        while(name==""){
            name=prompt("Введите имя пользователя", "");
        }
        while(otch==""){
            otch=prompt("Введите отчество пользователя", "");
        }  
        while(family==""){
            family=prompt("Введите фамилию пользователя", "");
        }   
        while(type==""){
            type=prompt("Введите тип пользователя: администратор/учитель/ученик/директор/замдиректора/бухгалтер", "");
        }           
        while(pass==""){
            pass=prompt("Введите пароль пользователя", "");
        }  
        $('.users').append('<span class="user"><span class="no">{5}</span><span  class="nick">{0}</span><span  class="name">{1}</span><span  class="otch">{2}</span><span  class="family">{3}</span><span  class="type">{6}</span><span  class="password">{4}</span></span>'.
                        format(nick, name,otch,family,pass, "", type));
        var i=0;
        $(".user").each(function(indx, element){
            i++;
          $(element).find('.no').text(String(i));
        });    
    });    

    $('.users').on('click', '.user', function(e) {
        $(this).toggleClass('selectable');
        e.preventDefault();
        return false;
    });

    $('.users').on('dblclick', '.user', function(e) {
        $(this).children().each(function(index, el) {
            $(el).attr('contenteditable','true');
        });
        e.preventDefault();
        return false;
    });    

    $('.users').on('blur', '.user', function(e) {
        $(this).children().each(function(index, el) {
            $(el).attr('contenteditable','false');
        });
        e.preventDefault();
        return false;
    });        

    $('.delete').click(function(e) {

        $('.selectable').each(function(a, el) {
           $(el).remove();
        });

        var i=0;
        $(".user").each(function(indx, element){
            i++;
          $(element).find('.no').text(String(i));
        });        
    });


    socket.on('connect', function() {
    });

    socket.on('set_users_table', function(data) {
        var i=0;
        _.each(data, function(obj, login) {
            i++;
            var stroke ='<span user="{0}" class="user"><span class="no">{5}</span><span  class="nick">{0}</span><span  class="name">{1}</span><span  class="otch">{2}</span><span  class="family">{3}</span><span  class="type">{6}</span><span  class="password">{4}</span></span>'.
                        format(login, obj["имя"],obj["отчество"],obj["фамилия"],obj["pass"], String(i), obj["role"]);
            $('.users').append(stroke);      
        });  
    });   

    socket.on('failed_get_userstable', function(){
        $('body').empty();
        $('body').html('<center><h1>ACCESS DENIED</h1><br><button onclick="sessionStorage.clear();reloadPage();">Зайти под другой учетной записью</button></center>');
    });

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
        sessionStorage["loginde"] = "success";
        $('.laypass').find('input').removeClass('redBorder');
        console.log('Верификация пройдена');
        init();
    });    

    $('.test').click(function() {
        $('.user').each(function(index, el) {
            var a = ['.nick','.otch','.name','.family', '.type','.password'];
            var $el = $(el);
            _.each(a, function(ix){
                if ($el.find(ix).text().replace(/\s+/g,'')=="") {
                    $el.find(ix).addClass('redBorder');
                }else{                    
                    $el.find(ix).removeClass('redBorder');
                }             
            });
            // $(el).find('.nick').text()
            // $(el).find('.otch').text()
            // $(el).find('.name').text()
            // $(el).find('.family').text()
            // $(el).find('.password').text()
        });
        if ($('.redBorder').length==0) {
            var users={};
            $('.user').each(function(index,el) {   
                if ($(el).find('.no').text()!="№") {
                    var nick=String($(el).find('.nick').text());
                    var name=String($(el).find('.name').text());
                    var otch=String($(el).find('.otch').text());
                    var family=String($(el).find('.family').text());
                    var type=String($(el).find('.type').text());
                    var password=String($(el).find('.password').text());

                    users[nick]={
                        "имя": name,
                        "отчество": otch,
                        "фамилия": family,
                        "pass": password,
                        "role": type
                       }

                }; 
            }); 

            // console.log(users);   
            socket.emit('write_users_table', users);
            reloadPage();
        };
    });

    login.session(init);
});