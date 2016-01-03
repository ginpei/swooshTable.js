g = require 'gulp'
jade = require 'gulp-jade'
sass = require 'gulp-sass'
webserver = require 'gulp-webserver'

path =
	src:
		css: 'src/**/*.sass'
		html: 'src/**/*.jade'
	dest:
		css: '.'
		html: '.'

g.task 'clean', ->
	del 'public'

g.task 'css', ->
	g.src path.src.css
		.pipe sass( style:'minify' )
		.pipe g.dest(path.dest.css)

g.task 'html', ->
	g.src path.src.html
		.pipe jade(client:false)
		.pipe g.dest(path.dest.html)

g.task 'watch', ['webserver'], ->
	g.watch path.src.css, ['css']
	g.watch path.src.html, ['html']

g.task 'webserver', ['build'], ->
	g.src '.'
		.pipe webserver
			host: '0.0.0.0'
			port: 3000

g.task 'build', [
	'css'
	'html'
]

g.task 'default', [ 'watch' ]

