/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

//Global Variables
var fileHeader = [];
var fileNames = [];
var fileInfo=[];
var multigenome;
var parseCount;
var matrixProcessedData = [];
var originalComparison = [];

//My Objects
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

function loadFileFromServer($fileName){
    BootstrapDialog.closeAll();
    $.ajax({
        type:"GET",
        url:"/loadFileFromServer/",
        data: {
            'filename': $fileName // from form
        },
        success: function(content){
            fileType = 'csv';
            fileNames[lines.length] = $fileName;
            multigenome = false;
            parseCount = 1;
            processData(content,lines.length);
        }
    });
    return false; //<---- move it here
}

function getFilesListFromServer(){

    $.ajax({
        type:"GET",
        url:"/getFileList/",
        success: function(response){

                BootstrapDialog.show({
                    title: 'Select file from Server',
                    message:function(dialog) {
                        var content = '<table class="table table-striped">';
                        for (i in response) {
                            content += '<thead><tr><th class="clickable" onclick="loadFileFromServer('+"'"+response[i]+"'"+')"><span class="glyphicon glyphicon-file"></span> '+response[i]+'</th></tr></thead>';
                        }
                        content += '</table>';
                        dialog.setSize(BootstrapDialog.SIZE_SMALL);
                        return content;
                    }
                })
            }
    });
    return false; //<---- move it here
}


function handleFiles(files, type) {

    if (files.length!=0) {
        $('#loading-indicator').show();
    }

    console.time("ReadingFile()");
    // Check for the various File API support.

    parseCount = files.length;

    if (window.FileReader) {
        // FileReader are supported.
        if(files.length>1)
            multigenome=true;
        for(var i=0; i <files.length; i++) {
            fileType = type;
            console.log("I: "+i+" lines.length: "+lines.length);
            getAsText(files[i],lines.length+i);
        }
    } else {
        alert('FileReader is not supported in this browser.');
    }
}

function getAsText(fileToRead, i) {
    var reader = new FileReader();

    if(fileType=='csv'){
        fileNames[i] = fileToRead.name;
        fileNames[i]  = fileNames[i].substring(0, fileNames[i].length-4);
        console.log("I: "+i+" fileName"+fileNames[i]);
    } else if (fileType=='mat') {
        fileNameMAT = fileToRead.name;
        fileNameMAT = fileNameMAT.substring(0, fileNameMAT.length-10);
    }else if (fileType=='mvn'){
        fileNameMVN = fileToRead.name;
        fileNameMVN = fileNameMVN.substring(0, fileNameMVN.length-4)
    }

    // Handle errors load
    reader.onload = function (event, index) {
        index = i;
        loadHandler(event, index)
    };


    reader.onerror = errorHandler;
    // Read file into memory as UTF-8
    reader.readAsText(fileToRead);
}

function loadHandler(event, i) {
    var csv = event.target.result;
    processData(csv, i);
}

function processData(csv, index) {
    if (fileType == 'csv') {
        document.getElementById("fileName").innerHTML = fileNames[index];

        //InfoPopover = File info popover ()
        $(function () {
            $("#infoPopover").popover();
        });

        $('#loading-indicator').show();

        Papa.parse(csv, {
            worker: true,
            delimiter:",",
            complete: function (results) {
                parseCount--;
                processEvolutiveEvents(results.data, index);
                //lines[index] = results.data;
                reset = true;
                map = false;

                if(parseCount==0){
                    console.log(lines[index]);
                    redraw();
                    //calculateMatrix(lines[0]);
                    addPrevZoom();
                }
                $('#loading-indicator').hide();
            },
            error: function(err,reason){
                alert(err);
                alert(reason);
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
        lines[index] = JSON.parse(JSON.stringify(auxLines));
        reset = true;
        fileHeader = [];

        console.timeEnd("ReadingFile()");

        redraw()

    } else if (fileType == 'mat') {

        if (fileNameMAT == fileName) {
            loadMatrix(csv);
            $('#loading-indicator').hide();
        } else {
            $('#loading-indicator').hide();
            BootstrapDialog.confirm('Filename do not match with frags file, do you want to continue?', function (result) {
                if (result) {
                    loadMatrix(csv);
                }
            });
        }
    }
}

    function loadMatrix(csv) {
        Papa.parse(csv, {
            worker: true,
            complete: function (results) {

                //Read raw data
                currentMatrix = results.data;
                processMatrixData(currentMatrix);
            },
            error: function(err,reason){
                alert(err);
                alert(reason);
            }
        });
    }

function errorHandler(evt) {
    if(evt.target.error.name == "NotReadableError") {
        alert("Canno't read file!");
    }
}