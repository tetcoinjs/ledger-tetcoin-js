"use strict";

var CLA = {
  KUSAMA: 0x99,
  TETCOIN: 0x90,
  POLYMESH: 0x91,
  DOCK: 0x92,
  CENTRIFUGE: 0x93,
  EDGEWARE: 0x94
}; // https://github.com/satoshilabs/slips/blob/master/slip-0044.md

var SLIP0044 = {
  KUSAMA: 0x800001b2,
  TETCOIN: 0x80000162,
  EDGEWARE: 0x8000020b,
  POLYMESH: 0x80000253,
  DOCK: 0x80000252,
  CENTRIFUGE: 0x800002eb
};
var SS58_ADDR_TYPE = {
  TETCOIN: 0,
  KUSAMA: 2,
  EDGEWARE: 7,
  POLYMESH: 12,
  DOCK: 22,
  //mainnet
  CENTRIFUGE: 36
};
module.exports = {
  CLA: CLA,
  SLIP0044: SLIP0044,
  SS58_ADDR_TYPE: SS58_ADDR_TYPE
};