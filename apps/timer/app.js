var counter = 20;
var buzzcounter = 0;
var counterInterval;
var buzzinterval;

var timeristicking = false; 
var completedtimer = false;

var atstart = true;

var customServiceUUID = "6E400001-B5A3-F393-E0A9-E50E24DCCA9E";

// Create a custom service
NRF.setServices({
  0x1800: {
    // Standard Generic Access service
    0x2A00: { // Device Name
      value: "MyDevice",
      readable: true,
    },
    0x2A01: { // Appearance
      value: [0x00, 0x00], // Generic category
      readable: true,
    },
  },
  customServiceUUID: {
    // Custom service with a single characteristic
    0x0001: {
      value: [0x00],
      writable: true,
      onWrite: function(evt) {
        // Handle characteristic write
        var value = evt.data[0];
        console.log("Characteristic write: " + value);
      },
    },
  },
});







function dobuzz(){
  buzzcounter++;
  
  if ( counter == 10 && counter >= 0 && buzzcounter % 2 == 1 ) {
    Bangle.buzz(280);
  }
  
  if ( counter < 5 && counter >= 0 && buzzcounter % 2 == 1 ) {
    Bangle.buzz(280);
  }
  
}


function startupscreen() { //for start and reset
  g.clear();
  g.setFontAlign(50,0); // center font
  g.setFont("Vector",31); // vector font, 80px  
  g.drawString(counter,176,162);
  Bangle.setLCDPower(1);
  Bangle.setLCDTimeout(0); //'this' might stop future screenlocks (but does not trigger it)
  console.log("startup done");
  
}

if (atstart == true){ //i.e. at the very start
  startupscreen();
}


function countDown() {
  
  counter--;
  console.log("counter",counter);
  
  // Out of time
  if (counter==0) {
    g.clear();
    g.setFontAlign(50,0); // center font
    g.setFont("Vector",31); // vector font, 80px    
    g.drawString("sent...",92,163); 
    //in the final version 'sent' will only appear after confirmation
    g.drawString(counter,176,162);

     clearInterval(counterInterval); //rids repeat calling of countDown()
     counterInterval = undefined;
     timeristicking = false;
     clearInterval(buzzinterval);
     buzzinterval = undefined;
     completedtimer = true;
     return;
   }

  
  //only runs when counter is higher than 0
  if (counter>=1) {
    g.clear();
    g.setFontAlign(50,0); // center font
    g.setFont("Vector",31); // vector font, 80px  
    g.drawString(counter,176,162);
  }
  
}

function startTimer() { 
  counter = 20;
  var buzzcounter = 0;
  countDown();
  if (!counterInterval)
    counterInterval = setInterval(countDown, 1000);
    buzzinterval = setInterval(dobuzz, 400);
  
    
  //this is repeated evry second until clearInterval(counterInterval) above
}



function buttonPressed() {
  if (timeristicking == false ) { //if timer hasn't begun
    if (completedtimer == false) {//and we aren't on a timer complete screen
      // Your actions or code here
      console.log("Timer Started!");
      // You can add any code you want to execute when the button is pressed
      startTimer();
      timeristicking = true;
    }
    else{ //if we are on the timer complete screen, just do a reset
      //in final this won;t be neccisary as the timer will just come back           after an allotted time
      completedtimer = false;
      console.log("reset timer from complete");
      counter = 20;
      //clearInterval(counterInterval); this was already triggered when...
      //counterInterval = undefined; ...the timer completed above. 
      timeristicking = false;
      startupscreen();
    }
    
  }
  else{ //if timer is currently tickign do a reset
    console.log("reset timer from ticking");
    counter = 20;
    clearInterval(counterInterval);
    counterInterval = undefined;
    timeristicking = false;
    clearInterval(buzzinterval);
    buzzinterval = undefined;
    startupscreen();
  }
  
}


Bangle.setOptions({
  lockTimeout: 99999999999, //1157 days
  backlightTimeout: 99999999999 });
    // NOTE: this stops screenlock in the future, but doens't deactivate the screen lock   function, if the screen was locked before the app started... this shouldn;t be an       issue if this app auto runs before any lock can activate.    



setWatch(buttonPressed, (process.env.HWVERSION==2) ? BTN1 : BTN2, { repeat: true, edge: 'rising', debounce: 50 });

atstart = false;


