/*
  MLX90316.cpp -  Library to use with Melexis MLX90316 rotary encoder chip.
  Created by Martin Nawrath KHM 2010.
  http://interface.khm.de
  Released into the public domain.
*/

#include "Arduino.h"
#include "MLX90316.h"


// constructor
MLX90316::MLX90316(){


};
// attach
void MLX90316::attach(int pinSS, int pinSCK, int pinMOSI )
{
	_pinSS = pinSS;
	_pinSCK = pinSCK;
	_pinMOSI = pinMOSI;

	pinMode(_pinSS , OUTPUT);
	pinMode(_pinSCK , OUTPUT);
	pinMode(_pinMOSI , OUTPUT);
}

//****************************************************** 
int MLX90316::readAngle() {
  byte bb;
  int ret=-1;
  unsigned int rr;
  long int lo;

  digitalWrite(_pinSS,0);


  bb=_spiByte(0x55);  // send sync byte ( AA reversed order = 55?)
  bb=_spiByte(0xFF);  // send sync byte FF)
  
   bb=_spiByte(0xFF); // receive 1. byte of mlx msb data
   rr= (bb << 8);    
   bb=_spiByte(0xFF); // receive 2. byte of lsb mlx data
   rr=rr+bb;
   
  if ((rr & 3) == 2) {
    
    if ( rr & (1 << 4)) ret=-2;  // signal to strong
    if ( rr & (1 << 5)) ret=-3;  // signal to weak
}
    
  if ((rr & 3) == 1) { // valid angle data ?
     rr = (rr >> 2);
     lo= rr ;
     lo=lo *  3600 / 16384;	// scale output to 360 deg, untit in tens of deg.	
    ret= lo;
  }

  digitalWrite(_pinSS,1);
  return(ret);


}

//*************************************************************
// send and receive SPI byte  to/from MLX90316 Chip
uint8_t  MLX90316::_spiByte(uint8_t  tx) {
  byte rxb=0;

  for (int ix = 0; ix < 8; ix++){  // receive/transmit 8 SPI bits

    digitalWrite(_pinSCK,1);    // clocksignal positive slope
    rxb = ( rxb << 1);           // shift received byte left

    pinMode(_pinMOSI,INPUT);    // switch MOSI pin to input
    digitalWrite(_pinMOSI,1);   // turn port internal pullup resistor on

    if (digitalRead(_pinMOSI) ==1) rxb = rxb | 1; // read respose bit from sensor
    digitalWrite(_pinMOSI,0);   // turn port internal pullup resistor off
    pinMode(_pinMOSI,OUTPUT);   // switch MOSI pin to output

    // write SPI transmit bit to sensor
    if ((tx & 1) != 0) digitalWrite(_pinMOSI,1); 
    else digitalWrite(_pinMOSI,0);
    tx= ( tx >> 1);

    digitalWrite(_pinSCK,0);   // clocksignal negative slope
    digitalWrite(_pinMOSI,0);  // set MOSI databit 0
  }
  
  return(rxb);
  

}

