var gulp = require('gulp');
var runSequence = require('run-sequence');
var sass = require('gulp-sass');

var AUTOPREFIXER_BROWSERS = [
	'ie >= 10',
	'ie_mob >= 10',
	'ff >= 30',
	'chrome >= 34',
	'safari >= 7',
	'opera >= 23',
	'ios >= 7',
	'android >= 4.0',
	'bb >= 10'
];

// Compile Sass For Style Guide Components (app/styles/components)
gulp.task('main:scss', function() {
	var path = require('path');
	return gulp.src('public/sass/*.scss')
		.pipe(sass({
			style: 'expanded',
			precision: 10,
			loadPath: ['scss']
		}))
		.on('error', console.error.bind(console))
		//.pipe($.autoprefixer(AUTOPREFIXER_BROWSERS))
		.pipe(gulp.dest('public/css'))
		//.pipe(reload({stream:true}))
		//.pipe($.size({title: 'styles:scss'}));
});

// Build Production Files, the Default Task
gulp.task('default', [], function(cb) {
	runSequence('main:scss');
});