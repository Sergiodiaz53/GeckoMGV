/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */
var prevTable=[];

function saveCSV(){
    var anot=[],csvtab=[];
    for(var x=0;x<lines.length;x++) {
        var annotationTable = document.getElementById("annotationsOutput");
        //annotationTable.deleteRow(0);

        var csvInfoTable = document.getElementById("csvInfoTable"+x);
        csvInfoTable.deleteRow(0);
        var cloneCsv= csvInfoTable.cloneNode(true);
        // console.log(lines);

        var row = csvInfoTable.insertRow(0);
        for (var j = 0; j < lines[x][16].length; j++) {
            var firstNameCell = row.insertCell(-1);
            firstNameCell.appendChild(document.createTextNode(lines[x][16][j]));
        }
        var cloneAn = annotationTable.cloneNode(true);
        anot.push(cloneAn);
        csvtab.push(csvInfoTable);
    }

    for(var x=0;x<lines.length;x++) {
        var output = document.getElementById("file"+x);
        var outputTable = document.createElement("table");
        outputTable.className = "table table-condensed";
        outputTable.id="output"+x;
        outputTable.innerHTML = "";
        outputTable.appendChild(fileInfo[x]);
        outputTable.appendChild(csvtab[x]);
        outputTable.appendChild(anot[x]);
        output.appendChild(outputTable);
        console.log(document.getElementById("output"+x));
        var fileName = lines[x][2][0].split(":")[1].trim()+"-"+lines[x][3][0].split(":")[1].trim();
        console.log("downloading "+fileName);
        CSV.begin("#output"+x).download(fileName).go();
        $('#infoModal').modal('toggle');
    }
    //redraw();
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
function showResults(filterText)
{
    for(var fileNum=0;fileNum<lines.length;fileNum++){
        var table = document.getElementById("csvInfoTable"+fileNum);
        if(prevTable.length>fileNum)
            table.replaceChild(prevTable[fileNum].cloneNode(true),table.childNodes[0]);
    }
    console.log("ha entrado");
    if(filterText!="")
    for(var fileNum=0;fileNum<lines.length;fileNum++){
        var toFiltertemp = document.getElementById("csvInfoTable"+fileNum).childNodes[0];
        prevTable[fileNum]=toFiltertemp.cloneNode(true);
        var toFilter=toFiltertemp.childNodes;
        for(var i=1;i<toFilter.length;i++){
            if(!showingSelected)
                if(toFilter[i].childNodes[0].innerHTML.indexOf("G")==0&&toFilter[i].childNodes[16].innerHTML.toLowerCase().indexOf(filterText.toLowerCase())==-1) {
                    document.getElementById("csvInfoTable" + fileNum).childNodes[0].removeChild(toFilter[i]);
                    //console.log("borrado");
                    i--;
                }
        }
    }

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
                text: "selected",
                click: function () {
                   showSelected()
                },
                "class":"ui-button-primary"
            },
            {
                text: "Save CSV",
                click: function () {
                    saveCSV()
                    //redraw();
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