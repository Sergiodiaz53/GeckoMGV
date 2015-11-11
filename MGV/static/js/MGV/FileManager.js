/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables
var fileHeader = [];
var fileInfo=[];
var multigenome;


//My Objectsx
function CSVHeader (headers) {
    this.seqXFilename = headers[1];
    this.seqYFilename = headers[2];
    this.seqXName = headers[3];
    this.seqYName = headers[4];
    this.seqXLength = headers[5];
    this.seqYLength = headers[6];
    this.minFragmentLength = headers[7];
    this.minIdentity = headers[8];
    this.totHits = headers[9];
    this.totHitsUsed = headers[10];
    this.totalFragments = headers[11];
}


function handleFiles(files, type) {
    $('#loading-indicator').show();
    console.log("HanldeFiles");
    console.time("ReadingFile()");
    // Check for the various File API support.
    if (window.FileReader) {
        // FileReader are supported.
        if(files.length>1)
            multigenome=true;
        for(var i=0; i <files.length; i++) {
            fileType = type;
            getAsText(files[i],i);
        }
    } else {
        alert('FileReader is not supported in this browser.');
    }
}

function getAsText(fileToRead, i) {
    console.log("GetAsText:"+i)
    var reader = new FileReader();
    // Handle errors load
    reader.onload = function (event, index) {
        index = i;
        loadHandler(event, index)
    };
    if(fileType=='csv'){
        fileName = fileToRead.name;
        fileName = fileName.substring(0, fileName.length-4);
    } else if (fileType=='mat') {
        fileNameMAT = fileToRead.name;
        fileNameMAT = fileNameMAT.substring(0, fileNameMAT.length-10);
    }else if (fileType=='mvn'){
        fileNameMVN = fileToRead.name;
        fileNameMVN = fileNameMVN.substring(0, fileNameMVN.length-4)
    }
    reader.onerror = errorHandler;
    // Read file into memory as UTF-8
    reader.readAsText(fileToRead);
}

function loadHandler(event, i) {
    console.log("LoadHandler: "+i)
    var csv = event.target.result;
    processData(csv, i);
}

function processData(csv, i) {

    console.log("ProcessData: " + i);

    if (fileType == 'csv') {
        var title = fileName;
        if (multigenome)
            title = "Multigenome comparison";
        document.getElementById("fileName").innerHTML = title;

        //InfoPopover = File info popover ()
        $(function () {
            $("#infoPopover").popover();
        });

        Papa.parse(csv, {
            worker: false,
            complete: function (results) {
                var ind = lines.length;
                lines[ind] = results.data;
                reset = true;
                fileHeader = [];
                map = false;
                redraw();
                $('#loading-indicator').hide();
            }
        });

    } else if (fileType == 'mvn') {
        var title = fileNameMVN;
        if (multigenome)
            title = "Multigenome comparison";
        document.getElementById("fileName").innerHTML = title;

        //InfoPopover = File info popover ()
        $(function () {
            $("#infoPopover").popover();
        });

        var auxLines = [];
        var allTextLines = csv.split(/\r\n|\n/);
        var j = 0;
        var ii = 0;
        while (allTextLines.length - 1) {
            if (ii <= 16) {
                auxLines.push("All by-Identity Ungapped Fragments (Hits based approach)");
                auxLines.push("[Abr.98/Apr.2010/Dec.2011 -- <ortrelles@uma.es>");
                allTextLines.shift();
                allTextLines.shift();
                auxLines.push("SeqX filename\t:" + allTextLines.shift().split('\t')[1]);
                var xlen = allTextLines.shift().split('\t')[1];
                auxLines.push("SeqY filename\t:" + allTextLines.shift().split('\t')[1]);
                auxLines.push("SeqX name\t:-");
                auxLines.push("Seqy name\t:-");
                auxLines.push("SeqX length\t:" + xlen);
                auxLines.push("SeqY length\t:" + allTextLines.shift().split('\t')[1]);
                auxLines.push("Min.fragment.length\t:-");
                auxLines.push("Min.Identity\t:0");
                auxLines.push("Tot Hits (seeds)\t:0");
                auxLines.push("Tot Hits (seeds) used\t:0");
                auxLines.push("Total fragments\t: -");
                auxLines.push("========================================================");
                auxLines.push("Total CSB\t:-");
                auxLines.push("x========================================================");
                auxLines.push("Type,xStart,yStart,xEnd,yEnd,strand(f/r),block,length,score,ident,similarity,%ident,SeqX,SeqY")
                allTextLines.shift();
                ii = 16;
            } else {
                var temp = allTextLines.shift().split('\t');
                var char = '';
                if (temp[2] < 0) {
                    char = 'r';
                } else {
                    char = 'f';
                }
                var x1 = parseInt(Math.abs(temp[2])) + parseInt(temp[0]);
                var x2 = parseInt((temp[1])) + parseInt(temp[0]);
                auxLines.push(["Frag", Math.abs(temp[2]).toString(), temp[1], x1, x2, char, "0", temp[0], "0", "0", "0", "0", "0", "0"])
            }

            ii++;
        }

        // Recovery lines
        lines[i] = JSON.parse(JSON.stringify(auxLines));
        reset = true;
        fileHeader = [];

        console.timeEnd("ReadingFile()");

        redraw()

    } else if (fileType == 'mat') {

        if (fileNameMAT == fileName) {
            loadMatrix();
        } else {
            BootstrapDialog.confirm('Filename do not match with frags file, do you want to continue?�', function (result) {
                if (result) {
                    loadMatrix();
                }
            });
        }
    }
}

    function loadMatrix() {
        var auxLines = [];
        var allTextLines = csv.split(/\r\n|\n/);

        while (allTextLines.length) {
            auxLines.push(allTextLines.shift().split('\t'));
        }

        // Recovery lines
        matrix = JSON.parse(JSON.stringify(auxLines));
        currentMatrix = matrix.slice(0);

        for (var i = 1; i < currentMatrix.length; i++) {
            for (var j = 0; j < currentMatrix[i].length - 1; j++) {
                maxMat = Math.max(parseInt(currentMatrix[i][j]), maxMat);
            }
        }

        paintMatrix();
    }

function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Canno't read file!");
    }
}