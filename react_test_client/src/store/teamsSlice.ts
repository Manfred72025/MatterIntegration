import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Team {
  id: string;
  [key: string]: any;
}

interface TeamsState {
  teams: Team[];
  teamsLoading: boolean;
  selectedTeamId: string | null;
}

const initialState: TeamsState = {
  teams: [],
  teamsLoading: false,
  selectedTeamId: null,
};

export const teamsSlice = createSlice({
  name: 'teams',
  initialState,
  reducers: {
    setTeams(state, action: PayloadAction<Team[]>) {
      state.teams = action.payload;
      if (!state.selectedTeamId && action.payload.length > 0) {
        state.selectedTeamId = action.payload[0].id;
      }
    },
    setTeamsLoading(state, action: PayloadAction<boolean>) {
      state.teamsLoading = action.payload;
    },
    setSelectedTeamId(state, action: PayloadAction<string | null>) {
      state.selectedTeamId = action.payload;
    },
    setCurrentTeamId(state, action: PayloadAction<string | null>) {
      state.selectedTeamId = action.payload;
    },
  },
});

export const {
  setTeams,
  setTeamsLoading,
  setSelectedTeamId,
  setCurrentTeamId,
} = teamsSlice.actions;

export const selectTeams = (state: any) => state.teams.teams;
export const selectTeamsLoading = (state: any) => state.teams.teamsLoading;
export const selectSelectedTeamId = (state: any) => state.teams.selectedTeamId;

export default teamsSlice.reducer; 