//////////////////////////////////////////
//LowerArmRotary
///////////////////////////////////////////

///////////////////////////////////////////
//reading from the sensor at the 90deg point in 1/10 of a degree 1805 = 180.5
int ninetyPoint = 3554;
///////////////////////////////////////////

#include "Metro.h"
#include "MLX90316.h"

Metro mlxMetro = Metro(25);
MLX90316 LA_Sensor  = MLX90316();



int LA_SS = 5;
int LA_SCK = 3;
int LA_MOSI = 4;

int baseSensorPin = A0;
int WHITE_THRESH = 500; //lower than 150 is white, above 150 is black
int LA_zeroPoint; //figure out the 0 point based on the 90deg point


void setup(){
  LA_zeroPoint = ninetyPoint - 900;
  if(LA_zeroPoint < 0) LA_zeroPoint += 3600;


  Serial1.begin(38400);
  LA_Sensor.attach(LA_SS,LA_SCK, LA_MOSI );
}

void loop() {
  if(LA_Sensor.readAngle() == -1){ //sensor board not found, send error E0000E
    outputBytes("E", 0);
  }else if(LA_Sensor.readAngle() == -3){  // magnet not found, send error E1111E
    outputBytes("E", 1);
  }else{
    outputBytes("A", lowerArmDegrees());
  }
  outputBytes("L", baseValue());
  
  delay(20);
}

int baseValue(){
  unsigned int baseRaw = analogRead(baseSensorPin);
  
  if(baseRaw < WHITE_THRESH){
    baseRaw = 16962;
  }else{
    baseRaw = 22359;
  }
  
  return baseRaw;
}

int lowerArmDegrees(){
  //Caculate the degrees of the lower arm sensor
  //Because 0 isnt read as 0, this fixes that offset
  int value = LA_Sensor.readAngle();

  value -= LA_zeroPoint;
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




