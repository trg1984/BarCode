var barStyles = ["bsAuto", "bsFree", "bsEAN13", "bsUPC12", "bsCode128"];

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
		//console.log(bars);
		var temp = left;
		var whiteBar = firstWhite;
		
		if (!!visible) {
			ctx.fillStyle = 'black';
			ctx.font = fontSize + 'px Arial';
			if (showText && (s != '')) {
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
	barStyle = 'bsCode128';
	
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
			for (i = 0; i < n.length; ++i) {
				var V = Code128.getValue(n[i], Code128.CodeSet.csB);
				if (V == 255) alert(n[i] + ' not found in Code 128 codeset.');
				checkSum = (checkSum + V * (i + 1)) % 103;
				str = Code128.getBarCode(V);
				T = new Array(str.length);
				for (m = 0; m < str.length; ++m) T[m] = str.charAt(m);
				__L(T, false, n[i], thickness, barH);
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
		default: console.log('Unimplemented bar style ' + barStyle); break;
	}
}