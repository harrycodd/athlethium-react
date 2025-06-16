// Training-specific utility functions

export const getFitnessLevelText = (ctl: number): string => {
  if (ctl >= 120) return "World Tour";
  if (ctl >= 100) return "Elite";
  if (ctl >= 80) return "Advanced";
  if (ctl >= 60) return "Intermediate";
  if (ctl >= 40) return "Moderate";
  if (ctl >= 20) return "Building";
  return "Beginner";
};

export const getFatigueLevelText = (form: number): string => {
  if (form >= 25) return "Very Fresh";
  if (form >= 15) return "Fresh";
  if (form >= 5) return "Good";
  if (form >= -5) return "Balanced";
  if (form >= -15) return "Tired";
  if (form >= -25) return "Very Tired";
  return "Extremely Fatigued";
};

export const getLevelToCTL = (): Record<string, number> => ({
  'Beginner': 20,
  'Intermediate': 40,
  'Advanced': 60,
  'Elite': 100,
  'World Tour': 120,
});

// Effort types and their TSS factors
export const getEffortTypes = () => [
  { label: 'Recovery', value: 'recovery', factor: 25 },
  { label: 'Steady', value: 'steady', factor: 45 },
  { label: 'Threshold', value: 'threshold', factor: 60 },
  { label: 'VO2max/Hard', value: 'vo2max', factor: 80 },
];

export const formatTimeFromSeconds = (timeInSeconds: number): string => {
  if (typeof timeInSeconds === 'number') {
    return new Date(timeInSeconds * 1000).toISOString().substr(11, 8);
  }
  return '00:00:00';
};

export const normalizeTrainingSession = (session: any): any => ({
  event_type: session.event_type || '',
  name: session.name || '',
  sport: session.sport || '',
  time: (typeof session.time === 'number')
    ? formatTimeFromSeconds(session.time)
    : (typeof session.time === 'string' && /^\d{2}:\d{2}:\d{2}$/.test(session.time))
      ? session.time
      : '00:00:00',
  description: session.description || session.title || session.notes || '',
  completed: session.completed || false,
  duration: session.duration || '',
  session_focus: session.session_focus || '',
  id: session.id || session.workoutId || '',
  workoutId: session.workoutId || session.id || '',
  timeStamp: session.timeStamp || session.timestamp || undefined,
});
