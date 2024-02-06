//add your api here below
var API_ENDPOINT = "https://7dhj7gkhq4.execute-api.us-east-1.amazonaws.com/partnerProd";
let base64Image;  // Variable to hold the base64 encoded image
let base64PDF;  // Variable to hold the base64 encoded image

function generateRandomID() {
    const min = 10000000; // Minimum for 8-digit number
    const max = 99999999; // Maximum for 8-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//AJAX POST REQUEST
document.getElementById("saveprofile").onclick = function(){
  var inputData = {
    "partnerId": generateRandomID().toString(),
    "partnerName":$('#partnername').val(),
    "partnerAddress":$('#partneraddress').val(),
    "partnerEIN":$('#partnerEIN').val(),
    "phoneNumber": $('#phonenumber').val(),
    "email": $('#email').val(),
    "profileImage": base64Image,
    "profilePDF": base64PDF          
      };
  $.ajax({
        url: API_ENDPOINT,
        type: 'POST',
        data:  JSON.stringify(inputData)  ,
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
          document.getElementById("profileSaved").innerHTML = "Profile Saved!";
          console.log(inputData);
        },
        error: function () {
            alert("error");
        }
    });
}
//AJAX GET REQUEST
document.getElementById("getprofile").onclick = function(){  
  $.ajax({
        url: API_ENDPOINT,
        type: 'GET',
         contentType: 'application/json; charset=utf-8',
        success: function (response) {
          $('#partnerProfile tr').slice(1).remove();
          jQuery.each(response, function(i,data) {          
            $("#partnerProfile").append("<tr> \
                <td>" + data['partnerID'] + "</td> \
                <td>" + data['partnerName'] + "</td> \
                <td>" + data['partnerAddress'] + "</td> \
                <td>" + data['partnerEIN'] + "</td> \
                <td>" + data['phoneNumber'] + "</td> \
                <td>" + data['email'] + "</td> \
                <td><a href='" + data['pURL'] + "' target='_blank'>View PDF</a></td> \
                </tr>");
          });
        },
        error: function () {
            alert("error");
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    var saveButton = document.getElementById('saveprofile');
    saveButton.disabled = true;  // Initially disable the save button

    // Function to update input field color based on validity
    function updateFieldColor(fieldId, isValid) {
        var field = document.getElementById(fieldId);
        if (isValid) {
            field.style.borderColor = 'green';
        } else {
            field.style.borderColor = 'red';
        }
    }

    // Function to check if all fields are valid
    function checkAllFields() {
        var partnerName = $('#partnername').val();
        var address = $('#partneraddress').val();
        var ein = $('#partnerEIN').val();
        var phoneNumber = $('#phonenumber').val();
        var email = $('#email').val(); 
        var pdf = base64PDF;
        var pdfFile = document.getElementById('profilePDF').files[0];

        // Check each field's validity
        var isPartnerNameValid = /^[a-zA-Z]{2,}$/.test(partnerName);
        var isAddressValid = address !== '';
        var isEINValid = /^\d{9}$/.test(ein); // Check if 'age' is exactly 9 digits
        var isPhoneNumberValid = /^\d{10}$/.test(phoneNumber);
        var isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        //var isPDFValid = pdf !== null && pdf !== undefined;
        
        var isPDFValid = pdfFile !== undefined && pdf !== null;


        console.log(isPartnerNameValid);
        console.log(isAddressValid);
        console.log(isEINValid);
        console.log(isPhoneNumberValid);
        console.log(isEmailValid);
        console.log(isPDFValid);
        console.log('/////////////////////')
        // Update field colors based on validity
        updateFieldColor('partnername', isPartnerNameValid);
        updateFieldColor('partneraddress', isAddressValid);
        updateFieldColor('partnerEIN', isEINValid);
        updateFieldColor('phonenumber', isPhoneNumberValid);
        updateFieldColor('email', isEmailValid);
        
        // Enable or disable save button based on validity
        saveButton.disabled = !(isPartnerNameValid && isAddressValid && isEINValid && isPhoneNumberValid && isEmailValid && isPDFValid);
    }

    // Attach event listeners to input fields for real-time validation
    ['partnername', 'partneraddress', 'partnerEIN', 'phonenumber', 'email', 'profilePDF'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', checkAllFields);
    });


/*
document.getElementById('profileimage').addEventListener('change', function(event){
    var file = event.target.files[0];
    if (file) {
        var reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').src = e.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            base64Image = e.target.result.split(',')[1]; // Store the base64 encoded image
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('imagePreview').style.display = 'none';
        base64Image = null; 
    }
    checkAllFields(); 
});
*/
document.getElementById('profilePDF').addEventListener('change', function(event) {
    var file = event.target.files[0];
    if (file) {
        // Check the file type
        if (file.type !== 'application/pdf') {
            alert('Please upload a PDF file.');
            return;
        }

        var reader = new FileReader();
        reader.onload = function(e) {
            base64PDF = e.target.result.split(',')[1]; // Get the base64 encoded string
            // Display the PDF in an iframe
            document.getElementById('pdfPreview').src = e.target.result;
            document.getElementById('pdfPreview').style.display = 'block';
            //inputData.profilePDF = base64PDF;
        };
        reader.readAsDataURL(file);  // Read the file as Data URL (base64)
        checkAllFields(); 
    }
});


});