/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables
var canvas, redraw;
var offsetX, offsetY, canvasOffset;
var board = false, zoomBoard = false, vertical = true;
var map = false, dragInMap = false, canvasMap;
var showingSelected=false;
var mouseInRect = {
	x : 0,
	y : 0
};

var filtered=[], lines = [], evolutiveEvents = [];
var currentLines = [], selectedLines=[];

//Annotations paint
var annotationsNumFile, annotationsWorking = false;
var AnotFiles = [], AnnotDataViews = [];

//Back zoom stuff
var backZoomList=[];
var backCanvas =$('<canvas/>',{'class':'canvasLayer img-responsive'}).prop({width: 500,height: 500 });
var backCtx=backCanvas[0].getContext('2d');
var currentZoomIndex=-1;

var currentArea = {
	x0 : 0,
	y0 : 0,
	x1 : 0,
	y1 : 0
};

var RectInMap = {
	x : 0,
	y : 0,
	tamx : 0,
	tamy : 0
};

var xTotal, yTotal;
var scaleX = 1, scaleY = 1;
var zoomed = false, reset = false, selected = false;
var selectLayer=$("#selectLayer")[0];


//Grids
var FragsGrid = [];
var annotsGrid = [];

// Constants
const headerSize = 12;
const fragsStarts = 16;

// Colors
// negro, rojo, azul, naranja, verde, amarillo, morado, verde2
var R = [ 44, 192, 41, 230, 39, 241, 142, 22 ];
var G = [ 62, 57, 128, 126, 174, 196, 68, 160 ];
var B = [ 80, 43, 185, 34, 96, 15, 173, 133 ];

// Initial Functions
window.onload = function() {
	createInstance();
};

//Add zoom to the backZoomList array
function addPrevZoom(){
	backCtx.save();
	backCtx.clearRect(0, 0, backCtx.canvas.width, backCtx.canvas.height);
	backCtx.restore();
	for(var i=0;i<lines.length;i++){
		var canvasLayer= $("#layer"+i)[0];
		backCtx.drawImage(canvasLayer,0,0);
	}
    var horizontalLayers=[];
    for(var x=0;x<$("#horizontalCanvasContainer")[0].childNodes.length-1;x++) {
        var horizontalLayer = createHorizontalComparisonLayer(x);
        var horImg = horizontalLayer.getContext('2d').getImageData(0, 0, horizontalLayer.width, horizontalLayer.height);
        horizontalLayers.push(horImg);
    }
	var img=backCtx.getImageData(0,0,canvas.width,canvas.height);
	backZoomList[++currentZoomIndex]=[$.extend(true, {},currentArea),img,$.extend(true, {},RectInMap),horizontalLayers];
	console.log("modifying index: "+currentZoomIndex);
	backZoomList.length=currentZoomIndex+1;
	if(currentZoomIndex>0)
		$("#prevZoom").prop( "disabled",false);
}

//Go to the previous zoom
function goToPrevZoom(){
	if(currentZoomIndex>0) {

		for (var i = 0; i < lines.length; i++) {
			clearCanvas("layer" + i);
		}

		var l0Ctx = $("#layer0")[0].getContext('2d');
		var last = backZoomList[--currentZoomIndex];
		currentArea = $.extend(true, {},last[0]);
        RectInMap=$.extend(true, {},last[2]);
        redrawMap();

        for(var j=0;j<last[3].length;j++){
            clearCanvas(createHorizontalComparisonLayer(j).id);
            createHorizontalComparisonLayer(j).getContext('2d').putImageData(last[3][j],0,0);
        }

		scaleX = (currentArea.x1 - currentArea.x0) / canvas.width;
		scaleY = (currentArea.y1 - currentArea.y0) / canvas.height;
		l0Ctx.putImageData(last[1], 0, 0);
		drawSelectedFrags();

		paintCodingRegions(annotationsNumFile)

		if($("#nextZoom").prop( "disabled"))
			$("#nextZoom").prop( "disabled",false);
		if(currentZoomIndex<=0)
			$("#prevZoom").prop( "disabled",true);

		console.log("------- CURRENT INDEX: "+ currentZoomIndex);
	}
}

//Go forward zooming
function goToNextZoom(){
	if(currentZoomIndex<backZoomList.length-1) {
		for (var i = 0; i < lines.length; i++) {
			clearCanvas("layer" + i);
		}
		var l0Ctx = $("#layer0")[0].getContext('2d');
		var last = backZoomList[++currentZoomIndex];
        RectInMap=$.extend(true, {},last[2]);
        redrawMap();
		currentArea = $.extend(true, {},last[0]);
        for(var i=0;i<last[3].length;i++){
            clearCanvas(createHorizontalComparisonLayer(i).id);
            createHorizontalComparisonLayer(i).getContext('2d').putImageData(last[3][i],0,0);
        }
		scaleX = (currentArea.x1 - currentArea.x0) / canvas.width;
		scaleY = (currentArea.y1 - currentArea.y0) / canvas.height;
		l0Ctx.putImageData(last[1], 0, 0);
		drawSelectedFrags()
		if($("#prevZoom").prop( "disabled"))
			$("#prevZoom").prop( "disabled",false);
		if(currentZoomIndex>=backZoomList.length-1)
			$("#nextZoom").prop( "disabled", true );
		paintCodingRegions(annotationsNumFile)
	}
	console.log("------- CURRENT INDEX: "+ currentZoomIndex);
}

//Draw in red frag that have been selected (Storaged in SelectedLines)
function drawSelectedFrags(){
	if(selectedLines.length>0) {
		clearCanvas("selectLayer");
		$('#executeServiceButton').prop('disabled', false);
		for (var i = 0; i < selectedLines.length; i++)
			if ($("#checklayer" + i)[0].checked) {
				drawLinesInLayer(selectedLines[i], selectLayer, i, rgb(255, 0, 0));
				drawHorizontalLinesInHorizontalLayer(selectedLines[i], document.getElementById("hSel" + i), i, rgb(255, 0, 0), false)
			}
	}
}

/**
 * Erase all the content in the canvas given
 * @param  {String} canvasName [Canvas ID to erase content]
 * @author Sergio
 */
function clearCanvas(canvasName) {
    var canvasToClear = document.getElementById(canvasName);
    var ctx = canvasToClear.getContext('2d');

	// Clear the canvas
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.restore();
}

/**
 * Parse the header of a loaded file, store it in a data structure and generate the table to be consulted
 * by the interface. The generated tables have the ID 'csvInfoTable2-[NUMFILE]'. The file header structure is defined as an object in the
 * FileManager.js as 'CSVHeader'
 * @param  {Array} currentLines Group of lines which we are currently working
 * @param  {Number} numFile    Index number of the file (First file loaded is 0)
 */
function storeFileHeader(currentLines, numFile) {
    console.time("CreateFileHeader()");

    var headers = new Array([]);

    var table2 = document.createElement("table");
    table2.className = "table table-striped";
    table2.id = "csvInfoTable2-" + numFile;

	// Insert file header
    var row = table2.insertRow(-1);
    row.className = "hiddenRow";
    var auxLine = currentLines[0].toString().split(":");
    var firstNameCell = row.insertCell(-1);
    firstNameCell.appendChild(document
                .createTextNode(auxLine[0]));

	var row = table2.insertRow(-1);
    row.className = "hiddenRow";
    auxLine = currentLines[1].toString().split(":");
    var firstNameCell = row.insertCell(-1);
    firstNameCell.appendChild(document
                .createTextNode(auxLine[0].toString()));

    for (var i = 2; i <= headerSize; i++) {
        var row = table2.insertRow(-1);
		row.className = "hiddenRow";
        var auxLine = currentLines[i].toString().split(":");
        if (auxLine.length == 1) {
            auxLine = currentLines[i].toString().split(",")
        }

        headers.push(auxLine[1].substr(0, auxLine[1].length));

        var firstNameCell = row.insertCell(-1);
        firstNameCell.appendChild(document
                    .createTextNode(auxLine[0]));

        var firstNameCell = row.insertCell(-1);
        firstNameCell.appendChild(document
                    .createTextNode(auxLine[1].substr(0,
                auxLine[1].length)));
    }

    var row = table2.insertRow(-1);
    row.className = "hiddenRow";
    auxLine = currentLines[13].toString().split(":");
    var firstNameCell = row.insertCell(-1);
    firstNameCell.appendChild(document
                .createTextNode(auxLine[0].toString()));

    var row = table2.insertRow(-1);
    row.className = "hiddenRow";
    auxLine = currentLines[14].toString().split(":");

    if (auxLine.length == 1) {
        auxLine = currentLines[14].toString().split(",")
    }

    var firstNameCell = row.insertCell(-1);
    firstNameCell.appendChild(document
                .createTextNode(auxLine[0].toString()));
    var firstNameCell = row.insertCell(-1);
    firstNameCell.appendChild(document
                .createTextNode(auxLine[1].toString()));

    var row = table2.insertRow(-1);
    row.className = "hiddenRow";
    auxLine = currentLines[15].toString().split(":");
    var firstNameCell = row.insertCell(-1);
    firstNameCell.appendChild(document
                .createTextNode(auxLine[0].toString()));

    fileHeader[numFile] = new CSVHeader(headers);

    document.getElementById("fileName").innerHTML += '<button id="infoPopover'
							+ numFile
							+ '" type="button" class="btn btn-warning btn-xs btn-padding" '
                            + 'data-container="body" data-toggle="popover" title ="'
                            +headers[1].substr(0,headers[1].length-6)+" - "
                            +headers[2].substr(0,headers[2].length-6)
                            +' "data-placement="right" data-html="true" data-content="<b> X Sequence length: </b>'
							+ fileHeader[numFile].seqXLength
							+ '</br> <b> Y Sequence length: </b>'
							+ fileHeader[numFile].seqYLength + '">?</button>';
    if(lines.length>1)
        document.getElementById("infoPopover"+numFile).style.background=rgb(R[numFile],G[numFile],B[numFile]);
    $('[data-toggle="popover"]').popover();
    fileInfo[numFile]=table2;
    console.timeEnd("CreateFileHeader()");
}

/**
 * Draw an array of index (fragments) in a given canvas.
 * @param  {Array} linesToPaint Array of index of fragments to paint.
 * @param  {String} canvasLayer  [Canvas to paint]
 * @param  {Number} numFile      [Index number of the file (First file loaded is 0)]
 * @param  {String} color        [RGBA color]
 */
function drawLinesInLayer(linesToPaint, canvasLayer, numFile, color){
	var currentCtx = canvasLayer.getContext('2d');

	currentCtx.beginPath();
	for (var x in linesToPaint){
		line = linesToPaint[x];

		var xIni = ((canvasLayer.width * (parseInt(lines[numFile][line][1]) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
				* canvasLayer.width;
		var yIni = ((canvasLayer.height * (parseInt(lines[numFile][line][2]) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
				* canvasLayer.height;
		var xFin = ((canvasLayer.width * (parseInt(lines[numFile][line][3]) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
				* canvasLayer.width;
		var yFin = ((canvasLayer.height * (parseInt(lines[numFile][line][4]) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
				* canvasLayer.height;


		if((xFin-xIni < 0.1)&&(xFin-xIni>0)){
			xFin = xIni + 0.1;
		}

		if((yFin-yIni < 0.1)&&(yFin-yIni >0)){
			yFin = yIni +0.1 ;
		}

		//console.log((lines[numFile][line][1])+" = "+xIni+"; "+(lines[numFile][line][2])+" = "+yIni+(lines[numFile][line][3])+" = "+xFin+"; "+(lines[numFile][line][4])+" = "+yFin);

		currentCtx.moveTo(xIni, canvasLayer.height - yIni);
		currentCtx.lineTo(xFin, canvasLayer.height - yFin);
	}
	currentCtx.closePath();
	currentCtx.lineWidth = 2;
	currentCtx.strokeStyle = color;
	currentCtx.stroke();
}

/**
 * Draw an array of lines (fragments) in a given canvas.
 * @param  {Array} linesToPaint Array of fragments to paint.
 * @param  {String} canvasLayer  [Canvas to paint]
 * @param  {Number} numFile      [Index number of the file (First file loaded is 0)]
 * @param  {String} color        [RGBA color]
 */
function drawArrayFragsInLayer(arrayLinesToPaint, canvasLayer, numFile, color){
	var currentCtx = canvasLayer.getContext('2d');

	currentCtx.beginPath();
	for (var x in arrayLinesToPaint){
		line = arrayLinesToPaint[x];

		var xIni = ((canvasLayer.width * (parseInt(line[1]) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
				* canvasLayer.width;
		var yIni = ((canvasLayer.height * (parseInt(line[2]) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
				* canvasLayer.height;
		var xFin = ((canvasLayer.width * (parseInt(line[3]) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
				* canvasLayer.width;
		var yFin = ((canvasLayer.height * (parseInt(line[4]) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
				* canvasLayer.height;


		if((xFin-xIni < 0.1)&&(xFin-xIni>0)){
			xFin = xIni + 0.1;
		}

		if((yFin-yIni < 0.1)&&(yFin-yIni >0)){
			yFin = yIni +0.1 ;
		}

		//console.log((lines[numFile][line][1])+" = "+xIni+"; "+(lines[numFile][line][2])+" = "+yIni+(lines[numFile][line][3])+" = "+xFin+"; "+(lines[numFile][line][4])+" = "+yFin);

		currentCtx.moveTo(xIni, canvasLayer.height - yIni);
		currentCtx.lineTo(xFin, canvasLayer.height - yFin);
	}
	currentCtx.closePath();
	currentCtx.lineWidth = 2;
	currentCtx.strokeStyle = color;
	currentCtx.stroke();
}

/* Deprecated */
function loadHorizontalView(){

    //change the main canvas to horizontal
    if (canvas.height != 250)
        canvas.height = 250;
    if (canvas.width != 700)
        canvas.width = 700;
    var ctx = canvas.getContext('2d');


    //Paint genome lines
    var padding = 50;
    ctx.beginPath();
    ctx.moveTo(0, padding / 2);
    ctx.lineTo(canvas.width, padding / 2);
    ctx.moveTo(0, canvas.height - padding / 2);
    ctx.lineTo(canvas.width, canvas.height - padding / 2);
    ctx.lineWidth = 4;
    ctx.strokeStyle = rgb(0,0,0);
    ctx.fill();
    ctx.stroke();
    /*
    Create canvas for each genome comparison in horizontal
    */

    for (var numCanvas = 1; numCanvas < lines.length; numCanvas++) {
        var canvasTemp = document
            .getElementById("myCanvas" + numCanvas);
        var ctxTemp = canvasTemp.getContext("2d");

        ctxTemp.beginPath();
        ctxTemp.moveTo(0, padding / 2);
        ctxTemp.lineTo(canvas.width, padding / 2);
        ctxTemp.moveTo(0, canvas.height - padding / 2);
        ctxTemp.lineTo(canvas.width, canvas.height - padding / 2);
        ctxTemp.lineWidth = 4;

        ctxTemp.strokeStyle = "rgb(0,0,0)";

        ctxTemp.fill();
        ctxTemp.stroke();

    }
}

function resetZoom(){
    currentArea.x0 = 0;
    currentArea.y0 = 0;
    currentArea.x1 = canvas.width;
    currentArea.y1 = canvas.height;
    scaleX = 1;
    scaleY = 1;
	currentZoomIndex=-1;
	backZoomList=[];
    reset = false;
}

/**
 * Create vertical layer for each comparison
 * @param  {Number} numLayer [index number for the layer]
 */
function createVerticalComparisonLayer(numLayer){
	var idVerticalLayer = "layer"+numLayer;

	if($("#" + idVerticalLayer).length == 0) {

		//If layer doesn't exist
		var newVerticalLayer =
				$('<canvas/>',{'class':'canvasLayer img-responsive', 'id': idVerticalLayer}).prop({
                    width: 500,
                    height: 500
                });
		$("#canvasContainer").append(newVerticalLayer);
		createComparisonCheck(numLayer);
	}

	return $("#"+idVerticalLayer)[0];
}

/**
 * Create horizontal layer for each comparison
 * @param  {Number} numLayer [index number for the layer]
 */
function createHorizontalComparisonLayer(numLayer){
	var idHorizontalLayer = "hlayer"+numLayer;

	if($("#" + idHorizontalLayer).length == 0) {
		var newHorizontalLayer =
				$('<canvas/>',{'class':'horizontalCanvasLayer img-responsive', 'id': idHorizontalLayer}).prop({
                    width: 500,
                    height: 200
                });
        var newHorizontalSelectionLayer=$('<canvas/>',{'class':'horizontalCanvasLayer img-responsive', 'id': "hSel"+numLayer}).prop({
                    width: 500,
                    height: 200,
                });
        var newHorizontalView=$('<div/>',{'id': "hView"+numLayer}).css({'position':'relative'});
		$("#horizontalCanvasContainer").append(newHorizontalView);
        newHorizontalView.append(newHorizontalLayer);
        $(newHorizontalSelectionLayer).css({'position':'absolute','background':'transparent','z-index':'2','margin-top':'0px'});
        newHorizontalSelectionLayer.insertBefore(newHorizontalLayer);
	}
	return $("#"+idHorizontalLayer)[0];
}

/**
 * Create new Map image layer for each comparison
 * @param  {Number} numLayer [index number for the layer]
 */
function createMapImageLayer(numLayer) {

	var idLayer = "Maplayer"+numLayer;

	var newLayer =
			$('<img/>',{'class':'mapimage', 'id': idLayer}).prop({
				width: 202,
				height: 202
			});
	$("#canvasMapContainer").prepend(newLayer);

	return $("#"+idLayer)[0];
}

/**
 * Create a checkbox for each new layer generated
 * @param  {Number} numLayer [index number of the layer]
 */
function createComparisonCheck(numLayer){
	var idVerticalLayer = "layer"+numLayer;
	var idHorizontalLayer = "hView"+numLayer;
	var idMapimageLayer = "Maplayer"+numLayer;

	var newLayerBoxElement =
				$('<input type="checkbox" class="switchLayer" id="checklayer'+numLayer+'"checked="checked" value="'+numLayer+'"/> '+fileNames[numLayer]+'</input><button class="btn btn-info btn-xs btn-annt" id="Anot'+numLayer+'" onclick="annotOnClick('+numLayer+')" disabled>Annot</button>');

	var row = $("<tr>");
	var column = row.append( $("<td>").append(newLayerBoxElement));
	$('#layersTable').last().append(row);

	$(newLayerBoxElement).change(function() {
        clearCanvas("selectLayer");
		if ($(this).is(':checked')) {
			$('#'+idVerticalLayer).show();
			$('#'+idHorizontalLayer).show();
			//$('#'+idHorizontalSelectionLayer).show();
			$('#'+idMapimageLayer).show()
					.removeAttr('style');
		} else {
			$('#'+idVerticalLayer).hide();
			$('#'+idHorizontalLayer).hide();
			//$('#'+idHorizontalSelectionLayer).hide();
			$('#'+idMapimageLayer).hide();
		}
        drawSelectedFrags();
	});
}


/**
 *  Paint an array of lines in a vertical layer
 * @param  {Number} linesToPaint Array of index of the lines
 * @param  {Number} canvasLayer  ID of the canvas layer
 * @param  {Number} numFile      Number of the file
 * @param  {Number} color        RGBa color
 */
function drawVerticalLinesInVerticalLayer(linesToPaint, canvasLayer, numFile, color){

	var currentCtx = canvasLayer.getContext('2d');
	currentCtx.beginPath();

	var count = 0;
	var counttotal = 0;

	console.time("DrawFiltrar");
	for (var x in linesToPaint){
		var line = linesToPaint[x];

		var xIni = ((canvasLayer.width * (parseInt(lines[numFile][line][1]) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
				* canvasLayer.width;
		var yIni = ((canvasLayer.height * (parseInt(lines[numFile][line][2]) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
				* canvasLayer.height;
		var xFin = ((canvasLayer.width * (parseInt(lines[numFile][line][3]) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
				* canvasLayer.width;
		var yFin = ((canvasLayer.height * (parseInt(lines[numFile][line][4]) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
				* canvasLayer.height;

		if((xFin-xIni < 1)&&(xFin-xIni>0)){
			xFin = Math.floor(xIni + 1);
		}

		if((yFin-yIni < 1)&&(yFin-yIni>0)){
			yFin = Math.floor(yIni +0.1);
		}

		//console.log((lines[numFile][line][1])+" = "+xIni+"; "+(lines[numFile][line][2])+" = "+yIni+(lines[numFile][line][3])+" = "+xFin+"; "+(lines[numFile][line][4])+" = "+yFin);

		var distance = calculateDistanceBetweenTwoPoints(xIni,yIni,xFin,yFin);
		//console.log("Distance: "+distance);
		if(distance<=1){
			count++;
		}
		counttotal++;
		if(distance>1){
			currentCtx.moveTo(xIni, canvasLayer.height - yIni);
			currentCtx.lineTo(xFin, canvasLayer.height - yFin);
		}
	}
	console.timeEnd("DrawFiltrar");

	console.time("DrawComienzo");

	console.log("Count: "+count);
	console.log("CountTotal: "+counttotal);
	currentCtx.closePath();
	currentCtx.lineWidth = 2;
	currentCtx.strokeStyle = color;


	currentCtx.stroke();

	console.timeEnd("DrawComienzo")
}

/**
 * Return the distance between two given points
 * @param  {Number} x1 X coordinate for the first point
 * @param  {Number} y1 Y coordinate for the first point
 * @param  {Number} x2 X coordinate for the second point
 * @param  {Number} y2 Y coordinate for the second point
 * @return {Number}    Distance
 */
function calculateDistanceBetweenTwoPoints(x1,y1,x2,y2){
    return Math.sqrt(Math.pow(x2 - x1, 2)+ Math.pow(y2 - y1, 2));
}

/**
 *  Paint an array of lines in a horizontal layer
 * @param  {Array} linesToPaint Array of index of the lines
 * @param  {Number} canvasLayer  ID of the canvas layer
 * @param  {Number} numFile      Number of the file
 * @param  {String} color        RGBa color
 */
function drawHorizontalLinesInHorizontalLayer(linesToPaint, canvasLayer, numFile, color, filterflag = true) {

	var currentCtx = canvasLayer.getContext('2d');
	var padding = 50;

	var current_anscombe = current_anscombe_results[numFile];
	if (filterflag) {
		test_ans = current_anscombe;
		// Normalize filter
		var current_filter = (current_anscombe.mean + current_anscombe.sigma) / current_anscombe.sigma;

	}else {
		var current_filter = -100;
	}

	currentCtx.beginPath();
	for (var x in linesToPaint) {

		let line = linesToPaint[x];
		let temp_anscombe = anscombeTransform( parseInt(lines[numFile][line][7]) );
		// Normalize temporal anscombe transformation
		if( (temp_anscombe - current_anscombe.mean) / current_anscombe.sigma >= current_filter){
			var xIni = (canvasLayer.width * parseInt(lines[numFile][line][1]) / xTotal);
			var yIni = (canvasLayer.width * parseInt(lines[numFile][line][2]) / yTotal);
			var xFin = (canvasLayer.width * parseInt(lines[numFile][line][3]) / xTotal);
			var yFin = (canvasLayer.width * parseInt(lines[numFile][line][4]) / yTotal);
			drawLine(xIni,xFin,yIni,yFin);

		}
	}

	currentCtx.closePath();
	currentCtx.lineWidth = 2;
	currentCtx.fillStyle = currentCtx.strokeStyle = color;
	currentCtx.fill();
	currentCtx.stroke();

	function drawLine(xIni, xFin, yIni, yFin) {
		// Filter by lineWidth (2)
		//if( (xFin-xIni)>=current_mean && (yFin - yIni)>=current_mean){
			// Rect in sequence X
			currentCtx.rect(xIni, 0, xFin - xIni, padding / 2);

			var halfX = xIni + ((xFin - xIni) / 2);
			var halfY = yIni + ((yFin - yIni) / 2);
			currentCtx.moveTo(halfX, padding / 2);
			currentCtx.lineTo(halfX, padding);
			currentCtx.moveTo(halfX, padding);
			currentCtx.lineTo(halfY, canvasLayer.height - padding);

			// Rect in sequence Y
			var rectYHeight;
			if (yFin < yIni) {
				rectYHeight = canvasLayer.height - padding / 2;
			} else {
				rectYHeight = canvasLayer.height - padding;
			}
			currentCtx.rect( yIni, rectYHeight, yFin - yIni, padding / 2);

			//console.log("Xini; Xfin; Yini; Yfin :: "+(xIni) +";"+ xFin+";"+yIni +";"+(yFin));
			//console.log("Xwidth: "+(xFin-xIni) +" Ywidth: "+(yFin - yIni));
		//}
				/*
		roundRect(currentCtx, xIni, 0, xFin - xIni, padding / 2);

		var halfX = xIni + ((xFin - xIni) / 2);
		var halfY = yIni + ((yFin - yIni) / 2);
		currentCtx.moveTo(halfX, padding / 2);
		currentCtx.lineTo(halfX, padding);
		currentCtx.moveTo(halfX, padding);
		currentCtx.lineTo(halfY, canvasLayer.height - padding);


		// Rect in sequence Y
		var rectYHeight;
		if (yFin < yIni) {
			rectYHeight = canvasLayer.height - padding / 2;
			currentCtx.moveTo(halfY, canvasLayer.height - padding / 2);
			currentCtx.lineTo(halfY, canvasLayer.height - padding);
		} else {
			rectYHeight = canvasLayer.height - padding;
		}

		roundRect(currentCtx, yIni, rectYHeight, yFin - yIni, padding / 2);
		*/
	}

}

/**
 * Draws a rounded rectangle using the current state of the canvas. If you omit
 * the last three params, it will draw a rectangle outline with a 5 pixel border
 * radius
 *
 * @param {CanvasRenderingContext2D}
 *            ctx
 * @param {Number}
 *            x The top left x coordinate
 * @param {Number}
 *            y The top left y coordinate
 * @param {Number}
 *            width The width of the rectangle
 * @param {Number}
 *            height The height of the rectangle
 * @param {Number}
 *            radius The corner radius. Defaults to 5;
 * @param {Boolean}
 *            fill Whether to fill the rectangle. Defaults to false.
 * @param {Boolean}
 *            stroke Whether to stroke the rectangle. Defaults to true.
 */
function roundRect(currentCtx, x, y, width, height, radius, fill) {
	var	radius = 5;

	//console.log("X: "+x+" Y: "+y+" W: "+width);

	if(width>0) {

		currentCtx.moveTo(x + radius, y);
		currentCtx.lineTo(x + width - radius, y);
		currentCtx.quadraticCurveTo(x + width, y, x + width, y + radius);
		currentCtx.lineTo(x + width, y + height - radius);
		currentCtx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
		currentCtx.lineTo(x + radius, y + height);
		currentCtx.quadraticCurveTo(x, y + height, x, y + height - radius);
		currentCtx.lineTo(x, y + radius);
		currentCtx.quadraticCurveTo(x, y, x + radius, y);

	} else {

		currentCtx.moveTo(x - radius, y);
		currentCtx.lineTo(x + width + radius, y);
		currentCtx.quadraticCurveTo(x + width, y, x + width, y + radius);
		currentCtx.lineTo(x + width, y + height - radius);
		currentCtx.quadraticCurveTo(x + width, y + height, x + width + radius, y + height);
		currentCtx.lineTo(x - radius, y + height);
		currentCtx.quadraticCurveTo(x, y + height, x, y + height - radius);
		currentCtx.lineTo(x, y + radius);
		currentCtx.quadraticCurveTo(x, y, x - radius, y);

	}
}

/**
 * Create an instance of the program. Contains the Redraw function
 */
function createInstance() {

	canvas = document.getElementById("myCanvas");
	canvasMap = document.getElementById("myMap");
	canvasOffset = $("#myCanvas").offset();
	offsetX = canvasOffset.left;
	offsetY = canvasOffset.top;

	var ctx = canvas.getContext('2d');
	var ctxMap = canvasMap.getContext('2d');
	ctxMap.strokeStyle = "#FF0000";
	trackTransforms(ctx);

	redrawMap = function redrawMap() {
		ctxMap.clearRect(0, 0, canvasMap.width, canvasMap.height);
		ctxMap.strokeRect(RectInMap.x, RectInMap.y, RectInMap.tamx,
				RectInMap.tamy);
	};

	redraw = function redraw() {
		overlayOn();
		console.time("reDraw()");

		FragsGrid = [];

		// Clear previous data in HTML
		document.getElementById("output").innerHTML = "<div class=\"SearchTitle\" > <div class=\"SearchTitleFilterButton\"> <span>Filter:</span> <input type=\"text\" class=\"SearchFilter\" /> <button class=\"SearchButton\" onclick=\"showResults($(\'.SearchFilter\').val(),true)\" ><span class=\"glyphicon glyphicon-search\"></span></button> </div> </div> <ul class='nav nav-tabs' id='files-tab'></ul>"
				+ " <div class='tab-content' id='files-tab-content'></div>";

		// Draw Grid
		drawGrid(board, vertical, "myCanvasGrid");


		spinnerOn("Filtering lines in CSV...");
		for (var numFile = 0; numFile < lines.length; numFile++) {
            console.log("Round: "+numFile);

			currentLines = lines[numFile].slice(0);

			if (currentLines) {

				var mode = document.option.tipo;

				// Store the file header
				if (fileHeader.length < lines.length) storeFileHeader(currentLines, numFile);

				//Reset if needed
				if (!xTotal || !yTotal || reset) resetZoom();

				xTotal = fileHeader[0].seqXLength;
				yTotal = fileHeader[0].seqYLength;

				var linesToPaint = [], filteredLines = [], CSBLines = [];

				var currentVerticalCanvas = createVerticalComparisonLayer(numFile);
				var currentHorizontalCanvas = createHorizontalComparisonLayer(numFile);

				//Start the paint proccess
				for (i = fragsStarts; i < currentLines.length; i++) {

					var paint = false;

					if (currentLines[i][0]=='CSB' || currentLines[i][0] == 'Frag') {

						if(currentLines[i][0]=='CSB') CSBLines.push(i);

						//Check mode (HSP, CSB or both)
						if ((mode[0].checked && mode[0].value == currentLines[i][0])
								|| (mode[1].checked && mode[1].value == currentLines[i][0])
								|| mode[2].checked) {

							// console.time("filter()");
							paint = filter(currentLines[i]);
							// console.timeEnd("filter()");

							//Zoom filter
							if (paint == true) {
								if ((parseInt(currentLines[i][1]) >= (currentArea.x0
										* xTotal / 500))
										&& (parseInt(currentLines[i][2]) >= (currentArea.y0
												* yTotal / 500))
										&& (parseInt(currentLines[i][3]) <= (currentArea.x1
												* xTotal / 500))
										&& (parseInt(currentLines[i][4]) <= (currentArea.y1
												* yTotal / 500))) {
									paint = true;
								} else {
									paint = false;
								}

							}

							if (paint == true && !(filtered[numFile]!=null&&filtered[numFile].indexOf(i)>-1)) {
								linesToPaint.push(i);
							} else {
								filteredLines.push(i);
							}
						}
					}
				}

				//Draw in vertical layer
				clearCanvas(currentVerticalCanvas.id);
				spinnerOn("Drawing Frags on Grid...");
				drawVerticalLinesInVerticalLayer(linesToPaint,currentVerticalCanvas,numFile,rgba(R[numFile], G[numFile], B[numFile], 1));
				drawVerticalLinesInVerticalLayer(filteredLines,currentVerticalCanvas,numFile,rgba(189, 195, 199, 0.3));

				//Draw in horizontal layer
				spinnerOn("Drawing Horizontal view...");
				drawHorizontalLinesInHorizontalLayer(filteredLines, currentHorizontalCanvas, numFile, rgba(189, 195, 199, 0.5));
				drawHorizontalLinesInHorizontalLayer(linesToPaint, currentHorizontalCanvas, numFile, rgba(R[numFile], G[numFile], B[numFile], 0.7));

				//drawHorizontalLinesInHorizontalLayer(filteredLines, currentHorizontalCanvas, numFile, rgba(189, 195, 199, 0.5));

				generateFragTable(currentLines, numFile, linesToPaint, false);

				//Draw Annotations
				if(annotationsWorking && numFile == annotationsNumFile) {
					spinnerOn("Writing Annotations...");
					d3.select("#annotationXLayer").remove();
					d3.select("#annotationYLayer").remove();
					annotationsWorking = false;
					paintCodingRegions(numFile);
				}

				//Draw Selected frags
				spinnerOn("Drawing Selected Frags...");
				drawSelectedFrags();

			}

			RectInMap.x = Math.min(currentArea.x0, currentArea.x1) * 2 / 5;
			RectInMap.y = (canvas.width - Math.max(currentArea.y0, currentArea.y1)) * 2 / 5;
			RectInMap.tamx = Math.abs(currentArea.x0 - currentArea.x1) * 2 / 5;
			RectInMap.tamy = Math.abs(currentArea.y0 - currentArea.y1) * 2 / 5;

			if(RectInMap.tamx < 5 || RectInMap.tamy < 5) {
				RectInMap.tamx = 5; RectInMap.tamy = 5;
			}

			redrawMap();

			if ((numFile <= (lines.length-1)) && (map == false)) {
				var mapimage = createMapImageLayer(numFile);
				mapimage.src = currentVerticalCanvas.toDataURL("image/png");
				if(numFile==lines.length-1) map = true;
			}
		}

		for(var index=0;index<searchList.length;index++)
			document.getElementById(searchList[index]).checked=false;
		searchList=[];
		//prevFragsTable=document.getElementById("files-tab-content").cloneNode(true);
        //prevAnnotTable=document.getElementById("annotations-tab-content").cloneNode(true);
		console.timeEnd("reDraw()");

		overlayOff();
		spinnerOff();
    drawSelectedFrags();

		$("#nextZoom").prop( "disabled", true);
		$("#prevZoom").prop( "disabled", true);
	};

	var lastX = canvas.width / 2, lastY = canvas.height / 2;
	var dragStart, dragged, area = false, mousedown = false, startX, startY, mouseX, mouseY,squared ,shiftSel,filterSel,ctrlZoom= false;

	window.addEventListener('keydown',
			function(evt) {

		switch(evt.keyCode) {
			case 16:
				canvas.style.cursor = "pointer";
				shiftSel = true;
				break;
			/*case 18: //Alt: Block dragging on square shape
				squared = true;
				break;*/
            case 17: //Ctrl: Block dragging on square shape only when ussed together with Alt
                squared=true;
                break;
			case 70:
				if($("#filterManual")[0].checked)
				filterSel = true;
				break;
		}

	}, false);
	window.addEventListener('keyup',
			function(evt) {

		switch(evt.keyCode) {

			case 16:
				canvas.style.cursor = "default";
				shiftSel = false;
				break;
			/*case 18:
				squared = false;
				break;*/
            case 17: //Ctrl: Block dragging on square shape only when ussed together with Alt
                squared=false;
                break;
			case 70:
				filterSel = false;
				break;
		}

	}, false);
	canvas.addEventListener('mousedown',
            function(evt) {
                document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
                lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
                lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
                dragStart = ctx.transformedPoint(lastX, lastY);
                dragged = false;
                console.log("MouseDown")
                mousedown = true;
				startX=getMousePos(canvas,evt).x;
                //startX = parseInt(evt.clientX - offsetX);
                startY=canvas.width-getMousePos(canvas,evt).y;
                //startY = parseInt(evt.clientY - offsetY);
            }, false);
	canvas.addEventListener('mouseup',
			function(evt) {
				console.log("MouseUP");
				mousedown = false;
				dragStart = null;

				if (!dragged) {
                    if (!shiftSel) {
						$("#filter").html("Filter");
                        selectFrag(lines, getMousePos(canvas, evt), evt);
                        selectedLines = [];
                    }else{
                        var linefound=false;
                        var arrayIndex=0;
                        var lineIndex=0;
                        var distance=0;
                        var x1,y1,x2,y2;
                        var x0=getMousePos(canvas,evt).x;
                        var y0=getMousePos(canvas,evt).y;
						console.log("mouseX:"+x0+" mouseY:"+y0);
	                    var mode = document.option.tipo;
                        $('#CSBPopover').hide();
                        for (var j = 0; j < lines.length; j++) {
                        xTotal = fileHeader[0].seqXLength;
                        yTotal = fileHeader[0].seqYLength;
                        var i = 17;

                        console.log("X: " + xTotal + " Y:" + yTotal);

                        while (!linefound && i < lines[j].length) {

                            x1 = ((((canvas.width * parseInt(lines[j][i][1])) / xTotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
                                    * canvas.width;
                            y1 = ((((canvas.height * parseInt(lines[j][i][2])) / yTotal) - currentArea.y0) /  ((currentArea.y1 - currentArea.y0)))
                                    * canvas.height;
                            x2 = (((canvas.width * (parseInt(lines[j][i][3])) / xTotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
                                    * canvas.width;
                            y2 = (((canvas.height * (parseInt(lines[j][i][4])) / yTotal) - currentArea.y0) / ((currentArea.y1 - currentArea.y0)))
                                    * canvas.height;

                            if ((mode[0].checked && mode[0].value == lines[j][i][0])
                                    || (mode[1].checked && mode[1].value == lines[j][i][0])
                                    || mode[2].checked) {

                                if ((x0 > x1) && (x0 < x2) && (y0 != y1) && y0!= y2) {
                                    distance = calculateDistance(getMousePos(canvas,evt),lines[j][i]);
                                    if (distance < 6) {
                                        linefound = true;
                                        arrayIndex = j;
                                        lineIndex = i;
                                        //console.log("linefound PP: " + j + " " + i);
                                    } else {
                                        i++;
                                    }

                                }else {
                                i++;
                                }
                            } else {
                                i++;
                            }
		}
							console.log(linefound);
                            if(linefound&&filter(lines[arrayIndex][lineIndex])){
                                if(selectedLines[arrayIndex]==null)
                                    selectedLines[arrayIndex]=[];
                                var index =-1;
                                if((index=selectedLines[arrayIndex].indexOf(lineIndex))>-1){
                                    selectedLines[arrayIndex].splice(index, 1);
									clearCanvas("selectLayer");
                                    drawVerticalLinesInVerticalLayer(selectedLines[arrayIndex], selectLayer, arrayIndex, rgb(255,0,0));
                                }else{
                                    selectedLines[arrayIndex].push(lineIndex);
                                    drawVerticalLinesInVerticalLayer( [lineIndex], selectLayer,arrayIndex, rgb(255,0,0));
                                }
                            }
                        }
                    }
                }

				if ((!selected) && vertical){
                    if(selectedLines.length==0) {
                        clearCanvas("selectLayer");
                        for (var i = 0; i < lines.length; i++)
                            clearCanvas("hSel" + i);
                    }
                    $('#CSBPopover').hide();
				}

				if ((area) && vertical&&!shiftSel&&!filterSel&&lines.length) {
                    document.getElementById("myCanvasLayer2").getContext("2d").clearRect(0,0,500,500);
					$('#CSBPopover').hide();
                    if(startX>mouseX)
                        startX=[mouseX,mouseX=startX][0];

                    if(startY>mouseY)
                        startY=[mouseY,mouseY=startY][0];

					console.log("Selecting new area :" + startX + ","
							+ (canvas.height - mouseY) + "," + mouseX + ","
							+ (canvas.height - startY));

					currentArea.x1 = currentArea.x0 + mouseX * scaleX;
					currentArea.y1 = currentArea.y0 + (canvas.height - startY)
							* scaleY;
					currentArea.x0 += (scaleX * startX);
					currentArea.y0 += (canvas.height - mouseY) * scaleY;
					scaleX = (currentArea.x1 - currentArea.x0) / canvas.width;
					scaleY = (currentArea.y1 - currentArea.y0) / canvas.height;

					console.log("CurrentArea :" + currentArea.x0 + ","
							+ currentArea.y0 + "," + currentArea.x1 + ","
							+ currentArea.y1);
					console.log("ScaleX: " + scaleX + " ScaleY: " + scaleY);

					var layer1 = document.getElementById("myCanvasLayer1");
					var ctx1 = layer1.getContext("2d");
					ctx1.clearRect(0, 0, canvas.width, canvas.height);

					zoomed = true;
					area = false;
					canvas.style.cursor = "default";
					clearCanvas("selectLayer");
					redraw();
					addPrevZoom();
                    //drawAnnotations();
				}

				if(!lines.length)
					clearCanvas("myCanvasLayer1");

                if(area&&vertical&&(shiftSel||filterSel)) {
                     if(startX>mouseX)
                        startX=[mouseX,mouseX=startX][0];

                    if(startY>mouseY)
                        startY=[mouseY,mouseY=startY][0];
                    $('#CSBPopover').hide();
                    var mode = document.option.tipo;
                    for (var x = 0; x < lines.length; x++) {
                        if(selectedLines[x]==null)
                            selectedLines[x]=[];
                        currentLines = lines[x].slice(0);
                        for (var i=0; i < currentLines.length; i++) {
                            if ((mode[0].checked && mode[0].value == currentLines[i][0])
                                    || (mode[1].checked && mode[1].value == currentLines[i][0])
                                    || mode[2].checked) {
								var select =false;
								if(shiftSel&&!filterSel){
									$("#filter").html("Filter");
									select=filtered[x]==null||(filtered[x]!=null &&filtered[x].indexOf(i)==-1);
								}else {
									select = (filtered[x] != null && filtered[x].indexOf(i) > -1);
									$("#filter").html("Unfilter");
								}
                                if(paint=filter(currentLines[i]))

                                if ((parseInt(currentLines[i][1]) >= ((currentArea.x0+scaleX * startX)
                                    * xTotal / 500))
                                    && (parseInt(currentLines[i][2]) >= ((currentArea.y0+(canvas.height - mouseY) * scaleY)
                                    * yTotal / 500))
                                    && (parseInt(currentLines[i][3]) <= ((currentArea.x0 + mouseX * scaleX)
                                    * xTotal / 500))
                                    && (parseInt(currentLines[i][4]) <= ((currentArea.y0 + (canvas.height - startY)
                                    * scaleY) * yTotal / 500))
									&& select) {
                                    paint = true;
                                } else {
                                    paint = false;
                                }
                                if (paint) {
                                    drawVerticalLinesInVerticalLayer([i],selectLayer,x,rgb(255,0,0));
                                    if(selectedLines[x].indexOf(i)==-1)
                                        selectedLines[x].push(i);
                                }

                            }
                        }
                    }
                    drawSelectedFrags();
                    var layer1 = document.getElementById("myCanvasLayer1");
                    var ctx1 = layer1.getContext("2d");
                    ctx1.clearRect(0, 0, canvas.width, canvas.height);
                    area=false;
                }

			}, false);
	canvas.addEventListener('mousemove',function(evt) {
			lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
			lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

			if (mousedown) {
				canvas.style.cursor = "crosshair";
				area = true;
			}

			dragged = true;

			if (area && mousedown && !squared) {
				//console.log("X:"+startX+" Y:"+startY);
				var layer1 = document.getElementById("myCanvasLayer1");
				var ctx1 = layer1.getContext("2d");

				mouseX = getMousePos(canvas,evt).x;//parseInt(evt.clientX - offsetX);
				mouseY = canvas.height-getMousePos(canvas,evt).y;//parseInt(evt.clientY - offsetY);
				//console.log("mouseX:"+mouseX+" mouseY:"+mouseY);
				ctx1.clearRect(0, 0, canvas.width, canvas.height);
				ctx1.beginPath();
				ctx1.rect(startX, startY, mouseX - startX, mouseY - startY);
				ctx1.stroke();
            } else if(area && mousedown && squared){
				var layer1 = document.getElementById("myCanvasLayer1");
				var ctx1 = layer1.getContext("2d");
                //startY=startX;
				mouseX = parseInt(evt.clientX - offsetX);
				mouseY = -startX+startY+mouseX;;
                //console.log(mouseX+" - "+startX+" - "+startY);
				ctx1.clearRect(0, 0, canvas.width, canvas.height);
				ctx1.beginPath();
				ctx1.rect(startX, startY, mouseX - startX, mouseY - startY);
				ctx1.stroke();

			}
	}, false);

	// MOUSE ON MAP
	canvasMap.onmousedown = function(e) {
		if (map) {
			var mapoffset = $("#myMap").offset();
			mouseInRect.x = e.pageX - mapoffset.left - RectInMap.x;
			mouseInRect.y = e.pageY - mapoffset.top - RectInMap.y;
			if (!(mouseInRect.x < 0 || mouseInRect.y < 0
					|| mouseInRect.x > RectInMap.tamx
					|| mouseInRect.y > RectInMap.tamy || (RectInMap.tamx == 200 && RectInMap.tamy == 200))) {
				dragInMap = true;
			}
		}
	}
	canvasMap.onmouseup = function() {
		if (map && dragInMap) {
			dragInMap = false;
			if (RectInMap.x < 0) {
				RectInMap.x = 0;
			}
			if (RectInMap.x + RectInMap.tamx > 200) {
				RectInMap.x = 200 - RectInMap.tamx;
			}
			if (RectInMap.y < 0) {
				RectInMap.y = 0;
			}
			if (RectInMap.y + RectInMap.tamy > 200) {
				RectInMap.y = 200 - RectInMap.tamy;
			}

			var difx = currentArea.x1 - currentArea.x0;
			var dify = currentArea.y1 - currentArea.y0;

			currentArea.x0 = RectInMap.x * 5 / 2;
			currentArea.x1 = currentArea.x0 + difx;
			currentArea.y1 = 500 - RectInMap.y * 5 / 2;
			currentArea.y0 = currentArea.y1 - dify;


			redraw();
		}
	}
	canvasMap.onmousemove = function(e) {
		if (map && dragInMap) {
			var mapoffset = $("#myMap").offset();
			RectInMap.x = e.pageX - mapoffset.left - mouseInRect.x;
			RectInMap.y = e.pageY - mapoffset.top - mouseInRect.y;
			redrawMap();
		}
	};
}

/**
 * Function to apply active filters to frags
 * @param  {Array} line fragment to check
 * @return {Boolean}      True/False if paint
 */
function filter(line) {

	var paint = false;

	var filterIrrelevants = document.getElementById("filterIrrelevants").checked;
	var filterOverlapped = document.getElementById("filterOverlapped").checked;
	var filterDuplications = document.getElementById("filterOverlapped2").checked;
	var filterLenght = document.getElementById("filterLenght").checked;
	var filterSimilarity = document.getElementById("filterSimilarity").checked;
	var filterPositives = document.getElementById("filterPositives").checked;
	var filterIdentity = document.getElementById("filterIdentity").checked;

	switch (parseInt(line[6])) {
        case -1:
            if (!filterIrrelevants) {
                paint = true;
            }
            break;
        default:
            if (filterLenght) {
                var lenghtFilter = document.getElementById("filterLenghtNumber").value
                if (parseInt(line[7]) >= parseInt(lenghtFilter)) {
                    paint = true;
                }
                break;
            } else {
                paint = true;
                break;
            }
	}

	if (filterSimilarity) {
		var similarityValue = document.getElementById("filterSimilarityNumber").value;
		if (parseFloat(line[10]) <= similarityValue) {
			paint = false;
		}
	}

	if (filterPositives) {
		if (parseFloat(line[6]) > 0) {
			paint = false;
		}
	}

	if (filterDuplications) {
		if (parseInt(line[6]) < -2) {
			paint = false;
		}
	}

	if(filterIdentity){
		if((line[9]/line[7]).toFixed(2)*100 <= identityLine.identityValue) {
			paint = false;
		}
	}


	if (filterOverlapped) {
		if (parseFloat(line[13]) > 0) {
			paint = false;
		}
	}

	return paint;

}


/**
 * Reset all canvas
 */
function resetDraw() {
	if ((canvas) && (vertical)) {
		clearCanvas("selectLayer");
		$('#CSBPopover').hide();
		var ctx = canvas.getContext('2d');
		trackTransforms(ctx);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		reset = true;
		zoomBoard = false;
		backZoomList=[];
        document.getElementById("myCanvasLayer2").getContext("2d").clearRect(0,0,500,500);
		redraw();
		addPrevZoom();
	}
}

/**
 * Draw annotations in canvas
 * @param  {String} seq   Sequence
 * @param  {Number} start X Start point
 * @param  {Number} end   X End point
 * @param  {Array} point X,Y point
 */
function annotationDrawLines(seq,start,end,point){

	//console.log("Drawing Annotations");
    start=parseInt(start),end=parseInt(end),point=parseInt(point);
    var c = document.getElementById("myCanvasLayer2");
	var ctx = c.getContext("2d");
    var pStartX,pStartY,pEndX,pEndY;
    switch (seq){
        case 'X':
            pStartX=start;
            pEndX=end;
            pStartY=point;
            pEndY=point+end-start;
            break;
        case 'Y':
            pStartY=start;
            pEndY=end;
            pStartX=point;
            pEndX=point+end-start;
            break;
        default:
            return;
    }

	var xIni;
	var xFin;
	var yIni;
	var yFin;

    xIni = ((c.width * (parseInt(pStartX) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
			* c.width;
	yIni = ((c.height * (parseInt(pStartY) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
			* c.height;
	xFin = ((c.width * (parseInt(pEndX) / xTotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
			* c.width;
	yFin = ((c.height * (parseInt(pEndY) / yTotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
			* c.height;


	if((xFin-xIni < 0.1)&&(xFin-xIni>0)){
		xFin = xIni + 0.1;
	}

	if((yFin-yIni < 0.1)&&(yFin-yIni >0)){
		yFin = yIni +0.1 ;
	}

    ctx.beginPath();

    if(seq=='X'){
        ctx.moveTo(xIni, c.height);
        ctx.lineTo(xIni, c.height - 5);
        ctx.moveTo(xFin, c.height);
        ctx.lineTo(xFin,c.height -5);
    }else{
        ctx.moveTo(0, c.height -yIni);
        ctx.lineTo(5, c.height - yIni);
        ctx.moveTo(0, c.height -yFin);
        ctx.lineTo(5, c.height - yFin);
    }

	ctx.lineWidth = 2;
    ctx.strokeStyle = rgba(51,122,183,0.7);
    ctx.stroke();
}

/**
 * Show selected frags in 'CSV & Frag info' table
 */
function showSelected(){
    if(!showingSelected){
		$("#selButton").html("Selected");
        //currTable=document.getElementById("files-tab-content").cloneNode(true);
        document.getElementById("annotationsOutput").innerHTML = "<ul class='nav nav-tabs' id='annotations-tab'></ul>"
				+ "<div class='tab-content' id='annotations-tab-content'></div>";
        for (var x = 0; x < lines.length; x++) {
            var table = document.createElement("table");
            table.className = "table table-condensed";
            table.id = "csvInfoTable" + x;
            currentLines=lines[x];
            add2Table(16,table);
            for (var i = 0; i < currentLines.length; i++) {
                 if(selectedLines.length>x&&selectedLines[x].indexOf(i)>-1) {
                     add2Table(i, table);
                 }
            }
            var newAnnot=document.createElement("table");
            newAnnot.className="table table-condensed";
            newAnnot.id = "csvAnnotationTable" + x;
            var currentAnnotTab = document.getElementById("fileAnnotation" + x);
            var auxAnnotationsDiv = document.getElementById("file" + x);
            //auxAnnotationsDiv.removeChild(auxAnnotationsDiv.childNodes[1]);
            auxAnnotationsDiv.replaceChild(table,document.getElementById("csvInfoTable"+x));
            //currentAnnotTab.replaceChild(newAnnot,document.getElementById("csvAnnotationTable" + x));
        }
        showingSelected=true;
    }else{
		$("#selButton").html("All");
        showingSelected=false;
        //document.getElementById("files-tab-content").parentNode.replaceChild(currTable.cloneNode(true),document.getElementById("files-tab-content"));
    }
}

/**
 * Get max from a column in a group of lines
 * @param  {Array} lines Array of lines
 * @param  {Number} k     Number of column
 * @return {Number}       Max value
 */
function getMax(lines, k) {
	var max;
	max = 0;
	for (var i = 0; i < lines.length; i++) {

		if (parseInt(lines[i][k]) > max) {
			max = parseInt(lines[i][k]);
		}
	}
	return max;

}

/**
 * Returns a RGB color
 * @param  {Number} r Red
 * @param  {Number} g Green
 * @param  {Number} b Blue
 * @return {String}   RGB color -> rgb(r,g,b)
 */
function rgb(r, g, b) {
	return "rgb(" + r + "," + g + "," + b + ")";
}

/**
 * Returns a RGBa color
 * @param  {Number} r Red
 * @param  {Number} g Green
 * @param  {Number} b Blue
 * @param  {Number} a Alpha
 * @return {String}   RGBa color -> rgb(r,g,b,a)
 */
function rgba(r, g, b, a) {
	return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

/**
 * Convert an HSB color to RGB
 * @param {String} hsb HSB color
 */
HSBToRGB = function(hsb) {
	var mirgb = {};
	var h = Math.round(hsb.h);
	var s = Math.round(hsb.s * 255 / 100);
	var v = Math.round(hsb.b * 255 / 100);
	if (s == 0) {
		mirgb.r = rgb.g = rgb.b = v;
	} else {
		var t1 = v;
		var t2 = (255 - s) * v / 255;
		var t3 = (t1 - t2) * (h % 60) / 60;
		if (h == 360)
			h = 0;
		if (h < 60) {
			mirgb.r = t1;
			rgb.b = t2;
			rgb.g = t2 + t3
		} else if (h < 120) {
			mirgb.g = t1;
			mirgb.b = t2;
			mirgb.r = t1 - t3
		} else if (h < 180) {
			mirgb.g = t1;
			mirgb.r = t2;
			mirgb.b = t2 + t3
		} else if (h < 240) {
			mirgb.b = t1;
			mirgb.r = t2;
			mirgb.g = t1 - t3
		} else if (h < 300) {
			mirgb.b = t1;
			mirgb.g = t2;
			mirgb.r = t2 + t3
		} else if (h < 360) {
			mirgb.r = t1;
			mirgb.g = t2;
			mirgb.b = t1 - t3
		} else {
			rgb.r = 0;
			rgb.g = 0;
			rgb.b = 0
		}
	}
	return rgb(Math.round(mirgb.r), Math.round(mirgb.g), Math.round(mirgb.b));
};

// Adds ctx.getTransform() - returns an SVGMatrix
// Adds ctx.transformedPoint(x,y) - returns an SVGPoint
function trackTransforms(ctx) {
	var svg = document.createElementNS("http://www.w3.org/2000/svg", 'svg');
	var xform = svg.createSVGMatrix();
	ctx.getTransform = function() {
		return xform;
	};

	var savedTransforms = [];
	var save = ctx.save;
	ctx.save = function() {
		savedTransforms.push(xform.translate(0, 0));
		return save.call(ctx);
	};
	var restore = ctx.restore;
	ctx.restore = function() {
		xform = savedTransforms.pop();
		return restore.call(ctx);
	};

	var scale = ctx.scale;
	ctx.scale = function(sx, sy) {
		xform = xform.scaleNonUniform(sx, sy);
		return scale.call(ctx, sx, sy);
	};
	var rotate = ctx.rotate;
	ctx.rotate = function(radians) {
		xform = xform.rotate(radians * 180 / Math.PI);
		return rotate.call(ctx, radians);
	};
	var translate = ctx.translate;
	ctx.translate = function(dx, dy) {
		xform = xform.translate(dx, dy);
		return translate.call(ctx, dx, dy);
	};
	var transform = ctx.transform;
	ctx.transform = function(a, b, c, d, e, f) {
		var m2 = svg.createSVGMatrix();
		m2.a = a;
		m2.b = b;
		m2.c = c;
		m2.d = d;
		m2.e = e;
		m2.f = f;
		xform = xform.multiply(m2);
		return transform.call(ctx, a, b, c, d, e, f);
	};
	var setTransform = ctx.setTransform;
	ctx.setTransform = function(a, b, c, d, e, f) {
		xform.a = a;
		xform.b = b;
		xform.c = c;
		xform.d = d;
		xform.e = e;
		xform.f = f;
		return setTransform.call(ctx, a, b, c, d, e, f);
	};
	var pt = svg.createSVGPoint();
	ctx.transformedPoint = function(x, y) {
		pt.x = x;
		pt.y = y;
		return pt.matrixTransform(xform.inverse());
	}
}

/**
 * Draw grid in a Canvas Layer
 * @param  {Boolean} board      Boolean active grid
 * @param  {Boolean} vertical   Boolean vertical or horizontal layer
 * @param  {String} canvasName ID Canvas
 */
function drawGrid(board, vertical, canvasName) {
    var canvasGrid = document.getElementById(canvasName);

    if(board) {
        var ctx = canvasGrid.getContext("2d");
        var width = canvas.width;
        var height = canvas.height;

		console.log("W: "+width+" H: "+height);
        if (vertical) {
			clearCanvas(canvasName);

            //ctx.font = "bold 20px sans-serif";
            //ctx.fillText("Grid size: 500x500px, Step: 100px", 0, -23);

            var stepVertical = (currentArea.x1 - currentArea.x0) / 4;
            var stepV = currentArea.x0;

			for (var x = canvasGrid.width/10; x <= canvasGrid.width; x += canvasGrid.width/5) {
				ctx.font = "bold 12px sans-serif";
				var correctPositionX = ((stepV) * parseInt(fileHeader[0].seqXLength)) / width;

				//Round to thousands if not so much zoom
				if(scaleX > 0.20) {
					correctPositionX = Math.round(correctPositionX/1000)*1000;
				} else {
					correctPositionX = Math.round(correctPositionX);
				}

				ctx.fillText(correctPositionX.toString(), x - 20, height + 45);
				ctx.moveTo(x, canvasGrid.width/20);
				ctx.lineTo(x, canvasGrid.height - canvasGrid.width/15);
				stepV += stepVertical;
			}

			if (vertical) {

				var stepHorizontal = (currentArea.y1 - currentArea.y0) / 4;
				var stepH = currentArea.y0;

				for (var y = canvasGrid.width/20; y <= canvasGrid.width; y += canvasGrid.width/5) {
					ctx.font = "bold 12px sans-serif";
					var correctPositionY = ((stepH) * parseInt(fileHeader[0].seqYLength)) / height;

					//Round to thousands if not so much zoom
					if(scaleX > 0.20) {
						correctPositionY = Math.round(correctPositionY/1000)*1000;
					} else {
						correctPositionY = Math.round(correctPositionY);
					}

					correctPositionY = Math.round(correctPositionY);
					ctx.fillText(correctPositionY.toString(), 5, height
                                - (y - 55));
					ctx.moveTo(canvasGrid.width/10, y);
					ctx.lineTo(canvasGrid.width - canvasGrid.width/10, y);
					stepH += stepHorizontal;
				}
			}

			ctx.strokeStyle = "#ddd";
			ctx.stroke();
        } else {
            var stepVertical = width / 10;
            var stepV = 0;

            for (var x = 0; x <= width; x += stepVertical) {
                ctx.font = "bold 12px sans-serif";
                // var aux = (((x - currentArea.x0) / (currentArea.x1 -
                // currentArea.x0)) * width);
                var correctPositionX = ((stepV) * parseInt(fileHeader[0].seqXLength));
                correctPositionX = Math.round(correctPositionX);
                ctx.fillText(correctPositionX.toString(), x + 20, height - 10);
                ctx.moveTo(x, 25);
                ctx.lineTo(x, height - 25);
                stepV += stepVertical;
            }

            ctx.strokeStyle = "#000000";
            ctx.stroke();
	    }
    } else {
        clearCanvas(canvasName);
    }
}

/**
 * Calculate the distance between a Frag and a point. Used to select frags with a mouse click
 * @param  {Array} position X,Y point
 * @param  {Array} frag     Regular fragment
 * @return {Number}          Distance
 */
function calculateDistance(position,frag){
    var distance = 0;
	var aux, aux2;
	var x1, x2, y1, y2;
	var x0 = position.x;
	var y0 = position.y;
    x1 = ((((canvas.width * parseInt(frag[1])) / xTotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
					* canvas.width;
    y1 = ((((canvas.height * parseInt(frag[2])) / yTotal) - currentArea.y0) /  ((currentArea.y1 - currentArea.y0)))
            * canvas.height;

    x2 = (((canvas.width * (parseInt(frag[3])) / xTotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
            * canvas.width;
    y2 = (((canvas.height * (parseInt(frag[4])) / yTotal) - currentArea.y0) / ((currentArea.y1 - currentArea.y0)))
            * canvas.height;
    //console.log(x1+" - "+y1+" - "+x2+" - "+y2);
    aux = Math.abs(((x2 - x1) * (y1 - y0))- ((x1 - x0) * (y2 - y1)));
    aux2 = Math.sqrt(Math.pow(x2 - x1, 2)+ Math.pow(y2 - y1, 2));
    distance = aux / aux2;
    return distance;
}

/**
 * Select line near the position given
 * @param  {Array} lines    Array of painted lines
 * @param  {Array} position X,Y Point
 * @param  {Number} evt      Event position to generate the popup with information
 */
function selectFrag(lines, position, evt) {

	var linefound = false;
	var distance = 0;
	var aux, aux2;
	var x1, x2, y1, y2;
	var x0 = position.x;
	var y0 = position.y;
	var lineIndex = 0;
	var arrayIndex = 0;

	var mode = document.option.tipo;

	for (var j = 0; j < lines.length; j++) {

		console.log("Checking lines" + j);
		xTotal = fileHeader[0].seqXLength;
		yTotal = fileHeader[0].seqYLength;
		var i = 17;

		console.log("X: " + xTotal + " Y:" + yTotal);

		while (!linefound && i < lines[j].length) {

			x1 = ((((canvas.width * parseInt(lines[j][i][1])) / xTotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
					* canvas.width;
			y1 = ((((canvas.height * parseInt(lines[j][i][2])) / yTotal) - currentArea.y0) /  ((currentArea.y1 - currentArea.y0)))
					* canvas.height;

			x2 = (((canvas.width * (parseInt(lines[j][i][3])) / xTotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
					* canvas.width;
			y2 = (((canvas.height * (parseInt(lines[j][i][4])) / yTotal) - currentArea.y0) / ((currentArea.y1 - currentArea.y0)))
					* canvas.height;

			if ((mode[0].checked && mode[0].value == lines[j][i][0])
					|| (mode[1].checked && mode[1].value == lines[j][i][0])
					|| mode[2].checked) {

				// Pendiente positiva
				if ((x0 > x1) && (x0 < x2) && (y0 != y1) && y0!= y2) {
					distance = calculateDistance(position,lines[j][i]);
                    console.log(distance+" - "+x0+" - "+y0);
					if (distance < 6&&filter(lines[j][i])) {
                        linefound = true;
						arrayIndex = j;
						lineIndex = i;
						//console.log("linefound PP: " + j + " " + i);
					} else {
						i++;
					}

				}else {
				i++;
			    }
			} else {
				i++;
			}
		}

	}

	if (!linefound) {
		$('#CSBPopover').hide()
		selected = false;
	} else {
		var left = evt.pageX;
		var top = evt.pageY;

		if(currentMatrix.length>0){
			paintFrag(((lines[arrayIndex][lineIndex][9]/lines[arrayIndex][lineIndex][7]).toFixed(2))*100,lines[arrayIndex][lineIndex][7]);
		}

		$('#CSBPopover')
				.html(
						"<div class='popover-title'>"
								+ lines[arrayIndex][lineIndex][0]
								+ " - "
								+ (lineIndex - parseInt(fragsStarts))
                                + "</div><div class='arrow'></div><div class='popover-content'>"
								+ "<br>xStart: "
								+ lines[arrayIndex][lineIndex][1]
								+ "<br>yStart: "
								+ lines[arrayIndex][lineIndex][2]
								+ "<br>xEnd: "
								+ lines[arrayIndex][lineIndex][3]
								+ "<br>yEnd: "
								+ lines[arrayIndex][lineIndex][4]
								+ "<br>Strand: "
								+ lines[arrayIndex][lineIndex][5]
								+ "<br>Block: "
								+ lines[arrayIndex][lineIndex][6]
								+ "<br>length: "
								+ lines[arrayIndex][lineIndex][7]
								+ "<br>Score(AVG): "
								+ lines[arrayIndex][lineIndex][8]
								+ "<br> Identity: "
								+ lines[arrayIndex][lineIndex][9]
								+ "<br> Identity %: "
								+ (lines[arrayIndex][lineIndex][9]/lines[arrayIndex][lineIndex][7]).toFixed(2)
								+ "<br>Similarity: "
								+ lines[arrayIndex][lineIndex][10] + "</div>")

				.css('left', (left + 20) + 'px');

		$('#CSBPopover').css('top', (top - ($('#CSBPopover').height() / 2) - 10) + 'px')
                        .popover({
                            html : true
                        }).show();

		if (selected) {
            clearCanvas("selectLayer");
            for(var i=0;i<lines.length;i++)
                clearCanvas("hSel"+i);
        }

		selected = true;
		xTotal = fileHeader[0].seqXLength;
		yTotal = fileHeader[0].seqYLength;
		drawLinesInLayer([lineIndex],selectLayer, arrayIndex, rgb(255,0,0))

	}

}

/**
 * Get mouse position
 * @param  {String} canvas Active canvas
 * @param  {Event} evt    Click event
 * @return {Array}        X,Y Position
 */
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();

	return {

		//x : (evt.pageX - rect.left)*canvas.width/$(canvas).width(),
		x : (evt.clientX - rect.left)*canvas.width/$(canvas).width(),
		y : ((canvas.height - (evt.clientY - rect.top))-(canvas.height-$(canvas).height()))*canvas.height/$(canvas).height(),
	};
}


/**
 * Activate canvas grid
 */
function activateBoard() {
	if (!board) {
		board = true
		redraw();
	} else {
		board = false;
		redraw();
	}
}

annot_state = false;
function annotOnClick(numFile) {
	if (!annot_state){
		annot_state = true;
		paintCodingRegions(numFile);
	}else{
		annot_state = false;
		d3.select("#annotationXLayer").remove();
		d3.select("#annotationYLayer").remove();
	}
}

function paintCodingRegions(numFile) {

	if(annotationsWorking == false && AnotFiles[numFile]) {

		annotationsNumFile = numFile;
		annotationsWorking = true;

		var svg = d3.select("#canvasContainer").append("svg")
					.attr("class", "annotationXLayer")
					.attr("id","annotationXLayer")
					.attr("width", 500)
					.attr("height", 520)
					.append("g");

		var svgY = d3.select("#canvasContainer").append("svg")
					.attr("class", "annotationYLayer")
					.attr("id","annotationYLayer")
					.attr("width", 520)
					.attr("height", 500)
					.append("g");


		var svgAux = d3.select("#annotationXLayer");
		var svgAuxY = d3.select("#annotationYLayer");

		var w = parseInt(svgAux.attr("width"));
		var h = parseInt(svgAux.style("height"));

		if(AnotFiles[numFile][0]) {
			console.log(AnotFiles[numFile][0]);

			var correctPositionXmin = ((currentArea.x0) * parseInt(fileHeader[numFile].seqXLength)) / w;
			var correctPositionXmax = ((currentArea.x1) * parseInt(fileHeader[numFile].seqXLength)) / w;
			var x = d3.scale.linear().domain([correctPositionXmin,correctPositionXmax]).range([0, w]);

			svg.selectAll("line")
					.data(AnotFiles[numFile][0]).enter()
					.append("line")          // attach a line
					.style("stroke", rgba(R[numFile], G[numFile], B[numFile], 1))  // colour the line
					.attr("x1", function (d) {
						return x(d.Start);
					})     // x position of the first end of the line
					.attr("y1", h - 10)    // y position of the first end of the line
					.attr("x2", function (d) {
						return x(d.Stop);
					})     // x position of the second end of the line
					.attr("y2", h - 10)
					.on("mouseover", function () {
						d3.select(this)
								.style("stroke-width", 5)
								.style("stroke", "red");
					})
					.on("mouseout", function () {
						d3.select(this)
								.style("stroke-width", 1)
								.style("stroke", rgba(R[numFile], G[numFile], B[numFile], 1))
					});

			$('svg line').tipsy({
				gravity: 'w',
				html: true,
				title: function () {
					var d = this.__data__;
					return d.Synonym;
				}
			});
		}

		if(AnotFiles[numFile][1]) {
			console.log( AnotFiles[numFile][1]);

			var hY = parseInt(svgAuxY.attr("height"));
			var correctPositionYmin = ((currentArea.y0) * parseInt(fileHeader[numFile].seqYLength)) / hY;
			var correctPositionYmax = ((currentArea.y1) * parseInt(fileHeader[numFile].seqYLength)) / hY;
			var yY = d3.scale.linear().domain([correctPositionYmin, correctPositionYmax]).range([0, hY]);

			svgY.selectAll("line")
					.data(AnotFiles[numFile][1]).enter()
					.append("line")          // attach a line
					.style("stroke", rgba(R[numFile], G[numFile], B[numFile], 1))  // colour the line
					.attr("x1", 5)     // x position of the first end of the line
					.attr("y1", function (d) {
						return yY(d.Start);
					})    // y position of the first end of the line
					.attr("x2", 5)     // x position of the second end of the line
					.attr("y2", function (d) {
						return yY(d.Stop);
					})
					.on("mouseover", function () {
						d3.select(this)
								.style("stroke-width", 5)
								.style("stroke", "red");
					})
					.on("mouseout", function () {
						d3.select(this)
								.style("stroke-width", 1)
								.style("stroke", rgba(R[numFile], G[numFile], B[numFile], 1))
					});

			$('svg line').tipsy({
				gravity: 'w',
				html: true,
				title: function () {
					var d = this.__data__;
					return d.Synonym;
				}
			});
		}
	} else {
		annotationsWorking = false;
		d3.select("#annotationXLayer").remove();
		d3.select("#annotationYLayer").remove();
		paintCodingRegions(numFile);
	}

}

/**
 * Deprecated
 */
function createAnnotations(numFile){
	var fragment = 0;

	var anntPrevX = annotations[numFile][fragment][18];
	var xStart = annotations[numFile][fragment][1];
	var xEnd = annotations[numFile][fragment][3];

	var anntPrevY = annotations[numFile][fragment][21];
	var yStart = annotations[numFile][fragment][2];
	var yEnd = annotations[numFile][fragment][4];

	var moreThanOneX = false;
	var moreThanOneY = false;

	while(fragment<annotations[numFile].length-1){

		fragment++;
		var anntNextX = annotations[numFile][fragment][18];
		var anntNextY = annotations[numFile][fragment][21];

		if(anntPrevX == anntNextX){
			xEnd = annotations[numFile][fragment][3]
		} else {
			moreThanOneX = true;
			annotationsX.push({'Name':anntPrevX, 'xStart':xStart, 'xEnd': xEnd});
			anntPrevX = anntNextX;
			xStart = annotations[numFile][fragment][1]

		}

		if(anntPrevY == anntNextY){
			yEnd = annotations[numFile][fragment][4]
		} else {
			moreThanOneY = true;
			annotationsY.push({'Name':anntPrevY, 'yStart':yStart, 'yEnd': yEnd});
			anntPrevY = anntNextY;
			yStart = annotations[numFile][fragment][2]
		}

	}

	if(!moreThanOneX){
		annotationsX.push({'Name':anntPrevX, 'xStart':xStart, 'xEnd': xEnd});
	}

	if(!moreThanOneY){
		annotationsY.push({'Name':anntPrevY, 'yStart':yStart, 'yEnd': yEnd});
	}

}
