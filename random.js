function roll(id) {
    console.log( "Here with " + id );
    let xhr = new XMLHttpRequest();
    xhr.onload = function() {
        console.log( 'status', xhr.status);
        if (xhr.status >= 200 && xhr.status < 400) {
            console.log(xhr);            
        }
        
            // var jsonResponse = JSON.parse(xhr.responseText);    
    }    
    xhr.open( 'POST', "https://chartopia.d12dev.com/api/charts/" + id + "/roll/" );
    xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded; charset=UTF-8' );
    // xhr.send();

    console.log( 'done' );
}

async function roll2(id) {
  console.log( "2 Here with " + id );
  let response = await fetch( "https://chartopia.d12dev.com/api/charts/" + id + "/roll/", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({mult: 1})
  });
  console.log( response );
  if(response.status == 403) {
    console.log("Chart is inaccessible");
  }
  else if (response.status == 404) {
    console.log("Chart does not exist");
  } else if (response.status == 429) {
    result = "Too many rolls in a short space of time."
  } else if (response.status == 201) {                    
    var aResult = await response.json();
    aResult = aResult.results[ 0 ];   
    console.log( aResult );          
    var converter = new showdown.Converter(),
        text      = aResult;    
    document.getElementById( 'chartopia-content' ).innerHTML = converter.makeHtml(text);
    console.log( aResult );
  } 
  else {
    console.log( "Unexpected status code: " + response.status );
  }
} 

roll2(26936);
