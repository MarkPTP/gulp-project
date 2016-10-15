//just type gulp [taskname] in the root of the dir to run.
//type gulp to run the gulp default task

//remeber to install the local gulp libraries, e.g $npm install gulp-sass --save -dev


//this tells Node to look in the node modules and find a package called gulp. Then assign that packages contents to gulp.
var gulp = require('gulp');
//require the gulp-sass plugin from node-modules
var sass = require('gulp-sass');
//require gulp-plumber - a plugin that checks for errors in multiple gulp plugins
var plumber = require('gulp-plumber');
//requir egulp-notify a plugin that enables gulp to notify via toaster messages
var notify = require('gulp-notify');
//require broswer-sync, which uses a webserver 
var browserSync = require('browser-sync');
//require gulp autoprefixer, a vendor postprocessor, that adds vendor names to css
var autoprefixer = require('gulp-autoprefixer')
//require sourcemaps - sourcemaps let you debug easier, via putting line numbers into browsers so you can see which rules are effecting
var sourcemaps = require('gulp-sourcemaps')    //WARNING: Need to enable CSS sourcemaps in google chrome up to view sourcemap info
//require nunjucks the templating engine
var	nunjucksRender = require('gulp-nunjucks-render');
//require data plugin tjay yakes in a function and returns a file
var	data = require('gulp-data');
//node plugin, no need to install to get fs
var	fs = require('fs');
//require del, node package to delete files
var	del	= require('del');
//require run-sequence, which takes a series of strings that define to run steps in certain sequence
var	runSequence	= require('run-sequence');
//require jshint, a js lint plugin
var jshint = require('gulp-jshint');
//require jscs, which enforces coding rules with js
var	jscs = require('gulp-jscs');
//require sass-lint
var	sassLint = require('gulp-sass-lint');





//	Consolidated dev phase, run clean:dev, then sas and nunjucks together, then bsync and watch together	
gulp.task('default', function(callback){
	runSequence(
	'clean:dev',
	['lint:js', 'lint:scss'], 
	['sass', 'nunjucks'],
	['browserSync','watch'],
	callback
	)
});






//set up the watch task, init by running gulp watch on cmd line.
//this first line says to do sass task first, then the code within the task function
//we want to run broswerSync, then sass, then use gulp.watch for future changes.
gulp.task('watch', ['browserSync', 'sass'], function() { 
	gulp.watch('app/scss/**/*.scss', ['sass', 'lint:scss']);
	gulp.watch('app/js/**/*.js', ['watch-js']);
	gulp.watch('app/js/**/*.js', browserSync.reload);
	gulp.watch([
		'app/templates/**/*',
		'app/pages/**/*.+(html|nunjucks)',
		'app/data.json'], ['nunjucks']
		)
})

//its not possible to broswer reload in same watch as above,
//so seperate the watch like this, and get watch to watch watch-js
gulp.task('watch-js', ['lint:js'], browserSync.reload);




//set up the sass task, which can be init with gulp sass in cmd line
gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss and children dirs
    .pipe(customPlumber('Error Running Sass')) //start plumber before any other plugin, this will then do error checking for other plugins
    .pipe(sourcemaps.init()) //init sourcemap
    .pipe(sass())
    .pipe(autoprefixer()) //then run the css through auto-prefixer
    .pipe(sourcemaps.write()) //write sourcemap info to the css file
    .pipe(gulp.dest('app/css'))
    //tells browser sync to reload files 
    .pipe(browserSync.reload({
    	stream: true
    }))
})


//custom plumber function, to prevent the sass watch from working if errors found.
function customPlumber(errTitle){
	return	plumber({
		//use notify plugin to report error as windows toaster message
		errorHandler:notify.onError({
				//Customizing error title
				title:errTitle || "Error running Gulp",
				message: "Error: <%= error.message %>",
		})
	});
}

//nunchucks task, the JSON.parse fs is used instead of require, require only reads a file once
//so it can repeatdly read the json with this.
//nunchuk tips: extend inehrits a nunjucks file. include: includes a partial. import: imports a macro
gulp.task('nunjucks', function() {
	return gulp.src('app/pages/**/*.+(html|nunjucks)')
	.pipe(customPlumber('Error Running Nunjucks'))
	.pipe(data(function(){
		return JSON.parse(fs.readFileSync('./app/data.json'))
	}))
	.pipe(nunjucksRender({
		path: ['app/templates']
	}))
	.pipe(gulp.dest('app'))
	.pipe(browserSync.reload({
		stream:	true}))
});


//Browser-sync needs a web server to work.
//this task for browsersync sets up server key in browser sync to the dir where the html is. 
//server - the server option creates a static server that serves html, css and js, basedir says which root folder to use
//use proxy instead of server, to point to another server, or localhost
//use tunnel and set to true, to share externally. or set tunnel to a url.
//browser key determines which browsers to open served up pages in
//open is by default loca, but can be set to tunnel, external and more, to determine where the browser opens
gulp.task('browserSync', function(){
	browserSync({
		server:{
			baseDir:'app'
		},
		//tunnel: true,
		//browser:['google chrome', 'firefox'],
		//open:'local',
	})
})


//clean task, delets unwanted files
gulp.task('clean:dev',	function(){
	return del.sync([
		'app/css',
		'app/*.html'
		]);
});



gulp.task('lint:js', function () {
	//glob for all js files
	return gulp.src('app/js/**/*.js')
	//	Catching	errors	with	customPlumber
	.pipe(customPlumber('JSHint	Error'))
	.pipe(jshint())
	//this pipe lets jshint report errors to console, in stylish format
	.pipe(jshint.reporter('jshint-stylish'))
	//	Catching	all	JSHint	errors
	.pipe(jshint.reporter('fail',{
		ignoreWarning: true,
		ignoreInfo:true
	}))
	.pipe(jscs({
		//fix errors found by jscs
		fix:true,
		configPath: '.jscsrc'
	}))
	.pipe(jscs.reporter())
	//overwire source files with fixed code
	.pipe(gulp.dest('app/js'))
 })

gulp.task('lint:scss', function() {
	return gulp.src('app/scss/**/*.scss')
	.pipe(sassLint())
	.pipe(sassLint.format())
    .pipe(sassLint.failOnError())
})






var	Server = require('karma').Server;

gulp.task('test', function(done)	{
	new	Server({
		configFile: process.cwd() + '/karma.conf.js',				
		singleRun: true
	}, done).start();
});




//require is a node keyword that basically imports a package

//example task
// with this I can go to the directory where the gulpfile.js is, 
//then enter gulp hello to print hello zell to command line.
/*
gulp.task('hello', function() {
  console.log('Hello Zell');
});
*/


//Setting options on a gulp plugin
//here, we set the precision option in gulp-sass to 2. This makes sass round decimals to two places.
/*
gulp.task('sass',	function()	{		return	gulp.src('app/scss/styles.scss')
				.pipe(sass({						
				precision:	2	//	Sets	precision	to	2						
				}))				.pipe(gulp.dest('app/css'))
			 });
*/


//watching with gulp
	//gulp.watch('files-to-watch',	['tasks',	'to',	'run']);
		//put gulp watches within a gulp task, this prevents them being inititated whenever you use gulp commands.
			//e.g
			//gulp.task('watch',	function(){		
				//gulp.watch('app/scss/**/*.scss',	['sass']); 
			//});
	//another problem: when we get an error in our sass, the watch will stop watching.
	//how to prevent:
		//node emits error event when error occurs


//Globs and globbing
	//Globs are matching patterns for filesthat allow you to add more
	// than one file into gulp.src
		//e.g for SASS
			// *.scss matches any scss file in the root folder
			// **/*.scss any scss in the root folder and child folders
			// !not-me.scss excludes a certain file, in this case not-me.scss
			// *.+(scss|sass) multiplle file types, so both scss and sass files.

/*
//task to compile sass
gulp.task('sass', function(){
	//use gulp.src to get source file to act upon
	return gulp.src('app/scss/styles.scss')
		//sass() converts sass to css with gulp-sass
		.pipe(sass())
		//use gulp.dest to specify where to output resulting file
		.pipe(gulp.dest('app/css'))
});
*/