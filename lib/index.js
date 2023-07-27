'use strict';
const chToPath = require('./ch-to-path');
const random = require('./random');
const optionMngr = require('./option-manager');

const opts = optionMngr.options;

const getLineNoise = function (width, height, options) {
	const hasColor = options.color;
	const noiseLines = [];
	const min = options.inverse ? 7 : 1;
	const max = options.inverse ? 15 : 9;
	let i = -1;

	while (++i < options.noise) {
		const start = `${random.int(1, 21)} ${random.int(1, height - 1)}`;
		const end = `${random.int(width - 21, width - 1)} ${random.int(1, height - 1)}`;
		const mid1 = `${random.int((width / 2) - 21, (width / 2) + 21)} ${random.int(1, height - 1)}`;
		const mid2 = `${random.int((width / 2) - 21, (width / 2) + 21)} ${random.int(1, height - 1)}`;
		const color = hasColor ? random.color() : random.greyColor(min, max);
		noiseLines.push(`<path d="M${start} C${mid1},${mid2},${end}" stroke="${color}" fill="none"/>`);
	}

	return noiseLines;
};

const getText = function (text, width, height, options) {
	const len = text.length;
	const spacing = (width - 2) / (len + 1);
	const min = options.inverse ? 10 : 0;
	const max = options.inverse ? 14 : 4;
	let i = -1;
	const out = [];

	while (++i < len) {
		const x = spacing * (i + 1);
		const y = height / 2;
		const charPath = chToPath(text[i], Object.assign({x, y}, options));

		const color = options.color ?
			random.color(options.background) : random.greyColor(min, max);
		out.push(`<path fill="${color}" d="${charPath}"/>`);
	}

	return out;
};

const createCaptcha = function (text, o) {
	text = text || random.captchaText();
	o = Object.assign({}, opts, o);
	const width = o.width;
	const height = o.height;
	const bg = o.background;
	if (bg) o.color = true;

	const borderWidth = o?.border?.width || 0
	const stroke = o.border ? 
		`stroke="${o.border.color}" stroke-width="${borderWidth}"` : '';
	const bgRect = bg ?
		`<rect width="100%" height="100%" ${stroke} fill="${bg}"/>` : '';

	const label = o.label ?
		`<g><svg width="${o.label.width}" height="${o.label.height}" viewBox="0 0 ${o.label.width} ${o.label.height}">
			<rect x="${borderWidth}" y="${borderWidth}" width="100%" height="100%" fill="${o.label.background}"/>
			<text x="${o.label.textPositionX}" y="${o.label.textPositionY}" class="color" font-family="Cera Pro"  font-size="${o.label.fontSize}" fill="${o.label.color}">${o.label.text}</text>
		</svg></g>` : ''

	const paths =
		[].concat(getLineNoise(width, height, o))
			.concat(getText(text, width, height, o))
			.sort(() => Math.random() - 0.5)
			.join('');
	const start = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0,0,${width},${height}">`;
	const xml = `${start}${bgRect}${paths}${label}</svg>`;

	return xml;
};

const create = function (options) {
	const text = options.text || random.captchaText(options);
	const data = createCaptcha(text, options);

	return {text, data};
};

const createMathExpr = function (options) {
	const expr = random.mathExpr(options.mathMin, options.mathMax, options.mathOperator);
	const text = expr.text;
	const data = createCaptcha(expr.equation, options);

	return {text, data};
};

module.exports = createCaptcha;
module.exports.randomText = random.captchaText;
module.exports.create = create;
module.exports.createMathExpr = createMathExpr;
module.exports.options = opts;
module.exports.loadFont = optionMngr.loadFont;
