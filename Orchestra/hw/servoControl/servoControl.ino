//this just shows how to connect the servos and sweep their positions
//used for checking to make sure they are all working

#include <Servo.h> 
 
Servo s1, s2, s3, s4, s5, s6;  // create servo objects to control a servo 
 
int pos = 0;    // variable to store the servo position 
 
void setup() { 
  s1.attach(3);
  s2.attach(5);
  s3.attach(6);
  s4.attach(9);
  s5.attach(10);
  s6.attach(11);
} 
 
void loop() { 
  
  for(pos = 0; pos < 180; pos += 1) {                                 
    s1.write(pos);
    s2.write(pos);
    s3.write(pos);
    s4.write(pos);
    s5.write(pos);
    s6.write(pos);
    delay(15);
  } 
  
  for(pos = 180; pos>=1; pos-=1) {                                
    s1.write(pos);
    s2.write(pos);
    s3.write(pos);
    s4.write(pos);
    s5.write(pos);
    s6.write(pos); 
    delay(15);
  } 
} 
