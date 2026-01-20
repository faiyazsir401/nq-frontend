import { useEffect, useState } from "react";

const Timer = (session_end_time, bothUsersJoined = false) => {
  const [timeDifference, setTimeDifference] = useState("");

  useEffect(() => {
    // Only start timer when both users have joined
    if (!bothUsersJoined) {
      setTimeDifference("Waiting for both users...");
      return;
    }

    const now = new Date();
    // Check if session_end_time is a string and includes the colon ":"
    
    if (typeof session_end_time === 'string' && session_end_time.includes(":")) {
      const [endHours, endMinutes] = session_end_time.split(":").map(Number);
      const endTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        endHours,
        endMinutes
      );
      
      const pad = (num) => (num < 10 ? `0${num}` : num);

      const updateTimerDifference = () => {
        const now = new Date();
        
        
        const isBeforeEndTime = now < endTime;
        const timeDiff = Math.abs(endTime - now);
        
        
        const hours = Math.floor(timeDiff / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

        const paddedHours = pad(hours);
        const paddedMinutes = pad(minutes);
        const paddedSeconds = pad(seconds);

        

        let formattedTimeDifference = `${isBeforeEndTime ? "" : "-"}${paddedHours}:${paddedMinutes}:${paddedSeconds}`;
        if (hours === 0) {
          formattedTimeDifference = `${isBeforeEndTime ? "" : "-"}${paddedMinutes}:${paddedSeconds}`;
        }

      

        setTimeDifference(formattedTimeDifference);
        // setIsOverTime(!isBeforeEndTime); // Uncomment if you need to set an over-time flag
      };

      //NOTE -  Initial call to update immediately
      updateTimerDifference();

      //NOTE - Update timer difference every second
      const intervalId = setInterval(updateTimerDifference, 1000);


      //NOTE -  Clean up interval on component unmount
      return () => clearInterval(intervalId);
    } else {
      console.error("Invalid session_end_time:", session_end_time);
      // Handle the case where session_end_time is invalid
      setTimeDifference("Invalid time");
    }



  }, [session_end_time, bothUsersJoined]);

  return timeDifference;
};

export default Timer;
