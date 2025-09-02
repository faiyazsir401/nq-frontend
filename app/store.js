import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector } from "react-redux";
import authReducer from "./components/auth/auth.slice";
import masterReducer from "./components/master/master.slice";
import scheduleInventoryReducer from "./components/trainer/scheduleInventory/scheduleInventory.slice";
import traineeReducer from "./components/trainee/trainee.slice";
import trainerReducer from "./components/trainer/trainer.slice";
import bookingsReducer from "./components/common/common.slice";
import commonReducer from "../app/common/common.slice";
import videouploadReducer from "./components/videoupload/videoupload.slice";
import transactionReducer from "./components/transaction/transaction.slice";
import contactusReducer from './components/contactUs/contactus.slice';
import notificationReducer from './components/notifications-service/notification.slice'

// OpenReplay tracker configuration
let openReplayMiddleware = null;

// Only initialize OpenReplay in browser environment
if (typeof window !== 'undefined') {
  try {
    const { tracker } = require('@openreplay/tracker');
    const trackerRedux = require('@openreplay/tracker-redux');
    
    // Configure the tracker (you'll need to set your project key)
    tracker.configure({
      projectKey: process.env.NEXT_PUBLIC_OPENREPLAY_PROJECT_KEY || 'YOUR_PROJECT_KEY',
      // Uncomment and set if using self-hosted version
      // ingestPoint: "https://openreplay.mydomain.com/ingest",
    });
    
    // Create the Redux middleware
    openReplayMiddleware = tracker.use(trackerRedux({
      // Customize what gets recorded
      actionFilter: action => {
        // Filter out sensitive actions (customize as needed)
        const sensitiveActions = ['DRAW', 'PASSWORD_CHANGE', 'SENSITIVE_DATA_UPDATE'];
        return !sensitiveActions.includes(action.type);
      },
      stateTransformer: state => {
        // Remove sensitive data from state before recording
        const { jwt, password, token, ...sanitizedState } = state;
        return sanitizedState;
      },
      actionTransformer: action => {
        // Transform actions if needed (e.g., remove sensitive data from payload)
        if (action.type === 'LOGIN' && action.payload) {
          const { password, ...safePayload } = action.payload;
          return { ...action, payload: safePayload };
        }
        return action;
      }
    }));
    
    // Start the tracker
    tracker.start();
  } catch (error) {
    console.warn('OpenReplay tracker not available:', error.message);
  }
}

const makeStore = () => {
  const middleware = [];
  
  // Add OpenReplay middleware if available
  if (openReplayMiddleware) {
    middleware.push(openReplayMiddleware);
  }
  
  return configureStore({
    reducer: {
      auth: authReducer,
      master: masterReducer,
      scheduleInventory: scheduleInventoryReducer,
      trainee: traineeReducer,
      trainer: trainerReducer,
      bookings: bookingsReducer,
      common: commonReducer,
      videoupload: videouploadReducer,
      transaction: transactionReducer,
      contactus: contactusReducer,
      notification: notificationReducer
    },
    middleware: (getDefaultMiddleware) => 
      getDefaultMiddleware().concat(middleware),
  });
};

const store = makeStore();

export default store;

export const useAppDispatch = () => useDispatch();

export const useAppSelector = useSelector;
