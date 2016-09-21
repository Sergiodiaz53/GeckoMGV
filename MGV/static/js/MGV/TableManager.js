/**
 * Created by Yeyo on 19/2/15.
 */


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

function generateFragTable(currentLines, numFile, linesToPaint){

    var auxDiv = document.createElement("div");

    if (numFile == 0) {
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
        {id: "seqy", name: "SeqY", field: "seqy"},
    ];

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        headerRowHeight: 30,
        explicitInitialization: true
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


    auxDiv.appendChild(fileInfo[numFile]);
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

    //Add to file the lines represented in the canvas
    visualizedLines[numFile].forEach(function(lineNumber){
        csvContent.push(lines[numFile][lineNumber]);
    });

    return csvContent;

}

function getActiveNumFileInFileTab(){
    var numFile = $(' #files-tab .active a').attr('href');
    numFile = numFile.substring(numFile.length-1, numFile.length);

    return numFile;
}

//Type,xStart,yStart,xEnd,yEnd,strand(f/r),block,length,score,ident,similarity,%ident,SeqX,SeqY