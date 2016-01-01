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

    if (!String.prototype.format) {
        String.prototype.format = function() {
            var args = arguments;
            return this.replace(/{(\d+)}/g, function(match, number) {
                return typeof args[number] != 'undefined' ? args[number] : match;
            });
        };
    }


    function formatSize(length) {
        var i = 0,
            type = ['б', 'Кб', 'Мб', 'Гб', 'Тб', 'Пб'];
        while ((length / 1000 | 0) && i < type.length - 1) {
            length /= 1024;
            i++;
        }
        return Math.round(length) + ' ' + type[i]; //length.toFixed(2) + ' ' + type[i];
    }
