(function() { if (session()){

    window.provider = {};

    _.extend(provider, Backbone.Events);
    provider.emit = provider.trigger;

    provider.on("rmFiles", function() {
        $('.selectable').each(function(a, el) {
            var $el = $(el);
            if (($el.find('.c-nick').text() == sessionStorage["from"]) | (sessionStorage["from"] == "admin")) { //nick
                $el.remove();
                socket.emit('removeFile', $el.find('.c-file').text());
            };
        });
    });

    provider.on('udFile', function(e, addmsg) {
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
                        attach_file(respond.file)
                    } else {
                        $('.c-title').after(fmsg.format(respond.file, respond.file, respond.from, respond.data, formatSize(respond.size)));
                    }
                }
            }
        };

        var onError = function(err) {
            console.log('Ошибка при загрузке ...');
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

    });

    var wrapper = $(".file_upload"),
        inp = wrapper.find("input"),
        lbl = wrapper.find("div");
    var btn2 = $("#upload_tocloud");

    btn2.focus(function() {
        wrapper.addClass("focus");
    }).blur(function() {
        wrapper.removeClass("focus");
    });

    btn2.add(lbl).click(function() {
        inp.attr('to', 'oblako');
        inp.click();
    });

    $("[name=upload]").on('change', function(e) {
        provider.emit("udFile", e ,false);
    });

    var fmsg = "<a class='attached attached_tree' target='_blank' href='/upload/{0}'><span class='c-file'>{1}</span><span class='c-nick'>{2}</span><span class='c-date'>{3}</span><span class='c-size'>{4}</span></a>";
    var fmsgflat = "<a class='attached_tree' target='_blank' href='/upload/{0}'>{0}<i class='icon-trash-empty'></i></a>";
    var fmsgmsg = "<a class='attached_tree nohover' target='_blank' href='/upload/{0}'>{0}<i class='icon-trash-empty'></i></a>";

    var fq = "Вы собираетесь удалить файлы из облака. Данное действие необратимо! Если файлы были приклеплены к сообщениям, то ссылки на них будут нерабочими. Вы действительно хотите удалить эти файлы?";
    var yesfq = "Да, эти файлы больше не нужны мне";
    var cancelfq = "Отмена";

    $('.files').on('click', 'a', function(e) {
        $(this).toggleClass('selectable');
        e.preventDefault();
    });

    $('#removefiles').on('click', function(event) {
        modalQ(fq, yesfq, cancelfq, function() {
            provider.emit('rmFiles');
        }, function() {
            return null
        });
        event.preventDefault();
    });

    socket.emit("cloud");

    socket.on('file_to_cloud', function(data) {
        $('.c-title').after(fmsg.format(data.file, data.file, data.from, data.data, formatSize(data.size)));
    });

    function modalQ(textq, yes, no, cbYes, cbNo) {
        var question = '<div class="layq">' +
            '<div class="center">' +
            '<div class="warning">{0}</div>' +
            '<div class="buttons">' +
            '<button class="warn" id="yes">{1}</button>' +
            '<button class="norm" id="cancel">{2}</button>' +
            '</div>' +
            '</div>' +
            '</div>';
        $('body').append(question.format(textq, yes, no));

        $('.layq #yes').click(function() {
            cbYes();
            $('.layq').remove();
        });

        $('.layq #cancel').click(function() {
            cbNo();
            $('.layq').remove();
        });
    };

}
})();
