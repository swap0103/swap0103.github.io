 navigator.serviceWorker.register('sw.js');

        document.addEventListener('DOMContentLoaded', function() {
		 if (!Notification) {
		  alert('Desktop notifications not available in your browser. Try Chromium.');
		  return;
		 }
		
		navigator.serviceWorker.register('sw.js');

		 if (Notification.permission !== 'granted')
		  Notification.requestPermission();
		});
		
        function askForApproval() {
		Notification.requestPermission(function(result) {
		var district = document.getElementById("hidDistrctName").value;
		var img = '/Shot_0.png';
		  if (result === 'granted') {
		    navigator.serviceWorker.ready.then(function(registration) {
		      registration.showNotification('Vaccine Alert',{
			  body: 'Slot Available Now in '+district+'!',
			  vibrate: [200, 100, 200, 100, 200, 100, 200],
			  icon: img,
			  requireInteraction: true
			});
			    
		    });
		  }
		});
           
        }
        
        var DEFAULT_MSG = "No Slots Free"; 		
        setInterval(searchSlot, 60000); //Search interval in milliseconds
        populateState();
		var today = new Date();
		
		function setCurrentDate(){			
			var dd = today.getDate();					
			dd = ("0" + dd).slice(-2);
			var mm = today.getMonth()+1; 
			mm = ("0" + mm).slice(-2);
			var yyyy = today.getFullYear();
			var currDate = yyyy+'-'+mm+'-'+dd;
			document.getElementById("searchDt").value=currDate;			
		}

        function populateState(){
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        var response = this.responseText;
                        var obj = JSON.parse(response);
                        var states = obj.states;
                        var msg = "<option value=\"\" disabled selected>Select</option>";
                        states.forEach((item) => {
                            msg=msg+"<option value=\""+item.state_id+"\">"+item.state_name+"</option>"
                        });
                        document.getElementById("statedrp").innerHTML = msg;
                        setCurrentDate();
                       
                    }else if(this.readyState == 4 && this.status != 200){
					document.getElementById("errorlbl").innerHTML = "<b style=\"color: red;\">Service Not Available<b>";
				}
                };
                
                xhttp.open("GET", "https://cdn-api.co-vin.in/api/v2/admin/location/states", true);

                xhttp.send();
        }

        function populateDistrict(district){
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        var response = this.responseText;
                        var obj = JSON.parse(response);
                        var districts = obj.districts;
                        var msg = "<option value=\"\" disabled selected>Select</option>";
                        districts.forEach((item) => {
                            msg=msg+"<option value=\""+item.district_id+"\">"+item.district_name+"</option>"
                        });
                        document.getElementById("districtdrp").innerHTML = msg;
                        
                       
                    }else if(this.readyState == 4 && this.status != 200){
					document.getElementById("errorlbl").innerHTML = "<b style=\"color: red;\">Service Not Available<b>";
				}
                };
                
                xhttp.open("GET", "https://cdn-api.co-vin.in/api/v2/admin/location/districts/"+district, true);

                xhttp.send();
        }
        

        function searchSlot(){     
        	document.getElementById("errorlbl").style="display:none;"
				var district_id ="";
				var ageGrp = "";
				var dose ="";
				var searchDate = "";
				var feeTyp = "";
				var vaccine = "";
				if(document.getElementById("searchDt")){
					searchDate = document.getElementById("searchDt").value;;
				}
				if(document.getElementById("hidDistrct")){
					district_id = document.getElementById("hidDistrct").value;
					setCookie("district_id",district_id);
				}else if(getCookie("district_id")!= ""){
					district_id = getCookie("district_id");
				}
					
				if(document.querySelector('input[name="ageGrp"]:checked')){
					ageGrp = document.querySelector('input[name="ageGrp"]:checked').value;  
					setCookie("ageGrp",ageGrp);
				}else if(getCookie("ageGrp")!= ""){
					ageGrp = getCookie("ageGrp");
				}
                
				if(document.querySelector('input[name="doseGrp"]:checked')){
					dose = document.querySelector('input[name="doseGrp"]:checked').value; 
					setCookie("dose",dose);
				}else if(getCookie("dose")!= ""){
					dose = getCookie("dose");
				}
		
				if(document.getElementById("hidFeeTyp")){
					feeTyp = document.getElementById("hidFeeTyp").value;
					setCookie("feeTyp",feeTyp);
				}else if(getCookie("feeTyp")!= ""){
					feeTyp = getCookie("feeTyp");
				} 
		
				if(document.getElementById("hidVaccine")){
					vaccine = document.getElementById("hidVaccine").value;
					setCookie("vaccine",vaccine);
				}else if(getCookie("vaccine")!= ""){
					vaccine = getCookie("vaccine");
				}
				
				if(district_id === "" || ageGrp === "" || dose === "" || searchDate === ""){
					document.getElementById("errorlbl").style="display:block;"
					document.getElementById("errorlbl").innerHTML = "<b style=\"color: red;\">Please select required fields to search<b>";
					return;
				}
				var alertCount = 0;
                		var xhttp = [];
				
				
				for (var i=0; i<7; i++) {
				  (function(i){ 	
					 document.getElementById("loader").style.display = "block";
					var day = new Date(searchDate);
					var nextDay = new Date(searchDate);
					nextDay.setDate(day.getDate() + i);					
					var dd = nextDay.getDate();
					dd = ("0" + dd).slice(-2);
                    			var mm = nextDay.getMonth()+1; 
					mm = ("0" + mm).slice(-2);
                    			var yyyy = nextDay.getFullYear();

					var currDate = dd+'-'+mm+'-'+yyyy;                

					xhttp[i] = new XMLHttpRequest();
					xhttp[i].onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
							// Typical action to be performed when the document is ready:
							document.getElementById("loader").style.display = "none";
							var response = this.responseText;
							var msg = "";
							if(feeTyp == "ALL" && vaccine == "ALL"){
								var msg = parseJsonAll(response,currDate,ageGrp,dose);
							}else{
								 msg = parseJson(response,currDate,ageGrp,dose,feeTyp,vaccine);
							}
							
							if (msg != DEFAULT_MSG){
								document.getElementById("day"+i).innerHTML = msg;
								if(alertCount < 1){
									askForApproval();
									alertCount++;
								}
																
							}else{
								document.getElementById("day"+i).innerHTML = "<b>"+currDate+"</b> - "+msg;
							}
							document.getElementById("date").innerHTML = "Date:"+new Date();
						   
						}else if(this.readyState == 4 && this.status != 200){
						document.getElementById("errorlbl").innerHTML = "<b style=\"color: red;\">Service Not Available<b>";
					}
					};
					
					xhttp[i].open("GET", "https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id="+district_id+"&date="+currDate, true);

					xhttp[i].send();
				})(i);
				}
               
            } 
        
        function parseJsonAll(response,currDate,ageGrp,dose){
            var obj = JSON.parse(response);
            var centers = obj.centers;
            var count = 0;
	    var district = "";
            var msg = "<p><b>"+currDate+"</b></p>"+
            			"<table><tr><th class=\"centerCol\">Center</th><th>Avail</th><th>Fee-Type</th><th>District</th>"
            			+"<th>PinCode</th><th>Age-Limit</th><th>Vaccine</th></tr>";
            
            for(var i=0; i< centers.length; i++){
                //if(centers[i].fee_type == feeTyp){
		    district = centers[i].district_name;
                    var sessions = centers[i].sessions;
                    for( var j=0; j< sessions.length; j++){
                        if(dose === "D1"){
                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose1 > 0
                            		 ){
                            	count ++;
                                msg =msg+ "<tr><td>"+centers[i].name+"</td>"+
                                    "<td>"+sessions[j].available_capacity_dose1+"</td>"+
                                    "<td>"+centers[i].fee_type+"</td>"+
                                    "<td>"+centers[i].district_name+"</td>"+
									"<td>"+centers[i].pincode+"</td>"+
                                    "<td>"+sessions[j].min_age_limit+"</td>"+
                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
                                
                            }
                        }else{
                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose2 > 0
                            		){
                            	count ++;
                                msg =msg+ "<tr><td>"+centers[i].name+"</td>"+
                                    "<td>"+sessions[j].available_capacity_dose2+"</td>"+
                                    "<td>"+centers[i].fee_type+"</td>"+
                                    "<td>"+centers[i].district_name+"</td>"+
									"<td>"+centers[i].pincode+"</td>"+
                                    "<td>"+sessions[j].min_age_limit+"</td>"+
                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
                                
                            }
                        }
                    }
                    
                //}
            }
            
            if(count== 0){
                return DEFAULT_MSG;
            }else{
            	msg = msg+"</table>"
		document.getElementById("hidDistrctName").value=district;
                return msg;
            }
        }
  
        function parseJson(response,currDate,ageGrp,dose,feeTyp,vaccine){
            var obj = JSON.parse(response);
            var centers = obj.centers;
            var count = 0;
	    var district = "";
            var msg = "<p><b>"+currDate+"</b></p>"+
			"<table><tr><th class=\"centerCol\">Center</th><th>Avail</th><th>Fee-Type</th><th>District</th>"
			+"<th>PinCode</th><th>Age-Limit</th><th>Vaccine</th></tr>";
            if(feeTyp != "ALL" && vaccine != "ALL"){
	            for(var i=0; i< centers.length; i++){
	                if(centers[i].fee_type == feeTyp){
			   district = centers[i].district_name;
	                    var sessions = centers[i].sessions;
	                    for( var j=0; j< sessions.length; j++){
	                        if(dose === "D1"){
	                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose1 > 0
	                            		 && sessions[j].vaccine == vaccine){
	                            	count++;
	                                msg =msg+"<tr><td>"+centers[i].name+"</td>"+
	                                    "<td>"+sessions[j].available_capacity_dose1+"</td>"+
	                                    "<td>"+centers[i].fee_type+"</td>"+
	                                    "<td>"+centers[i].district_name+"</td>"+
										"<td>"+centers[i].pincode+"</td>"+
	                                    "<td>"+sessions[j].min_age_limit+"</td>"+
	                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
	                                
	                            }
	                        }else{
	                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose2 > 0
	                            		&& sessions[j].vaccine == vaccine){
	                            	count++;
	                                msg =msg+"<tr><td>"+centers[i].name+"</td>"+
	                                    "<td>"+sessions[j].available_capacity_dose2+"</td>"+
	                                    "<td>"+centers[i].fee_type+"</td>"+
	                                    "<td>"+centers[i].district_name+"</td>"+
										"<td>"+centers[i].pincode+"</td>"+
	                                    "<td>"+sessions[j].min_age_limit+"</td>"+
	                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
	                                
	                            }
	                        }
	                    }
	                    
	                }
	            }
            }else if (feeTyp === "ALL" && vaccine != "ALL"){
            	for(var i=0; i< centers.length; i++){
	                //if(centers[i].fee_type == 'Paid'){
			   district = centers[i].district_name;
	                    var sessions = centers[i].sessions;
	                    for( var j=0; j< sessions.length; j++){
	                        if(dose === "D1"){
	                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose1 > 0
	                            		&& sessions[j].vaccine == vaccine){
	                            	count++;
	                                msg =msg+"<tr><td>"+centers[i].name+"</td>"+
	                                    "<td>"+sessions[j].available_capacity_dose1+"</td>"+
	                                    "<td>"+centers[i].fee_type+"</td>"+
	                                    "<td>"+centers[i].district_name+"</td>"+
										"<td>"+centers[i].pincode+"</td>"+
	                                    "<td>"+sessions[j].min_age_limit+"</td>"+
	                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
	                                
	                            }
	                        }else{
	                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose2 > 0
	                            		&& sessions[j].vaccine == vaccine){
	                            	count++;
	                                msg =msg+"<tr><td>"+centers[i].name+"</td>"+
	                                    "<td>"+sessions[j].available_capacity_dose2+"</td>"+
	                                    "<td>"+centers[i].fee_type+"</td>"+
	                                    "<td>"+centers[i].district_name+"</td>"+
										"<td>"+centers[i].pincode+"</td>"+
	                                    "<td>"+sessions[j].min_age_limit+"</td>"+
	                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
	                                
	                            }
	                        }
	                    }
	                    
	                //}
	            }
            }else if (feeTyp != "ALL" && vaccine === "ALL"){
            	for(var i=0; i< centers.length; i++){
	                if(centers[i].fee_type == feeTyp){
		            district = centers[i].district_name;
	                    var sessions = centers[i].sessions;
	                    for( var j=0; j< sessions.length; j++){
	                        if(dose === "D1"){
	                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose1 > 0
	                            		){
	                            	count++;
	                                msg =msg+"<tr><td>"+centers[i].name+"</td>"+
	                                    "<td>"+sessions[j].available_capacity_dose1+"</td>"+
	                                    "<td>"+centers[i].fee_type+"</td>"+
	                                    "<td>"+centers[i].district_name+"</td>"+
										"<td>"+centers[i].pincode+"</td>"+
	                                    "<td>"+sessions[j].min_age_limit+"</td>"+
	                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
	                                
	                            }
	                        }else{
	                            if(sessions[j].date === currDate && sessions[j].min_age_limit == ageGrp && sessions[j].available_capacity_dose2 > 0
	                            		){
	                            	count++;
	                                msg =msg+"<tr><td>"+centers[i].name+"</td>"+
	                                    "<td>"+sessions[j].available_capacity_dose2+"</td>"+
	                                    "<td>"+centers[i].fee_type+"</td>"+
	                                    "<td>"+centers[i].district_name+"</td>"+
										"<td>"+centers[i].pincode+"</td>"+
	                                    "<td>"+sessions[j].min_age_limit+"</td>"+
	                                    "<td>"+sessions[j].vaccine+"</td>"+"</tr>";
	                                
	                            }
	                        }
	                    }
	                    
	                }
	            }
            }
            if(count== 0){
                return DEFAULT_MSG;
            }else{
            	msg = msg+"</table>"
		document.getElementById("hidDistrctName").value=district;
                return msg;
            }
        }
function changeDistrict(value){    
    document.getElementById("hidDistrct").value=value;    
}
function changeVaccine(value){    
    document.getElementById("hidVaccine").value=value;    
}
function changeFeeType(value){    
    document.getElementById("hidFeeTyp").value=value;    
}
function setCookie(cname,cvalue) {
  var d = new Date();
  d.setTime(d.getTime() + (30*24*60*60*1000));
  var expires = "expires=" + d.toGMTString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}
function getCookie(cname) {
  var name = cname + "=";
  var decodedCookie = decodeURIComponent(document.cookie);
  var ca = decodedCookie.split(';');
  for(var i = 0; i < ca.length; i++) {
    var c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}
