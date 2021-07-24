var barStyles = ["bsAuto", "bsEAN13", "bsUPCA", "bsCode128", "bsCode39"];

function charToByte(c) {
     switch (c) {
        case '0': return 0; break;
        case '1': return 1; break;
        case '2': return 2; break;
        case '3': return 3; break;
        case '4': return 4; break;
        case '5': return 5; break;
        case '6': return 6; break;
        case '7': return 7; break;
        case '8': return 8; break;
        case '9': return 9; break;
		default: return 10; break;
	 }
}

function drawBarCode(canvas, barStyle, showText, n, x0, y0, w, h, thickness, visible) {
	var left = 0, i, m, barH;
	var fontSize = 12;
	var ctx = canvas.getContext('2d');

	var __L = function(bars, firstWhite, s, thickness, hei) {
		var temp = left;
		var whiteBar = typeof(firstWhite) !== 'undefined' ? firstWhite : true;
		thickness = Number.isSafeInteger(thickness) && (thickness > 0) ? thickness : 1;
		hei = Number.isSafeInteger(hei) && (hei > 0) ? hei : barH;
		
		if (!!visible) {
			ctx.fillStyle = 'black';
			ctx.font = fontSize + 'px Arial';
			if (showText && s && (s != '')) {
				ctx.fillText(s, x0 + left, y0 + hei + fontSize + 3);
			}
		}
		
		for (var j = 0; j < bars.length; ++j) {
			if (!!visible) {
				ctx.beginPath();
				ctx.strokeStyle = whiteBar ? 'white' : 'black';
			
				for (var l = 0; l < bars[j]; ++l)
				for (var k = 0; k < thickness; ++k) {
						
						ctx.moveTo(Math.round(x0 + left + l * thickness + k), y0 + 2);
						ctx.lineTo(Math.round(x0 + left + l * thickness + k), y0 + hei);
				};
				ctx.stroke();
			}
			whiteBar = !whiteBar;
			left += bars[j] * thickness;
		}
		return left - temp;
	}

	left = 5;
	barH = showText ? h - fontSize * 2 - 1 : h - 2;
	barStyle = barStyle ? barStyle : 'bsCode128';
	
	if (!!visible) {
		ctx.fillStyle = "#ffffff";
		ctx.fillRect(0, 0, w, h);
	}
	
	switch (barStyle) {
		case 'bsCode128':
			// Space + "Start codeset B"
			__L([(10)], true, '', thickness, barH);
			var str = Code128.getBarCode(104);
			var T = new Array(str.length);
			for (m = 0; m < str.length; ++m) T[m] = str.charAt(m);
			__L(T, false, '', thickness, barH);

			var checkSum = 104;
			i = 0
			while (i < n.length) {
				var n0;
				if (n.substr(i).search('{FNC1}') === 0) n0 = '{FNC1}';
				else if (n.substr(i).search('{FNC2}') === 0) n0 = '{FNC2}';
				else if (n.substr(i).search('{FNC3}') === 0) n0 = '{FNC3}';
				else if (n.substr(i).search('{FNC4}') === 0) n0 = '{FNC4}';
				else if (n.substr(i).search('{SHIFT}') === 0) n0 = '{SHIFT}';
				else n0 = n[i];

				var V = Code128.getValue(n0, Code128.CodeSet.csB);
				if (V == 255) alert(n0 + ' not found in Code 128 codeset.');
				checkSum = (checkSum + V * (i + 1)) % 103;
				str = Code128.getBarCode(V);
				T = new Array(str.length);
				for (m = 0; m < str.length; ++m) T[m] = str.charAt(m);
				__L(T, false, n0.length === 1 ? n0 : '', thickness, barH);

				i += n0.length;
			}
			
			// checkSum + "Stop" + Space
			str = Code128.getBarCode(checkSum);
			T = new Array(str.length);
			for (m = 0; m < str.length; ++m) T[m] = str.charAt(m);
			__L(T, false, '', thickness, barH);

			str = Code128.getBarCode(106);
			T = new Array(str.length);
			for (m = 0; m < str.length; ++m) T[m] = str.charAt(m);
			__L(T, false, '', thickness, barH);
			__L([(10)], true, '', thickness, barH);
			
			return left;
		break;
		case 'bsCode39':
			__L(Code39.binToBars('010010100'), false, '*', thickness, barH);
			left += thickness;
			for (var i = 0; i < n.length; ++i) {
				var bars = Code39.charToBars(n[i]);
				__L(bars, false, n[i], thickness, barH);
				left += thickness;
			}
			__L(Code39.binToBars('010010100'), false, '*', thickness, barH);
			left += thickness;
			return left;
		break;
		case 'bsUPCA':
		case 'bsEAN13':
			if ((barStyle === 'bsUPCA') && (n.length == 12)) {
				n = '0' + n;
			}

			if (
				(typeof(n) === 'string') &&
				(n.length === 13) &&
				(n.search(/^[0-9]{13}$/) === 0) &&
				(EAN13.checksumDigit(n.substr(0,12)) + '' === n[12]) &&
				((barStyle != 'bsUPCA') || (n.substr(0, 1) == '0'))
			) {
				var params = EAN13.convert(n).map(function(item) { return EAN13.binToBars(item) });
				var s = ' ' + n.substr(1,6) + ' ' + n.substr(7,13);
				__L([7], true, barStyle === 'bsUPCA' ? '' : n.substr(0, 1), thickness, barH);
				for (var i = 0; i < params.length; ++i) {
					__L(params[i].bars, params[i].firstWhite, s[i], thickness, [0, 7, 14].indexOf(i) < 0 ? h - fontSize * 2 - 1 : h - 2);
				}
			}
			return left;
		break;
		default: console.log('Unimplemented bar style ' + barStyle); break;
	}
}