//add your api here below
var API_ENDPOINT = "https://5ub3m56a4b.execute-api.us-east-1.amazonaws.com/driverProd/";
let base64Image;  // Variable to hold the base64 encoded image

function generateRandomID() {
    const min = 10000000; // Minimum for 8-digit number
    const max = 99999999; // Maximum for 8-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

//AJAX POST REQUEST
document.getElementById("saveprofile").onclick = function(){
  var inputData = {
    "driverId": generateRandomID().toString(),
    "driverFirstName":$('#fname').val(),
    "driverLastName":$('#lname').val(),
    "driverAge":$('#driverage').val(),
    "address": $('#address').val(),
    "phoneNumber": $('#phonenumber').val(),
    "email": $('#email').val(),
    "profileImage": base64Image           
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
          $('#driverProfile tr').slice(1).remove();
          jQuery.each(response, function(i,data) {          
            $("#driverProfile").append("<tr> \
                <td>" + data['driverID'] + "</td> \
                <td>" + data['driverFirstName'] + "</td> \
                <td>" + data['driverLastName'] + "</td> \
                <td>" + data['driverAge'] + "</td> \
                <td>" + data['address'] + "</td> \
                <td>" + data['phoneNumber'] + "</td> \
                <td>" + data['email'] + "</td> \
                <td><img src='" + data['imageURL'] + "' alt='Profile Image' height='50'></td> \
                </tr>");
          });
          console.log(data['imageURL']);
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
        var firstName = $('#fname').val();
        var lastName = $('#lname').val();
        var phoneNumber = $('#phonenumber').val();
        var email = $('#email').val();
        var age = $('#driverage').val();
        var address = $('#address').val();
        var image = base64Image;

        // Check each field's validity
        var isFirstNameValid = /^[a-zA-Z]{2,}$/.test(firstName);
        var isLastNameValid = /^[a-zA-Z]{2,}$/.test(lastName);
        var isPhoneNumberValid = /^\d{10}$/.test(phoneNumber);
        var isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
        var isAgeValid = /^\d{9}$/.test(age); // Check if 'age' is exactly 9 digits
        var isAddressValid = address !== '';
        var isImageValid = image !== null && image !== undefined;

        console.log(isFirstNameValid);
        console.log(isLastNameValid);
        console.log(isPhoneNumberValid);
        console.log(isEmailValid);
        console.log(isAgeValid);
        console.log(isAddressValid);
        console.log(isImageValid);

        // Update field colors based on validity
        updateFieldColor('fname', isFirstNameValid);
        updateFieldColor('lname', isLastNameValid);
        updateFieldColor('phonenumber', isPhoneNumberValid);
        updateFieldColor('email', isEmailValid);
        updateFieldColor('driverage', isAgeValid);
        updateFieldColor('address', isAddressValid);

        // Enable or disable save button based on validity
        saveButton.disabled = !(isFirstNameValid && isLastNameValid && isPhoneNumberValid && isEmailValid && isAgeValid && isAddressValid && isImageValid);
    }

    // Attach event listeners to input fields for real-time validation
    ['fname', 'lname', 'phonenumber', 'email', 'driverage', 'address', 'profileimage'].forEach(function(id) {
        document.getElementById(id).addEventListener('input', checkAllFields);
    });



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

});