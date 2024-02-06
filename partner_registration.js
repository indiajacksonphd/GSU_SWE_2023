/*****************************************UI************************************************ */

var base64PDF; 
var passwordInput = document.getElementById("passwordInputRegister");
var confirmPasswordInput = document.getElementById("confirmationpassword");
var nameVal = document.getElementById("personalnameRegister");
var emailVal = document.getElementById("emailInputRegister");
var nameMatch = document.getElementById("nameValid")
var emailMatch = document.getElementById("emailValid");
var number = document.getElementById("number");
var spec_char = document.getElementById("special_character");
var upper = document.getElementById("upper");
var lower = document.getElementById("lower");
var length = document.getElementById("length");
var theyMatch = document.getElementById("theyMatch");
var licenseInput = document.getElementById("driverlicense");
var licenseVal = document.getElementById("licenseValid");
var driverAddy = document.getElementById("address");
var driverAddyVal = document.getElementById("addressValid");
var driverPhone = document.getElementById("phonenumber");
var driverPhoneVal = document.getElementById("phoneNumberValid");
var pdfValid = document.getElementById('pdfSelected');
var codeInput = document.getElementById("verificationCodeInput");
var showLogin = document.getElementById("signIn");
var showSignUp = document.getElementById("registrat");

function displayLogin() {
    showLogin.style.display = "block";
	showSignUp.style.display = "none";
}

function displaySignUp() {
	showLogin.style.display = "none";
	showSignUp.style.display = "block";
}

function showPassword() {
  if (passwordInput.type === "password" && confirmPasswordInput.type === "password") {
    passwordInput.type = "text";
	confirmPasswordInput.type = "text";
  } else {
    passwordInput.type = "password";
	confirmPasswordInput.type = "password";
  }
}

function validate(){
	if(nameVal.value.length > 0) nameMatch.style.color = 'green';
	else nameMatch.style.color = 'red';

    if(licenseInput.value.match(/^\d{9}$/)) licenseVal.style.color = 'green';
    else licenseVal.style.color = 'red';

    if(driverAddy.value.length > 0) driverAddyVal.style.color = 'green';
    else driverAddyVal.style.color = 'red';

    if(driverPhone.value.match(/^\d{10}$/)) driverPhoneVal.style.color = 'green';
    else driverPhoneVal.style.color = 'red';

    if(isPDFSelected()) pdfValid.style.color = 'green';
    else pdfValid.style.color = 'red';
 
	if(emailVal.value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)) emailMatch.style.color = 'green';
	else emailMatch.style.color = 'red';

	if(passwordInput.value.match(/[0-9]/)) number.style.color = 'green';
	else number.style.color = 'red';

	if(passwordInput.value.match(/[!\@\#\$\%\^\&\*\(\)\_\-\+\=\?\>\<\.\,]/)) spec_char.style.color = 'green';
	else spec_char.style.color = 'red';

	if(passwordInput.value.match(/[A-Z]/)) upper.style.color = 'green';
	else upper.style.color = 'red';

	if(passwordInput.value.match(/[a-z]/)) lower.style.color = 'green';
	else lower.style.color = 'red';

	if(passwordInput.value.length < 8) length.style.color = 'red';
	else length.style.color = 'green';

	if(passwordInput.value === confirmPasswordInput.value || passwordInput.value.length === 0 || confirmPasswordInput.value.length === 0) theyMatch.style.color = 'green';
	else theyMatch.style.color = 'red';

	if(passwordInput.value.length === 0 || confirmPasswordInput.value.length === 0) theyMatch.style.color = 'red';
    
    if(isPDFSelected() && licenseInput.value.match(/^\d{9}$/) && driverAddy.value.length > 0 && driverPhone.value.match(/^\d{10}$/) && emailVal.value.match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/) && document.getElementById("personalnameRegister").value.length > 0 && document.getElementById("emailInputRegister").value.length > 0 && passwordInput.value === confirmPasswordInput.value && passwordInput.value.match(/[0-9]/) && passwordInput.value.match(/[!\@\#\$\%\^\&\*\(\)\_\-\+\=\?\>\<\.\,]/) && passwordInput.value.match(/[A-Z]/) && passwordInput.value.match(/[a-z]/) && passwordInput.value.length > 7) document.getElementById("mainbutton").disabled = false;
    else document.getElementById("mainbutton").disabled = true;
}

function isPDFSelected() {
    return base64PDF !== null && base64PDF !== undefined;
}



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
            pdfValid.style.color = 'green';
            validate();
        };
        reader.readAsDataURL(file);  // Read the file as Data URL (base64)
    } else {
        document.getElementById('imagePreview').style.display = 'none';
    }
});




/*****************************************SEND TO DATABASE************************************************ */
//add your api here below
var API_ENDPOINT = "https://7dhj7gkhq4.execute-api.us-east-1.amazonaws.com/partnerProd";

function generateRandomID() {
    const min = 10000000; // Minimum for 8-digit number
    const max = 99999999; // Maximum for 8-digit number
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

   /*****************************************COGNITO************************************************ */
   var username;
   var password;
   var personalname;
   
   var cognito = {
           userPoolId: 'us-east-1_BQFNSxITV', // e.g. us-east-2_uXboG5pAb
           region: 'us-east-1', // e.g. us-east-2
           clientId: '4ajjtqs5ksfh12i6702utc2laq' //is this used anywhere?
   }
   
   var poolData = {
       UserPoolId : cognito.userPoolId, // Your user pool id here
       ClientId : cognito.clientId // Your client id here
   };
   
   var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

   var cognitoUser = userPool.getCurrentUser();
       
   function registerButton() {	
       personalname =  document.getElementById("personalnameRegister").value;	
       username = document.getElementById("emailInputRegister").value;
           
       if (passwordInput.value != confirmPasswordInput.value) {
           alert("Passwords Do Not Match!")
               throw "Passwords Do Not Match!"
       } else {
           password =  document.getElementById("passwordInputRegister").value;	
       }
           
       var attributeList = [];
           
       var dataEmail = {
           Name : 'email', 
           Value : username, //get from form field
       };
           
       var dataPersonalName = {
           Name : 'name', 
           Value : personalname, //get from form field
       };
   
       var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
       var attributePersonalName = new AmazonCognitoIdentity.CognitoUserAttribute(dataPersonalName);
           
           
       attributeList.push(attributeEmail);
       attributeList.push(attributePersonalName);
   
       userPool.signUp(username, password, attributeList, null, function(err, result){
           if (err) {
               alert(err.message || JSON.stringify(err));
               return;
           }
               
           cognitoUser = result.user;
           emailVal.disabled = 'true';
           passwordInput.disabled = 'true';
           document.getElementById("personalnameRegister").disabled = 'true';
           confirmPasswordInput.disabled = 'true';
           document.getElementById("veriCode").style.display = "block";
       });

   }
   
   function verifyCode(){
           console.log(cognitoUser)
           cognitoUser.confirmRegistration(codeInput.value, true, function(err, result) {
               if (err) {
                   document.getElementById("log").innerText = err.message;
               }else{
                   
                   setInterval(displaySeconds, 1000);
                   setTimeout(function(){
                       document.getElementById('signIn').style.display = "block";
                       document.getElementById('registrat').style.display = "none";
                        }, 5000);
                   }
           });

           var inputData = {
            "partnerId": generateRandomID().toString(),
            "partnerName":$('#personalnameRegister').val(),
            "partnerAddress":$('#address').val(),
            "partnerEIN":$('#driverlicense').val(),
            "phoneNumber": $('#phonenumber').val(),
            "email": $('#emailInputRegister').val(),
            "password": $('#passwordInputRegister').val(),
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
   
   function signInButton() {
       
       var authenticationData = {
           Username : document.getElementById("inputUsername").value,
           Password : document.getElementById("inputPassword").value,
       };
       
       var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);
       
       var poolData = {
           UserPoolId : cognito.userPoolId, // Your user pool id here
           ClientId : cognito.clientId, // Your client id here
       };
       
       var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
       
       var userData = {
           Username : document.getElementById("inputUsername").value,
           Pool : userPool,
       };
       
       var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
       
       cognitoUser.authenticateUser(authenticationDetails, {
           onSuccess: function (result) {
               var accessToken = result.getAccessToken().getJwtToken();
               console.log(accessToken);	
         //open profile page
               window.open("partner_profile.html");
           },
           onFailure: function(err) {
               alert(err.message || JSON.stringify(err));
           },
       });
    }
     
     function forgotpasswordbutton() {
       var poolData = {
           UserPoolId : cognito.userPoolId, // Your user pool id here
           ClientId : cognito.clientId, // Your client id here
       };
       
       var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);
       
       var userData = {
           Username : document.getElementById("inputUsername").value,
           Pool : userPool,
       };
       
       var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
           
       cognitoUser.forgotPassword({
           onSuccess: function (result) {
               console.log('call result: ' + result);
           },
           onFailure: function(err) {
               alert(err);
               console.log(err);
           },
           inputVerificationCode() {
               var verificationCode = prompt('Please input verification code ' ,'');
               var newPassword = prompt('Enter new password ' ,'');
               cognitoUser.confirmPassword(verificationCode, newPassword, this);
           }
       });
     }


document.getElementById("login").addEventListener('click', function(){
    document.getElementById("signIn").style.display = "block";
    document.getElementById("registrat").style.display = "none";
});

document.getElementById("sign_up").addEventListener('click', function(){
    document.getElementById("signIn").style.display = "none";
    document.getElementById("registrat").style.display = "block";
});

function updateClock(){
    var now = new Date();
    var dname = now.getDay(),
    mo = now.getMonth(),
    dnum = now.getDate(),
    yr = now.getFullYear(),
    hou = now.getHours(),
    min = now.getMinutes(),
    sec = now.getSeconds(),
    pe = "AM";
    
    if(hou >= 12){
    pe = "PM";
    }
    if(hou == 0){
    hou = 12;
    }
    if(hou > 12){
    hou = hou - 12;
    }

    Number.prototype.pad = function(digits){
    for(var n = this.toString(); n.length < digits; n = 0 + n);
    return n;
    }

    var months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    var week = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    var ids = ["dayname", "month", "daynum", "year", "hour", "minutes", "seconds", "period"];
    var values = [week[dname], months[mo], dnum.pad(2), yr, hou.pad(2), min.pad(2), sec.pad(2), pe];
    for(var i = 0; i < ids.length; i++) document.getElementById(ids[i]).firstChild.nodeValue = values[i];
}

function initClock(){
    updateClock();
    window.setInterval(updateClock, 1);
}

function initMap() {
    var autocomplete;
    autocomplete = new google.maps.places.Autocomplete((document.getElementById("address")), {
    types: ['geocode'],
    });
}

initClock();