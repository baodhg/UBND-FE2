import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface UploadedVideo {
  id: string
  idVideo: string
  currentIndex: number
  totalChunks: number
  fileName: string
  fileSize: number
  fileType: string
  url?: string
}

interface VideoUploadState {
  uploadedVideos: UploadedVideo[]
  currentUpload: {
    idVideo: string | null
    progress: number
    isUploading: boolean
  }
  isLoading: boolean
  error: string | null
}

const initialState: VideoUploadState = {
  uploadedVideos: [],
  currentUpload: {
    idVideo: null,
    progress: 0,
    isUploading: false,
  },
  isLoading: false,
  error: null,
}

const videoUploadSlice = createSlice({
  name: 'videoUpload',
  initialState,
  reducers: {
    setUploadedVideo: (state, action: PayloadAction<UploadedVideo>) => {
      const existingIndex = state.uploadedVideos.findIndex(
        (v) => v.idVideo === action.payload.idVideo
      )
      if (existingIndex >= 0) {
        state.uploadedVideos[existingIndex] = action.payload
      } else {
        state.uploadedVideos.push(action.payload)
      }
      state.isLoading = false
      state.error = null
      state.currentUpload.isUploading = false
      state.currentUpload.progress = 100
    },
    setCurrentUpload: (
      state,
      action: PayloadAction<{ idVideo: string | null; progress?: number; isUploading?: boolean }>
    ) => {
      if (action.payload.idVideo !== undefined) {
        state.currentUpload.idVideo = action.payload.idVideo
      }
      if (action.payload.progress !== undefined) {
        state.currentUpload.progress = action.payload.progress
      }
      if (action.payload.isUploading !== undefined) {
        state.currentUpload.isUploading = action.payload.isUploading
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
      if (action.payload) {
        state.error = null
      }
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
      state.isLoading = false
      state.currentUpload.isUploading = false
    },
    clearCurrentUpload: (state) => {
      state.currentUpload = {
        idVideo: null,
        progress: 0,
        isUploading: false,
      }
    },
    removeUploadedVideo: (state, action: PayloadAction<string>) => {
      state.uploadedVideos = state.uploadedVideos.filter((v) => v.idVideo !== action.payload)
    },
    clearUploadedVideos: (state) => {
      state.uploadedVideos = []
      state.currentUpload = {
        idVideo: null,
        progress: 0,
        isUploading: false,
      }
      state.error = null
    },
  },
})

export const {
  setUploadedVideo,
  setCurrentUpload,
  setLoading,
  setError,
  clearCurrentUpload,
  removeUploadedVideo,
  clearUploadedVideos,
} = videoUploadSlice.actions

export default videoUploadSlice.reducer

