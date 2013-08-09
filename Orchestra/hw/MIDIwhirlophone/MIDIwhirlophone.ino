#include <MIDI.h>
#include <Servo.h> 
Servo s1, s2, s3, s4;  // create servo objects to control a servo 

// each Servo will need to be calibrated to travel the correct distance
int s1_off = 40;
int s2_off = 40;
int s3_off = 40;
int s4_off = 40;

int s1_on = 60;
int s2_on = 60;
int s3_on = 60;
int s4_on = 60;

int s1t = 0;
int s2t = 0;
int s3t = 0;
int s4t = 0;

int noteLen = 200; // longest possible note duration. staccato notes will override this

void setup() {
  MIDI.begin();
  MIDI.setHandleNoteOn(handleNoteOn);
  
  s1.attach(3);
  s2.attach(5);
  s3.attach(6);
  s4.attach(9);
  
  // put servos in off position
  s1.write(s1_off);
  s2.write(s2_off);
  s3.write(s3_off);
  s4.write(s4_off);
}

void loop() {
  MIDI.read();
  
  int m = millis(); // gets the current time
  
  if (m - s1t > noteLen){
    s1.write(s1_off);
  }
  if (m - s2t > noteLen){
    s2.write(s2_off);
  } 
  if (m - s3t > noteLen){
    s3.write(s3_off);
  } 
  if (m - s4t > noteLen){
    s4.write(s4_off);
  }  

}

void handleNoteOn (byte channel, byte note, byte velocity) {
  if (velocity != 0){ // only uses noteOn, noteOff sends a velocity of 0
    switch(note) {
      case 60:
        s1.write(s1_on);
        s1t = millis();
        break;
      case 61:
         s2.write(s2_on);
         s2t = millis();
        break;
      case 62:
         s3.write(s3_on);
         s3t = millis();
        break;
      case 63:
         s4.write(s4_on);
         s4t = millis();
        break;
    }
  }
}
