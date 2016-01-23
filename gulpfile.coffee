babel = require 'gulp-babel'
del = require 'del'
g = require 'gulp'
jade = require 'gulp-jade'
livereload = require 'gulp-livereload'
plumber = require 'gulp-plumber'
sass = require 'gulp-sass'
sourcemaps = require 'gulp-sourcemaps'
webserver = require 'gulp-webserver'

path =
	src:
		css: 'src/**/*.sass'
		js: 'src/**/*.js'
	doc_src:
		css: 'doc/**/*.sass'
		html: 'doc/**/*.jade'
		js: ['!doc/**/*.react.js', '!doc/lib/**/*', 'doc/**/*.js']
		js_react: 'doc/**/*.react.js'
		lib: 'doc/lib/**/*'
	dest:
		public: 'public'

g.task 'clean', ->
	del "#{path.dest.public}/*"

g.task 'css', ->
	g.src path.src.css
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe sass( style:'minify' )
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.public)
		.pipe livereload()

g.task 'js', ->
	g.src path.src.js
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe babel(presets:'es2015')
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.public)
		.pipe livereload()

g.task 'doc_css', ->
	g.src path.doc_src.css
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe sass( style:'minify' )
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.public)
		.pipe livereload()

g.task 'doc_html', ['doc_build_html'], ->
	g.src ''
		.pipe livereload()

# divide to assure loaded HTML that it's updated
g.task 'doc_build_html', ->
	g.src path.doc_src.html
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe jade(client:false)
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.public)

g.task 'doc_js', ->
	g.src path.doc_src.js
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe babel(presets:'es2015')
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.public)
		.pipe livereload()

g.task 'doc_js_react', ->
	g.src path.doc_src.js_react
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe babel(presets:'react')
		.pipe babel(presets:'es2015')
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.public)
		.pipe livereload()

g.task 'doc_lib', ->
	g.src path.doc_src.lib
		.pipe g.dest(path.dest.public)

g.task 'watch', ['webserver'], ->
	livereload.listen()
	g.watch path.src.css, ['css']
	g.watch path.src.js, ['js']
	g.watch path.doc_src.css, ['doc_css']
	g.watch path.doc_src.html, ['doc_html']
	g.watch path.doc_src.js, ['doc_js']
	g.watch path.doc_src.js_react, ['doc_js_react']

g.task 'webserver', ['build'], ->
	g.src 'public'
		.pipe webserver
			host: '0.0.0.0'
			port: 3000

g.task 'build', [
	'css'
	'js'
	'doc_css'
	'doc_html'
	'doc_js'
	'doc_js_react'
	'doc_lib'
]

g.task 'default', [ 'watch' ]

