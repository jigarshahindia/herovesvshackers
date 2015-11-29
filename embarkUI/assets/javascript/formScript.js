$(document).ready(function () {

    /*
    Function: getFormData
    TODO: Function to build form data to be sent during POST call to create campaign. 
    Created with two offers in case of referral campaign
    @parms: none
    @return: data-json object to be passed in POST call
    */

    var getFormData = function () {
        var data = {
            emailId: $('#usrKey').val(),
            random: $('#usrKey').val(),
            ownerKey: null
        }
        return data;
    };

    /*
    Function: areInputsValid
    TODO: Function to validate input fields before submitting
    @parms: none
    @return: none
    */

    var areInputsValid = function () {
        var error = [];

        if ($('#usrKey').val().length < 1) {
            $('#block-left').addClass('has-error');
            error.push("Please enter a user key.<br/>");
        } else {
            $('#block-left').removeClass('has-error');
            $('#block-left').addClass('has-success');
        }

        if ($('#usrEmail').val().length < 1) {
            $('#block-right').addClass('has-error');
            error.push("Please enter an Email Id.<br/>");
        } else {
            $('#block-right').removeClass('has-error');
            $('#block-right').addClass('has-success');
        }

        if (error.length > 0) {
            //$("#errorText").html("<b>" + error + "</b>");
            $("#createError").removeClass("hide");
            return false;
        } else {
            return true;
        }1993
    };

    var populateFields = function(res) {
        $('#dob').val() = res.details.poi.dob
        if (res.details.poi.gender == "M") {
            $('#gender').val() = "Male";    
        } else {
            $('#gender').val() = "Female";
        }   
        $('#name').val() = res.details.poi.name;
        $('#home-address').val() = res.details.poa.co + " " + 
            res.details.poa.vtc + " " + res.details.poa.dist + " " + 
            res.details.poa.state;
    };

    $('#btn-get-info').on('click', function (callback) {
        if (areInputsValid()) {
            $("#errorMsg").addClass("hide");
            //$('#campaignSaveSubmitBtn').attr('disabled', true);
            if (window.XMLHttpRequest) var req = new XMLHttpRequest();
            else var req = new ActiveXObject("Microsoft.XMLHTTP");
            var data = JSON.stringify(getFormData());
            req.open('POST', 'http://192.168.43.126:8000/getDoc', true);
            req.send(data);
            req.onreadystatechange = function () {
                if (req.readyState == 4) {
                    try {
                        var res = JSON.parse(req.responseText);
                        if (req.status == 200) {
                            if (res){
                                $("#successMsg").removeClass("hide");
                                populateFields(res.data);
                            } else if (res.error != null || res.error == true) {
                                $("#errorMsg").removeClass("hide");
                            }
                        } else {
                            $("#errorMsg").removeClass("hide");
                        }
                    } catch (error) {
                        console.log(error);
                        $("#errorMsg").removeClass("hide");
                    }
                }
            }
        }
    });
});