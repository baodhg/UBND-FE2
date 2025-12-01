import apiClient from '../../../lib/axios'
import { resolveToAbsoluteUrl, getAssetBaseUrl } from '../../../utils/url'

// Generate UUID v4
const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    const v = c === 'x' ? r : (r & 0x3) | 0x8
    return v.toString(16)
  })
}

export interface UploadVideoParams {
  idVideo?: string
  currentIndex?: number
  totalChunks?: number
  file: File
}

export interface UploadVideoResponse {
  success: boolean
  data: {
    id: string
    idVideo: string
    currentIndex: number
    totalChunks: number
    fileName: string
    fileSize: number
    fileType: string
    url?: string
  }
  message: string
}

export const videoUploadApi = {
  getVideoUrl: async (idVideo: string): Promise<string | null> => {
    const assetBaseUrl = getAssetBaseUrl()
    const toAbsoluteUrl = (url?: string | null): string | null => {
      if (!url) return null
      const resolved = resolveToAbsoluteUrl(url)
      if (resolved) return resolved
      const normalizedPath = url.startsWith('/') ? url : `/${url}`
      return `${assetBaseUrl}${normalizedPath}`
    }
    
    // First, try to get video info/metadata from API
    try {
      const infoEndpoints = [
        `/video/${idVideo}/info`,
        `/video/${idVideo}/metadata`,
        `/api/video/${idVideo}/info`,
        `/api/video/${idVideo}/metadata`,
      ]
      
      for (const endpoint of infoEndpoints) {
        try {
          const response = await apiClient.get(endpoint, {
            validateStatus: (status) => status < 500,
          })
          
          if (response.status === 200 && response.data) {
            // If response has URL field
            if (response.data.url || response.data.videoUrl || response.data.streamUrl) {
              const videoUrl = response.data.url || response.data.videoUrl || response.data.streamUrl
              const absoluteUrl = toAbsoluteUrl(videoUrl)
              if (absoluteUrl) return absoluteUrl
            }
            
            // If response has data.url
            if (response.data.data?.url) {
              const absoluteUrl = toAbsoluteUrl(response.data.data.url)
              if (absoluteUrl) return absoluteUrl
            }
          }
        } catch (err) {
          // Try next endpoint
          continue
        }
      }
    } catch (error) {
      console.log('Could not get video info from API, trying direct URLs')
    }
    
    // If info endpoint doesn't work, try direct video endpoints
    try {
      const endpoints = [
        `/video/${idVideo}/stream`,
        `/video/${idVideo}/play`,
        `/video/${idVideo}`,
        `/api/video/${idVideo}/stream`,
        `/api/video/${idVideo}/play`,
        `/api/video/${idVideo}`,
      ]
      
      for (const endpoint of endpoints) {
        try {
          const response = await apiClient.get(endpoint, {
            responseType: 'blob',
            validateStatus: (status) => status < 500,
          })
          
          if (response.status === 200) {
            // If we get a blob, create object URL
            if (response.data instanceof Blob) {
              return URL.createObjectURL(response.data)
            }
            // If we get a redirect or URL
            if (response.headers.location) {
              return response.headers.location
            }
            // If response data is a URL string
            if (typeof response.data === 'string' && response.data.startsWith('http')) {
              return response.data
            }
          }
        } catch (err) {
          // Try next endpoint
          continue
        }
      }
    } catch (error) {
      console.error('Error getting video URL:', error)
    }
    
    // All endpoints failed, return null
    return null
  },
  uploadVideo: async (params: UploadVideoParams): Promise<UploadVideoResponse['data']> => {
    const formData = new FormData()
    
    // Generate UUID for idVideo if not provided
    const idVideo = params.idVideo || generateUUID()
    const currentIndex = params.currentIndex ?? 1
    const totalChunks = params.totalChunks ?? 1
    
    // Append fields
    formData.append('idVideo', idVideo)
    formData.append('currentIndex', currentIndex.toString())
    formData.append('totalChunks', totalChunks.toString())
    formData.append('file', params.file)
    
    // Debug: Log FormData contents
    console.log('Video Upload FormData:')
    console.log('idVideo:', idVideo)
    console.log('currentIndex:', currentIndex)
    console.log('totalChunks:', totalChunks)
    console.log('file:', params.file.name, `(${(params.file.size / 1024 / 1024).toFixed(2)} MB)`, params.file.type)
    
    try {
      const response = await apiClient.post<any>('/video/upload', formData)
      
      console.log('Video Upload Response:', {
        status: response.status,
        data: response.data,
      })
      
      // Handle different response formats
      if (response.data) {
        // If response has success field and data
        if (response.data.success && response.data.data) {
          return response.data.data
        }
        
        // If response is the data directly (without success wrapper)
        if (response.data.idVideo || response.data.id) {
          // Construct response data from direct response
          return {
            id: response.data.id || idVideo,
            idVideo: response.data.idVideo || idVideo,
            currentIndex: response.data.currentIndex || currentIndex,
            totalChunks: response.data.totalChunks || totalChunks,
            fileName: response.data.fileName || params.file.name,
            fileSize: response.data.fileSize || params.file.size,
            fileType: response.data.fileType || params.file.type,
            url: response.data.url,
          }
        }
        
        // If response has message indicating success (like "Uploaded single chunk...")
        if (response.data.message && response.data.message.includes('Uploaded')) {
          // Video uploaded successfully, construct response
          console.log('Video upload successful based on message')
          return {
            id: idVideo,
            idVideo: idVideo,
            currentIndex: currentIndex,
            totalChunks: totalChunks,
            fileName: params.file.name,
            fileSize: params.file.size,
            fileType: params.file.type,
          }
        }
        
        // If response is just a message string
        if (typeof response.data === 'string' && response.data.includes('Uploaded')) {
          console.log('Video upload successful (string response)')
          return {
            id: idVideo,
            idVideo: idVideo,
            currentIndex: currentIndex,
            totalChunks: totalChunks,
            fileName: params.file.name,
            fileSize: params.file.size,
            fileType: params.file.type,
          }
        }
      }
      
      // If we get here and status is 2xx, consider it success
      if (response.status >= 200 && response.status < 300) {
        console.log('Video upload successful (2xx status)')
        return {
          id: idVideo,
          idVideo: idVideo,
          currentIndex: currentIndex,
          totalChunks: totalChunks,
          fileName: params.file.name,
          fileSize: params.file.size,
          fileType: params.file.type,
        }
      }
      
      throw new Error(response.data?.message || 'Có lỗi xảy ra khi upload video')
    } catch (error: any) {
      // Log detailed error information
      console.error('Video Upload Error Details:', {
        status: error?.response?.status,
        statusText: error?.response?.statusText,
        data: error?.response?.data,
        message: error?.response?.data?.message || error?.message,
        errors: error?.response?.data?.errors,
      })
      
      // Check if error message indicates success (like "Uploaded single chunk...")
      const errorMessage = error?.response?.data?.message || error?.message || ''
      if (errorMessage.includes('Uploaded')) {
        // This is actually a success, return the video ID
        console.log('Video upload successful (detected from error message)')
        return {
          id: idVideo,
          idVideo: idVideo,
          currentIndex: currentIndex,
          totalChunks: totalChunks,
          fileName: params.file.name,
          fileSize: params.file.size,
          fileType: params.file.type,
        }
      }
      
      throw error
    }
  },
}

