/* eslint-disable no-console */

const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const gulpSass = require('gulp-sass')(require('sass'));
const sassVars = require('gulp-sass-vars');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const named = require('vinyl-named');
const run = require('gulp-run');
const gulpHtmlmin = require('gulp-htmlmin');
const gulpNunjucks = require('gulp-nunjucks');
const yargs = require('yargs');
const template = require('gulp-template');
const webpackCompiler = require('webpack');
const webpack = require('webpack-stream');
const zip = require('gulp-zip');

let port = 8000;
let development = false;
const appVersion = (typeof (yargs.argv.appVersion) !== 'undefined') ? yargs.argv.appVersion : 'dev';

let webpackConfig = require('./webpack.config.js');

const sass = () => {
	return gulp.src('scss/style-*.scss')
		.pipe(sassVars({
			appVersion: appVersion,
		}, {verbose: true}))
		.pipe(gulpSass().on('error', gulpSass.logError))
		.pipe(gulp.dest('www/css'))
		.pipe(browserSync.stream());
};

const cssmin = () => {
	return gulp.src(['www/css/*.css', '!www/css/*.min.css'])
		.pipe(postcss([
			autoprefixer(),
			cssnano({
				reduceIdents: false,
			}),
		]))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('www/css'))
		.pipe(browserSync.stream());
};

const css = gulp.series(sass, cssmin);

const nunjucks = () => {
	return gulp.src([
		'html/**/*.njk',
		'!html/components/*.njk',
	])

		.pipe(gulpNunjucks.compile({
			clientHeadPictureSizes: {
				sm: {
					width: 340,
					height: 272,
				},
				md: {
					width: 500,
					height: 480,
				},
			},
			getNextObjectKey: (database, key) => {
				const keys = Object.keys(database);
				const index = keys.indexOf(key);

				if (index + 1 < keys.length) {
					return keys[index + 1];
				} else {
					return null;
				}
			},
			clients: require(__dirname + '/html/clients.json'),
			year: new Date().getFullYear(),
		}))
		.pipe(rename({extname: '.html'}))
		.pipe(gulp.dest('temp/html/'));
};

const htmlmin = () => {
	let stream = gulp.src([
		'temp/html/**/*.html',
		//'manifest.json',
	]);

	if (development) {
		stream = stream.pipe(template({
			noRobots: true,
			version: '@dev',
			pageUrl: 'http://localhost:8000',
			googleAnalytics: 'G-xxxxxxxxx',
			sentMessageUrl: 'http://localhost:4000/v1/contact-form',
		}));
	}

	return stream.pipe(gulpHtmlmin({
		collapseWhitespace: true,
	})).pipe(gulp.dest('www'))
		.pipe(browserSync.stream());
};

const html = gulp.series(nunjucks, htmlmin);

const transpile = () => {
	let myConfig = {...webpackConfig};

	if (!development) {
		myConfig.optimization.minimize = true;
	}

	return gulp.src(['scripts/app-*.js'])
		.pipe(named())
		.pipe(webpack(myConfig, webpackCompiler))
		.on('error', (err) => {
			console.log(err.toString());
		})
		.pipe(gulp.dest('www/js'))
		.pipe(browserSync.stream());
};

const js = transpile;

// Documentation
const storybook = () => {
	return run('npm run storybook').exec();
};

const server = () => {
	return browserSync.init({
		open: false,
		port: port,
		//https: true,
		server: {
			baseDir: "www",
		},
	});
};

const watch = (callback) => {
	const watchConfig = {
		interval: 500,
		usePolling: true,
	};
	gulp.watch(['scss/**/*.scss'], watchConfig, gulp.parallel(css));
	gulp.watch(['html/**/*.njk'], watchConfig, html);
	gulp.watch(['scripts/**/*.js'], watchConfig, js);

	callback();
};

const setDevelopmentEnvironment = (callback) => {
	development = true;
	callback();
};

const buildZip = () => {
	return gulp.src('production/build/**/*')
		.pipe(zip('ticha-website.zip'))
		.pipe(gulp.dest('production/release/'));
};


const production = gulp.series(gulp.parallel(css, js, html));

const defaultTask = gulp.series(setDevelopmentEnvironment, production, gulp.parallel(watch, server, storybook));


module.exports.package = buildZip;
module.exports.production = production;
module.exports.default = defaultTask;
