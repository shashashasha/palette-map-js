/*
	Creating paletteMap functionality like Actionscript's BitmapData.paletteMap() method

	https://github.com/shashashasha/palette-map-js
*/
self.addEventListener('message', function(e) {
	// in case we're logging
	var time = new Date().getTime();

	var mode = e.data.mode,
		imageData = e.data.imageData;

	switch (mode.toLowerCase()) {
		case 'scaled-rgba':
			imageData = scaledRGBA(e.data);
			break;

		case 'scaled-rgb':
			imageData = scaledRGB(e.data);
			break;

		case 'scaled-gray':
			imageData = scaledSingleChannel(e.data, 0);
			break;

		case 'scaled-channel':
			imageData = scaledSingleChannel(e.data, e.data.channel);
			break;

		case 'gray':
			imageData = singleChannel(e.data, 0);
			break;

		case 'channel':
			imageData = singleChannel(e.data, e.data.channel);
			break;

		case 'rgba':
			imageData = RGBA(e.data);
			break;

		case 'rgb':
		default:
			imageData = RGB(e.data);
			break;
	}

	// post the finished imageData
	self.postMessage({ 
		imageData: imageData 
	});

	if (e.data.log) {
		var ms = new Date().getTime() - time;
		self.postMessage('iterated through ' + imageData.data.length + ' pixels, took ' + ms + ' ms.');	
	}

	// terminate the worker from within
	if (e.data.autoclose) {
		self.close();	
	}
}, false);

/*
	Scaling function, Math.round seems to be the fastest for what we want
	http://jsperf.com/math-floor-vs-math-round-vs-parseint/18
*/
function scale(i, c) {
	return Math.round((i / 255) * (c.length - 1));
}

/*
	Scaled RGBA
	Reads the imageData pixels, and places r, g, b, and a arrays based on an interpolation of the canvas pixel
	i.e., r, g, b, and a need not be 0-255 index arrays, and need not be the same length as each other
*/
function scaledRGBA(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		a = data.a,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		var cr = pixels[i], 
			cg = pixels[i+1], 
			cb = pixels[i+2], 
			ca = pixels[i+3];

		pixels[i] = 		r[ scale(cr, r) ];
		pixels[i + 1] = g[ scale(cg, g) ];
		pixels[i + 2] = b[ scale(cb, b) ];
		pixels[i + 3] = a[ scale(ca, a) ];
	}

	return imageData;
}

/*
	Scaled RGB
	Reads the imageData pixels, and places r, g, b arrays based on an interpolation of the canvas pixel
	i.e., r, g, b need not be 0-255 index arrays, and need not be the same length as each other
*/
function scaledRGB(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		var cr = pixels[i], 
			cg = pixels[i+1], 
			cb = pixels[i+2];

		pixels[i] = 		r[ scale(cr, r) ];
		pixels[i + 1] = g[ scale(cg, g) ];
		pixels[i + 2] = b[ scale(cb, b) ];
	}

	return imageData;
}

/*
	Scaled Single Channel
	Reads the imageData pixels, and places r, g, b, and a arrays 
	based on the value of the pixel at channel specified (0-3)
*/
function scaledSingleChannel(data, channel) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		var cp = pixels[i + channel];

		pixels[i] = 		r[ scale(cp, r) ];
		pixels[i + 1] = g[ scale(cp, g) ];
		pixels[i + 2] = b[ scale(cp, b) ];
	}

	return imageData;
}

/*
	RGBA
	Takes r, g, b, and a arrays and recolors the imageData based on each pixel's values
*/
function RGBA(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		a = data.a,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		var cr = pixels[i], 
			cg = pixels[i+1], 
			cb = pixels[i+2], 
			ca = pixels[i+3];

		pixels[i] = 		r[cr];
		pixels[i + 1] = g[cg];
		pixels[i + 2] = b[cb];
		pixels[i + 3] = a[ca];
	}

	return imageData;
}

/*
	RGB
	Takes r, g, b arrays and recolors the imageData based on each pixel's values
*/
function RGB(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		pixels[i] = 		r[pixels[i]];
		pixels[i + 1] = g[pixels[i + 1]];
		pixels[i + 2] = b[pixels[i + 2]];
	}

	return imageData;
}

/*
	Single Channel
	Reads the imageData pixels, and places r, g, b, arrays 
	based on the value of the canvas pixel specified, in the specified channel [r, g, b or a]
*/
function singleChannel(data, channel) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;
	
	var l = pixels.length;
	for (var i = 0; i < max; i+=4) {
		var p = pixels[i + channel];

		pixels[i] = 		r[p];
		pixels[i + 1] = g[p];
		pixels[i + 2] = b[p];
	}

	return imageData;
}