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

function generateTable(currentLines){

     console.log("DATA1: "+currentLines[fragsStarts+1][0]);

    var columns = [
        {id: "type", name: "Type", field: "type"},
        {id: "xstart", name: "xStart", field: "xstart"},
        {id: "ystart", name: "yStart", field: "ystart"},
        {id: "xend", name: "xEnd", field: "xend"},
        {id: "yend", name: "yEnd", field: "yend"},
        {id: "strand", name: "Strand", field: "strand"}
    ];

    var options = {
        enableCellNavigation: true,
        enableColumnReorder: false,
        explicitInitialization: true
    };

    var data = [];
    for (var i = 0; i < currentLines.length-fragsStarts-1; i++) {
      data[i] = {
        type: "FRAGS",
        xstart: currentLines[i+fragsStarts+1][1],
        ystart: currentLines[i+fragsStarts+1][2],
        xend: currentLines[i+fragsStarts+1][3],
        yend: currentLines[i+fragsStarts+1][4],
        strand:currentLines[i+fragsStarts+1][5]
      };
    }

    console.log("DATA: "+data);

    grid = new Slick.Grid("#output", data, columns, options);
}


//Type,xStart,yStart,xEnd,yEnd,strand(f/r),block,length,score,ident,similarity,%ident,SeqX,SeqY