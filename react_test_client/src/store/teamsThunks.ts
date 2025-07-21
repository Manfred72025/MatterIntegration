import { setTeams, setTeamsLoading } from './teamsSlice';
import { fetchTeams as dalFetchTeams } from '../dal';

export const fetchTeamsThunk = () => async (dispatch: any) => {
  dispatch(setTeamsLoading(true));
  try {
    const data = await dalFetchTeams();
    dispatch(setTeams(Array.isArray(data) ? data : (data.teams || [])));
  } catch (e: any) {
    // Можно добавить обработку ошибок через dispatch
  } finally {
    dispatch(setTeamsLoading(false));
  }
}; 