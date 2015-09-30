/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */

function saveCSV(){


    console.log("saving");
    var annotationTable =  document.getElementById("annotationsOutput");
    //annotationTable.deleteRow(0);

    console.table(annotationTable);

    var csvInfoTable = document.getElementById("csvInfoTable0");
    csvInfoTable.deleteRow(0);

   // console.log(lines);

    var row = csvInfoTable.insertRow(0);
    for (var j = 0; j < lines[0][16].length; j++) {
        var firstNameCell = row.insertCell(-1);
        firstNameCell.appendChild(document.createTextNode(lines[0][16][j]));
    }

    var clone=annotationTable.cloneNode(true);
    var outputTable = document.getElementById("output");
    outputTable.innerHTML = "";
    outputTable.appendChild(fileInfo);
    outputTable.appendChild(csvInfoTable);
    outputTable.appendChild(clone);

    var fileName = $("#fileName").text().split(" ")[0];
    CSV.begin("#output").download(fileName).go();
    $('#infoModal').modal('toggle');

    console.log(document.getElementById("annotationsOutput"));
    redraw();
}



//Show external page in popup
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
        title: 'CSB & Frag',
        buttons: [
            {
                text: "Save CSV",
                click: function () {
                    saveCSV()
                },
                "class":"ui-button-primary"
            },

            {
                text: "Close",
                click: function () {
                    $(this).dialog("close");
                }
            }
        ],
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
        title: 'Annotations',
        open: function () {
            $detachedChildren.appendTo($dialogContainer);
        }
    });
}