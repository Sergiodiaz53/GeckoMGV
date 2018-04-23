/*
 @author Sergio Díaz del Pino
 Multigenome Visualizer
 Bitlab - Universidad de Málaga
 */
var prevFragsTable="";
var prevAnnotTable="";
var currTable="";
var searchList=[];

//Loads the tables into variables.
function loadTables(anot,csvtab,x){
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

//Prepare tha tables for being printed
function prepareTable(anot, csvtab,x){
    var output = document.getElementById("file"+x);
    var outputTable = document.createElement("table");
    outputTable.className = "table table-condensed";
    outputTable.id="output"+x;
    outputTable.innerHTML = "";
    outputTable.appendChild(fileInfo[x]);
    outputTable.appendChild(csvtab[x]);
    outputTable.appendChild(anot[x]);
    output.appendChild(outputTable);
}

function saveCSV(){
    var anot=[],csvtab=[];
    for(var x=0;x<lines.length;x++) {
        loadTables(anot,csvtab,x);
    }

    for(var x=0;x<lines.length;x++) {
        prepareTable(anot, csvtab,x);
        //console.log(document.getElementById("output"+x));
        var fileName = lines[x][2][0].split(":")[1].trim().split(".")[0]+"-"+lines[x][3][0].split(":")[1].trim().split(".")[0]+"_Selectedlines.csv";
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
//Launch the search algorithm and initialize the search's enviroment
function showResults(filterText,firstFilter)
{
    //Empty the textBoxes
    if(filterText)
        if($('.SearchFilter2').val()!="")
            $('.SearchFilter2').val("");
        else if($('.SearchFilter3').val()!="")
            $('.SearchFilter3').val("");
        else
            $('.SearchFilter').val("");
    if(firstFilter&&prevFragsTable!="")
        document.getElementById("output").replaceChild(prevFragsTable.cloneNode(true), document.getElementById("files-tab-content"));
    if(firstFilter&&prevAnnotTable!="")
        document.getElementById("annotationsOutput").replaceChild(prevAnnotTable.cloneNode(true), document.getElementById("annotations-tab-content"));

    if(filterText!=""){
        if($("#"+filterText.toLowerCase()+"").length==0)
            search(filterText);
        else
            if(document.getElementById(filterText.trim().toLowerCase()).checked){
                searchList.push(filterText.toLowerCase());
                search(filterText);
            } else {
                document.getElementById("output").replaceChild(prevFragsTable.cloneNode(true),document.getElementById("files-tab-content"));
                document.getElementById("annotationsOutput").replaceChild(prevAnnotTable.cloneNode(true), document.getElementById("annotations-tab-content"));
                searchList.splice(searchList.indexOf(filterText.toLowerCase()),1);
                for(var index= 0;index<searchList.length;index++)
                    setTimeout(search(searchList[index]),5);
            }
         //Draw crossed lines to the annotations found
        drawAnnotations();
    }else
        document.getElementById("myCanvasLayer2").getContext("2d").clearRect(0,0,500,500);

}
//function which deletes from the table the annotations which doesn't match the search
function search(text){
    text=text.trim();
    if(text.indexOf(" ")>-1){
        search(text.substring(0,text.indexOf(" ")));
        setTimeout(search(text.substring(text.indexOf(" "),text.length)),10);
        return;
    }
    for(var fileNum=0;fileNum<lines.length;fileNum++){
        var active= false;
        if($("#checklayer"+fileNum).prop("checked"))
            active= true;
        var annotToFilter = document.getElementById("csvAnnotationTable" + fileNum).childNodes[0].childNodes;
        var toFilter = document.getElementById("csvInfoTable" + fileNum).childNodes[0].childNodes;
        for (var i = 1; i < toFilter.length; i++) {
            if (!showingSelected)
                if (toFilter[i].childNodes.length == 22 && ((toFilter[i].childNodes[18].innerHTML.toLowerCase().indexOf(text.toLowerCase()) == -1||!active)&& (toFilter[i].childNodes[21].innerHTML.toLowerCase().indexOf(text.toLowerCase()) == -1||!active))) {
                    document.getElementById("csvInfoTable" + fileNum).childNodes[0].removeChild(toFilter[i]);
                    i--;
                }
        }
        for (var i = 1; i < annotToFilter.length; i++) {
            if (!showingSelected)
                if ((annotToFilter[i].childNodes[9].innerHTML.toLowerCase().indexOf(text.toLowerCase()) == -1||!active)&&(annotToFilter[i].childNodes[12].innerHTML.toLowerCase().indexOf(text.toLowerCase()) == -1||!active)) {
                    document.getElementById("csvAnnotationTable" + fileNum).childNodes[0].removeChild(annotToFilter[i]);
                    i--;
                }
        }
    }
        currTable=document.getElementById("files-tab-content").cloneNode(true);
        if($("#"+text.toLowerCase()+"").length==0) {
            $("#Annotations").append("<div name=\"word\" class=\"checkbox\" ><label> <input type=\"checkbox\" onclick= \"showResults(\'"+text.trim()+"\',false)\" id=\"" + text.toLowerCase() + "\" checked >" + text + "</label> </div>");
            searchList.push(text.toLowerCase());
        }
}
//Draw crossed lines to the found annotations
function drawAnnotations(){
    document.getElementById("myCanvasLayer2").getContext("2d").clearRect(0,0,500,500);
    if(searchList.length>0)
    for(var fileNum=0;fileNum<lines.length;fileNum++){
        var toFilter = document.getElementById("csvInfoTable"+fileNum).childNodes[0].childNodes;
        var xfrag=parseInt(toFilter[1].childNodes[1].innerHTML),yfrag=parseInt(toFilter[1].childNodes[2].innerHTML);
            for(var i=2;i<toFilter.length;i++){
                if(toFilter[i].childNodes.length==22) {
                    var seq=toFilter[i].childNodes[0].innerHTML.charAt(1).toUpperCase();
                    var seqX=false;
                    for(var fil=0;fil<searchList.length;fil++) {
                        if (toFilter[i].childNodes[18].innerHTML.indexOf(searchList[fil]) == -1)
                            break;
                        seqX=true;
                    }
                    var seqY=false;
                    for(var fil=0;fil<searchList.length;fil++) {
                        if (toFilter[i].childNodes[21].innerHTML.indexOf(searchList[fil]) == -1)
                            break;
                        seqY=true;
                    }
                    //Classify depending on the sequence
                    var point=xfrag+(parseInt(toFilter[i].childNodes[2].innerHTML)-yfrag);
                    if(seqY)
                        annotationDrawLines('Y', toFilter[i].childNodes[2].innerHTML, toFilter[i].childNodes[4].innerHTML, point);
                    if (seqX) {
                        point = yfrag+(parseInt(toFilter[i].childNodes[1].innerHTML)-xfrag);
                        annotationDrawLines('X', toFilter[i].childNodes[1].innerHTML, toFilter[i].childNodes[3].innerHTML, point);
                    }

                }else{
                    var xfrag=parseInt(toFilter[i].childNodes[1].innerHTML),yfrag=parseInt(toFilter[i].childNodes[2].innerHTML);
                }
            }
        }
}

function uploadCSV(){
    for(var x=0;x<selectedLines.length;x++) {
        var selectedAsText = "CSV\n"
        for (var i = 1; i < 16; i++)
            if(i=13)
            selectedAsText += "========================================================\n";
            else
            selectedAsText += lines[x][i] + '\n';
        for (var i = 0; i < selectedLines[x].length; i++)
            selectedAsText += lines[x][selectedLines[x][i]] + '\n';
        var fileName = lines[x][2][0].split(":")[1].trim().split(".")[0]+"-"+lines[x][3][0].split(":")[1].trim().split(".")[0]+".csv";
        $.ajax({
            url:'/upload/',
            type: "POST",
            data: {name: fileName, content: selectedAsText},
            success:function(response){},
            complete:function(){},
            error:function (xhr, textStatus, thrownError){console.log("error")}
        });
        console.log("NEW FILE");
        newFileInformation();
        selectedAsText = ""
    }
}
function buttondisabled(){
    $("#filter")[0].disabled=!$("#filter")[0].disabled
    if(!$("#filter")[0].checked) {
        filtered = [];
        redraw();
    }
}
function filterSelection(){
    if(selectedLines.length>0){
    if($("#filter").text()[0]=='F'){
    for(var i=0; i<lines.length;i++)
    for(var j=0;j<selectedLines[i].length; j++) {
        if (filtered[i] == null)
            filtered[i] = [];
        filtered[i].push(selectedLines[i][j]);
    }
    }else {
        for (var i = 0; i < lines.length; i++)
            for (var j = 0; j < selectedLines[i].length; j++) {
                filtered[i] = jQuery.grep(filtered[i], function (value) {
                    return value != selectedLines[i][j];
                });
            }
        $("#filter").text("Filter");
    }
    selectedLines=[];
    clearCanvas("selectLayer");
    for(var i=0;i<lines.length;i++)
        clearCanvas("hSel"+i);
    redraw();}
}

function dialogFrags() {
    if (!$('#output').is(':visible')) {
        var $dialogContainer = $('#output');
        var $detachedChildren = $dialogContainer.children().detach();
        $('#output').dialog({
            height:500,
            minHeight:500,
            width: 500,
            minWidth: 500,
            title: 'CSB & Frag',
            resize: function() {
                FragsGrid.forEach(function(grid) {
                    grid.resizeCanvas();
                });
            },
            buttons: [
                {
                    text: "Selected",
                    id: "selButton",
                    click: function () {
                        showSelectedFragsInGrid();
                    },
                    "class": "ui-button-primary"
                },
                {
                    text: "Upload",
                    click: function () {
                        uploadActualState();
                    },
                    "class": "ui-button-primary",
                    "id": "uploadSelected",
                    "disabled": true
                },
                {
                    text: "Save",
                    click: function () {
                       saveActualState();
                    },
                    "class": "ui-button-primary",
                    "id": "saveSelected",
                    "disabled": true
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
                updateFragsGrids()
            }
        });
    }else
        $('#output').dialog("close");

    
    if(selectedLines.length > 0){
        console.log("TESTING...")
        
        document.getElementById('uploadSelected').className = "ui-button-primary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only";
        document.getElementById('saveSelected').className = "ui-button-primary ui-button ui-widget ui-state-default ui-corner-all ui-button-text-only";
    }
}

function dialogAnnotations(){
    if (!$('#annotationsOutput').is(':visible')) {
        var $dialogContainer = $('#annotationsOutput');
        var $detachedChildren = $dialogContainer.children().detach();
        $('#annotationsOutput').dialog({
            height:500,
            minHeight:500,
            width: 500,
            minWidth: 500,
            title: 'Annotations',
            resize: function() {
                annotsGrid.forEach(function(grid) {
                    grid.resizeCanvas();
                });
            },
            buttons: [
                {
                    text: "Close",
                    click: function () {
                        $(this).dialog("close");
                    }
                }
            ],
            open: function () {
                $detachedChildren.appendTo($dialogContainer);
                updateAnnotsGrids();
            }
        });

    }else
        $('#annotationsOutput').dialog("close");
}

    $( document ).ready(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });


function getServicelist(){
        $.ajax({
        type:"GET",
        url:"/scripts/getServiceList/",
        data:{returnType:"Frags"},
        success: function(response){

                BootstrapDialog.show({
                    title: 'Select service from Server',
                    message:function(dialog) {
                        var content = '<table class="table table-striped">';
                        for (i in response[0]) {
                            content += '<thead><tr><th class="clickable" onclick="loadServiceForm('+"'"+response[0][i]+"','"+response[1][i]+"'"+')"><span class="glyphicon glyphicon-file"></span> '+response[1][i]+'</th></tr></thead>';
                        }
                        content += '</table>';
                        dialog.setSize(BootstrapDialog.SIZE_SMALL);
                        return content;
                    }
                })
            }
    });
}

function showConsole(){
    console.log("sending ajax");
    $.ajax({
            url:'/filemanager/console',
            type: "POST",
            async: false,
            data: {},
            error:function (xhr, textStatus, thrownError){console.log("error")}
        })
}
//...........................................................................................................

$("form[name=viewFile]").submit(function(e){
  var form = $(this);
  var filename = form.find(':text').val();

  if (filename.indexOf('.clw') >= 0 || filename.indexOf('.msa') >= 0 || filename.indexOf('.aln') >= 0){
      form.attr('action', '/scripts/MSAvisualizer/')
  }
});


$("#serviceForm").submit(function(e){
    e.preventDefault();

    serviceForm=$('#serviceForm :input');
    files=0;

    for (var i=0;i<$('#serviceForm :input').length; i++){
        if($(serviceForm[i]).attr('class')!= null && $(serviceForm[i]).attr('class')=='file')
          $.ajax({
            url:'/filemanager/createPost/',
            type: "POST",
            async: false,
            data: {filename: $(serviceForm[i]).val(), content:''},
            beforeSend:function(){
                console.log("-- Service Submit --");
                files++;
            },
            success:function(response){
                console.log($(serviceForm[i]).val());
                $(serviceForm[i]).val(response);
                console.log($(serviceForm[i]).val());
            },
            complete:function(){
            },
            error:function (xhr, textStatus, thrownError){console.log("error")}
          });
    }

    $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: $(this).serialize(),
            success: function(data) {
                console.log("BACKGROUND:" + data);
                //$("html").html(data);
                window.location.href = "/filemanager/";
                executingServiceInformation(data);
            }
    });

    return true;
});

$("#serviceFormModal").submit(function(e){
    e.preventDefault();

    serviceForm=$('#serviceFormModal :input');
    files=0;

    for (var i=0;i<$('#serviceFormModal :input').length; i++){
        if($(serviceForm[i]).attr('class')!= null && $(serviceForm[i]).attr('class')=='file')
            $.ajax({
            url:'/filemanager/createPost/',
            type: "POST",
            async: false,
            data: {filename: $(serviceForm[i]).val(), content:''},
            beforeSend:function(){
                files++;
            },
            success:function(response){
                console.log($(serviceForm[i]).val())
                $(serviceForm[i]).val(response);
                console.log($(serviceForm[i]).val())
            },
            complete:function(){
            },
            error:function (xhr, textStatus, thrownError){console.log("error")}
        });
    }

    $.ajax({
            type: 'POST',
            url: $(this).attr('action'),
            data: $(this).serialize(),
            success: function(data) {
                console.log("BACKGROUND:" + data)
                executingServiceInformation(data);
            }
    });

    BootstrapDialog.closeAll();

    return false;
});

function executingServiceInformation(data){
    if(!$("#newFilePopup").hasClass("hidden")){
        $("#newFilePopup").removeClass("hidden");
    }
    $("#executingServicePopup").removeClass("hidden");
}

function newFileInformation(data){
    if(!$("#executingServicePopup").hasClass("hidden")){
        $("#executingServicePopup").removeClass("hidden");
    }
    $("#newFilePopup").removeClass("hidden");
}

$(".alert button.close").click(function (e) {
    $(this).parent().addClass("hidden")
});

//.........................................................................................................

function createFile(){
    $(".close").click();
    $.ajax({
            url:'/filemanager/createFile',
            type: "POST",
            data: {
                filename: $("#name").val()+'.'+$("#format").val(),
                content:$("#content").val()
            }
        });
}

function expandTextarea() {
    id="content";
    var element = $('#'+id).get(0);
    //element.style.overflow = 'hidden';
    element.style.height = 0;
    element.style.height = (parseInt(element.scrollHeight)+2).toString() + 'px';
}

function openCreationPad(){
     BootstrapDialog.show({
        title: 'Create a new file',
        message:function(dialog) {
            var content = '<p><label for="block">Name:</label> <input id="name" placeholder="e.g:file" type="text"></p><p><label for="block">Format:</label> <div ><select id="format" style="width:auto;" class="form-control"><option value="fasta">fasta</option><option value="csv">csv</option><option value="txt">txt</option></select></div></p><p><label for="block">Content:</label> <textarea id="content" onkeyup= "expandTextarea()" style="min-width: 85%; height: 28px" type="text"/>';
            dialog.setSize(BootstrapDialog.SIZE_NORMAL);
            return content
        },
         buttons: [{
                label: 'Create',
                cssClass: 'btn btn-success',
                //hotkey: 13,
                action: function() {
                    createFile();
                    location.reload();
                }
            }]
    })
}

function loadServiceForm(serviceExe, serviceName){
        BootstrapDialog.closeAll();
        $.ajax({
        type: 'POST',
        url: '/scripts/getServiceForm/',
        data: {
            'exeName': serviceExe
        },
        success: function(content) {
            var $generatedForm = $('<div></div>');
            console.log(content);
            $generatedForm.append(content);
            BootstrapDialog.show({
                title: serviceName,
                message:  $generatedForm
            });
        }
        });
        return false;
}

// Spinner functions

function spinnerOn(loadText){
  var spinner = document.getElementById("spinner");
  spinner.style.display = "block";

  $("#loadingtext").text(loadText);
}
function spinnerOff(){
  var spinner = document.getElementById("spinner");
  spinner.style.display = "none";
}
function overlayOn(){
  var overlay = document.getElementById("overlay");
  overlay.style.display = "block";
}
function overlayOff(){
  var overlay = document.getElementById("overlay");
  overlay.style.display = "none";
}

// Statistical functions
var current_anscombe_results = [];

function meanLength(numFile){
  var current_f = lines[numFile];
  var mean_length = 0;

  console.time("meanLength");
  for (var i = current_f.length - 2; i >= 18; i--){
    mean_length += parseInt(current_f[i][7]);
  }
  mean_length = mean_length/current_f.length
  console.timeEnd("meanLength");

  return Math.round(mean_length);
}

function meanOf(array){
  var ret = 0;
  console.time("meanOf");
  for( n of array){
    ret += n;
  }
  console.timeEnd("meanOf");
  return (ret/array.length);
}

// http://www.cs.tut.fi/~foi/invansc/
function anscombeTransform(number){
  return ( 2 * Math.sqrt(number + (3/8)) )
}

function anscombeInverse(number){
  return ( Math.pow(number/2, 2) - 3/8 )
}

function anscombeTransformLength(numFile){
  let current_f = lines[numFile];
  let ret = []
  var mean = 0;
  var sigma = 0;

  console.time("anscombeTransformLength");
  // Problem with file ending lines ???
  for (let i = current_f.length - 3; i >= 18; i--){
    let temp = anscombeTransform( parseInt(current_f[i][7]) )
    ret.push( temp );
    mean += temp;
  }
  mean = mean / current_f.length;

  for (num of ret){
    let temp = parseFloat(Math.pow(parseInt(num-mean),2));
    sigma += temp;
  }
  sigma = Math.sqrt(sigma / current_f.length);

  console.timeEnd("anscombeTransformLength");

  return {mean: mean, sigma: sigma};
}

var testing;