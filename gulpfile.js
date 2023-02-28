/* eslint-disable no-console */

const YAML = require('yaml');
const fs = require('fs');
const browserSync = require('browser-sync').create();
const gulp = require('gulp');
const gulpSass = require('gulp-sass')(require('sass'));
const sassVars = require('gulp-sass-vars');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');
const rename = require('gulp-rename');
const named = require('vinyl-named');
const gulpHologram = require('gulp-hologram');
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

const config = fs.readFileSync('./config.yml', 'utf8');
const locales = fs.readdirSync('./locale').map((locale) => locale.replace('.yml', ''));

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

const translate = (translations) => (key) => {
	if (!translations.hasOwnProperty(key)) {
		console.log(key);
		return `[${key}]`;
	}
	return translations[key];
};

const bulkTranslate = (translations) => (messages, value) => {
	return {
		...messages,
		[value]: translate(translations)(value),
	}
}

const resolvePrefix = (locale) => locale === 'cs' ? '' : `/${locale}`;

const constructLangSwitch = locales.reduce((map, locale) => {
	const prefix = resolvePrefix(locale);
	const link = `${prefix}/index.html`;

	return {
		...map,
		[locale]: link,
	}
}, {});

const contactFormErrors = [
	'email.invalid',
	'email.missing',
	'message.invalid',
	'message.missing',
	'name.invalid',
	'name.missing',
	'phone.invalid',
	'phone.missing',
];

const nunjucksParams = {
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
	clients: require(__dirname + '/html/clients.json'),
	languages: constructLangSwitch,
	year: new Date().getFullYear(),
};

const nunjucksFiles = [
	'html/**/*.njk',
	'!html/components/*.njk',
];

const generateHtmlTasks = [];

for (const locale of locales) {
	const generateHtml = () => {
		const translations = YAML.parse(fs.readFileSync(`./locale/${locale}.yml`, 'utf8'));

		return gulp.src(nunjucksFiles)
			.pipe(gulpNunjucks.compile({
				...nunjucksParams,
				t: translate(translations),
				contactFormErrors: JSON.stringify(contactFormErrors.reduce(bulkTranslate(translations), {})),
			}))
			.pipe(rename({extname: '.html'}))
			.pipe(gulp.dest(`temp/html/${resolvePrefix(locale)}`));
	}

	generateHtmlTasks.push(generateHtml);
}

const nunjucks = gulp.parallel(...generateHtmlTasks);

const htmlmin = () => {
	let stream = gulp.src([
		'temp/html/**/*.html',
		//'manifest.json',
	]);

	if (development) {
		stream = stream.pipe(template({
			...YAML.parse(config),
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

	return gulp.src(['scripts/app-*.ts'])
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
const hologram = () => {
	return gulp.src('docs/hologram/config.yml')
		.pipe(gulpHologram({
			bundler: true,
			logging: true,
		}));
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
	gulp.watch(['scss/**/*.scss'], watchConfig, gulp.parallel(css, hologram));
	gulp.watch(['html/**/*.njk'], watchConfig, html);
	gulp.watch(['locale/**/*.yml'], watchConfig, html);
	gulp.watch(['scripts/**/*.ts'], watchConfig, js);

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


const production = gulp.series(gulp.parallel(css, js, html), hologram);

const defaultTask = gulp.series(setDevelopmentEnvironment, production, gulp.parallel(watch, server));


module.exports.package = buildZip;
module.exports.production = production;
module.exports.default = defaultTask;
