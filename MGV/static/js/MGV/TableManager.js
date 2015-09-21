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