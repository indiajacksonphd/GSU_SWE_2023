/*moloja6408@kxgif.com*/
var my_latitude;
var my_longitude;
var bus_latitude;
var bus_longitude;
var distance_me_business;
var time;
var placeId;
var userName1;
var driverID;
var partnerID;
var driverName;
var driverLicense;
var address;
var phoneNumber;
var email;
var imageURL;
var userName;
var timerInterval;
var map;
var marker;
var transactionid;
var base64Image;
var partnerAddress;
var drop_off_address;
var elapsedTime = 0;

var API_ENDPOINT = "https://7dhj7gkhq4.execute-api.us-east-1.amazonaws.com/partnerProd";

var cognito = {
    userPoolId: 'us-east-1_BQFNSxITV', // e.g. us-east-2_uXboG5pAb
    region: 'us-east-1', // e.g. us-east-2
    clientId: '4ajjtqs5ksfh12i6702utc2laq' //is this used anywhere?
};

var data = { 
    UserPoolId : cognito.userPoolId,
    ClientId : cognito.clientId
};

var userPool = new AmazonCognitoIdentity.CognitoUserPool(data);

var cognitoUser = userPool.getCurrentUser();

window.onload = cognito_User();

function initMap() {
    
    $.getJSON('https://ipapi.co/json', function(data){
        console.log(data);
        $('#latitude').text(data.latitude);
        $('#longitude').text(data.longitude);

        my_latitude = data.latitude;
        my_longitude = data.longitude;

        console.log(my_latitude);
        console.log(my_longitude);

        const mylatlng = {
            lat: my_latitude,
            lng: my_longitude
        }
        const geocoder1 = new google.maps.Geocoder();
        geocoder1.geocode({location:mylatlng})
        .then((response) => {
            console.log(response);
            console.log(response.results[0].formatted_address);
            })

        // Initialize the map
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 14,
            center: { lat: my_latitude, lng: my_longitude } // Default center, will be updated
        });

        var autocomplete;
        autocomplete = new google.maps.places.Autocomplete((document.getElementById("searchInput")), {
         types: ['geocode'],
        });
         
        google.maps.event.addListener(autocomplete, 'place_changed', function () {
            document.getElementById("mainbutton").disabled = false;
            var near_place = autocomplete.getPlace();
             // Check if a place is selected
            if (!near_place.geometry) {
                return;
            }

            // Get the selected location's latitude and longitude
            var autocomplete_latitude = near_place.geometry.location.lat();
            var autocomplete_longitude = near_place.geometry.location.lng();

            console.log(autocomplete_latitude);
            console.log(autocomplete_longitude);

            // Create a marker at the selected location
            var marker2 = new google.maps.Marker({
                map: map,
                title: 'Autocomplete Location',
                position: { lat: autocomplete_latitude, lng: autocomplete_longitude }
            });

            // Optionally, you can center the map on the selected location
            map.setCenter(marker2.getPosition());
            console.log(my_latitude);
            console.log(my_longitude);
            console.log(near_place);
            console.log(near_place.formatted_address);
            drop_off_address = near_place.formatted_address;
            // Do something with the marker or location information
            console.log("Selected location: " + drop_off_address);
            document.getElementById("drop_off").innerHTML = drop_off_address;
        });
    });
}

function geocodeLatLng(geocoder, map, infoWindow, bus_lat, bus_long){
    const latlng = {
        lat: bus_lat,
        lng: bus_long
    }
    geocoder.geocode({location:latlng})
        .then((response) => {
        console.log(response);
        console.log(response.results[0].formatted_address);
        document.getElementById("business_address").innerHTML = response.results[0].formatted_address;
    })
}

function calculateDistance(lat1, lon1, lat2, lon2) {
    // Radius of the Earth in kilometers
    const R = 6371; 

    // Convert latitude and longitude from degrees to radians
    const lat1Rad = (Math.PI / 180) * lat1;
    const lon1Rad = (Math.PI / 180) * lon1;
    const lat2Rad = (Math.PI / 180) * lat2;
    const lon2Rad = (Math.PI / 180) * lon2;

    // Differences in latitude and longitude
    const dLat = lat2Rad - lat1Rad;
    const dLon = lon2Rad - lon1Rad;

    // Haversine formula
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + 
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    // Calculate the distance in kilometers
    const distance = R * c;

    return distance;
}

function cognito_User(){
    if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                alert(err);
                return;
            }
            console.log('session validity: ' + session.isValid());
            //Set the profile info
            cognitoUser.getUserAttributes(function(err, result) {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log(result);
                var userEmail = result[3].getValue();
                
                userName = result[2].getValue();
                document.getElementById("user_name").innerHTML = userName;
                
                
                $.ajax({
                    url: API_ENDPOINT + '?email=' + encodeURIComponent(userEmail),
                    type: 'GET',
                    contentType: 'application/json; charset=utf-8',
                    success: function (response) {
                        console.log(API_ENDPOINT  + '?email=' + userEmail);
                        console.log(response);
                                // Assuming 'response' is an array of items
                        var filteredData = response.filter(function(item) {
                            return item.email === userEmail;
                        });

                        jQuery.each(filteredData, function(i,data) {          
                            $("#driverInfo").append("<h4><tr><td> Account Number: <span>" + data['partnerID'] + "</span></td></tr></h4>");
                            $("#driverInfo").append("<h4><tr><td> Name: <span>" + data['partnerName'] + "</span></td></tr></h4>");
                            $("#driverInfo").append("<h4><tr><td> License Number: <span>" + data['partnerEIN'] + "</span></td></tr></h4>");
                            $("#driverInfo").append("<h4><tr><td> Address: <span>" + data['partnerAddress'] + "</span></td></tr></h4>");
                            $("#driverInfo").append("<h4><tr><td> Phone Number: <span>" + data['phoneNumber'] + "</span></td></tr></h4>");
                            $("#driverInfo").append("<h4><tr><td> Email: <span>" + data['email'] + "</span></td></tr></h4>");
                            $("#driverInfo").append("<h4><tr><td> Business Status: <span> Valid </span></td></tr></h4>");
                            partnerID = data['partnerID'];
                            partnerName = data['partnerName'];
                            partnerEIN = data['partnerEIN'];
                            partnerAddress = data['partnerAddress'];
                            phoneNumber = data['phoneNumber'];
                            email = data['email'];
                            pdfURL = data['pURL'];
                            console.log(partnerID);
                            console.log(partnerName);
                            console.log(partnerEIN);
                            console.log(partnerAddress);
                            console.log(phoneNumber);
                            console.log(email);
                            console.log(pdfURL);   
                            $("#ein_pdf").html('<object data="' + pdfURL + '" type="application/pdf" style="width: 95%; height: 75vh;"><embed src="' + pdfURL + '" type="application/pdf" style="width: 100%; height: 85vh;"></embed></object>');
                            document.getElementById("current_address").innerHTML = partnerAddress;
                            createMarker(partnerAddress, 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                            document.getElementById("welcome_back").innerHTML = "Welcome Back, " + partnerName;
                            //refreshContent();
                        $.ajax({
                            url: "https://efem21piw5.execute-api.us-east-1.amazonaws.com/transProd",
                            type: 'GET',
                            contentType: 'application/json; charset=utf-8',
                            success: function (response) {
                                console.log(response);
                                // Assuming 'response' is an array of items
                                var filteredData = response.filter(function(item) {
                                    return item.partnerID === partnerID && item.completed === 'In Progress';
                                }); 

                                var filteredData2 = response.filter(function(item) {
                                    return item.partnerID === partnerID && item.completed === 'No';
                                });
                                
                                // Check if there are items in the filteredData array
                                if (filteredData2.length > 0) {
                                    // Iterate through the filtered items
                                    filteredData2.forEach(function(item) {
                                        // Perform actions or access properties of each filtered item
                                        console.log("Partner ID: " + item.partnerID);
                                        console.log("Completed: " + item.completed);
                                        console.log(item.partnerID === partnerID && item.completed === 'Yes');
                                        // Check the condition and update the #mainbutton accordingly
                                        if (item.partnerID === partnerID && item.completed === 'Yes') {
                                            //$('#mainbutton').css('display', 'none').prop('disabled', false);
                                            document.getElementById("mainbutton").style.display = "block";
                                        } else {
                                            //$('#mainbutton').css('display', 'block').prop('disabled', true);
                                            document.getElementById("mainbutton").style.display = "none";
                                        }
                                    });
                                } else {
                                    // Handle the case when no items match the filter criteria
                                    console.log("No matching items found.");
                                }

                                jQuery.each(filteredData, function(i, data) {
                                    $("#transaction_number").append("<h4><tr><td>Transaction ID: <span>" + data['transactionID'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Request Date: <span>" + data['request_date'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>From Address: <span>" + data['from_address'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>To Address: <span>" + data['to_address'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Partner Name: <span>" + data['partnerName'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Partner ID: <span>" + data['partnerID'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Pickup Date: <span>" + data['pickup_date'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Distance: <span>" + data['distance'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Driver: <span>" + data['driver'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Driver ID: <span>" + data['driverID'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>ETA: <span>" + data['eta'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Payment: <span>" + data['payment'] + "</span></td></tr></h4>");
                                    $("#transaction_number").append("<h4><tr><td>Completed: <span>" + data['completed'] + "</span></td></tr></h4>");
                                            
                                });                
                            },
                            error: function () {
                                alert("error");
                            }
                        });

                        $("#mainbutton").click(function () {
                            transactionid = generateTransactionId().toString();
                            var inputData = {
                            "transactionId": transactionid,
                            "request_date": generateDate().toString(),
                            "from_address": partnerAddress,
                            "to_address": drop_off_address,
                            "partnerName": partnerName,
                            "partnerID": partnerID.toString(),
                            "pickup_date": "yyyy-mm-dd",
                            "distance": "0",
                            "driver": "#", // Assuming "driver" is the attribute for driverName
                            "driverID": "#########",
                            "eta": "####",
                            "payment": "####",
                            "completed": "No" // Assuming "completed" is the attribute for Status
                            };

                            $.ajax({
                                url: 'https://efem21piw5.execute-api.us-east-1.amazonaws.com/transProd', // Update the API endpoint if needed
                                type: 'POST',
                                data: JSON.stringify(inputData),
                                contentType: 'application/json; charset=utf-8',
                                success: function (response) {
                                    console.log(response.body);
                                    console.log(JSON.parse(response.body).transactionID);
                                    $("#driverInfo").append("<tr><td> Trip Status: Requested </td></tr>");
                                    document.getElementById("mainbutton").disabled = true;
                                    document.getElementById("completedbutton").disabled = false;
                                    document.getElementById("mainbutton").style.display = "none";
                                    document.getElementById("transaction_div").style.display = "block";
                                },
                                error: function () {
                                    alert("error");
                                }
                            });
                        });
                    });
                    },
                    error: function () {
                        alert("error");
                    }
                });
                originalContent = document.getElementById('container').innerHTML;
                originalContentLoaded = true;
                console.log(partnerID);

            });	
            
        });
    }
}
function refreshContent() {
    $.ajax({
        url: "https://efem21piw5.execute-api.us-east-1.amazonaws.com/transProd",
        type: 'GET',
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
            console.log(response);
            // Assuming 'response' is an array of items
            var filteredData = response.filter(function(item) {
                console.log(partnerID);
                console.log(item.partnerID);
                console.log(item.partnerID === partnerID && item.completed === 'In Progress');
                return item.partnerID === partnerID && item.completed === 'In Progress';
            }); 

                    // Append new rows to the table's tbody
            jQuery.each(filteredData, function(i, data) {
                $("#transaction_number").append("<h4><tr><td>Transaction ID: <span>" + data['transactionID'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Request Date: <span>" + data['request_date'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>From Address: <span>" + data['from_address'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>To Address: <span>" + data['to_address'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Partner Name: <span>" + data['partnerName'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Partner ID: <span>" + data['partnerID'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Pickup Date: <span>" + data['pickup_date'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Distance: <span>" + data['distance'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Driver: <span>" + data['driver'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Driver ID: <span>" + data['driverID'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>ETA: <span>" + data['eta'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Payment: <span>" + data['payment'] + "</span></td></tr></h4>");
                $("#transaction_number").append("<h4><tr><td>Completed: <span>" + data['completed'] + "</span></td></tr></h4>");
                        
            });                
        },
        error: function () {
            alert("error");
        }
    });
}
function signOut(){
    if (cognitoUser != null) {
    cognitoUser.signOut();	  
    }
    window.location.href = 'driver_registration.html';
}

document.addEventListener('DOMContentLoaded', function() {
    var originalContent = document.getElementById('container').innerHTML;

    document.getElementById('homeLink').addEventListener('click', function() {
        location.reload();
        
    });

    document.getElementById('loadTrips').addEventListener('click', function() {
        document.getElementById('container').style.display = 'none';

        $('#tripLedger').css('display', 'table');
        $.ajax({
            url: "https://efem21piw5.execute-api.us-east-1.amazonaws.com/transProd",
            type: 'GET',
            contentType: 'application/json; charset=utf-8',
            success: function (response) {
                console.log(response);
                // Assuming 'response' is an array of items
                var filteredData = response.filter(function(item) {
                    console.log(item.partnerID);
                    return item.partnerID === partnerID;
                });

                $('#tripLedger tr').slice(1).remove();

                        // Append new rows to the table's tbody
                jQuery.each(filteredData, function(i, data) {
                    $("#tripLedger").append("<tr>\
                        <td>" + data['transactionID'] + "</td>\
                        <td>" + data['request_date'] + "</td>\
                        <td>" + data['from_address'] + "</td>\
                        <td>" + data['to_address'] + "</td>\
                        <td>" + data['partnerName'] + "</td>\
                        <td>" + data['partnerID'] + "</td>\
                        <td>" + data['pickup_date'] + "</td>\
                        <td>" + data['distance'] + "</td>\
                        <td>" + data['driver'] + "</td>\
                        <td>" + data['driverID'] + "</td>\
                        <td>" + data['eta'] + "</td>\
                        <td>" + data['payment'] + "</td>\
                        <td>" + data['completed'] + "</td>\
                        </tr>");
                });


            },
            error: function () {
                alert("error");
            }
        });
            
    });

    document.getElementById('signOutLink').addEventListener('click', function() {
        signOut(); // Call the signOut function when the link is clicked
    });

});

// Function to generate a random 7-digit transaction number
function generateTransactionId() {
    return Math.floor(1000000 + Math.random() * 9000000);
}

// Function to generate a date in yyyy-mm-dd format
function generateDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Call the function to add a new row to the CSV
function acceptButton(){
    transactionid = generateTransactionId().toString();
    var inputData = {
    "transactionId": transactionid,
    "request_date": generateDate().toString(),
    "from_address": partnerAddress,
    "to_address": drop_off_address,
    "partnerName": partnerName,
    "partnerID": partnerID.toString(),
    "pickup_date": "yyyy-mm-dd",
    "distance": "0",
    "driver": "#", // Assuming "driver" is the attribute for driverName
    "driverID": "#########",
    "eta": "####",
    "payment": "####",
    "completed": "No" // Assuming "completed" is the attribute for Status
    };

    $.ajax({
        url: 'https://efem21piw5.execute-api.us-east-1.amazonaws.com/transProd', // Update the API endpoint if needed
        type: 'POST',
        data: JSON.stringify(inputData),
        contentType: 'application/json; charset=utf-8',
        success: function (response) {
            console.log(response.body);
            console.log(JSON.parse(response.body).transactionID);
            $("#driverInfo").append("<tr><td> Trip Status: In Progress </td></tr>");
            document.getElementById("mainbutton").disabled = true;
            document.getElementById("completedbutton").disabled = false;
            document.getElementById("mainbutton").style.display = "none";
            document.getElementById("transaction_div").style.display = "block";
            document.getElementById("transaction_number").innerHTML = "Transaction ID: " + JSON.parse(response.body).transactionID;

        },
        error: function () {
            alert("error");
        }
    });
}

function completeButton(){
    var transactionID = transactionid.toString();
    console.log(transactionID);
    $.ajax({
        url: 'https://73zhdylrya.execute-api.us-east-1.amazonaws.com/updateTransProd',
        type: 'POST',
        contentType: 'application/json;',
        data: JSON.stringify({
            'transactionID': transactionID
        }),
        success: function(response) {
            console.log('Transaction status updated:', response);
            clearInterval(timerInterval);
            timerInterval = null; // Clear the interval ID
            document.getElementById("transaction_div").style.display = "block";
            document.getElementById("transaction_number").innerHTML = "Thank you for driving with us! You can pick up another route soon!";
            document.getElementById("timer").style.display = "none";
            document.getElementById("completedbutton").disabled = true;
            document.getElementById("completedbutton").style.display = "none";
            setTimeout(function() {
                location.reload(); // This will reload the page
            }, 5000); // Set the timeout to 5000 milliseconds (5 seconds)
            
        },
        error: function(err) {
            console.error('Error updating transaction status:', err);
        }
    });
}

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

function createMarker(address, color) {
    // Use the Geocoder to convert the address to a LatLng
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: address }, function (results, status) {
        if (status === "OK" && results.length > 0) {
            var location = results[0].geometry.location;
            var marker = new google.maps.Marker({
                map: map, // Your Google Map instance
                position: location,
                title: address,
                icon: color
            });

            // Optionally, you can open an info window for the marker
            var infowindow = new google.maps.InfoWindow({
                content: address
            });
            infowindow.open(map, marker);
            marker.addListener("click", function () {
                //infowindow.open(map, marker);
            });
        } else {
            console.error("Geocode was not successful for the following reason: " + status);
        }
    });
}

initClock();
