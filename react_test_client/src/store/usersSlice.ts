import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: string;
  username: string;
  [key: string]: any;
}

interface UsersState {
  users: User[];
  usersLoading: boolean;
  selectedUser: User | null;
  currentUser: User | null;
}

const initialState: UsersState = {
  users: [],
  usersLoading: false,
  selectedUser: null,
  currentUser: null,
};

export const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers(state, action: PayloadAction<User[]>) {
      state.users = action.payload;
      if (!state.currentUser && action.payload.length > 0) {
        state.currentUser = action.payload[0];
      }
    },
    addUser(state, action: PayloadAction<User>) {
      state.users.push(action.payload);
    },
    setUsersLoading(state, action: PayloadAction<boolean>) {
      state.usersLoading = action.payload;
    },
    setSelectedUser(state, action: PayloadAction<User | null>) {
      state.selectedUser = action.payload;
    },
    setCurrentUser(state, action: PayloadAction<User | null>) {
      state.currentUser = action.payload;
    },
  },
});

export const {
  setUsers,
  addUser,
  setUsersLoading,
  setSelectedUser,
  setCurrentUser,
} = usersSlice.actions;

export const selectUsers = (state: any) => state.users.users;
export const selectUsersLoading = (state: any) => state.users.usersLoading;
export const selectSelectedUser = (state: any) => state.users.selectedUser;
export const selectCurrentUser = (state: any) => state.users.currentUser;

export default usersSlice.reducer; 