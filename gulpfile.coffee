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
		html: 'src/**/*.jade'
		js: ['!src/**/*.react.js', 'src/**/*.js']
		js_react: 'src/**/*.react.js'
		lib: 'lib/**/*'
	dest:
		css: 'public'
		html: 'public'
		js: 'public'
		js_react: 'public'
		lib: 'public'

g.task 'clean', ->
	del 'public'

g.task 'css', ->
	g.src path.src.css
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe sass( style:'minify' )
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.css)
		.pipe livereload()

g.task 'html', ['build_html'], ->
	g.src ''
		.pipe livereload()

# divide to assure loaded HTML that it's updated
g.task 'build_html', ->
	g.src path.src.html
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe jade(client:false)
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.html)

g.task 'js', ->
	g.src path.src.js
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe babel(presets:'es2015')
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.js)
		.pipe livereload()

g.task 'js_react', ->
	g.src path.src.js_react
		.pipe plumber()
		.pipe sourcemaps.init()
		.pipe babel(presets:'react')
		.pipe babel(presets:'es2015')
		.pipe sourcemaps.write()
		.pipe g.dest(path.dest.js_react)
		.pipe livereload()

g.task 'lib', ->
	g.src path.src.lib
		.pipe g.dest(path.dest.lib)

g.task 'watch', ['webserver'], ->
	livereload.listen()
	g.watch path.src.css, ['css']
	g.watch path.src.html, ['html']
	g.watch path.src.js, ['js']
	g.watch path.src.js_react, ['js_react']

g.task 'webserver', ['build'], ->
	g.src 'public'
		.pipe webserver
			host: '0.0.0.0'
			port: 3000

g.task 'build', [
	'css'
	'html'
	'js'
	'js_react'
	'lib'
]

g.task 'default', [ 'watch' ]

