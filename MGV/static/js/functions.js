var savedCBC = false;
var PRODUCTION = true;

function getRow(){

    let currentFilter = "";
    let currentFilterWord ="";

    if(sessionStorage.getItem("currentFilter")){
        currentFilter = sessionStorage.getItem("currentFilter");
    }

    if(sessionStorage.getItem("currentFilterWord")){
        currentFilterWord = sessionStorage.getItem("currentFilterWord");
    }

    let url_getrow = "/getRow";
    if(PRODUCTION){
        url_getrow = "/labeller" + url_getrow;
    }

    $.ajax({
    type:"GET",
    url:url_getrow,
    data: {
        'currentFilter': currentFilter,
        'currentFilterWord': currentFilterWord
    },
    beforeSend: function(){
        $('#CBCtable tbody').empty();
        $('#observaciones').empty();
        $('#classes').empty();
    },
    success: function(content) {
        response = JSON.parse(content.candidate);

        var order = ["Fecha", "Número", "Edad del Paciente", "Sexo del Paciente", "WBC", "LY", "LYAB", "MO", "NE", "NEAB", "EO", "BA", "HEMA", "HGB", "HTO", "VCM", "MCH", "CHCM", "RDW", "PLT", "VPM"];

        for (var item in order){
            $('#CBCtable tbody').append('<tr><td class="titleTab">'+ order[item] +'</td>+<td>'+ response[0][order[item]]+'</td></tr>');
        }

        html_classes = "<div class='inline-class'>";
        for (var i in content.classes){
            html_classes += "<div class='custom-control  custom-radio custom-control-inline'>";
            html_classes += "<input type='radio' class='custom-control-input' id='radioButton"+i+"' value='"+content.classes[i]+"' name='labelclass'>";
            html_classes += "<label class='custom-control-label clinicalClass' for='radioButton"+i+"''>";
            html_classes += content.classes[i];
            html_classes += "</label> </div>";

            let aux = (parseInt(i)+1)%2;
            if((aux===0) && (parseInt(i)!==0)){
                html_classes += "</div>";
                $("#classes").append(html_classes).trigger( "create" );
                html_classes = "<div class='inline-class'>";
            }

            if(parseInt(i)===(content.classes.length-1)){
                html_classes += "</div>";
                $("#classes").append(html_classes).trigger( "create" );
            }

        }

        $('#observaciones').append(response[0]["Observaciones"]);

        sessionStorage.setItem("actual_index",content.index);

        setLabelledCount(content)

    }});

    hideAllDropdowns();

}

function getRowById(index){
    let url_getrowbyid = "/ById";
    if(PRODUCTION){
        url_getrowbyid = "/labeller" + url_getrowbyid;
    }

    $.ajax({
    type:"GET",
    url:url_getrowbyid,
    data: {
        'currentIndex': index
    },
    beforeSend: function(){
        $('#CBCtable tbody').empty();
        $('#observaciones').empty();
        $('#classes').empty();
    },
    success: function(content) {
        response = JSON.parse(content.candidate);

        $("#saved_message_info").show();

        var order = ["Fecha", "Número", "Edad del Paciente", "Sexo del Paciente", "WBC", "LY", "LYAB", "MO", "NE", "NEAB", "EO", "BA", "HEMA", "HGB", "HTO", "VCM", "MCH", "CHCM", "RDW", "PLT", "VPM"];

        for (var item in order){
            $('#CBCtable tbody').append('<tr><td class="titleTab">'+ order[item] +'</td>+<td>'+ response[0][order[item]]+'</td></tr>');
        }

        html_classes = "<div class='inline-class'>";

        for (var i in content.classes){
            html_classes += "<div class='custom-control  custom-radio custom-control-inline'>";
            html_classes += "<input type='radio' class='custom-control-input' id='radioButton"+i+"' value='"+content.classes[i]+"' name='labelclass'>";
            html_classes += "<label class='custom-control-label clinicalClass' for='radioButton"+i+"''>";
            html_classes += content.classes[i];
            html_classes += "</label> </div>";

            let aux = (parseInt(i)+1)%2;
            if((aux===0) && (parseInt(i)!==0)){
                html_classes += "</div>";
                $("#classes").append(html_classes).trigger( "create" );
                html_classes = "<div class='inline-class'>";
            }

            if(parseInt(i)===(content.classes.length-1)){
                html_classes += "</div>";
                $("#classes").append(html_classes).trigger( "create" );
            }

        }

        $('#observaciones').append(response[0]["Observaciones"]);

        sessionStorage.setItem("actual_index",content.index);

        setLabelledCount(content);
    }});

    hideAllDropdowns();
}

function setLabelledCount(content){
    let rows_left = JSON.parse(content.cbc_nan);
    let rows_all = JSON.parse(content.cbc_all);
    $('#rows-left').html("Classified CBCs: <b>" + (rows_all - rows_left) + "</b>")
}

function setRow(){
    try {
        var label = $('input[name="labelclass"]:checked')[0].value;

        if ($('input[name="externalHospital"]').is(":checked")) {
            var externalHospital = "1";
        } else {
            var externalHospital = "0";
        }

        let class_type = -1;
        if ($("input[name='labelclass']:checked").val() === 'Talasemia'){
            class_type = $('#thalasemia-type option:selected').val();
        } else if ($("input[name='labelclass']:checked").val() === 'Hemoglobinopatía'){
            class_type = $('#hemoglobinopathy-type option:selected').val();
        } else if ($("input[name='labelclass']:checked").val() === 'Anemia'){
            class_type = $('#anemia-type option:selected').val();
        }

	if ($('input[name="hemoStudy"]').is(":checked")) {
            var hemoStudy = "1";
        } else {
            var hemoStudy = "0";
        }

        let url_setrow = "/setRow";
        if(PRODUCTION){
            url_setrow = "/labeller" + url_setrow;
        }

        $.ajax({
            type:"POST",
            url:url_setrow,
            data: {
                'name': sessionStorage.getItem("current_name"),
                'label': label,
                'index': sessionStorage.getItem("actual_index"),
                'externalHospital': externalHospital,
                'class_type': class_type,
		'hemoStudy': hemoStudy
            },
            success: function(content) {
                checkSavedCBC();
            }
        });

    } catch(error) {
        alert("ERROR: " + error.message);
    }


}

function saveRow(){

    let actualIndex = sessionStorage.getItem("actual_index");
    let currentIndexList = [];

    if(localStorage["saved_elements"]){
        currentIndexList = localStorage.getItem("saved_elements");
        currentIndexList = JSON.parse(currentIndexList);
    }

    currentIndexList.unshift(actualIndex);
    localStorage.setItem("saved_elements",JSON.stringify(currentIndexList));

    checkSavedCBC()
}

function setConfig(){
    sessionStorage.setItem("current_name",$("#nametag").val());
    sessionStorage.setItem("actual_index",-1);

    let filterValue = $("#filterValue").val();
    if(filterValue) {
        let valueToFilter = $("#valueToFilter").val();
        let filterOperator = $("#filterOperator").val();
        sessionStorage.setItem("currentFilter", valueToFilter+filterOperator+filterValue);
    }

    let wordToFilter = $("#wordToFilter").val();
    if(wordToFilter){
        sessionStorage.setItem("currentFilterWord", wordToFilter);
    }

}

function checkSavedCBC(){
    if (localStorage["saved_elements"] && savedCBC==true) {
        let currentIndexList = [];
        currentIndexList = localStorage.getItem("saved_elements");
        currentIndexList = JSON.parse(currentIndexList);

        getRowById(currentIndexList.pop());

        if (currentIndexList.length > 0) {
            localStorage.setItem("saved_elements", JSON.stringify(currentIndexList));
        } else {
            localStorage.removeItem("saved_elements");
            sessionStorage.setItem('savedCBC', 0);
            savedCBC = false;
        }

    } else {
        $("#saved_message_info").hide();
        getRow()
    }

}

function hideAllDropdowns(){
    $('#thalasemia-type').hide();
    $('#hemoglobinopathy-type').hide();
    $('#anemia-type').hide();
}

$(document).ready(function () {
    $('#classes').change(function(){
        selected_value = $("input[name='labelclass']:checked").val();
        //console.log(selected_value);
        if (selected_value==="Talasemia") {
            $('#thalasemia-type').show();
            $('#hemoglobinopathy-type').hide();
            $('#anemia-type').hide();
        } else if (selected_value==="Hemoglobinopatía"){
            $('#hemoglobinopathy-type').show();
            $('#thalasemia-type').hide();
            $('#anemia-type').hide();
        } else if (selected_value==="Anemia"){
            $('#anemia-type').show();
            $('#thalasemia-type').hide();
            $('#hemoglobinopathy-type').hide();
        } else {
            hideAllDropdowns();
        }
    });

});
