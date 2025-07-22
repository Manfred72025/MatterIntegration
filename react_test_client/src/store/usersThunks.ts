import { setUsers, setUsersLoading, setSelectedUser } from './usersSlice';
import { fetchUsers as dalFetchUsers, createUser } from '../dal';

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
    const result = await createUser(userData);
    // Не обновляем список пользователей здесь!
    return { payload: result };
  } catch (e: any) {
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