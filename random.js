/* global token */
var sLiveEditToken = '', iRandCount = 1, aSaved = [];

function createRandomItem( elemSource, sResult, iRandom, iRandCount ) {
    let sGroup = elemSource.getAttribute( 'data-group' );
    let elemGroup = document.querySelector( ".group-heading." + sGroup + " > .detail-group" );
    let elemClone = elemRollTmpl.cloneNode( true );

    elemClone.setAttribute( 'data-reroll', iRandCount );
    elemClone.setAttribute( 'rand-source', elemSource.getAttribute( 'id' ) );
    elemGroup.appendChild( elemClone );
    elemClone = elemLabelTmpl.cloneNode( true );
    elemClone.textContent = elemSource.getAttribute( 'data-label' ) + ":";
    elemGroup.appendChild( elemClone );
    elemClone = elemItemTmpl.cloneNode( true );
    elemClone.setAttribute( 'data-group', sGroup );
    elemClone.setAttribute( 'id', "random_data_" + iRandCount );
    elemClone.setAttribute( 'rand-source', elemSource.getAttribute( 'id' ) );
    elemClone.setAttribute( 'rand-count', iRandCount );
    elemClone.setAttribute( 'result', iRandom );
    elemClone.innerHTML = sResult;
    elemGroup.appendChild( elemClone );
}

function createRandomSubItems( i, iOrigResult, iRandCount ) {
    let iSubResult = ( parseInt( iOrigResult ) + 1 ), j = 1, aSubData = [], elemSubSource = null, iRandom = 0, iOrigCount = ( parseInt( iRandCount ) - 1 );

    while( !!( document.querySelector( "#random_" + i + "_sub" + iSubResult + "_" + j ) ) ) {
        elemSubSource = document.querySelector( "#random_" + i + "_sub" + iSubResult + "_" + j );
        aSubData = document.querySelector( "#random_" + i + "_sub" + iSubResult + "_" + j + " > .random-data" ).value.trim().split( "<br />" );

        // Use existing saved data if available.
        if( aSaved.length > 0 ) {
            iRandom = aSaved[ ( iRandCount - 1 ) ];
        }
        else {
            iRandom = Math.floor( Math.random() * aSubData.length );
        }

        createRandomItem( elemSubSource, aSubData[ iRandom ].trim(), iRandom, iRandCount );
        document.querySelector( "#random_data_" + iRandCount ).classList.add( 'sublist' );
        document.querySelector( "#random_data_" + iRandCount ).setAttribute( 'parent', iOrigCount );
        iRandCount++;

        j++;
    }

    return iRandCount;
}

/* Create groups */
let aGroup = document.querySelector( ".swn-data #groups" ).value.split("|"), sGroupClass = '';
let elemTemplate = document.querySelector( ".swn-template > .group-heading" ), elemClone = null;
for( let i = 0; i < aGroup.length; i++ ) {
    document.querySelector( ".swn-template > .group-heading > .header > h3" ).innerHTML = aGroup[ i ];
    elemClone = elemTemplate.cloneNode( true );
    sGroupClass = aGroup[ i ].toLowerCase().replaceAll( ' ','-' );
    elemClone.classList.add( sGroupClass );
    document.querySelector( ".swn" ).appendChild( elemClone );
}

let iMax       = document.querySelector( ".swn-data #max" ).value,
    aData      = [],
    sGroup     = '',
    iRandom    = 0,
    elemGroup  = null,
    elemLabelTmpl = document.querySelector( ".swn-template > .random-item > .swn-label" ),
    elemItemTmpl  = document.querySelector( ".swn-template > .random-item > .swn-details" ),
    elemRollTmpl  = document.querySelector( ".swn-template > .random-item > .reroll" ),
    elemSource  = null;

// Use existing saved data if available and update button
if( document.querySelector( ".live-edit" ).innerHTML != "" ) {
    aSaved = document.querySelector( ".live-edit" ).innerHTML.split( "|" );
    document.querySelector( "#swn-lock" ).classList.add( "dn" );
    document.querySelector( "#swn-unlock" ).classList.remove( "dn" );
}
else {
    document.querySelector( "#swn-lock" ).classList.remove( "dn" );
    document.querySelector( "#swn-unlock" ).classList.add( "dn" );
}

// Loop through our data and start building
for( let i = 1; i <= iMax; i++ ) {
    // Get list of items to randomly select from
    elemSource = document.querySelector( "#random_" + i );
    aData = document.querySelector( "#random_" + i + " > .random-data" ).value.trim().split( "<br />" );

    // Use existing saved data if available.
    if( aSaved.length > 0 ) {
        iRandom = aSaved[ ( iRandCount - 1 ) ];
    }
    else {
        iRandom = Math.floor( Math.random() * aData.length );
    }

    // Create new element
    createRandomItem( elemSource, aData[ iRandom ].trim(), iRandom, iRandCount++ );

    // Check for sub lists to roll on. A new randcount is returned
    if( !!( document.querySelector( "#random_" + i + "_sub1_1" ) ) ) {
        iRandCount = createRandomSubItems( i, iRandom, iRandCount );
    }

    // Check for repeats to roll on
    if( elemSource.getAttribute( 'data-repeat' ) )
    {
        let iRepeatParent = iRandCount;
        for( let k = 1; k <= elemSource.getAttribute( 'data-repeat' ); k++ ) {
            // Use existing saved data if available.
            if( aSaved.length > 0 ) {
                iRandom = aSaved[ ( iRandCount - 1 ) ];
            }
            else {
                iRandom = Math.floor( Math.random() * aData.length );
            }

            createRandomItem( elemSource, aData[ iRandom ].trim(), iRandom, iRandCount );
            document.querySelector( "#random_data_" + iRandCount ).classList.add( 'repeat' );
            document.querySelector( "#random_data_" + iRandCount ).setAttribute( 'parent', iRepeatParent );
            iRandCount++;

            // Check for sub lists to roll on. A new randcount is returned
            if( !!( document.querySelector( "#random_" + i + "_sub1_1" ) ) ) {
                iRandCount = createRandomSubItems( i, iRandom, iRandCount );
            }
        }
    }
}

function reroll( elemSelf ) {
    let aData = document.querySelector( "#" + elemSelf.getAttribute( "rand-source" ) + " > .random-data" ).value.trim().split( "<br />" );
    let elemUpdate = elemSelf.parentNode.querySelector( '#random_data_' + elemSelf.getAttribute( "data-reroll" ) );
    let iRandom = Math.floor( Math.random() * aData.length );

    // prevent the same result, if possible
    if( aData.length > 1 )
    {
        while( iRandom == elemUpdate.getAttribute( "result" ) )
        {
            iRandom = Math.floor( Math.random() * aData.length );
        }
    }

    // Check for sublists
    if( !!( document.querySelector( ".sublist[parent='" + elemSelf.getAttribute( "data-reroll" ) + "']" ) ) ) {
        document.querySelectorAll( ".sublist[parent='" + elemSelf.getAttribute( "data-reroll" ) + "']" ).forEach( ( elemSub ) => {
            reroll( elemSub.previousSibling.previousSibling );
        } );
    }

    elemUpdate.setAttribute( "result", iRandom );
    elemUpdate.innerHTML = aData[ iRandom ];

    // If we've saved this previously, resave to keep the changes.
    if( document.querySelector( ".swn-data > span.live-edit" ).innerHTML != '' ) {
        saveRandom();
    }
}

// Save/lock the data so we don't lose it when loading the page again
function saveRandom() {
    // Combine all random results into one string
	let aRandom = [], i = 1;
    while( !!( document.querySelector( ".swn-details[rand-count='" + i + "']" ) ) )
    {
    	aRandom.push( document.querySelector( ".swn-details[rand-count='" + i++ + "']" ).getAttribute( "result" ) );
    }

    // Call the function to save the data
    saveLiveEdit( document.querySelector( ".swn-data > span.live-edit" ), aRandom.join( '|' ) );

    // Update button
    document.querySelector( "#swn-unlock" ).classList.remove( "dn" );
    document.querySelector( "#swn-lock" ).classList.add( "dn" );
    document.querySelector( "#warning-msg").textContent = "The planet is currently locked. To reroll, use the unlock button below.";
}

// Given a valid "live-edit" element and a value, make asynchronous calls to save
async function saveLiveEdit( oLiveElem, vValue ) {
    // Update button to show we're saving
    document.querySelector( ".btn-lock" ).setAttribute( "disabled", "disabled" );
    document.querySelector( ".btn-lock .fa-hourglass-start" ).classList.remove( "dn" );

    let iAttrId = oLiveElem.getAttribute( "data-id" ),
        iUId    = oLiveElem.getAttribute( "data-uid" );

    // If we don't have a token, get one
    if( sLiveEditToken == '' )
    {
        // Connect to get the token
        sLiveEditToken = document.querySelector('meta[name="csrf-token"]').content;
        // await setToken( oLiveElem );
    }   

    // api call to save
    let sUrl = document.querySelector( "input[name='live-attribute-config']" ).getAttribute( "data-live" ) + '/' + iAttrId + '/save';
    xhr = new XMLHttpRequest();
    xhr.onload = function() {
        // @todo: confirm status is good
        // console.log( this.status );
        if( this.status !== 200 ) {
            window.showToast( "Error trying to save." );
        }
		// let sResponse = this.responseText;
	}
	xhr.open( "POST", sUrl );
    xhr.setRequestHeader( 'Content-type', 'application/x-www-form-urlencoded; charset=UTF-8' );
	xhr.send( "value=" + vValue + "&uid=" + iUId + "&_token=" + sLiveEditToken );
    oLiveElem.innerHTML = vValue;

    // Restore button
    document.querySelector( ".btn-lock" ).removeAttribute( "disabled" );
    document.querySelector( ".btn-lock .fa-hourglass-start" ).classList.add( "dn" );
}

function clearRandom() {
    saveLiveEdit( document.querySelector( ".swn-data > span.live-edit" ), "" );
    document.querySelector( "#swn-unlock" ).classList.add( "dn" );
    document.querySelector( "#swn-lock" ).classList.remove( "dn" );
    document.querySelector( "#warning-msg").textContent = "Don't forget to save using the button below to lock in the planet."
}

async function setToken( oLiveElem ) {
    let iAttrId = oLiveElem.getAttribute( "data-id" ),
        iUId    = oLiveElem.getAttribute( "data-uid" ),
        sUrl    = document.querySelector( "input[name='live-attribute-config']" ).getAttribute( "data-live" ) + "?id=" + iAttrId + "&uid=" + iUId;
    let response = await fetch( sUrl, {
        method: "GET",
        cache: "no-cache",
        credentials: "same-origin",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    let sResponse = await response.text(),
        oRegex    = /input name="_token" type="hidden" value="(.*)"/gm
        , aToken  = oRegex.exec( sResponse );

    sLiveEditToken = aToken[ 1 ];
}
