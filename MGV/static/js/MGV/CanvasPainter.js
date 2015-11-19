/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables
var canvas;
var canvasOffset;
var offsetX;
var offsetY;
var redraw;
var board = false;
var zoomBoard = false;
var vertical = true;
var map = false;
var dragInMap = false;
var showingSelected=false;
var mouseInRect = {
	x : 0,
	y : 0
};
var lines = [];
var currentLines = [];
var selectedLines=[];
var auxLines = [];
var currentArea = {
	x0 : 0,
	y0 : 0,
	x1 : 0,
	y1 : 0
};

var minValue = 1;

var canvasMap;
var RectInMap = {
	x : 0,
	y : 0,
	tamx : 0,
	tamy : 0
};

var xtotal;
var ytotal;
var scaleX = 1;
var scaleY = 1;
var zoomed = false;
var reset = false;
var selected = false;

// Constants
const headerSize = 12;
const fragsStarts = 16;

// Colors
// negro, rojo, azul, naranja, verde, amarillo, morado, verde2
var R = [ 44, 192, 41, 230, 39, 241, 142, 22 ];
var G = [ 62, 57, 128, 126, 174, 196, 68, 160 ];
var B = [ 80, 43, 185, 34, 96, 15, 173, 133 ];

// My Functions
window.onload = function() {
	createInstance();
};

function clearCanvas(canvasName) {
    var canvas = document.getElementById(canvasName);
    var ctx = canvas.getContext('2d');

	// Clear the canvas
	ctx.save();
	ctx.setTransform(1, 0, 0, 1, 0, 0);
	ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
	ctx.restore();
}

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

    console.log("X: " + numFile + "Headers: " + headers);

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
    ctx.strokeStyle = "rgb(0,0,0)";
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
    reset = false;
}

function createInstance() {
    var loadingGif = $('#loading-indicator');

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
        loadingGif.show();
		console.time("reDraw()");

        clearCanvas("myCanvas");

		// Clear previous data in HTML
		document.getElementById("output").innerHTML = "<div class=\"SearchTitle\" > <div class=\"SearchTitleFilterButton\"> <span>Filter:</span> <input type=\"text\" class=\"SearchFilter\" /> <button class=\"SearchButton\" onclick=\"showResults($(\'.SearchFilter\').val(),true)\" ><span class=\"glyphicon glyphicon-search\"></span></button> </div> </div> <ul class='nav nav-tabs' id='files-tab'></ul>"
				+ " <div class='tab-content' id='files-tab-content'></div>";

		document.getElementById("annotationsOutput").innerHTML = "<ul class='nav nav-tabs' id='annotations-tab'></ul>"
				+ "<div class='tab-content' id='annotations-tab-content'></div>";

		for (var numFile = 0; numFile < lines.length; numFile++) {

            console.log("Round: "+numFile);

			currentLines = lines[numFile].slice(0);

			if (currentLines) {

				var mode = document.option.tipo;

				var table = document.createElement("table");
				table.className = "table table-condensed";
				table.id = "csvInfoTable" + numFile;

				var annotationTable = document.createElement("table");
				annotationTable.className = "table table-condensed table-striped";
				annotationTable.id = "csvAnnotationTable" + numFile;

				var row = annotationTable.insertRow(-1);
				//console.log("Line: "+lines[0]);
				for (var j = 0; j < lines[0][16].length; j++) {
					if ((j <= 3) || ((j > 5) && (j < 7)) || (j >= 14)) {
						var firstNameCell = row.insertCell(-1);
						firstNameCell.appendChild(document
								.createTextNode(lines[0][16][j]));
					}
				}

				// Store the file header
				if (fileHeader.length < lines.length) {
                    storeFileHeader(currentLines, numFile);
				}

				if (!xtotal || !ytotal || reset) {
                    resetZoom();
				}

				xtotal = fileHeader[0].seqXLength;
				ytotal = fileHeader[0].seqYLength;

				if (!vertical) {
                    loadHorizontalView();
                } else {
					if (canvas.height != 500)
						canvas.height = 500;
					if (canvas.width != 500)
						canvas.width = 500;
				}

				// Draw Grid
				if (board) {
                    if(vertical){
                        drawBoard(board, vertical, "myCanvasGrid");
                    } else {
                        if(numFile!=0){
                            drawBoard(board, vertical, "myCanvas"+numFile);
                        } else {
                            drawBoard(board, vertical, "myCanvas");
                        }
                    }
				} else {
                     if(vertical) clearCanvas("myCanvasGrid");
				}

				for (i = fragsStarts; i < currentLines.length; i++) {

					var paint = false;

					// console.log("I: " +i+" lenght"+lines.length);

					if (i == fragsStarts) {
						var row = table.insertRow(-1);
						for (var j = 0; j < lines[0][16].length; j++) {
							// if(j<14) {
							var firstNameCell = row.insertCell(-1);
							firstNameCell.appendChild(document
									.createTextNode(lines[0][16][j]));

							// }
						}
					}

					if (currentLines[i][0] != 'GX'
							&& currentLines[i][0] != 'GY') {

						if ((mode[0].checked && mode[0].value == currentLines[i][0])
								|| (mode[1].checked && mode[1].value == currentLines[i][0])
								|| mode[2].checked) {

							// console.time("filter()");
							paint = filter(currentLines[i]);
							// console.timeEnd("filter()");

							if (paint == true) {
								if ((parseInt(currentLines[i][1]) >= (currentArea.x0
										* xtotal / 500))
										&& (parseInt(currentLines[i][2]) >= (currentArea.y0
												* ytotal / 500))
										&& (parseInt(currentLines[i][3]) <= (currentArea.x1
												* xtotal / 500))
										&& (parseInt(currentLines[i][4]) <= (currentArea.y1
												* ytotal / 500))) {
									paint = true;
								} else {
									paint = false;
								}

							}

							if (paint == true) {
								// console.time("paint()");
								var numColor = (i) % 8;
								color = rgb(R[numFile], G[numFile], B[numFile]);
								drawLine(currentLines, i, xtotal, ytotal, mode,
										color, numFile);
								add2Table(i, table);
								auxLines.push(lines[i]);
								// console.timeEnd("paint()");
							} else {
								color = rgba(189, 195, 199, 0.7);
								drawLine(currentLines, i, xtotal, ytotal, mode,
										color, numFile);
								drawLine(currentLines, i, xtotal, ytotal, mode,
										color, numFile);
							}
						}
					} else {
						if (currentLines[i][0] == 'GX') {
							if ((parseInt(currentLines[i][1]) >= (currentArea.x0
									* xtotal / 500))
									&& (parseInt(currentLines[i][3]) <= (currentArea.x1
											* xtotal / 500))) {
								paint = filter(currentLines[i]);
								if (paint == true) {
									add2Table(i, table);
									var row = annotationTable.insertRow(-1);
									for (var j = 0; j < currentLines[i].length; j++) {
										if (currentLines[i].length > 10) {
											if ((j <= 3)
													|| ((j > 5) && (j < 7))
													|| (j >= 14)) {
												var firstNameCell = row
														.insertCell(-1);
												firstNameCell
														.appendChild(document
																.createTextNode(currentLines[i][j]));
											}
										} else {
											var firstNameCell = row
													.insertCell(-1);
											firstNameCell
													.appendChild(document
															.createTextNode(currentLines[i][j]));
										}
									}
								}
							}
						} else {
							if ((parseInt(currentLines[i][2]) >= (currentArea.y0
									* xtotal / 500))
									&& (parseInt(currentLines[i][4]) <= (currentArea.y1
											* xtotal / 500))) {
								paint = filter(currentLines[i]);
								if (paint == true) {
									add2Table(i, table);
									var row = annotationTable.insertRow(-1);
									for (var j = 0; j < currentLines[i].length; j++) {
										if (currentLines[i].length > 10) {
											if ((j <= 3)
													|| ((j > 5) && (j < 7))
													|| (j >= 14)) {
												var firstNameCell = row
														.insertCell(-1);
												firstNameCell
														.appendChild(document
																.createTextNode(currentLines[i][j]));
											}
										} else {
											var firstNameCell = row
													.insertCell(-1);
											firstNameCell
													.appendChild(document
															.createTextNode(currentLines[i][j]));
										}
									}
								}
							}

						}
					}
				}

				// currentLines = auxLines.slice(0);

				$("#files-tab").append(
						"<li><a href='#file" + numFile + "' data-toggle='tab'>File "
								+ numFile + "</a></li>");
				$("#annotations-tab")
						.append(
								"<li><a href='#fileAnnotation" + numFile
										+ "' data-toggle='tab'>File " + numFile
										+ "</a></li>");

				var auxDiv = document.createElement("div");
				var auxAnnotationsDiv = document.createElement("div");

				if (numFile == 0) {
					auxDiv.className = "tab-pane active";
					auxDiv.id = "file" + numFile;
					auxAnnotationsDiv.className = "tab-pane active";
					auxAnnotationsDiv.id = "fileAnnotation" + numFile;
				} else {
					auxDiv.className = "tab-pane";
					auxDiv.id = "file" + numFile;
					auxAnnotationsDiv.className = "tab-pane";
					auxAnnotationsDiv.id = "fileAnnotation" + numFile;
				}

				auxDiv.appendChild(fileInfo[numFile]);
				auxDiv.appendChild(table);
				$("#files-tab-content").append(auxDiv);

				auxAnnotationsDiv.appendChild(fileInfo[numFile]);
				auxAnnotationsDiv.appendChild(annotationTable);
				$("#annotations-tab-content").append(auxAnnotationsDiv);

			}

			// Hide filtered rows in the table (CSV&Frag Info button)
			$('.hiddenRow').hide();

			RectInMap.x = Math.min(currentArea.x0, currentArea.x1) * 2 / 5;
			RectInMap.y = (canvas.width - Math.max(currentArea.y0, currentArea.y1)) * 2 / 5;
			RectInMap.tamx = Math.abs(currentArea.x0 - currentArea.x1) * 2 / 5;
			RectInMap.tamy = Math.abs(currentArea.y0 - currentArea.y1) * 2 / 5;

			if(RectInMap.tamx < 5 || RectInMap.tamy < 5) {
				RectInMap.tamx = 5; RectInMap.tamy = 5;
			}

			console.log("Map: "+RectInMap.x+", "+RectInMap.y+", "+RectInMap.tamx+", "+RectInMap.tamy);

			redrawMap();

			if ((numFile == (lines.length-1)) && (map == false)) {
				var mapimage = document.getElementById("mapimage");
				mapimage.src = canvas.toDataURL("image/png");
				map = true;
			}
		}
		for(var index=0;index<searchList.length;index++)
			document.getElementById(searchList[index]).checked=false;
		searchList=[];
		prevTable=document.getElementById("files-tab-content").cloneNode(true);
		console.timeEnd("reDraw()");
        loadingGif.hide();
	};

	var lastX = canvas.width / 2, lastY = canvas.height / 2;
	var dragStart, dragged, area = false, mousedown = false, startX, startY, mouseX, mouseY,squared ,shiftSel,ctrlZoom= false;

	window.addEventListener('keydown', function(evt) {

		switch(evt.keyCode) {
			case 16:
				canvas.style.cursor = "pointer";
				shiftSel = true;
				break;
			case 18: //Alt: Block dragging on square shape
				squared = true;
				break;
            case 17: //Ctrl: Block dragging on square shape only when ussed together with Alt
                squared=true;
                break;
		}

	}, false);

	window.addEventListener('keyup', function(evt) {

		switch(evt.keyCode) {

			case 16:
				canvas.style.cursor = "default";
				shiftSel = false;
				break;
			case 18:
				squared = false;
				break;
            case 17: //Ctrl: Block dragging on square shape only when ussed together with Alt
                squared=false;
                break;
		}

	}, false);

	canvas
		.addEventListener(
            'mousedown',
            function(evt) {
                document.body.style.mozUserSelect = document.body.style.webkitUserSelect = document.body.style.userSelect = 'none';
                lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
                lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);
                dragStart = ctx.transformedPoint(lastX, lastY);
                dragged = false;
                console.log("MouseDown")
                mousedown = true;
                startX = parseInt(evt.clientX - offsetX);
                startY = parseInt(evt.clientY - offsetY);
            }, false);

	canvas
        .addEventListener('mouseup',
			function(evt) {
				console.log("MouseUP");
				mousedown = false;
				dragStart = null;
				if (!dragged) {
                    if (!shiftSel) {
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
	                    var mode = document.option.tipo;
                        $('#CSBPopover').hide();
                        for (var j = 0; j < lines.length; j++) {
                        xtotal = fileHeader[0].seqXLength;
                        ytotal = fileHeader[0].seqYLength;
                        var i = 17;

                        console.log("X: " + xtotal + " Y:" + ytotal);

                        while (!linefound && i < lines[j].length) {

                            x1 = ((((canvas.width * parseInt(lines[j][i][1])) / xtotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
                                    * canvas.width;
                            y1 = ((((canvas.height * parseInt(lines[j][i][2])) / ytotal) - currentArea.y0) /  ((currentArea.y1 - currentArea.y0)))
                                    * canvas.height;
                            x2 = (((canvas.width * (parseInt(lines[j][i][3])) / xtotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
                                    * canvas.width;
                            y2 = (((canvas.height * (parseInt(lines[j][i][4])) / ytotal) - currentArea.y0) / ((currentArea.y1 - currentArea.y0)))
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
                            if(linefound&&filter(lines[arrayIndex][lineIndex])){
                                if(selectedLines[arrayIndex]==null)
                                    selectedLines[arrayIndex]=[];
                                var index =-1;
                                if((index=selectedLines[arrayIndex].indexOf(lineIndex))>-1){
                                    selectedLines[arrayIndex].splice(index, 1);
                                    verticalDrawLines(lines[arrayIndex], lineIndex, false, rgb(R[arrayIndex],G[arrayIndex],B[arrayIndex]));
                                }else{
                                    selectedLines[arrayIndex].push(lineIndex);
                                    verticalDrawLines(lines[arrayIndex], lineIndex, true, null);
                                }
                            }
                        }
                    }
                }

				if ((!selected) && vertical){
                    if(selectedLines.length==0)
                        redraw();
                    $('#CSBPopover').hide();
				}

				if ((area) && vertical&&!shiftSel) {
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

					redraw();
                    //drawAnnotations();
				}
                if(area&&vertical&&shiftSel) {
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
                                if(paint=filter(currentLines[i]))
                                if ((parseInt(currentLines[i][1]) >= ((currentArea.x0+scaleX * startX)
                                    * xtotal / 500))
                                    && (parseInt(currentLines[i][2]) >= ((currentArea.y0+(canvas.height - mouseY) * scaleY)
                                    * ytotal / 500))
                                    && (parseInt(currentLines[i][3]) <= ((currentArea.x0 + mouseX * scaleX)
                                    * xtotal / 500))
                                    && (parseInt(currentLines[i][4]) <= ((currentArea.y0 + (canvas.height - startY)
                                    * scaleY) * ytotal / 500))) {
                                    paint = true;
                                } else {
                                    paint = false;
                                }
                                if (paint) {
                                    verticalDrawLines(lines[x], i, true, null);
                                    /*if(selectedLines[x]==null)
                                        selectedLines[x]=[];*/
                                    if(selectedLines[x].indexOf(i)==-1)
                                        selectedLines[x].push(i);
                                }
                            }
                        }
                    }
                    var layer1 = document.getElementById("myCanvasLayer1");
                    var ctx1 = layer1.getContext("2d");
                    ctx1.clearRect(0, 0, canvas.width, canvas.height);
                    area=false;
                }

			}, false);

	canvas
        .addEventListener('mousemove', function(evt) {

			lastX = evt.offsetX || (evt.pageX - canvas.offsetLeft);
			lastY = evt.offsetY || (evt.pageY - canvas.offsetTop);

			if (mousedown) {
				canvas.style.cursor = "crosshair";
				area = true;
			}

			dragged = true;

			if (area && mousedown && !squared) {

				var layer1 = document.getElementById("myCanvasLayer1");
				var ctx1 = layer1.getContext("2d");

				mouseX = parseInt(evt.clientX - offsetX);
				mouseY = parseInt(evt.clientY - offsetY);

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

	var handleScroll = function(evt) {
		/*var delta = evt.wheelDelta ? evt.wheelDelta / 60
				: evt.detail ? -evt.detail : 0;
		if (delta)
			zoom(delta);
		return evt.preventDefault() && false;*/
	};

	canvas.addEventListener('DOMMouseScroll', handleScroll, false);
	canvas.addEventListener('mousewheel', handleScroll, false);

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
    loadingGif.hide();
}

function filter(line) {

	var paint = false;

	var filterIrrelevants = document.getElementById("filterIrrelevants").checked;
	var filterOverlapped = document.getElementById("filterOverlapped").checked;
	var filterDuplications = document.getElementById("filterOverlapped2").checked;
	var filterLenght = document.getElementById("filterLenght").checked;
	var filterSimilarity = document.getElementById("filterSimilarity").checked;
	var filterPositives = document.getElementById("filterPositives").checked;

	switch (parseInt(line[6])) {
        case -1:
            if (!filterIrrelevants) {
                paint = true;
            }
            break;
        case -2:
            if (!filterOverlapped) {
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
		if (parseFloat(line[10]) < similarityValue) {
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

	return paint;

}

function drawLine(lines, i, xtotal, ytotal, mode, color, canvasNumber) {
	if (vertical) {
        var sel=false;
        if(selectedLines.length>canvasNumber&&selectedLines[canvasNumber].indexOf(i)>-1)
            sel=true;
		verticalDrawLines(lines, i, sel, color);
	} else {

		horizontalDrawLines(lines, i, xtotal, ytotal, mode, color, canvasNumber);
	}
}

function resetDraw() {
	if ((canvas) && (vertical)) {
		$('#CSBPopover').hide();
		var ctx = canvas.getContext('2d');
		trackTransforms(ctx);
		ctx.setTransform(1, 0, 0, 1, 0, 0);
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		reset = true;
		zoomBoard = false;
        document.getElementById("myCanvasLayer2").getContext("2d").clearRect(0,0,500,500);
		redraw();
	}
}

//Draw the lines to the lines to the annotation point
function annotationDrawLines(seq,start,end,point){
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

    xIni = ((c.width * (parseInt(pStartX) / xtotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
			* c.width;
	yIni = ((c.height * (parseInt(pStartY) / ytotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
			* c.height;
	xFin = ((c.width * (parseInt(pEndX) / xtotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
			* c.width;
	yFin = ((c.height * (parseInt(pEndY) / ytotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
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
        ctx.lineTo(xFin,c.height - 5);
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

function verticalDrawLines(actualLines, i, fragment, color) {

	// Find the canvas document
	var c = document.getElementById("myCanvas");

	// Then, call its getContext() method (you must pass the string "2d" to the
	// getContext() method):
	var ctx = c.getContext("2d");

	var xIni;
	var xFin;
	var yIni;
	var yFin;

	xIni = ((c.width * (parseInt(actualLines[i][1]) / xtotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
			* c.width;
	yIni = ((c.height * (parseInt(actualLines[i][2]) / ytotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
			* c.height;
	xFin = ((c.width * (parseInt(actualLines[i][3]) / xtotal) - currentArea.x0) / (currentArea.x1 - currentArea.x0))
			* c.width;
	yFin = ((c.height * (parseInt(actualLines[i][4]) / ytotal) - currentArea.y0) / (currentArea.y1 - currentArea.y0))
			* c.height;


	if((xFin-xIni < 0.1)&&(xFin-xIni>0)){
		xFin = xIni + 0.1;
	}

	if((yFin-yIni < 0.1)&&(yFin-yIni >0)){
		yFin = yIni +0.1 ;
	}

	//console.log((actualLines[i][1])+" = "+xIni+"; "+(actualLines[i][2])+" = "+yIni+(actualLines[i][3])+" = "+xFin+"; "+(actualLines[i][4])+" = "+yFin);

	ctx.beginPath();
	ctx.moveTo(xIni, c.height - yIni);
	ctx.lineTo(xFin, c.height - yFin);
	ctx.lineWidth = 2;

	// if NOT CSB:

	var mode = document.option.tipo;

	if (actualLines[i][0] == 'CSB') {
		if (mode[2].checked&&!fragment) {
			ctx.strokeStyle = rgb(0, 150, 0);
		} else if(fragment){
            ctx.strokeStyle = rgb(255, 0, 0);
        }else{
			ctx.strokeStyle = color;
		}
	} else {
		if (fragment) {
            ctx.strokeStyle = rgb(255, 0, 0);
		} else {
			ctx.strokeStyle = color;
		}
	}

	ctx.stroke();

}

function horizontalDrawLines(lines, i, xtotal, ytotal, rectsFilled,
		rectsStroked, canvasNumber) {

	// Find the canvas document
	if (canvasNumber != 0) {
		var c = document.getElementById("myCanvas" + canvasNumber);
	} else {
		var c = document.getElementById("myCanvas");
	}
	// Then, call its getContext() method (you must pass the string "2d" to the
	// getContext() method):
	var ctx = c.getContext("2d");

	var xIni;
	var xFin;
	var yIni;
	var yFin;

	var padding = 50;

	xIni = (c.width * parseInt(lines[i][1]) / xtotal);
	yIni = (c.width * parseInt(lines[i][2]) / ytotal);
	xFin = (c.width * parseInt(lines[i][3]) / xtotal);
	yFin = (c.width * parseInt(lines[i][4]) / ytotal);
	if(selectedLines.length>canvasNumber&& selectedLines[canvasNumber]!=null&&selectedLines[canvasNumber].indexOf(i)>-1)
			color=rgb(255,0,0);
	ctx.fillStyle = ctx.strokeStyle = color;

	// Rect in sequence X
	roundRect(ctx, xIni, 0, xFin - xIni, padding / 2, 2, rectsFilled,
			rectsStroked);
	/*
	 * if(rectsFilled){ ctx.rect(xIni,0,xFin-xIni,padding); ctx.fill();
	 * ctx.stroke(); } else { ctx.lineWidth=3;
	 * ctx.strokeRect(xIni,0,xFin-xIni,padding); }
	 */

	var halfX = xIni + ((xFin - xIni) / 2);
	var halfY = yIni + ((yFin - yIni) / 2);
	ctx.beginPath();
	ctx.moveTo(halfX, padding / 2);
	ctx.lineTo(halfX, padding);
	ctx.moveTo(halfX, padding);
	ctx.lineTo(halfY, c.height - padding);
	ctx.lineWidth = 1;
	ctx.stroke();
	/*
	 * ctx.beginPath(); ctx.moveTo(xIni,padding);
	 * ctx.lineTo(yIni,c.height-padding); ctx.moveTo(xFin,padding);
	 * ctx.lineTo(yFin,c.height-padding); ctx.lineWidth=1; ctx.stroke();
	 */

	// Rect in sequence Y
	var rectYHeight;
	if (yFin < yIni) {
		rectYHeight = c.height - padding / 2;
		ctx.beginPath();
		ctx.moveTo(halfY, c.height - padding / 2);
		ctx.lineTo(halfY, c.height - padding);
		ctx.stroke();
	} else {
		rectYHeight = c.height - padding;
	}
	roundRect(ctx, yIni, rectYHeight, yFin - yIni, padding / 2, 2, rectsFilled,
			rectsStroked);
	// ctx.lineWidth=3;
	// ctx.strokeRect(yIni,c.height-padding,yFin-yIni,padding);
	// ctx.lineWidth=1;
	// ctx.fill();
	// ctx.stroke();

}

function showSelected(){
    if(!showingSelected){
        currTable=document.getElementById("files-tab-content").cloneNode(true);
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
        showingSelected=false;
        document.getElementById("files-tab-content").parentNode.replaceChild(currTable.cloneNode(true),document.getElementById("files-tab-content"));
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
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke == "undefined") {
		stroke = true;
	}
	if (typeof radius === "undefined") {
		radius = 5;
	}
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (stroke) {
		ctx.stroke();
	}
	if (fill) {
		ctx.fill();
	}
}

function chooseColor(likeness) {
	return rgb(0, 0, 0);
	/*
	 * switch(likeness){ case likeness > 0.90: return rgb(0,0,0); break; }
	 */
}

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

function rgb(r, g, b) {
	return "rgb(" + r + "," + g + "," + b + ")";
}

function rgba(r, g, b, a) {
	return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}

function aleatorio(inferior, superior) {
	numPosibilidades = superior - inferior
	aleat = Math.random() * numPosibilidades
	aleat = Math.floor(aleat)
	return parseInt(inferior) + aleat
}

function colorAleatorio() {
	return "rgb(" + aleatorio(0, 255) + "," + aleatorio(0, 255) + ","
			+ aleatorio(0, 255) + ")";
}

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
}

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

function drawBoard(board, vertical, canvasName) {
    var canvasGrid = document.getElementById(canvasName);
    if(board) {
        var ctx = canvasGrid.getContext("2d");
        var width = canvas.width;
        var height = canvas.height;
        if (vertical) {
			clearCanvas(canvasName);

            //ctx.font = "bold 20px sans-serif";
            //ctx.fillText("Grid size: 500x500px, Step: 100px", 0, -23);

            var stepVertical = (currentArea.x1 - currentArea.x0) / 5;
            var stepV = currentArea.x0;

			for (var x = 50; x <= 550; x += 100) {
				ctx.font = "bold 12px sans-serif";
				var correctPositionX = ((stepV) * parseInt(fileHeader[0].seqXLength)) / width;

				//Round to thousands if not so much zoom
				if(scaleX > 0.20) {
					correctPositionX = Math.round(correctPositionX/1000)*1000;
				} else {
					correctPositionX = Math.round(correctPositionX);
				}
				ctx.fillText(correctPositionX.toString(), x - 20, height + 45);
				ctx.moveTo(x, 25);
				ctx.lineTo(x, height + 25);
				stepV += stepVertical;
			}

			var stepHorizontal = Math.round((currentArea.y1 - currentArea.y0) / 5);
			var stepH = currentArea.y0;

			if (vertical) {

				var stepHorizontal = (currentArea.y1 - currentArea.y0) / 5;
				var stepH = currentArea.y0;

				for (var y = 25; y <= 525; y += 100) {
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
					ctx.moveTo(50, y);
					ctx.lineTo(width + 50, y);
					stepH += stepHorizontal;
				}
			}

			ctx.strokeStyle = "#ddd";
			ctx.stroke();
        } else {
			console.log("Track 1");
            var stepVertical = width / 10;
            var stepV = 0;

            for (var x = 0; x <= width; x += stepVertical) {
                ctx.font = "bold 12px sans-serif";
                // var aux = (((x - currentArea.x0) / (currentArea.x1 -
                // currentArea.x0)) * width);
                var correctPositionX = ((stepV) * parseInt(fileHeader[0].seqXLength))
                        / width;
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

function calculateDistance(position,frag){
    var distance = 0;
	var aux, aux2;
	var x1, x2, y1, y2;
	var x0 = position.x;
	var y0 = position.y;
    x1 = ((((canvas.width * parseInt(frag[1])) / xtotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
					* canvas.width;
    y1 = ((((canvas.height * parseInt(frag[2])) / ytotal) - currentArea.y0) /  ((currentArea.y1 - currentArea.y0)))
            * canvas.height;

    x2 = (((canvas.width * (parseInt(frag[3])) / xtotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
            * canvas.width;
    y2 = (((canvas.height * (parseInt(frag[4])) / ytotal) - currentArea.y0) / ((currentArea.y1 - currentArea.y0)))
            * canvas.height;
    //console.log(x1+" - "+y1+" - "+x2+" - "+y2);
    aux = Math.abs(((x2 - x1) * (y1 - y0))- ((x1 - x0) * (y2 - y1)));
    aux2 = Math.sqrt(Math.pow(x2 - x1, 2)+ Math.pow(y2 - y1, 2));
    distance = aux / aux2;
    return distance;
}

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
		xtotal = fileHeader[0].seqXLength;
		ytotal = fileHeader[0].seqYLength;
		var i = 17;

		console.log("X: " + xtotal + " Y:" + ytotal);

		while (!linefound && i < lines[j].length) {

			x1 = ((((canvas.width * parseInt(lines[j][i][1])) / xtotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
					* canvas.width;
			y1 = ((((canvas.height * parseInt(lines[j][i][2])) / ytotal) - currentArea.y0) /  ((currentArea.y1 - currentArea.y0)))
					* canvas.height;

			x2 = (((canvas.width * (parseInt(lines[j][i][3])) / xtotal) - currentArea.x0) / ((currentArea.x1 - currentArea.x0)))
					* canvas.width;
			y2 = (((canvas.height * (parseInt(lines[j][i][4])) / ytotal) - currentArea.y0) / ((currentArea.y1 - currentArea.y0)))
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

		if (selected)
			redraw();

		selected = true;
		xtotal = fileHeader[0].seqXLength;
		ytotal = fileHeader[0].seqYLength;
		verticalDrawLines(lines[arrayIndex], i, true, null)

	}

}

function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();

	return {
		x : evt.clientX - rect.left,
		y : (canvas.height - (evt.clientY - rect.top))
	};
}

function activateBoard() {
	if (!board) {
		board = true
		redraw();
	} else {
		board = false;
		redraw();
	}
}

$('#viewSelect')
		.change(
				function() {
					if (this.value == 'Traditional') {
						$("#myCanvasLayer1").show();
						$("#myCanvasLayer2").show();
						$("#myCanvasGrid").show();
						$("#canvasContainer").css('width', '600px').css(
								'height', '550px');
						$("#myCanvas").css('background-color', 'transparent')
								.css('position', 'absolute').css('margin-top',
										'25px').css('margin-left', '50px');

						for (x = 1; x < lines.length; x++) {
							console.log("Generating horizontal canvas");
							var canvasTemp = document.getElementById("myCanvas"
									+ x);
							canvasTemp.remove();
						}

						vertical = true;
						redraw();
						zoomBoard = false;
					}

					if (this.value == 'Horizontal') {
						$("#myCanvasLayer1").hide();
						$("#myCanvasLayer2").hide();
						$("#myCanvasGrid").hide();
						$("#canvasContainer").css('width', 'auto').css(
								'height', 'auto');
						$("#myCanvas").css('background-color', 'white').css(
								'position', 'relative')
								.css('margin-top', '0px').css('margin-left',
										'0px');

						for (x = 1; x < lines.length; x++) {
							console.log("Generating horizontal canvas");
							$("#canvasContainer")
									.append(
											"<canvas id='myCanvas"
													+ x
													+ "' class='horizontalCanvas' width='700' height='250'></canvas>")
						}

						vertical = false;
						redraw();
						zoomBoard = false;
					}

				});
