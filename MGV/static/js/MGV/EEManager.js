var evolutiveIndex = -1;
var evolutiveFrags = [];
var huge_file = false;
var huge_files = [];

//Constants
HUGE_FILE_NUM = 100;
/**
 * Store evolutionary events information in a data estructure
 * @param  {String} frags File content
 * @param  {Integer} index Number of file
 */
function processEvolutiveEvents(frags, index){
    //console.log("Frags: "+frags);
    //console.log("Index: "+index);
    var eeIndex = 0;
    lines[index] = [];
    originalComparison[index] = [];
    evolutiveFrags[index] = [];
    evolutiveFrags[index][eeIndex] = [];
    evolutiveEvents[index] = [];

    for (var i = frags.length - 1; i >= 18; i--){
        if (frags[i][0] == "EndEE"){
            i--;
            evolutiveEvents[index][eeIndex] = [];
            evolutiveFrags[index][eeIndex] = [];
            while (frags[i][0] != "StartEE"){
                if ((frags[i][0] == "PrevFrag") || frags[i][0] == "NextFrag"){
                    evolutiveFrags[index][eeIndex].push(frags[i]);
                } else {
                    evolutiveEvents[index][eeIndex].push(frags[i]);
                }
                i--;
            }
            eeIndex++;
        }
    }
    console.timeEnd("processEvolutiveEvents");

    lines[index] = frags.slice(0);
    originalComparison[index] = frags.slice(0);

    evolutiveFrags[index] = evolutiveFrags[index].reverse();
    evolutiveEvents[index] = evolutiveEvents[index].reverse();

    if(eeIndex) $("#EEmanag").show();
}

function processHugeFile(){
  // Filter huge files
  for(hf of checkForHugeFiles()){
    var current_f = lines[hf];
  	var count=0

  	console.time("processHugeFile");
    for (var i = current_f.length - 1; i >= 18; i--){
      if (!filterHugeFile(current_f[i])) {
          current_f.splice(i, 1);
          count++;
      }
    }
    lines[hf] = current_f.slice(0);

    console.timeEnd("processHugeFile");
    console.log(count);
  }

  reset = true;
  map = false;
  for(i = 0; i < lines.length; i++){
    generateAnnotationTab(i);
  }

  redraw();
  addPrevZoom();
  spinnerOff();
  overlayOff();
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

/**
* Function to apply active filters to frags
* @param  {Array} line fragment to check
* @return {Boolean}      True/False if paint
*/
function filterHugeFile(line){
  	var paint = false;

  	var filterLenght = document.getElementById("filterLenght2").checked;
  	var filterSimilarity = document.getElementById("filterSimilarity2").checked;
  	var filterIdentity = document.getElementById("filterIdentity2").checked;

  	switch (parseInt(line[6])) {
          case -1:
              if (!filterIrrelevants) {
                  paint = true;
              }
              break;
          default:
              if (filterLenght) {
                  var lenghtFilter = document.getElementById("filterLenghtNumber2").value
                  if (parseInt(line[7]) >= parseInt(lenghtFilter)) {
                      paint = true;
                  }
                  break;
              } else {
                  paint = true;
                  break;
              }
  	}

  	if (filterSimilarity) {
  		var similarityValue = document.getElementById("filterSimilarityNumber2").value;
  		if (parseFloat(line[10]) <= similarityValue) {
  			paint = false;
  		}
  	}

  	if(filterIdentity){
  		if((line[9]/line[7]).toFixed(2)*100 <= identityLine.identityValue) {
  			paint = false;
  		}
  	}

    return paint;
}

function dialogHugeFile(huge_files_list) {
    if (!$('#hugeFileOutput').is(':visible')) {
        var $dialogContainer = $('#output');
        var file_list = document.getElementById("hugeFile_FileNames");
        for(file of huge_files_list){
          let current_filename = fileNames[file];
          let current_li = document.createElement("li");
          current_li.setAttribute("class", "list-group-item");
          current_li.appendChild(document.createTextNode(current_filename));
          file_list.appendChild(current_li);
        }
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
                        spinnerOn("Processing file");
                        processHugeFile();
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

/**
 * Load the next Evolutionary event
 */
function nextEE (){
    if(evolutiveIndex < evolutiveEvents[0].length-1) {
        evolutiveIndex++;
        $("#EEindex").html(evolutiveIndex);
        console.log("EE: "+evolutiveIndex);

        var auxPrevArray = [];
        var auxNextArray = [];

        for (var i = 0; i < evolutiveFrags[0][evolutiveIndex].length; i++) {
            var frag = evolutiveFrags[0][evolutiveIndex][i];
            console.log(evolutiveFrags[0][evolutiveIndex][i]);
            if(frag[0] == 'PrevFrag') auxPrevArray.push(frag);
            if(frag[0] == 'NextFrag') auxNextArray.push(frag);
        }

        //drawHorizontalLinesInHorizontalLayer(auxPrevArray, document.getElementById("hSel0"), 0, rgb(255, 0, 0));
        drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines[0] = lines[0].slice(0, 16).concat(evolutiveEvents[0][evolutiveIndex]);
            redraw();
            drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));
        },1500);

        setTimeout(function(){
            clearCanvas("selectLayer");
            redraw();
            drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgba(R[0], G[0], B[0], 0.7));
        },3000);

    }
}

function activateFilters(){
	$('#filterLenght').prop('checked', true);
	$('#filterSimilarity').prop('checked', true);
	$('#filterIdentity').prop('checked', true);

	$('#filterLenghtNumber').val(1000);
	$('#filterSimilarityNumber').val(50);
	$('#filterIdentityNumber').val(50);
}

/**
 * Load the previous evolutionary event
 */
function prevEE (){
    console.log("EEi: "+evolutiveIndex);
    if(evolutiveIndex>0) {

       var auxPrevArray = [];
       var auxNextArray = [];

        for (var i = 0; i < evolutiveFrags[0][evolutiveIndex].length; i++) {
            var frag = evolutiveFrags[0][evolutiveIndex][i];
            console.log(evolutiveFrags[0][evolutiveIndex][i]);
            if(frag[0] == 'PrevFrag') auxPrevArray.push(frag);
            if(frag[0] == 'NextFrag') auxNextArray.push(frag);
        }

        drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines[0] = lines[0].slice(0, 16).concat(evolutiveEvents[0][evolutiveIndex]);
            redraw();
            drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));
        },1500);

        setTimeout(function(){
            clearCanvas("selectLayer");
            redraw();
            drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgba(R[0], G[0], B[0], 0.7));
        },3000);

       evolutiveIndex--;
        $("#EEindex").html(evolutiveIndex);


    } else if (evolutiveIndex == 0) {

        var auxPrevArray = [];
        var auxNextArray = [];
        $("#EEindex").html("-");
        for (var i = 0; i < evolutiveFrags[0][evolutiveIndex].length; i++) {
            var frag = evolutiveFrags[0][evolutiveIndex][i];
            console.log(evolutiveFrags[0][evolutiveIndex][i]);
            if(frag[0] == 'PrevFrag') auxPrevArray.push(frag);
            if(frag[0] == 'NextFrag') auxNextArray.push(frag);
        }

        drawArrayFragsInLayer(auxNextArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines [0] = originalComparison[0];
            redraw();
            drawArrayFragsInLayer(auxPrevArray, document.getElementById("selectLayer"), 0, rgb(255, 0, 0));
        },1500);

        setTimeout(function(){
            clearCanvas("selectLayer");
            lines [0] = originalComparison[0];
            redraw();
            evolutiveIndex--;
       },3000);

    }
}
