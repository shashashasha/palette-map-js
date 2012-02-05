/*
	Creating paletteMap functionality like Actionscript's BitmapData.paletteMap() method
*/
self.addEventListener('message', function(e) {
	var time = new Date().getTime();

	var mode = e.data.mode,
		imageData = e.data.imageData;

	switch (mode.toLowerCase()) {
		case 'gray':
			imageData = grayScale(e.data);
			break;

		case 'channel':
			imageData = singleChannel(e.data);
			break;

		case 'scaled-rgba':
			imageData = scaledRGBA(e.data);
			break;

		case 'rgba':
			imageData = RGBA(e.data);
			break;

		case 'rgb':
		default:
			imageData = RGB(e.data);
			break;
	}

	var ms = new Date().getTime() - time;
	self.postMessage('iterated through ' + imageData.data.length + ' pixels, took ' + ms + ' ms.');

	self.postMessage({ 
		imageData: imageData 
	});

	// terminate the worker from within
	self.close();
}, false);

function scaledRGBA(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		a = data.a,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	var scale = function(i, channel) {
		return parseInt((i / 255) * (channel.length - 1));
	}

	for (var i = 0; i < max; i+=4) {
		var cr = pixels[i], 
			cg = pixels[i+1], 
			cb = pixels[i+2], 
			ca = pixels[i+3];

		pixels[i] = 	r[ scale(cr, r) ];
		pixels[i + 1] = g[ scale(cg, g) ];
		pixels[i + 2] = b[ scale(cb, b) ];
		pixels[i + 3] = a[ scale(ca, a) ];
	}

	return imageData;
}

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

		pixels[i] = 	r[cr];
		pixels[i + 1] = g[cg];
		pixels[i + 2] = b[cb];
		pixels[i + 3] = a[ca];
	}

	return imageData;
}

function RGB(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		pixels[i] = 	r[pixels[i]];
		pixels[i + 1] = g[pixels[i + 1]];
		pixels[i + 2] = b[pixels[i + 2]];
	}

	return imageData;
}

// if the imagedata is grayscale
function grayScale(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;

	for (var i = 0; i < max; i+=4) {
		var p = pixels[i];
		pixels[i] = 	r[p];
		pixels[i + 1] = g[p];
		pixels[i + 2] = b[p];
	}

	return imageData;
}

// if we only want to read data from a single channel
function singleChannel(data) {
	var r = data.r, 
		g = data.g, 
		b = data.b,
		channel = data.channel,
		imageData = data.imageData,
		pixels = imageData.data,
		max = pixels.length;
	
	var l = pixels.length;
	for (var i = 0; i < max; i+=4) {
		var p = pixels[i + channel];
		pixels[i] = 	r[p];
		pixels[i + 1] = g[p];
		pixels[i + 2] = b[p];
	}

	return imageData;
}