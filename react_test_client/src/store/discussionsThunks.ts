import { setDiscussions, setDiscussionsLoading, setDiscussionPosts, setPostsLoading } from './discussionsSlice';
import { fetchDiscussions as dalFetchDiscussions, fetchDiscussionPosts as dalFetchDiscussionPosts } from '../dal';

export const fetchDiscussionsThunk = () => async (dispatch: any) => {
  dispatch(setDiscussionsLoading(true));
  try {
    const data = await dalFetchDiscussions();
    dispatch(setDiscussions(Array.isArray(data) ? data : (data.channels || [])));
  } catch (e: any) {
    // Можно добавить обработку ошибок через dispatch
  } finally {
    dispatch(setDiscussionsLoading(false));
  }
};

export const fetchDiscussionPostsThunk = (channelId: string) => async (dispatch: any) => {
  dispatch(setPostsLoading(true));
  try {
    const postsArr = await dalFetchDiscussionPosts(channelId);
    dispatch(setDiscussionPosts(postsArr));
  } catch (e: any) {
    // Можно добавить обработку ошибок через dispatch
  } finally {
    dispatch(setPostsLoading(false));
  }
}; 