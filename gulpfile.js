const gulp = require('gulp');
const uglify = require('gulp-uglify');
const minifyCSS = require('gulp-minify-css');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const qunit = require('gulp-qunit');
const replace = require('gulp-replace');

// Replace package.version
const version = require('./package').version;
const versionRegExp = /\{package\.version\}/;

// Rename and uglify scripts
function jsTask(prefix) {
	return gulp.src('src/clockpicker.js')
		.pipe(rename({ prefix: prefix + '-' }))
		.pipe(replace(versionRegExp, version))
		.pipe(gulp.dest('dist'))
		.pipe(uglify({
			output: {
				comments: /^!|@preserve|@license|@cc_on/i
			}
		}))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'));
}

// Rename, concat and minify stylesheets
function cssTask(prefix) {
	let stream;
	if (prefix === 'bootstrap5') {
		stream = gulp.src('src/clockpicker5.css')
			.pipe(concat('clockpicker.css'));
	} else if (prefix === 'bootstrap') {
		stream = gulp.src('src/clockpicker.css');
	} else {
		stream = gulp.src(['src/standalone.css', 'src/clockpicker.css'])
			.pipe(concat('clockpicker.css'));
	}
	return stream
		.pipe(rename({ prefix: prefix + '-' }))
		.pipe(replace(versionRegExp, version))
		.pipe(gulp.dest('dist'))
		.pipe(minifyCSS({ keepSpecialComments: 1 }))
		.pipe(rename({ suffix: '.min' }))
		.pipe(gulp.dest('dist'));
}

function js() {
	jsTask('bootstrap5');
	jsTask('bootstrap');
	jsTask('jquery');
	return Promise.resolve(); // tell Gulp it's done
}

function css() {
	cssTask('bootstrap5');
	cssTask('bootstrap');
	cssTask('jquery');
	return Promise.resolve();
}

function watchFiles() {
	gulp.watch('src/*.js', js);
	gulp.watch('src/*.css', css);
	return Promise.resolve();
}

function test() {
	return gulp.src('test/*.html')
		.pipe(qunit());
}

// Register tasks
exports.js = js;
exports.css = css;
exports.test = test;
exports.watch = watchFiles;
exports.default = gulp.series(gulp.parallel(js, css), watchFiles);
