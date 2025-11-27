import React, { useState, useEffect } from 'react'
import { Search, Calendar, AlertCircle, CheckCircle2, X, Video } from 'lucide-react'
import { useSearchReportsByTitle, useGetReportByCode } from '../../features/reports'
import { videoUploadApi } from '../../features/video-upload'

// Video Player Component with multiple URL fallback
export const VideoPlayer: React.FC<{ idVideo: string; videoUrls: string[]; videoIndex: number }> = ({ 
  idVideo, 
  videoUrls, 
  videoIndex 
}) => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [currentUrlIndex, setCurrentUrlIndex] = useState(0)
  const [videoError, setVideoError] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Try to get video URL from API first
  useEffect(() => {
    const fetchVideoUrl = async () => {
      setIsLoading(true)
      try {
        const url = await videoUploadApi.getVideoUrl(idVideo)
        if (url) {
          console.log(`Got video URL from API:`, url)
          setVideoUrl(url)
          setIsLoading(false)
          return
        }
      } catch (error) {
        console.error('Error fetching video URL from API:', error)
      }
      
      // If API doesn't return URL, fallback to hardcoded URLs
      setIsLoading(false)
    }
    
    fetchVideoUrl()
  }, [idVideo])

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    const currentUrl = videoUrl || videoUrls[currentUrlIndex]
    console.error(`Video error with URL:`, currentUrl, e)
    
    // If we have a videoUrl from API and it failed, try hardcoded URLs
    if (videoUrl && currentUrlIndex < videoUrls.length - 1) {
      console.log(`API URL failed, trying hardcoded URL ${currentUrlIndex + 1}`)
      setVideoUrl(null)
      setCurrentUrlIndex(currentUrlIndex + 1)
      setIsLoading(true)
    } else if (currentUrlIndex < videoUrls.length - 1) {
      console.log(`Trying next URL: ${currentUrlIndex + 1}`)
      setCurrentUrlIndex(currentUrlIndex + 1)
      setIsLoading(true)
    } else {
      console.error('All video URLs failed')
      setVideoError(true)
      setIsLoading(false)
    }
  }

  const handleVideoLoaded = () => {
    const currentUrl = videoUrl || videoUrls[currentUrlIndex]
    console.log(`Video loaded successfully with URL:`, currentUrl)
    setIsLoading(false)
  }

  const handleVideoLoadStart = () => {
    const currentUrl = videoUrl || videoUrls[currentUrlIndex]
    console.log(`Loading video from URL:`, currentUrl)
  }
  
  const currentVideoUrl = videoUrl || videoUrls[currentUrlIndex]

  return (
    <div className="rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
      {!videoError ? (
        <>
          {isLoading && (
            <div className="w-full h-64 flex items-center justify-center text-white">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-2"></div>
                <p className="text-sm">Đang tải video...</p>
              </div>
            </div>
          )}
          {currentVideoUrl && (
            <video
              key={currentVideoUrl} // Force re-render when URL changes
              src={currentVideoUrl}
              controls
              className="w-full max-h-96 object-contain"
              preload="auto"
              onError={handleVideoError}
              onLoadedData={handleVideoLoaded}
              onLoadStart={handleVideoLoadStart}
              crossOrigin="anonymous"
              style={{ display: isLoading ? 'none' : 'block' }}
            >
              Trình duyệt của bạn không hỗ trợ video.
            </video>
          )}
        </>
      ) : (
        <div className="w-full h-64 flex items-center justify-center text-white">
          <div className="text-center">
            <Video size={48} className="mx-auto mb-2 opacity-50" />
            <p className="text-sm">Không thể tải video</p>
            <p className="text-xs opacity-75 mt-1">ID: {idVideo.substring(0, 8)}...</p>
            <p className="text-xs opacity-50 mt-2">Đã thử {videoUrls.length} URL khác nhau</p>
          </div>
        </div>
      )}
      <div className="bg-black/50 text-white text-xs p-2 flex items-center justify-between">
        <span className="flex items-center gap-2">
          <Video size={14} />
          Video {videoIndex}
        </span>
        <span>ID: {idVideo.substring(0, 8)}...</span>
      </div>
    </div>
  )
}

export const TrackReportForm: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [showResult, setShowResult] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [validationError, setValidationError] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)
  const [maPhanAnh, setMaPhanAnh] = useState<string>('')

  // Step 1: Search by title to get ma_phan_anh
  const { data: searchResult, isLoading: isSearching, error: searchError } = useSearchReportsByTitle(searchTerm, showResult)
  
  // Step 2: Get full report details by ma_phan_anh
  const { data: report, isLoading: isLoadingDetail, error: detailError } = useGetReportByCode(maPhanAnh, !!maPhanAnh)
  
  const isLoading = isSearching || isLoadingDetail
  const error = searchError || detailError

  // When search result is available, get the ma_phan_anh
  React.useEffect(() => {
    console.log('🔍 Search result:', searchResult)
    console.log('🔍 Is Array:', Array.isArray(searchResult))
    
    if (searchResult) {
      // Backend returns array, get first item
      const reportData = Array.isArray(searchResult) ? searchResult[0] : searchResult
      console.log('🔍 Report data:', reportData)
      console.log('🔍 ma_phan_anh value:', reportData?.ma_phan_anh)
      
      if (reportData && reportData.ma_phan_anh) {
        console.log('✅ Found ma_phan_anh:', reportData.ma_phan_anh)
        setMaPhanAnh(reportData.ma_phan_anh)
      } else {
        console.log('⚠️ No ma_phan_anh found in:', reportData)
      }
    }
  }, [searchResult])

  // Debug report data
  React.useEffect(() => {
    console.log('📄 Report data:', report)
    console.log('⏳ Is loading:', isLoading)
    console.log('❌ Error:', error)
  }, [report, isLoading, error])

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setValidationError('Vui lòng nhập từ khóa tìm kiếm')
      return
    }
    setValidationError('')
    setMaPhanAnh('') // Reset ma_phan_anh when starting new search
    setSearchTerm(searchQuery.trim())
    setShowResult(true)
  }

  const handleClose = () => {
    setShowResult(false)
    setShowErrorModal(false)
    setMaPhanAnh('')
    setSearchTerm('')
  }

  // Show error modal when error occurs
  React.useEffect(() => {
    if (error && showResult) {
      setShowErrorModal(true)
    }
  }, [error, showResult])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const formatPriority = (priority: string) => {
    const priorityMap: { [key: string]: string } = {
      'THONG_THUONG': 'Thông thường',
      'KHAN_CAP': 'Khẩn cấp',
    }
    return priorityMap[priority] || priority
  }

  return (
    <>
      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-2"
            >
              <X size={24} />
            </button>
            
            {/* Image */}
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      <div className="bg-white text-card-foreground rounded-xl p-6 border border-gray-200 shadow-lg">
        <h3 className="mb-6 flex items-center gap-2">
          <Search size={24} className="text-blue-600" />
          <span className="text-lg font-semibold">Tra cứu tiến độ</span>
        </h3>
        <div className="flex gap-3">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (validationError) setValidationError('')
            }}
            placeholder="Nhập tiêu đề phản ánh để tìm kiếm..."
            className={`flex h-10 w-full min-w-0 rounded-md border px-3 py-2.5 text-base bg-gray-100 transition-all outline-none md:text-sm flex-1 ${
              validationError 
                ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-200' 
                : 'border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200'
            }`}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleSearch()
              }
            }}
          />
          <button
            type="button"
            onClick={handleSearch}
            disabled={isLoading}
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all h-9 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
          >
            {isLoading ? 'Đang tìm...' : 'Tra cứu'}
          </button>
        </div>
        {validationError && (
          <div className="mt-3 flex items-center gap-2 text-red-600 text-sm">
            <AlertCircle size={16} />
            <span>{validationError}</span>
          </div>
        )}
      </div>

      {/* Error Modal - Only show when not found */}
      {showErrorModal && error && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>

            {/* Content */}
            <div className="text-center py-4">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy</h3>
              <p className="text-gray-600 mb-6">
                Không tìm thấy phản ánh với từ khóa <strong>{searchTerm}</strong>
              </p>
              <button
                onClick={handleClose}
                className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Display Below Search */}
      {showResult && !error && report && (
        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          {isLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Status badges */}
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded text-sm font-medium">
                  {report.linh_vuc_phan_anh?.ten}
                </span>
                {report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0 && (
                  <span className="px-3 py-1 bg-orange-50 text-orange-600 rounded text-sm font-medium">
                    {report.lich_su_trang_thai[report.lich_su_trang_thai.length - 1].ten}
                  </span>
                )}
              </div>

              {/* Title */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{report.tieu_de}</h3>

                {/* Meta info */}
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} />
                    <span>Ngày gửi: {formatDate(report.thoi_gian_tao)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Mã phản ánh: {report.ma_phan_anh}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Mức độ: {formatPriority(report.muc_do)}</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Mô tả chi tiết</h4>
                <p className="text-gray-700 whitespace-pre-wrap">{report.mo_ta}</p>
              </div>

              {/* Location */}
              {report.vi_tri && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Địa điểm</h4>
                  <p className="text-gray-700">{report.vi_tri}</p>
                </div>
              )}

              {/* Attached Images */}
              {report.dinh_kem_phan_anh && report.dinh_kem_phan_anh.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh đính kèm</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {report.dinh_kem_phan_anh
                      .filter((file) => file.dinh_dang_file.startsWith('image/'))
                      .map((file, index) => (
                        <div
                          key={index}
                          className="relative aspect-square rounded-lg overflow-hidden border-2 border-gray-200"
                        >
                          <img
                            src={`https://ubnd-api-staging.noah-group.org${file.url_file}`}
                            alt={`Đính kèm ${index + 1}`}
                            className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                            onClick={() => setSelectedImage(`https://ubnd-api-staging.noah-group.org${file.url_file}`)}
                          />
                          <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white text-xs p-1 text-center">
                            {file.kich_thuoc_file_mb} MB
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Attached Videos */}
              {((report.dinh_kem_phan_anh && report.dinh_kem_phan_anh.length > 0 && 
                 report.dinh_kem_phan_anh.some(file => file.dinh_dang_file.startsWith('video/'))) ||
                (report.videos && report.videos.length > 0)) && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Video size={20} className="text-blue-600" />
                    Video đính kèm
                  </h4>
                  <div className="space-y-3">
                    {/* Videos from dinh_kem_phan_anh */}
                    {report.dinh_kem_phan_anh && report.dinh_kem_phan_anh
                      .filter(file => file.dinh_dang_file.startsWith('video/'))
                      .map((file, index) => (
                        <div key={`file-${index}`} className="rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
                          <video
                            src={`https://ubnd-api-staging.noah-group.org${file.url_file}`}
                            controls
                            className="w-full max-h-96 object-contain"
                            preload="metadata"
                          >
                            Trình duyệt của bạn không hỗ trợ video.
                          </video>
                          <div className="bg-black/50 text-white text-xs p-2 flex items-center justify-between">
                            <span className="flex items-center gap-2">
                              <Video size={14} />
                              Video {index + 1}
                            </span>
                            <span>{file.kich_thuoc_file_mb} MB</span>
                          </div>
                        </div>
                      ))}
                    
                    {/* Videos from videos array */}
                    {report.videos && report.videos.length > 0 && report.videos
                      .filter(video => video.status === 'DONE' && video.final_mp4_url)
                      .map((video, index) => {
                        const videoIndex = (report.dinh_kem_phan_anh?.filter(f => f.dinh_dang_file.startsWith('video/')).length || 0) + index + 1
                        const baseUrl = 'https://ubnd-api-staging.noah-group.org'
                        
                        return (
                          <div key={`video-${video.id}`} className="rounded-lg overflow-hidden border-2 border-gray-200 bg-black">
                            <video
                              src={`${baseUrl}${video.final_mp4_url}`}
                              controls
                              className="w-full max-h-96 object-contain"
                              preload="metadata"
                            >
                              Trình duyệt của bạn không hỗ trợ video.
                            </video>
                            <div className="bg-black/50 text-white text-xs p-2 flex items-center justify-between">
                              <span className="flex items-center gap-2">
                                <Video size={14} />
                                Video {videoIndex}
                              </span>
                              <span className="text-green-400">{video.status}</span>
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              )}

              {/* Timeline */}
              {report.lich_su_trang_thai && report.lich_su_trang_thai.length > 0 && (
                <div>
                  <h4 className="font-semibold text-gray-900 mb-4">Tiến trình xử lý</h4>
                  <div className="space-y-0">
                    {report.lich_su_trang_thai.map((history, index) => {
                      const isLast = index === report.lich_su_trang_thai.length - 1
                      const isCompleted = index < report.lich_su_trang_thai.length - 1

                      return (
                        <div key={index} className="flex gap-4">
                          {/* Timeline indicator */}
                          <div className="flex flex-col items-center pt-1">
                            <div
                              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                isCompleted
                                  ? 'bg-blue-600 text-white'
                                  : isLast
                                  ? 'bg-gray-300 text-gray-500'
                                  : 'bg-blue-600 text-white'
                              }`}
                            >
                              <CheckCircle2 size={20} />
                            </div>
                            {!isLast && (
                              <div className="w-0.5 h-full bg-blue-200 mt-2 min-h-[60px]"></div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 pb-8">
                            <h5 className="font-semibold text-gray-900 mb-1">{history.ten}</h5>
                            <p className="text-sm text-gray-500">
                              {formatDate(history.thoi_gian_tao)}
                            </p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {showResult && isLoading && !error && (
        <div className="mt-6 bg-white rounded-xl p-6 border border-gray-200 shadow-lg">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Đang tìm kiếm...</p>
          </div>
        </div>
      )}
    </>
  )
}
