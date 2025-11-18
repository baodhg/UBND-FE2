import { useMutation } from '@tanstack/react-query'
import { useAppDispatch, useAppSelector } from '../../../store/hooks'
import { videoUploadApi, type UploadVideoParams } from '../api/videoUploadApi'
import { setUploadedVideo, setCurrentUpload, setLoading, setError } from '../store/videoUploadSlice'

export const useUploadVideo = () => {
  const dispatch = useAppDispatch()
  const { uploadedVideos, currentUpload, isLoading, error } = useAppSelector(
    (state) => state.videoUpload
  )

  const mutation = useMutation({
    mutationFn: async (params: UploadVideoParams) => {
      dispatch(setLoading(true))
      dispatch(
        setCurrentUpload({
          idVideo: params.idVideo || undefined,
          progress: 0,
          isUploading: true,
        })
      )

      try {
        // TODO: Implement progress tracking if needed
        // For now, we'll use a simple approach
        const result = await videoUploadApi.uploadVideo(params)
        dispatch(setUploadedVideo(result))
        return result
      } catch (err: any) {
        const errorMessage =
          err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi upload video'
        dispatch(setError(errorMessage))
        throw err
      }
    },
  })

  return {
    uploadVideo: mutation.mutate,
    uploadVideoAsync: mutation.mutateAsync,
    uploadedVideo: mutation.data || null,
    uploadedVideos,
    currentUpload,
    isLoading: isLoading || mutation.isPending,
    error: error || (mutation.error ? 'Có lỗi xảy ra khi upload video' : null),
    isSuccess: mutation.isSuccess,
    reset: mutation.reset,
  }
}

