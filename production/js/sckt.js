// window.socket = io.connect('http://' + '127.0.0.1' + ':' + '8008');
window.socket = io.connect('http://4b1d94cf.ngrok.io')

if (!String.prototype.format) {
    String.prototype.format = function() {
        var args = arguments;
        return this.replace(/{(\d+)}/g, function(match, number) {
            return typeof args[number] != 'undefined' ? args[number] : match;
        });
    };
}