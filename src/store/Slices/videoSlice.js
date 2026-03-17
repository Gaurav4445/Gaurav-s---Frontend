import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axiosInstance from "../../helpers/axiosInstance";
import toast from "react-hot-toast";
import { BASE_URL } from "../../constants";

const initialState = {
    loading: false,
    uploading: false,
    uploaded: false,
    videos: {
        docs: [],
        hasNextPage: false,
    },
    video: null,
    publishToggled: false,
};

export const getAllVideos = createAsyncThunk(
    "getAllVideos",
    async ({ userId, sortBy, sortType, query, page, limit }) => {
        try {
            let endpoint = "/videos";
            const params = new URLSearchParams();

            if (userId) params.set("userId", userId);
            if (query) params.set("query", query);
            if (page) params.set("page", page);
            if (limit) params.set("limit", limit);
            if (sortBy && sortType) {
                params.set("sortBy", sortBy);
                params.set("sortType", sortType);
            }

            const url = params.toString() ? `${endpoint}?${params.toString()}` : endpoint;
            const response = await axiosInstance.get(url);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const publishAvideo = createAsyncThunk("publishAvideo", async (data) => {
    const formData = new FormData();
    formData.append("title", data.title);
    formData.append("description", data.description);
    formData.append("videoFile", data.videoFile[0]);
    formData.append("thumbnail", data.thumbnail[0]);

    try {
        const response = await axiosInstance.post("/video", formData);
        toast.success(response?.data?.message);
        return response.data.data;
    } catch (error) {
        toast.error(error?.response?.data?.error);
        throw error;
    }
});

export const updateAVideo = createAsyncThunk(
    "updateAVideo",
    async ({ videoId, data }) => {
        const formData = new FormData();
        formData.append("title", data.title);
        formData.append("description", data.description);
        formData.append("thumbnail", data.thumbnail[0]);

        try {
            const response = await axiosInstance.patch(
                `/video/v/${videoId}`,
                formData
            );
            toast.success(response?.data?.message);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const deleteAVideo = createAsyncThunk(
    "deleteAVideo",
    async (videoId) => {
        try {
            const response = await axiosInstance.delete(`/video/v/${videoId}`);
            toast.success(response?.data?.message);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const getVideoById = createAsyncThunk(
    "getVideoById",
    async ({ videoId }) => {
        try {
            const response = await axiosInstance.get(`/video/v/${videoId}`);
            return response.data.data;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

export const togglePublishStatus = createAsyncThunk(
    "togglePublishStatus",
    async (videoId) => {
        try {
            const response = await axiosInstance.patch(
                `/video/toggle/publish/${videoId}`
            );
            toast.success(response.data.message);
            return response.data.data.isPublished;
        } catch (error) {
            toast.error(error?.response?.data?.error);
            throw error;
        }
    }
);

const videoSlice = createSlice({
    name: "video",
    initialState,
    reducers: {
        updateUploadState: (state) => {
            state.uploading = false;
            state.uploaded = false;
        },
        makeVideosNull: (state) => {
            state.videos.docs = [];
        },
    },
    extraReducers: (builder) => {
        builder.addCase(getAllVideos.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getAllVideos.fulfilled, (state, action) => {
            state.loading = false;
            state.videos.docs = [...state.videos.docs, ...action.payload.docs];
            state.videos.hasNextPage = action.payload.hasNextPage;
        });
        builder.addCase(publishAvideo.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(publishAvideo.fulfilled, (state) => {
            state.uploading = false;
            state.uploaded = true;
        });
        builder.addCase(updateAVideo.pending, (state) => {
            state.uploading = true;
        });
        builder.addCase(updateAVideo.fulfilled, (state) => {
            state.uploading = false;
            state.uploaded = true;
        });
        builder.addCase(deleteAVideo.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(deleteAVideo.fulfilled, (state) => {
            state.loading = false;
        });
        builder.addCase(getVideoById.pending, (state) => {
            state.loading = true;
        });
        builder.addCase(getVideoById.fulfilled, (state, action) => {
            state.loading = false;
            state.video = action.payload;
        });
        builder.addCase(togglePublishStatus.fulfilled, (state) => {
            state.publishToggled = !state.publishToggled;
        });
    },
});

export const { updateUploadState, makeVideosNull } = videoSlice.actions;

export default videoSlice.reducer;
