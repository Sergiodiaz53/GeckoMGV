/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables//
var canvasMatrix;
var matrix = [];
var currentMatrix = [];
var fileType;
var fileName;
var fileNameMAT;
var maxMat = 0;

function paintMatrix (){
    var ctx = canvasMatrix.getContext("2d");
    var x, y, value;

    for(var i = 1; i< currentMatrix.length; i++) {
        for (var j = 0; j < currentMatrix[i].length; j++) {

            x = i;
            y = 100-j;
            value = Math.log(parseInt(currentMatrix[i][j])+1)/ Math.log(maxMat);

            //	setPixel(ctx, x, y,value);
            var h, l, s;
            var r, g, b;
            h = value;
            l = 0.6;
            s = 0.6;

            if (s == 0) {
                r = g = b = l; // achromatic
            } else {

                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1 / 6) return p + (q - p) * 6 * t;
                    if (t < 1 / 2) return q;
                    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
                    return p;
                }

                var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                var p = 2 * l - q;
                r = hue2rgb(p, q, h + 1 / 3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1 / 3);
            }

            r = Math.floor(r * 255);
            g = Math.floor(g * 255);
            b = Math.floor(b * 255);

            if (parseInt(currentMatrix[i][j]) == 0) {
                r = 255;
                g = 255;
                b = 255;
            }

            ctx.beginPath();
            ctx.fillStyle = rgb(r,g,b);
            ctx.fillRect(i/2, canvasMatrix.height-j, 2, 2);

        }
    }

}
