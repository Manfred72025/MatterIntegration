import { setUsers, setUsersLoading, setSelectedUser } from './usersSlice';
import { fetchUsers as dalFetchUsers } from '../dal';

export const fetchUsersThunk = () => async (dispatch: any) => {
  dispatch(setUsersLoading(true));
  try {
    const data = await dalFetchUsers();
    dispatch(setUsers(data));
  } catch (e: any) {
    // Можно добавить обработку ошибок через dispatch
  } finally {
    dispatch(setUsersLoading(false));
  }
};

export const createUserThunk = (userData: any) => async (dispatch: any) => {
  dispatch(setUsersLoading(true));
  try {
    const response = await fetch('http://localhost:3001/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const result = await response.json();
    if (!response.ok) {
      let errorMsg = 'Ошибка создания пользователя';
      if (result && result.error) errorMsg = result.error;
      throw new Error(errorMsg);
    }
    // Не обновляем список пользователей здесь!
    return { payload: result };
  } catch (e: any) {
    // Можно добавить обработку ошибок через dispatch
    throw e;
  } finally {
    dispatch(setUsersLoading(false));
  }
};

export const deleteUserThunk = (userId: string) => async (dispatch: any) => {
  dispatch(setUsersLoading(true));
  try {
    const res = await fetch(`http://localhost:3001/users/${userId}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data?.error || 'Ошибка удаления пользователя');
    }
    // После удаления обновляем список
    await dispatch(fetchUsersThunk());
    dispatch(setSelectedUser(null));
  } catch (e: any) {
    // Можно добавить обработку ошибок через dispatch
    throw e;
  } finally {
    dispatch(setUsersLoading(false));
  }
}; 