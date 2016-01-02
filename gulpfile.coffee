g = require 'gulp'
jade = require 'gulp-jade'
sass = require 'gulp-sass'

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

g.task 'watch', ->
	g.watch path.src.css, ['css']
	g.watch path.src.html, ['html']

g.task 'build', [
	'css'
	'html'
]

g.task 'default', [ 'watch' ]

