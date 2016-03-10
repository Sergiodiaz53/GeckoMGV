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
        var fileName = lines[x][2][0].split(":")[1].trim().split(".")[0]+"-"+lines[x][3][0].split(":")[1].trim().split(".")[0]+".csv";
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
            var annotToFilter=document.getElementById("csvAnnotationTable"+fileNum).childNodes[0].childNodes;
            var toFilter = document.getElementById("csvInfoTable"+fileNum).childNodes[0].childNodes;
            for(var i=1;i<toFilter.length;i++) {
                if (!showingSelected)
                    if (toFilter[i].childNodes[0].innerHTML.indexOf("G") == 0 && toFilter[i].childNodes[16].innerHTML.toLowerCase().indexOf(text.toLowerCase()) == -1) {
                        document.getElementById("csvInfoTable" + fileNum).childNodes[0].removeChild(toFilter[i]);
                        i--;
                    }
            }
            for(var i=1;i<annotToFilter.length;i++){
                if(!showingSelected)
                    if(annotToFilter[i].childNodes[7].innerHTML.toLowerCase().indexOf(text.toLowerCase())==-1) {
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
                if(toFilter[i].childNodes[0].innerHTML.indexOf("G")==0) {
                    var seq=toFilter[i].childNodes[0].innerHTML.charAt(1).toUpperCase();
                    //Classify depending on the sequence
                    var point=xfrag+(parseInt(toFilter[i].childNodes[2].innerHTML)-yfrag);
                    if (seq=='X') {
                        point = yfrag+(parseInt(toFilter[i].childNodes[1].innerHTML)-xfrag);
                        annotationDrawLines(seq, toFilter[i].childNodes[1].innerHTML, toFilter[i].childNodes[3].innerHTML, point);
                    }else
                        annotationDrawLines(seq, toFilter[i].childNodes[2].innerHTML, toFilter[i].childNodes[4].innerHTML, point);
                }else{
                    var xfrag=parseInt(toFilter[i].childNodes[1].innerHTML),yfrag=parseInt(toFilter[i].childNodes[2].innerHTML);
                }
            }
        }
}

function uploadCSV(){
    for(var x=0;x<selectedLines.length;x++) {
        var selectedAsText = ""
        for (var i = 0; i < 16; i++)
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
            height: 400,
            widht: 800,
            title: 'CSB & Frag',
            buttons: [
                {
                    text: "Selected",
                    click: function () {
                        showSelected()
                    },
                    "class": "ui-button-primary"
                },
                {
                    text: "Upload",
                    click: function () {
                        uploadCSV();
                    },
                    "class": "ui-button-primary"
                },
                {
                    text: "Save",
                    click: function () {
                        saveCSV()
                        //redraw();
                    },
                    "class": "ui-button-primary"
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
    }else
        $('#output').dialog("close");
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

    $( document ).ready(function() {
        $('[data-toggle="tooltip"]').tooltip();
    });


function getServicelist(){
        $.ajax({
        type:"GET",
        url:"/scripts/getServiceList/",
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

//...........................................................................................................
$("#serviceForm").submit(function(e){

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

    return true;
});

$("#serviceFormModal").submit(function(e){

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
                newFileInformation(data)
            }
    });

    BootstrapDialog.closeAll();

    return false;
});

function newFileInformation(data){

    $("#newFilePopup").removeClass("hidden")
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
            data: {filename: $("#name").val()+'.'+$("#format").val(),content:$("#content").val()},
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
        BootstrapDialog.closeAll()
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