export function getRestaurantStatus(openingHours: Array<{ 
  day: string; 
  open: string; 
  close: string; 
}>) {
  if (!openingHours?.length) {
    return { isOpen: false, status: 'Closed', todayHours: null };
  }

  const now = new Date();
  const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  const currentTime = now.getHours() * 60 + now.getMinutes();

  const todaySchedule = openingHours.find(
    (schedule) => schedule.day.toLowerCase() === currentDay
  );

  if (!todaySchedule) {
    return { isOpen: false, status: 'Closed Today', todayHours: null };
  }

  const [openHour, openMinute] = todaySchedule.open.split(':').map(Number);
  const [closeHour, closeMinute] = todaySchedule.close.split(':').map(Number);
  
  const openTime = openHour * 60 + openMinute;
  const closeTime = closeHour * 60 + closeMinute;
  const isOpen = currentTime >= openTime && currentTime < closeTime;

  // Calculate time until close or open
  let statusMessage = '';
  if (isOpen) {
    const minutesUntilClose = closeTime - currentTime;
    if (minutesUntilClose <= 60) {
      statusMessage = `Closing in ${minutesUntilClose} min`;
    } else {
      statusMessage = `Open until ${todaySchedule.close}`;
    }
  } else {
    if (currentTime < openTime) {
      const minutesUntilOpen = openTime - currentTime;
      statusMessage = `Opens at ${todaySchedule.open}`;
    } else {
      statusMessage = 'Closed for today';
    }
  }

  return {
    isOpen,
    status: statusMessage,
    todayHours: todaySchedule,
  };
}
