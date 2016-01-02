var gulp = require('gulp'),  

	webserver    = require('gulp-webserver'),    //Сервер локалхоста
	concat       = require('gulp-concat'),       //Объединяет файлы в один
	minifyCSS    = require('gulp-minify-css'),   //Сжимает, оптимизирует
	less         = require('gulp-less'),         //Less
	rename       = require("gulp-rename"),       //Переименование
	gutil 		 = require('gulp-util'), 		 //Работа с файлами
	autoprefixer = require('less-plugin-autoprefix'), // Автопрефиксер свойств для старых браузеров
	tinylr       = require('tiny-lr')(),
	bump	     = require('gulp-bump'),
	uglify       = require('gulp-uglify'),
	changed      = require('gulp-changed'),
    autoprefix   = new autoprefixer({browsers: ["last 5 versions"]}); //Свойства для браузеров от 2013 года	


function updateVersion (importance) {
  return gulp.src(['./package.json'])
    .pipe(bump({type: importance}))
    .pipe(gulp.dest('./'));
}

// gulp.task('patch', function () { return updateVersion('patch'); });
// gulp.task('feature', function () { return updateVersion('minor'); });
// gulp.task('release', function () { return updateVersion('major'); });


gulp.task('styles', function () {
	gulp.src('./dev/less/*.less')
		.pipe(less({plugins: [autoprefix]}))
		// .pipe(less())
		.on('error', function (err) {
	        gutil.log(err);
	        this.emit('end');
    	})
		// .pipe(concat('gross.css'))
		.pipe(minifyCSS())   
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest('./production/css/'));
	// notify('Генерация less...');
});

gulp.task('js', function () {
	gulp.src('./production/js/logic.js')
		.pipe(uglify())
		.on('error', function (err) {
	        gutil.log(err);
	        this.emit('end');
    	})
		.pipe(rename({suffix: ".min"}))
		.pipe(gulp.dest('./production/js/'));
});

var nodemon = require('gulp-nodemon');
var notify = require('gulp-notify');

gulp.task('livereload', function() {  
  tinylr.listen(35729);
});

function notifyLiveReload(event) {
	// console.log('reload');
  var fileName = require('path').relative(__dirname, event.path);
  updateVersion('patch');
  tinylr.changed({
    body: {
      files: [fileName]
    }
  });
}

gulp.task('watch', function() {
  gulp.watch(["./dev/less/*.less"], ['styles']);   
  gulp.watch('./html/*.html', notifyLiveReload);
  gulp.watch('./production/css/*.css', notifyLiveReload);
  gulp.watch('./production/js/*.js', notifyLiveReload);
  // gulp.watch('./production/js/*.js', ['js']);
});

// gulp.task('reload', function () {
// 	refresh(lrserver);
// })

// Task
gulp.task('default', ['livereload','watch'], function() {
	nodemon({
		// the script to run the app
		script: 'appChat.js',
		ext: 'js',
		ignore: ['routers.js', 'logic.js', 'admin.js', 'logic-nw.js', 'login.js', 'login2.js'],
	}).on('restart', function(){
		// when the app has restarted, run livereload.
		// notifyLiveReload();
		// notify('Перезагрузка сервера...')
		// refresh();
		// gulp.src('./index.html')
		// 	// .pipe(refresh())
		// 	.pipe(notify('Reloading page, please wait...'));
	});
  // gulp.watch(['./static/css/*.less','./static/js/*.js','./*.html']).on('change', refresh.changed);
})





// gulp.task('build', function() {
// 	    gulp.src('./index.html')
//         	.pipe(replace('[[IP]]', ip))
// 	    	// .pipe(rename({extname: ".html"}))
//         	.pipe(gulp.dest('./'));	
// });

// gulp.task('reload', function () {
// 	gulp.start('styles');
// 	// gulp.src("./index.html").
// 	gulp.src('./').pipe(refresh(webserver));	   	
// 	console.log('[sfedor-g] Сервер обновлён.');	
// });



// gulp.task('default', ['styles'], function() {  
// 	gulp.watch(["./index.html","./static/css/*.less"], ['styles']);    
// });