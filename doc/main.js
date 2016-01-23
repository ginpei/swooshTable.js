// LiveReload
if (location.search === '?live') {
	let elScript = document.createElement('script');
	elScript.src = '//' + location.hostname + ':35729/livereload.js';
	document.body.appendChild(elScript);
}
