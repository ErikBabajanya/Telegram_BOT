const ARMENIA_TIME = (dateString) => {
  const date = new Date(dateString);

  // Array of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get the month and day
  const month = months[date.getMonth()];
  const day = date.getDate();

  // Get the time
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // Format the date and time
  const formattedDateTime = `${month} ${day} ${formattedHours}:${formattedMinutes} ${ampm}`;

  return formattedDateTime;
};

const START_TIME = () => {
  // Set the time zone to Armenia
  const armeniaTimeZone = "Asia/Yerevan";

  // Get the current date and time in the Armenia time zone
  const currentDate = new Date().toLocaleString("en-US", {
    timeZone: armeniaTimeZone,
  });

  // Convert currentDate to a Date object
  const date = new Date(currentDate);

  // Array of month names
  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Get the month, day, hours, minutes, and AM/PM
  const month = months[date.getMonth()];
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12; // Convert to 12-hour format
  const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

  // Format the date and time
  const formattedDateTime = `${month} ${day} ${formattedHours}:${formattedMinutes} ${ampm}`;

  return formattedDateTime;
};

module.exports = { ARMENIA_TIME, START_TIME };
