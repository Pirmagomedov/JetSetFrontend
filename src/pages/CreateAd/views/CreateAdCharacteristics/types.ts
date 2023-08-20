export interface IValues {
  // Aircraft Summary

  serialNumber: string
  registrationNumber: string
  flightRules: string
  flightDeck: string
  airframeTtsn: number
  landings: string
  configuration: string
  landingGear: string
  totalSeats: string
  crewSeats: string
  passengerSeats: string
  totalTime: string

  // Engine

  engineMake: string
  engineModel: string
  engineTbo: string
  engineN1Ttsn: string
  engineN1Tsox: string
  engineN1ShsiTop: string
  engineN1Ttox: string
  engineN1Csn: string
  engineN1Csoh: string
  engineN2Ttsn: string
  engineN2Tsox: string
  engineN2ShsiTop: string
  engineN2Ttox: string
  engineN2Csn: string
  engineN2Csoh: string
  engineN3Ttsn: string
  engineN3Tsox: string
  engineN3ShsiTop: string
  engineN3Ttox: string
  engineN3Csn: string
  engineN3Csoh: string
  engineN4Ttsn: string
  engineN4Tsox: string
  engineN4ShsiTop: string
  engineN4Ttox: string
  engineN4Csn: string
  engineN4Csoh: string
  engineN1Sn: string
  engineN2Sn: string
  engineN3Sn: string
  engineN4Sn: string
  engineHpThrust: string

  // APU

  apuMake: string
  apuModel: string
  apuTbo: string
  apuTtsn: string
  apuTsoh: string
  apuCsn: string
  apuCsoh: string
  apuSn: string

  // Propeller

  propMake: string
  propType: string
  propModel: string
  propSize: string
  propTboHrs: string
  propTboYrs: string
  prop1Sn: string
  prop1Ttsn: string
  prop1Tsoh: string
  prop1Ttoh: string
  prop1OhYr: string
  prop1OhDue: string
  prop2Sn: string
  prop2Ttsn: string
  prop2Tsoh: string
  prop2Ttoh: string
  prop2OhYr: string
  prop2OhDue: string

  // Avionics

  fmsN: string
  fms: string
  engMonitor: string
  gpsN: string
  gpsModel1: string
  gpsModel2: string
  autopilot: string
  autopilotN: string
  wxRadar: string
  transponderN: string
  transponder1: string
  transponder2: string
  vhfComN: string
  vhfComModel1: string
  vhfComModel2: string
  vhfNavN: string
  vhfNavModel1: string
  vhfNavModel2: string

  // Maintenance

  mtxTracking: string
  airframeProgram: string
  engineProgram: string
  apuProgram: string
  avionicsProgram: string
  mtxCondition: string
  annualDue: string
  cCheckDue: string
  lGearOhDue: string
  inspectionStatus: string
  warrantyAfYr: string
  warrantyEngYr: string
  warrantyAviYr: string
  warrantyApuYr: string
  warrantyPropYr: string
  lastPerformed: string
  nextDue: string
  warrantyAfHrs: string
  warrantyEngHrs: string
  warrantyPropHrs: string

  // Exterior/Cabin

  exteriorColor: string
  exteriorDetail: string
  exteriorYear: string
  interiorColor: string
  interiorFinish: string
  interiorYear: string
  galleyLocation: string
  lavLocation: string
  lavDescription: string
  crewRest: boolean
  jumpSeat: boolean
  wifiConnectivity: string

  // Weights/other

  maxRamp: string
  mtow: string
  mlv: string
  mzvf: string
  bew: string
  bow: string
  fuelCapacity: string
  payload: string
  usefulLoad: string
  floatModel: string
  bewFloats: string
  usefulLoadFloats: string
  oxygenTank: string
  fuelCapacityGal: string
}
