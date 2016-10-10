/**
 * Created by Yeyo on 19/2/15.
 */

var searchString = "";

function add2Table(i,table){
    var row = table.insertRow(-1);
    for (var j = 0; j < currentLines[i].length; j++) {
        var firstNameCell = row.insertCell(-1);
        if((j>0) && (j<14)){
            firstNameCell.className = 'columnRight';
            firstNameCell.appendChild(document.createTextNode(currentLines[i][j]));
        } else if(j==16){
            firstNameCell.className = 'bigCell leftCell';
            firstNameCell.appendChild(document.createTextNode(currentLines[i][j]));
        } else if(j>=14) {
            firstNameCell.className = 'leftCell';
            firstNameCell.appendChild(document.createTextNode(currentLines[i][j]));
        } else {
            firstNameCell.appendChild(document.createTextNode(currentLines[i][j]));
        }
    }
}

function generateFragTable(currentLines, numFile, linesToPaint, activate){

    var auxDiv = document.createElement("div");

    if (numFile == 0 || activate) {
        $("#files-tab").append(
            "<li class='active'><a href='#file" + numFile + "' data-toggle='tab'>File "
            + numFile + "</a></li>");
        auxDiv.className = "tab-pane active";
        auxDiv.id = "file" + numFile;
    } else {
        $("#files-tab").append(
            "<li><a href='#file" + numFile + "' data-toggle='tab'>File "
            + numFile + "</a></li>");
        auxDiv.className = "tab-pane";
        auxDiv.id = "file" + numFile;
    }

    auxDiv.style.height = "100%";
    auxDiv.style.width = "100%";


    var columns = [
        {id: "type", name: "Type", field: "type"},
        {id: "xstart", name: "xStart", field: "xstart"},
        {id: "ystart", name: "yStart", field: "ystart"},
        {id: "xend", name: "xEnd", field: "xend"},
        {id: "yend", name: "yEnd", field: "yend"},
        {id: "strand", name: "Strand", field: "strand"},
        {id: "block", name: "Block", field: "block"},
        {id: "length", name: "Length", field: "length"},
        {id: "score", name: "Score", field: "Score"},
        {id: "ident", name: "Ident", field: "ident"},
        {id: "similarity", name: "Similarity", field: "similarity"},
        {id: "identp", name: "Ident %", field: "identp"},
        {id: "seqx", name: "SeqX", field: "seqx"},
        {id: "seqy", name: "SeqY", field: "seqy"}
    ];

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        headerRowHeight: 30,
        explicitInitialization: true,
        enableTextSelectionOnCells: true
    };

    var data = [];
    var i = 0;
    for (var x in linesToPaint) {
        var line = linesToPaint[x];
          data[i] = {
              type: currentLines[line][0],
              xstart: currentLines[line][1],
              ystart: currentLines[line][2],
              xend: currentLines[line][3],
              yend: currentLines[line][4],
              strand:currentLines[line][5],
              block: currentLines[line][6],
              length: currentLines[line][7],
              score: currentLines[line][8],
              ident: currentLines[line][9],
              similarity: currentLines[line][10],
              identp: currentLines[line][11],
              seqx: currentLines[line][12],
              seqy: currentLines[line][13]
          };
        i++;
    }


    //auxDiv.appendChild(fileInfo[numFile]);
    $("#files-tab-content").append(auxDiv);
    FragsGrid[numFile] = new Slick.Grid(auxDiv, data, columns, options);

}

function saveActualState() {
    var csvContent = getCSVContent();
    var numFile = getActiveNumFileInFileTab();

    //Download the file
    var csvGenerator = new CsvGenerator(csvContent, fileNames[numFile]);
    csvGenerator.download(true);
}

function uploadActualState(){
    var csvContent = getCSVContent();
    var numFile = getActiveNumFileInFileTab();

    $.ajax({
            url:'/upload/',
            type: "POST",
            data: {name: fileNames[numFile], content: csvContent.toString()},
            success:function(){
                 newFileInformation();
            },
            error:function (error){
                console.log(error)
            }
    });
}

function getCSVContent(){

    var numFile = getActiveNumFileInFileTab();

    var csvContent = [];

    //Add header to file
    for(var i=0; i <= fragsStarts; i++){
        csvContent.push(lines[numFile][i]);
    }

    if(!showingSelected) {
        //Add to file the lines represented in the canvas
        visualizedLines[numFile].forEach(function(lineNumber){
            csvContent.push(lines[numFile][lineNumber]);
        });
    } else {
        selectedLines[numFile].forEach(function(lineNumber){
            csvContent.push(lines[numFile][lineNumber]);
        });
    }

    return csvContent;

}

function getActiveNumFileInFileTab(){
    var numFile = $(' #files-tab .active a').attr('href');
    numFile = numFile.substring(numFile.length-1, numFile.length);

    return numFile;
}

function showSelectedFragsInGrid(){

    if(!showingSelected) {
        var numFile = getActiveNumFileInFileTab();

        $(' #files-tab .active').remove();
        $('#file'+numFile).remove();

        generateFragTable(lines[numFile], numFile, selectedLines[numFile], true);

        updateFragsGrids();
        showingSelected=true;
    } else {
        showingSelected=false;
        redraw();
        updateFragsGrids()
    }



}

function updateFragsGrids(){
    FragsGrid.forEach(function(item) {
        item.init();
    });
}

function updateAnnotsGrids(){
    annotsGrid.forEach(function(item) {
        item.init();
    });
}

function generateAnnotationTab(numFile, activate){

    var auxDiv = document.createElement("div");

    if (numFile == 0 || activate) {
        $("#annotations-tab").append(
            "<li class='active'><a href='#annotFile" + numFile + "' data-toggle='tab'>File "
            + numFile + "</a></li>");
        auxDiv.className = "tab-pane active";
        auxDiv.id = "annotFile" + numFile;
    } else {
        $("#annotations-tab").append(
            "<li><a href='#annotFile" + numFile + "' data-toggle='tab'>File "
            + numFile + "</a></li>");
        auxDiv.className = "tab-pane";
        auxDiv.id = "annotFile" + numFile;
    }

    auxDiv.style.height = "100%";
    auxDiv.style.width = "100%";

    var GBFloadButtons = $('<div class="btn-group GBFButtons" role="group">' +
                            '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Load GBF File for Genome X" onclick ="loadGBFFfile('+"'x',"+numFile+');"><span class="glyphicon glyphicon-floppy-save"></span> GBF X</button>' +
                            '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Load GBF File for Genome X" onclick ="loadGBFFfile('+"'y',"+numFile+');"><span class="glyphicon glyphicon-floppy-save"></span> GBF Y</button>' +
                            '</div>');

    AnotFiles[numFile] = [];

    $("#annotations-tab-content").append(auxDiv);
    $("#"+auxDiv.id).append(GBFloadButtons)

}

function fillGeneratedAnnotationTab(numFile){

    console.log("Filling:");
    console.log(AnotFiles[numFile][0]);
    console.log(AnotFiles[numFile][1]);

    var GBFloadButtons = $('<div class="btn-group GBFButtons" role="group">' +
                            '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Load GBF File for Genome X" onclick ="loadGBFFfile('+"'x',"+numFile+');"><span class="glyphicon glyphicon-floppy-save"></span> GBF X</button>' +
                            '<button type="button" class="btn btn-default" data-toggle="tooltip" data-placement="top" title="Load GBF File for Genome X" onclick ="loadGBFFfile('+"'y',"+numFile+');"><span class="glyphicon glyphicon-floppy-save"></span> GBF Y</button>' +
                            '</div>');

    annotsGrid[numFile] = "";
    $("#annotFile"+numFile).html("")
        .append(GBFloadButtons)
        .height('100%')
        .width('100%');


    var auxDiv = document.createElement("div");

    auxDiv.style.height = "100%";
    auxDiv.style.width = "100%";


    var columns = [
        {id: "start", name: "Start", field: "Start"},
        {id: "stop", name: "Stop", field: "Stop"},
        {id: "strand", name: "Strand", field: "Strand"},
        {id: "size", name: "Size", field: "Size"},
        {id: "gene", name: "Gene", field: "Gene"},
        {id: "synonym", name: "Synonym", field: "Synonym"},
        {id: "product", name: "Product", field: "Product"}
    ];

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        headerRowHeight: 30,
        explicitInitialization: true,
        enableTextSelectionOnCells: true
    };

    if(AnotFiles[numFile][0]==null) AnotFiles[numFile][0] =[];
    if(AnotFiles[numFile][1]==null) AnotFiles[numFile][1] =[];

    var auxAnots = AnotFiles[numFile][0].slice();
    var data = $.merge(auxAnots, AnotFiles[numFile][1]);

     $("#annotFile"+numFile).append(auxDiv);

    AnnotDataViews[numFile] = new Slick.Data.DataView({ inlineFilters: true });

    annotsGrid[numFile] = new Slick.Grid(auxDiv, AnnotDataViews[numFile], columns, options);
    annotsGrid[numFile].registerPlugin( new Slick.AutoColumnSize());

   AnnotDataViews[numFile].onRowCountChanged.subscribe(function (e, args) {
        annotsGrid[numFile].updateRowCount();
        annotsGrid[numFile].render();
    });
   AnnotDataViews[numFile].onRowsChanged.subscribe(function (e, args) {
        annotsGrid[numFile].invalidateRows(args.rows);
        annotsGrid[numFile].render();
    });

    updateFilter();

    AnnotDataViews[numFile].beginUpdate();
    AnnotDataViews[numFile].setItems(data,"ID");
    AnnotDataViews[numFile].setFilter(myFilter);
    AnnotDataViews[numFile].endUpdate();

    updateAnnotsGrids();
}

function updateFilter() {
    AnnotDataViews.forEach(function (dataView) {

        dataView.setFilterArgs({
            searchString: searchString
        });

        dataView.refresh();
    });

}

function myFilter(item, args) {
  if (args.searchString != "" && item["Product"].indexOf(args.searchString) == -1) {
    return false;
  }

  return true;
}

$("#search-annotation").keyup(function (e) {
    Slick.GlobalEditorLock.cancelCurrentEdit();

    // clear on Esc
    if (e.which == 27) {
      this.value = "";
    }

    searchString = this.value;
    updateFilter();

    });