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
var currentAddress;
var totalDistance = 0;

var elapsedTime = 0;

var API_ENDPOINT = "https://u0iqxkwhk6.execute-api.us-east-1.amazonaws.com/driver2prod";

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

$.ajax({
    url: "https://efem21piw5.execute-api.us-east-1.amazonaws.com/transProd",
    type: 'GET',
    contentType: 'application/json; charset=utf-8',
    success: function (response) {
        console.log(response);
        // Filter the response array to find items where completed is 'No'
        var filteredData = response.filter(function(item) {
            return item.completed === 'No';
        });

        // Iterate through the filtered data and add options to the select menu
        $.each(filteredData, function(index, item) {
            $('#business_address').append(new Option(item.partnerName + " (" + item.transactionID + ")", item.from_address));
            transactionid = item.transactionID;
        });

        $("#business_address").change( function () {
            // Get the selected option
            document.getElementById("mainbutton").disabled = false;
            var selectedOption = $(this).val();
            
            // Find the corresponding item in the response array
            var selectedBusiness = response.find(function (item) {
                return item.from_address === selectedOption;
            });
            
            // Check if a matching business was found
            if (selectedBusiness) {
                // Get the from_address and to_address from the selected business
                var fromAddress = selectedBusiness.from_address;
                var toAddress = selectedBusiness.to_address;
                transactionid = selectedBusiness.transactionID;

                console.log(fromAddress);
                console.log(toAddress);
                console.log(currentAddress);
                //console.log(transactionid_business);
                document.getElementById("pick_up").innerHTML = fromAddress;
                document.getElementById("drop_off").innerHTML = toAddress;


                // Create markers for from_address and to_address on the map
                createMarker(fromAddress, 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png');
                createMarker(toAddress, 'http://maps.google.com/mapfiles/ms/icons/green-dot.png');

                calculateDistance(currentAddress, fromAddress, function (distance) {
                    if (distance !== null) {
                        const distanceInKilometers = distance / 1000;
                        const distanceInMiles = distance / 1609.34; // 1 mile is approximately 1609.34 meters
                        console.log('Distance between current Address and Business:', distance);
                        console.log('Distance between current Address and Business:', distanceInKilometers);
                        console.log('Distance between current Address and Business:', distanceInMiles);
                        // Now, you can do something with the distance, such as adding it to a running total
                        document.getElementById("curr_bus_dist").innerHTML = "(" + distanceInMiles.toFixed(2) + ") miles";
    
                    }
                    
                });

                // Calculate the distance between fromAddress and toAddress
                calculateDistance(fromAddress, toAddress, function (distance) {
                    if (distance !== null) {
                        const distanceInKilometers = distance / 1000;
                        const distanceInMiles = distance / 1609.34; // 1 mile is approximately 1609.34 meters
                        console.log('Distance between Business and Customer:', distance);
                        console.log('Distance between Business and Customer:', distanceInKilometers);
                        console.log('Distance between Business and Customer:', distanceInMiles);
                        // Now, you can do something with the distance, such as adding it to a running total
                        document.getElementById("bus_cus_dist").innerHTML = "(" + distanceInMiles.toFixed(2) + ") miles";
                    }
                    
                });

                calculateAndAddDistance(currentAddress, fromAddress);
                calculateAndAddDistance(fromAddress, toAddress);
            }

            // Attach a click event handler to an element with the ID "acceptButton" (replace with your actual button ID)
                $("#mainbutton").click(function () {
                    var inputData = {
                        "transactionId": transactionid,
                        "pickup_date": generateDate().toString(),
                        "driver": userName, // Assuming "driver" is the attribute for driverName
                        "driverID": driverID.toString(),
                        "distance": (totalDistance / 1609.34).toFixed(2).toString(),
                        "eta": time.toFixed(2).toString(),
                        "payment": payment_formula.toFixed(2).toString(),
                        "completed": "In Progress" // Assuming "completed" is the attribute for Status
                    };
                    console.log(transactionid, userName, driverID, totalDistance, time, payment_formula);
                    
                    $.ajax({
                        url: 'https://yh1g6m1ko2.execute-api.us-east-1.amazonaws.com/updateProgessProd/', // Update the API endpoint if needed
                        type: 'POST',
                        data: JSON.stringify(inputData),
                        contentType: 'application/json; charset=utf-8',
                        success: function (response) {
                            console.log(response.body);
                            console.log(JSON.parse(response.body).transactionID);
                            $("#driverInfo").append("<tr><td> Trip Status: In Progress </td></tr>");
                            $("#mainbutton").prop("disabled", true);
                            $("#completedbutton").prop("disabled", false);

                            $("#mainbutton").css("display", "none");
                            $("#completedbutton").css("display", "block");
                            $("#transaction_div").css("display", "block");
                            $("#transaction_number").html("Transaction ID: " + transactionid);
                            $("#timer").css("display", "block");

                            if (!timerInterval) {
                                timerInterval = setInterval(function () {
                                    elapsedTime++;
                                    $("#timer").text(elapsedTime);
                                }, 1000); // Update the timer every 1 second
                            }
                        },
                        error: function () {
                            alert("error");
                        }
                    });
                });

                $("#closeButton").click(function () {
                    $.ajax({
                        url: 'https://73zhdylrya.execute-api.us-east-1.amazonaws.com/updateTransProd',
                        type: 'POST',
                        contentType: 'application/json;',
                        data: JSON.stringify({
                            'transactionID': transactionid
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
                });

                    
        });
    },
    error: function () {
        alert("error");
    }
});

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
            currentAddress = response.results[0].formatted_address;
            document.getElementById("current_address").innerHTML = currentAddress;
            var infowindow = new google.maps.InfoWindow({
                content: currentAddress
            });
            infowindow.open(map, marker);
            })

        // Initialize the map
        map = new google.maps.Map(document.getElementById('map'), {
            zoom: 10,
            center: { lat: my_latitude, lng: my_longitude } // Default center, will be updated
        });

        // Initialize the marker
        marker = new google.maps.Marker({
            map: map,
            title: 'My location',
            position: { lat: my_latitude, lng: my_longitude }, // Default position, will be updated
            icon: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png'
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
    })
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
            });
        } else {
            console.error("Geocode was not successful for the following reason: " + status);
        }
    });
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
                        $("#driverInfo").append("<tr><td> Account Number: <span>" + data['driverID'] + "</span></td></tr>");
                        $("#driverInfo").append("<tr><td> Name: <span>" + data['driverName'] + "</span></td></tr>");
                        $("#driverInfo").append("<tr><td> License Number: <span>" + data['driverLicense'] + "</span></td></tr>");
                        $("#driverInfo").append("<tr><td> Address: <span>" + data['address'] + "</span></td></tr>");
                        $("#driverInfo").append("<tr><td> Phone Number: <span>" + data['phoneNumber'] + "</span></td></tr>");
                        $("#driverInfo").append("<tr><td> Email: <span>" + data['email'] + "</span></td></tr>");
                        $("#driverInfo").append("<tr><td> Driver Status: <span> Valid </span></td></tr>");
                        driverID = data['driverID'];
                        driverName = data['driverName'];
                        driverLicense = data['driverLicense'];
                        address = data['address'];
                        phoneNumber = data['phoneNumber'];
                        email = data['email'];
                        imageURL = data['imageURL'];
                        console.log(driverID);
                        console.log(driverName);
                        console.log(driverLicense);
                        console.log(address);
                        console.log(phoneNumber);
                        console.log(email);
                        console.log(imageURL);   
                        $("#license").append("<img src='" + data['imageURL'] + "' alt='Profile Image' style='width: 95%; height: auto;'>");                  
                        document.getElementById("welcome_back").innerHTML = "Welcome Back, " + driverName;
                    });
                    },
                    error: function () {
                        alert("error");
                    }
                });
                originalContent = document.getElementById('container').innerHTML;
                originalContentLoaded = true;
            });	
            
        });
    }
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
                    console.log(item.driverID);
                    return item.driverID === driverID;
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

// Function to generate a date in yyyy-mm-dd format
function generateDate() {
    const now = new Date();
    const year = now.getFullYear();
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}


function completeButton(){
 // Stop the timer

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

function getLatLng(address) {
        // Initialize the Geocoder
        var geocoder = new google.maps.Geocoder();

        // Perform geocoding for the provided address
        geocoder.geocode({ address: address }, function(results, status) {
            if (status === "OK" && results.length > 0) {
                // Extract the latitude and longitude from the first result
                var lat = results[0].geometry.location.lat();
                var lng = results[0].geometry.location.lng();

                // Resolve the Promise with the coordinates
                return({ lat: lat, lng: lng });
            } else {
                // Reject the Promise with an error
                reject(new Error("Geocoding failed for address: " + address));
            }
        });
}
function calculateAndAddDistance(fromAddress, toAddress) {
    calculateDistance(fromAddress, toAddress, function (distance) {
        if (distance !== null) {
            // Add the distance to the total
            totalDistance += distance;

            // Convert the total distance to kilometers and miles
            const totalDistanceInKilometers = totalDistance / 1000;
            const totalDistanceInMiles = totalDistance / 1609.34;

            console.log('Total Distance:', totalDistance);
            console.log('Total Distance in Kilometers:', totalDistanceInKilometers);
            console.log('Total Distance in Miles:', totalDistanceInMiles);

            // Now, you can use the total distance as needed
            
            time = ((totalDistanceInMiles * 0.621371) / 30) * 60;
            payment_formula = 4 + 0.25 * time + 0.75 * totalDistanceInMiles;
            document.getElementById("distance_miles").innerHTML =  totalDistanceInMiles;
            document.getElementById("eta").innerHTML = time.toFixed(2) + " minutes";
            document.getElementById("payment").innerHTML = "$" + payment_formula.toFixed(2);
            return time, totalDistanceInMiles, payment_formula;
        }
    });
}
function calculateDistance(origin, destination, callback) {
    var service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: [destination],
            travelMode: 'DRIVING',
            unitSystem: google.maps.UnitSystem.IMPERIAL, // or METRIC
        },
        function (response, status) {
            if (status === 'OK') {
                // Extract distance from the response
                var distance = response.rows[0].elements[0].distance.value; // Distance in meters
                callback(distance);
            } else {
                console.error('Error:', status);
                callback(null);
            }
        }
    );
}

initClock();