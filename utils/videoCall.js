import moment from "moment";
export function getInitials(fullName) {
    // Split the full name into separate words
    const nameParts = fullName?.split(" ") ?? "ALAM";

    // Check if there are at least two words (first and last name)
    if (nameParts.length < 2) {
        return "Invalid name format";
    }

    // Get the first letter of the first name and the last letter of the last name
    const firstNameInitial = nameParts[0][0].toUpperCase();
    const lastNameInitial =
        nameParts[nameParts.length - 1][
            nameParts[nameParts.length - 1].length - 1
        ].toUpperCase();

    // Combine and return the initials
    return firstNameInitial + lastNameInitial;
}

export function demoSessionEndTime(){
       //NOTE -  Get the current time
       const currentTime = moment();
       //NOTE - Add 2 hours to the current time
       const newTime = currentTime.add(2, 'hours');
       // Extract hour and minutes from the new time
       const hour = newTime.hour();
       const minutes = newTime.minute();
       return `${hour}:${minutes}`
}

export function currentTimeZone () {
    const date = new Date();
const offsetInMinutes = -date.getTimezoneOffset();
const hours = Math.floor(Math.abs(offsetInMinutes) / 60);
const minutes = Math.abs(offsetInMinutes) % 60;

// Format the offset as GMT+hh:mm or GMT-hh:mm
const formattedOffset = `GMT${offsetInMinutes >= 0 ? '+' : '-'}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
return formattedOffset;
}