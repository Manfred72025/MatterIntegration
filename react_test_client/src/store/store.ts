import { configureStore } from '@reduxjs/toolkit';
import discussionsReducer from './discussionsSlice';
import teamsReducer from './teamsSlice';
import usersReducer from './usersSlice';

export const store = configureStore({
  reducer: {
    discussions: discussionsReducer,
    teams: teamsReducer,
    users: usersReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 