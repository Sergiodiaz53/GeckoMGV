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
    this.seqXLength = parseInt(headers[5]);
    this.seqYLength = parseInt(headers[6]);
    this.minFragmentLength = parseInt(headers[7]);
    this.minIdentity = parseFloat(headers[8]);
    this.totHits = parseInt(headers[9]);
    this.totHitsUsed = parseInt(headers[10]);
    this.totalFragments = parseInt(headers[11]);
}

/**
 * Load file from server side
 * @param  {[type]} $fileName Name of the file
 */
function loadFileFromServer($fileName){
    BootstrapDialog.closeAll();
    overlayOn();
    spinnerOn("Loading File...");

    $.ajax({
        type:"GET",
        url:"/loadFileFromServer/",
        data: {
            'filename': $fileName // from form
        },
        success: function(content){
            var extension = $fileName.split('.').pop().toLowerCase();
            switch (extension) {
                case 'csv':
                    fileType = 'csv';
                    fileNames[lines.length] = $fileName;
                    multigenome = false;
                    parseCount = 1;
                    processData(content,lines.length);
                    break;
                case 'gbff':
                    console.log("GBFF FILE LOADING");
                    processGBFF(content);
                    break;
            }
        }
    });
}

function processGBFF(content){
    console.log("PROCESSING");
    console.log(content)
    $('#loading-indicator').show();
    Papa.parse(content, {
        worker: true,
        header: true,
        complete: function (results){
            var id = $("ul#annotations-tab li.active a").attr('href');
            id = id.substr(id.length-1);
            id = parseInt(id);
            anotButtonID = "#Anot" + id;
            console.log("Anots: "+anotButtonID);
            console.log(AnotFiles[id][0]);
            console.log(AnotFiles[id][1]);
            if(AnotFiles[id][0]==1){
                console.log('entering X');

                var x_size, y_size;

                //Able anotation button for this comparison
                if($(anotButtonID).prop("disabled", true)){
                    $(anotButtonID).prop("disabled", false)
                }

                AnotFiles[id][0] = results.data.slice(0, results.data.length-1);

                x_size = AnotFiles[id][0].length;

                for(i = 0; i < x_size; i++){
                        AnotFiles[id][0][i].File = "X"
                }

                if(AnotFiles[id][1]!=null){
                    x_size = AnotFiles[id][0].length;
                    y_size = AnotFiles[id][1].length;
                    for(i = 0; i < x_size; i++){
                        AnotFiles[id][0][i]["ID"] = parseInt(AnotFiles[id][0][i]["ID"]) + y_size;
                    }
                }

            } else if(AnotFiles[id][1]==1) {
                console.log('entering Y');

                //Able anotation button for this comparison
                if($(anotButtonID).prop("disabled", true)){
                    $(anotButtonID).prop("disabled", false)
                }

                AnotFiles[id][1] = results.data.slice(0, results.data.length-1);
                y_size = AnotFiles[id][1].length;
                for(i = 0; i < y_size; i++){
                        AnotFiles[id][1][i].File = "Y"
                }

                if(AnotFiles[id][0]!=null){
                    x_size = AnotFiles[id][0].length;
                    y_size = AnotFiles[id][1].length;
                    for(i = 0; i < y_size; i++){
                        AnotFiles[id][1][i]["ID"] = parseInt(AnotFiles[id][1][i]["ID"]) + x_size;
                    }
                }

            }
            console.log("DI: "+id);
            console.log(AnotFiles[id]);
            fillGeneratedAnnotationTab(id);
            console.log("Finishing processing");
            $('#loading-indicator').hide();
        }
    });
}

function loadGBFFfile(genome, numFile){
    console.log("First Step");
    if(genome=='x'){
        AnotFiles[numFile][0] = 1
    } else {
        AnotFiles[numFile][1] = 1
    }

    getFilesListFromServer('gbff');
}

/**
 * Load the file list from server side
 * @return {[type]} Array of file names
 */
function getFilesListFromServer(extension){

    var data = { "extension" : extension };

    $.ajax({
        type:"GET",
        url:"/getFileList/",
        data: data,
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
    return false;
}

/**
 * Handler for proccess files
 * @param  {[type]} files array of files
 * @param  {[type]} type  type of files
 */
function handleFiles(files, type) {

    console.log(files);
    current_huge_file_index = 0;

    if (files.length!=0) {
        overlayOn();
        spinnerOn("Reading file...");
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
        console.log("I: "+i+" fileName: "+fileNames[i]);
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

/**
 * Process csv information with Papaparse
 * @param  {[type]} csv   Data
 * @param  {[type]} index Number of file
 */
function processData(csv, index) {
    console.log("Process index: "+index);

		overlayOn();
    spinnerOn("Processing Data...");

    if (fileType == 'csv') {
        document.getElementById("fileName").innerHTML = fileNames[index];

        //InfoPopover = File info popover ()
        $(function () {
            $("#infoPopover").popover();
        });

        Papa.parse(csv, {
            worker: false,
            delimiter:",",
            complete: function (results) {
                    if(parseCount >= 1) {
                        parseCount--;
                        processEvolutiveEvents(results.data, index);
                        current_anscombe_results[index] = anscombeTransformLength(index);
                        //parseFileColumns(index);

                        if (parseCount == 0) {
                            let nhf = checkForHugeFiles();
                            if(nhf.length>0){
                              dialogHugeFile(nhf);
                            } else{
                                reset = true;
                                map = false;
                                generateAnnotationTab(index);
                                redraw();
                                addPrevZoom();
                            }
                        }
                    }

            },
            error: function(err,reason){
                alert(err);
                alert(reason);
            }
        });

    }
    else if (fileType == 'mvn') {
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

    }
    else if (fileType == 'mat') {

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


		overlayOff();
    spinnerOff();
}

/**
 * Load matrix with Papaparse
 * @param  {[type]} csv Data
 */
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

/* -----------------
---- HUGE FILES ----
----------------- */
// Constants
HUGE_FILE_NUM = 1000000;

// Variables
var huge_file = false;
var huge_files = [];

function processHugeFile(){
    //console.time("processHugeFile");
    // Filter huge files

    let filterLenght = document.getElementById("filterLenght2").checked;
    let filterSimilarity = document.getElementById("filterSimilarity2").checked;
    let filterIdentity = document.getElementById("filterIdentity2").checked;
    current_lenghtValue = 0; current_similarityValue = 0; current_identityValue = 0;

    if(filterLenght)
        current_lenghtValue = parseInt(document.getElementById("filterLenghtNumber2").value);

    if(filterSimilarity)
        current_similarityValue = parseInt(document.getElementById("filterSimilarityNumber2").value);

    if(filterIdentity)
        current_identityValue = parseInt(document.getElementById("filterIdentity2").value);

    
    
    for(hf of checkForHugeFiles()){
        lines[hf] = filterHugeFile(lines[hf]);
    }

    //console.timeEnd("processHugeFile");
    reset = true;
    map = false;
    for(i = 0; i < lines.length; i++){
        generateAnnotationTab(i);
    }

    redraw();
    addPrevZoom();
}

function checkForHugeFiles(index){
  let ret = [];
  for(let file = 0; file < lines.length; file++){
    if(checkHugeFile(file)) ret.push(file);
  }
  return ret;
}

function checkHugeFile(index){
    return  (lines[index].length > HUGE_FILE_NUM);
}

var current_lenghtValue = 0, current_similarityValue = 0, current_identityValue = 0;
function filterFrag(frag){
    /*
    console.log(frag);
    console.log(frag[7] >= current_lenghtValue);
    console.log(frag[10] >= current_similarityValue);
    console.log(frag[11] >= current_identityValue);
    */

    return (frag[7] > current_lenghtValue &&
        frag[10] > current_similarityValue &&
        frag[11] > current_identityValue)
}
/**
* Function to apply active filters to frags
* @param  {Array} line fragment to check
* @return {Boolean}      True/False if paint
*/
function filterHugeFile(file){
    console.time("filterHugeFile");

    let header = file.splice(0,16);
    let frags = file.filter(filterFrag);
    console.log(file.length-frags.length);

    console.timeEnd("filterHugeFile");

    return header.concat(frags);
}

function dialogHugeFile(huge_files_list) {
    if (!$('#hugeFileOutput').is(':visible')) {
        var $dialogContainer = $('#output');
        var file_list = document.getElementById("hugeFile_FileNames");
        // Clear huge file list
        while (file_list.firstChild) {
          file_list.removeChild(file_list.firstChild);
        }

        // Fill huge file list
        for(file of huge_files_list){
          let current_filename = fileNames[file];
          let current_li = document.createElement("li");
          current_li.setAttribute("class", "list-group-item");
          current_li.appendChild(document.createTextNode(current_filename));
          file_list.appendChild(current_li);
        }

        // Create dialog
        var $detachedChildren = $dialogContainer.children().detach();
        $('#hugeFileOutput').dialog({
            closeOnEscape: false,
            height:550,
            minHeight:550,
            width: 500,
            minWidth: 500,
            title: huge_files_list.length + ' Huge File(s) Detected!',
            buttons: [
                {
                    text: "Continue",
                    click: function () {
                        $(this).dialog("close");
                        overlayOn();
                        spinnerOn("Processing file");
                        setTimeout(function(){processHugeFile();}, 250);
                    },
                    "class": "ui-button-primary"
                }
            ],
            open: function (event, ui) {
                $(".ui-dialog-titlebar-close").hide();
                $detachedChildren.appendTo($dialogContainer);
                updateAnnotsGrids();
            }
        });

    }
}

function parseFileColumns(index){
    // Parse lines
    console.time("parseFileColumns");
    for (var i = lines[index].length - 1; i >= 16; i--){
        let line = lines[index][i];

        line[1] = parseInt(line[1]);
        line[2] = parseInt(line[2]);
        line[3] = parseInt(line[3]);
        line[4] = parseInt(line[4]);
        line[7] = parseInt(line[7]);
        line[6] = parseFloat(line[6]);
        line[10] = parseFloat(line[10]);
        line[11] = parseFloat(line[11]);
        line[13] = parseFloat(line[13]);

        lines[index][i] = line;
    }
    console.timeEnd("parseFileColumns");
}

function parseLine(unparsedLine){
    unparsedLine[1] = parseInt(unparsedLine[1]);
    unparsedLine[2] = parseInt(unparsedLine[2]);
    unparsedLine[3] = parseInt(unparsedLine[3]);
    unparsedLine[4] = parseInt(unparsedLine[4]);
    unparsedLine[7] = parseInt(unparsedLine[7]);
    unparsedLine[6] = parseFloat(unparsedLine[6]);
    unparsedLine[10] = parseFloat(unparsedLine[10]);
    unparsedLine[11] = parseFloat(unparsedLine[11]);
    unparsedLine[13] = parseFloat(unparsedLine[13]);
}
