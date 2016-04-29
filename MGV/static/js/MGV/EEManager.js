var evolutiveIndex = -1;
var evolutiveFrags = [];

function processEvolutiveEvents(frags, index){
    //console.log("Frags: "+frags);
    //console.log("Index: "+index);
    var eeIndex = 0;
    lines[index] = [];
    originalComparison[index] = [];
    evolutiveFrags[index] = [];
    evolutiveFrags[index][eeIndex] = [];
    evolutiveEvents[index] = [];
    for(var i = 0; i < frags.length; i++){
        if(frags[i][0] != "StartEE"){
            lines[index].push(frags[i]);
            originalComparison[index].push(frags[i]);
        } else if (frags[i][0] == "StartEE"){
            i++;
            evolutiveEvents[index][eeIndex] = [];
            evolutiveFrags[index][eeIndex] = [];
            while (frags[i][0] != "EndEE"){
                if ((frags[i][0] == "PrevFrag") || frags[i][0] == "NextFrag"){
                    evolutiveFrags[index][eeIndex].push(frags[i]);
                } else {
                    evolutiveEvents[index][eeIndex].push(frags[i]);
                }
                i++;
            }
            eeIndex++;
        }
    }
    if(eeIndex) $("#EEmanag").show();
}

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

