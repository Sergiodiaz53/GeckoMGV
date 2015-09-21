/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

function saveCSV(){

    var annotationTable =  document.getElementById("csvAnnotationTable");
    annotationTable.deleteRow(0);

    console.table(annotationTable);

    var csvInfoTable = document.getElementById("csvInfoTable");
    csvInfoTable.deleteRow(0);

    var row = csvInfoTable.insertRow(0);
    for (var j = 0; j < lines[16].length; j++) {
        var firstNameCell = row.insertCell(-1);
        firstNameCell.appendChild(document.createTextNode(lines[16][j]));
    }

    var outputTable = document.getElementById("output");
    outputTable.innerHTML = "";
    outputTable.appendChild(fileInfo);
    outputTable.appendChild(csvInfoTable);
    outputTable.appendChild(annotationTable);

    var fileName = $("#fileName").text().split(" ")[0];
    CSV.begin("#output").download(fileName).go();

    $('#infoModal').modal('toggle');

    redraw();
}




function showDivInfoInPopup(divID, page, name){
    var windowFeatures =  'height=' + 500 +
        ',width=' + 500 +
        ',toolbar=' + 0 +
        ',scrollbars=' + 1 +
        ',status=' + 0 +
        ',resizable=' + 1 +
        ',location=' + 0 +
        ',menuBar=' + 0;

    var divText = document.getElementById(divID).outerHTML;

    var myWindow = window.open(page, name, windowFeatures);
    myWindow.dataFromParent = divText;
}


function dialogFrags(){
    var $dialogContainer = $('#output');
    var $detachedChildren = $dialogContainer.children().detach();
    $('#output').dialog({
        height:400,
        widht: 800,
        open: function () {
            $detachedChildren.appendTo($dialogContainer);
        }
    });
}
function dialogAnnotations(){
    var $dialogContainer = $('#annotationsOutput');
    var $detachedChildren = $dialogContainer.children().detach();
    $('#annotationsOutput').dialog({
        height:400,
        widht: 800,
        open: function () {
            $detachedChildren.appendTo($dialogContainer);
        }
    });
}