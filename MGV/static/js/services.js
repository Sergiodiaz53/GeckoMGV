/**
 * Created by Yeyo on 2/7/15.
 */

 /*   $("#serviceForm").submit(function(e) {
        var args = new Array();

        $("#serviceForm :input[type=text]").each(function(){
            var input = $(this); // This is the jquery object of the input, do what you will
            args.push(input.val());
        });

        function getCookie(name) {
            var cookieValue = null;
            if (document.cookie && document.cookie != '') {
                var cookies = document.cookie.split(';');
                for (var i = 0; i < cookies.length; i++) {
                    var cookie = jQuery.trim(cookies[i]);
                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) == (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                    }
                }
            }
        return cookieValue;
        }

        var csrftoken = getCookie('csrftoken');

        servicename = args[0];
        exeName = args[1];

        args = args.slice(2,args.length);

        $("#serviceForm").append("<input type='text' name='args[]' value='"+args+"'/>");

        return true;

    });*/