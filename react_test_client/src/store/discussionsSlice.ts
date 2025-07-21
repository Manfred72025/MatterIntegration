import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Discussion {
  id: string;
  [key: string]: any;
}

interface DiscussionsState {
  discussions: Discussion[];
  discussionsLoading: boolean;
  selectedDiscussionId: string | null;
  discussionPosts: any[];
  postsLoading: boolean;
}

const initialState: DiscussionsState = {
  discussions: [],
  discussionsLoading: false,
  selectedDiscussionId: null,
  discussionPosts: [],
  postsLoading: false,
};

export const discussionsSlice = createSlice({
  name: 'discussions',
  initialState,
  reducers: {
    setDiscussions(state, action: PayloadAction<Discussion[]>) {
      state.discussions = action.payload;
    },
    setDiscussionsLoading(state, action: PayloadAction<boolean>) {
      state.discussionsLoading = action.payload;
    },
    setSelectedDiscussionId(state, action: PayloadAction<string | null>) {
      state.selectedDiscussionId = action.payload;
    },
    setDiscussionPosts(state, action: PayloadAction<any[]>) {
      state.discussionPosts = action.payload;
    },
    setPostsLoading(state, action: PayloadAction<boolean>) {
      state.postsLoading = action.payload;
    },
  },
});

export const {
  setDiscussions,
  setDiscussionsLoading,
  setSelectedDiscussionId,
  setDiscussionPosts,
  setPostsLoading,
} = discussionsSlice.actions;

// Селекторы
export const selectDiscussions = (state: any) => state.discussions.discussions;
export const selectDiscussionsLoading = (state: any) => state.discussions.discussionsLoading;
export const selectSelectedDiscussionId = (state: any) => state.discussions.selectedDiscussionId;
export const selectDiscussionPosts = (state: any) => state.discussions.discussionPosts;
export const selectPostsLoading = (state: any) => state.discussions.postsLoading;

export default discussionsSlice.reducer; 