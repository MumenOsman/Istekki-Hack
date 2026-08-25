/**
 * 791 Mother App State Management
 */
export const state = {
  // Screen 0: Nurse & Health Clinic (Left)
  // Screen 1: SOS Main Emergency (Right) - Default active
  activeScreenIndex: 1,
  emergencyActive: false,
  callStatus: 'idle',
  motherInfo: {
    name: 'Sofia Korhonen',
    hetu: '140592-124X',
    gestationalWeek: '38+4',
    bloodType: 'O+',
    allergies: 'Penicillin',
    emergencyContact: 'Matti Korhonen (+358 40 123 4567)',
    assignedMidwife: 'Laura Hakala',
    assignedClinic: 'Niiralan neuvola',
    hospitalDestination: 'Kuopion yliopistollinen sairaala (KYS)',
    currentLocation: 'Juontotie 8, 70150 Kuopio'
  }
};
