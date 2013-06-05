//////////////////////////////////////////
//UpperArmRotary
///////////////////////////////////////////

///////////////////////////////////////////
//reading from the sensor at the 90deg point in 1/10 of a degree 1805 = 180.5
int ninetyPoint = 2068;
///////////////////////////////////////////

#include "Metro.h"
#include "MLX90316.h"

Metro mlxMetro = Metro(25);
MLX90316 UA_Sensor  = MLX90316();



int UA_SS = 5;
int UA_SCK = 3;
int UA_MOSI = 4;

int tipSensorPin = A0;
int UA_zeroPoint;//figure out the 0 point based on the 90deg point


void setup(){
  UA_zeroPoint = ninetyPoint - 900;
  if(UA_zeroPoint < 0) UA_zeroPoint += 3600;


  Serial1.begin(38400);
  UA_Sensor.attach(UA_SS,UA_SCK, UA_MOSI );
}

void loop() {
  if(UA_Sensor.readAngle() == -1){ //sensor board not found, send error E0000E
    outputBytes("E", 0);}
  else if(UA_Sensor.readAngle() == -3){  // magnet not found, send error E1111E
    outputBytes("E", 1);}
  else{
    outputBytes("B", upperArmDegrees());}
    
  outputBytes("C", tipValue());
  delay(20);
}

int tipValue(){
  unsigned int tipRaw = analogRead(tipSensorPin);
  
  return tipRaw;
}

int upperArmDegrees(){
  //Caculate the degrees of the upper arm sensor
  //Because 0 isnt read as 0, this fixes that offset
  int value = UA_Sensor.readAngle();

  value -= UA_zeroPoint;
  if(value < 0) value += 3600;

  return value;
}

void outputBytes(char* header, int value){
  //translate the value into a header + 2 data bytes
  //Works for numbers upto 16,000
  //this way we know that the value is always exactly 3 bytes
  //makes it much easier to receive on the other end
  int MSB;
  int LSB;


  if(value < 0){
    MSB = 255; //highest value
    LSB = 255; //highest value
  }
  else{
    MSB = value >> 8; //get just the first byte
    LSB = value & 0b0000000011111111; //get just the second byte
  }

  Serial.print(header);
//  Serial.println(value);

  Serial.write(MSB);
  Serial.write(LSB);
  Serial.write(LSB);
  Serial.write(MSB);

  Serial.print(header);
}




