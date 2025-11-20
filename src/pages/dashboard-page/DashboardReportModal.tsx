import React, { useState, useMemo, useEffect } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Camera, MapPin, ChevronDown, CheckCircle2, X, Copy, Check, Video } from 'lucide-react'
import { useAppSelector } from '../../store/hooks'
import { useReportCategories } from '../../features/report-categories'
import { useCreateReport } from '../../features/reports'
import { useUploadVideo } from '../../features/video-upload'

interface DashboardReportModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface DashboardReportFormValues {
  category: string
  title: string
  description: string
  images: File[]
  video: File | null
  location: string
  priority: string
  name: string
  phone: string
}

const DashboardReportSchema = Yup.object().shape({
  category: Yup.string().required('Loại phản ánh là bắt buộc'),
  title: Yup.string()
    .max(200, 'Tiêu đề không được vượt quá 200 ký tự')
    .required('Tiêu đề là bắt buộc'),
  description: Yup.string()
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .required('Mô tả là bắt buộc'),
  images: Yup.array()
    .max(5, 'Chỉ được tải lên tối đa 5 hình ảnh')
    .test('fileSize', 'Mỗi file tối đa 3MB', (files) => {
      if (!files) return true
      return files.every((file: any) => file.size <= 3 * 1024 * 1024)
    }),
  video: Yup.mixed()
    .nullable()
    .test('fileSize', 'Mỗi file tối đa 150MB', (file: any) => {
      if (!file) return true
      return file.size <= 150 * 1024 * 1024
    })
    .test('fileType', 'Chỉ chấp nhận file .mp4', (file: any) => {
      if (!file) return true
      return file.type === 'video/mp4' || file.name.toLowerCase().endsWith('.mp4')
    }),
  location: Yup.string().required('Địa điểm là bắt buộc'),
  priority: Yup.string().required('Mức độ là bắt buộc'),
  // name and phone are auto-filled from user account, no validation needed
  name: Yup.string(),
  phone: Yup.string(),
})

export const DashboardReportModal: React.FC<DashboardReportModalProps> = ({ open, onClose, onSuccess }) => {
  const { user } = useAppSelector((state) => state.auth)
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [trackingCode, setTrackingCode] = useState('')
  const [copied, setCopied] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [showErrorModal, setShowErrorModal] = useState(false)

  const { mutate: createReport, isPending } = useCreateReport()
  const { uploadVideoAsync, isLoading: isUploadingVideo } = useUploadVideo()

  // Fetch categories from API
  const { categories, isLoading: isLoadingCategories } = useReportCategories({
    page: 1,
    size: 100,
    isActive: true,
  })

  // Helper function to extract phone from email if it's numeric
  const getPhoneFromEmail = (email: string | null): string => {
    if (!email) return ''
    // If email is just numbers, use it as phone
    const numericOnly = email.replace(/\D/g, '')
    if (numericOnly.length === 10) {
      return numericOnly
    }
    return ''
  }

  const initialValues: DashboardReportFormValues = {
    category: '',
    title: '',
    description: '',
    images: [],
    video: null,
    location: '',
    priority: 'Thông thường',
    name: user?.name || '',
    phone: getPhoneFromEmail(user?.email || null),
  }

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void,
    currentImages: File[]
  ) => {
    const newFiles = Array.from(event.target.files || [])
    const totalFiles = [...currentImages, ...newFiles]
    
    if (totalFiles.length > 5) {
      setErrorMessage('Chỉ được tải lên tối đa 5 hình ảnh')
      setShowErrorModal(true)
      return
    }

    const oversizedFiles = newFiles.filter((file) => file.size > 3 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      setErrorMessage('Mỗi file tối đa 3MB')
      setShowErrorModal(true)
      return
    }

    setFieldValue('images', totalFiles)
    event.target.value = ''
  }

  const handleRemoveImage = (
    index: number,
    setFieldValue: (field: string, value: any) => void,
    currentImages: File[]
  ) => {
    const newImages = currentImages.filter((_, i) => i !== index)
    setFieldValue('images', newImages)
  }

  const handleVideoChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const file = event.target.files?.[0]
    
    if (!file) {
      return
    }

    // Check file type - only .mp4
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      setErrorMessage('Chỉ chấp nhận file .mp4')
      setShowErrorModal(true)
      event.target.value = ''
      return
    }

    // Check file size - max 150MB
    if (file.size > 150 * 1024 * 1024) {
      setErrorMessage('Mỗi file tối đa 150MB')
      setShowErrorModal(true)
      event.target.value = ''
      return
    }

    setFieldValue('video', file)
    event.target.value = ''
  }

  const handleRemoveVideo = (
    setFieldValue: (field: string, value: any) => void
  ) => {
    setFieldValue('video', null)
  }

  const handleSubmit = async (values: DashboardReportFormValues, { resetForm }: any) => {
    try {
      let videoId: string | undefined = undefined

      // Upload video first if exists
      if (values.video) {
        try {
          console.log('Uploading video...')
          const videoResult = await uploadVideoAsync({
            file: values.video,
          })
          videoId = videoResult.idVideo
          console.log('Video uploaded successfully, idVideo:', videoId)
        } catch (videoError: any) {
          console.error('Video upload error:', videoError)
          const videoErrorMsg =
            videoError?.response?.data?.message || videoError?.message || 'Có lỗi xảy ra khi upload video'
          setErrorMessage(videoErrorMsg)
          setShowErrorModal(true)
          return
        }
      }

      // Prepare report data - always include user info (auto-filled from account)
      // Get phone from user email if it's numeric, otherwise use empty string
      const userPhone = getPhoneFromEmail(user?.email || null)
      
      const requestData = {
        idLinhVucPhanAnh: values.category,
        tieuDe: values.title,
        moTa: values.description,
        viTri: values.location,
        mucDo: values.priority,
        tenNguoiPhanAnh: user?.name || '',
        soDienThoaiNguoiPhanAnh: userPhone || undefined,
        idVideo: videoId ? [videoId] : undefined,
      }

      // Submit report with images and video ID
      createReport(
        { 
          data: requestData, 
          images: values.images.length > 0 ? values.images : undefined,
        },
        {
          onSuccess: (data) => {
            console.log('API Response:', data)
            console.log('Mã phản ánh:', data.ma_phan_anh)
            setTrackingCode(data.ma_phan_anh || '')
            setShowSuccessModal(true)
            resetForm()
            // Reset to initial values with user info
            setTimeout(() => {
              resetForm({
              values: {
                ...initialValues,
                name: user?.name || '',
                phone: getPhoneFromEmail(user?.email || null),
              }
            })
            }, 100)
            // Call onSuccess after a short delay to ensure backend has processed the new report
            setTimeout(() => {
              console.log('Calling onSuccess to refresh reports list...')
              onSuccess?.()
            }, 300)
          },
          onError: (error: any) => {
            console.error('Submit error:', error)
            console.error('Error response:', error?.response?.data)
            
            // Try to get detailed error message
            let errorMsg = 'Có lỗi xảy ra khi gửi phản ánh'
            
            if (error?.response?.data) {
              const errorData = error.response.data
              
              // Check for validation errors
              if (errorData.errors && Array.isArray(errorData.errors)) {
                errorMsg = errorData.errors.map((err: any) => 
                  typeof err === 'string' ? err : err.message || JSON.stringify(err)
                ).join('\n')
              } else if (errorData.message) {
                errorMsg = errorData.message
              } else if (typeof errorData === 'string') {
                errorMsg = errorData
              }
            } else if (error?.message) {
              errorMsg = error.message
            }
            
            setErrorMessage(errorMsg)
            setShowErrorModal(true)
          },
        }
      )
    } catch (error: any) {
      console.error('Unexpected error:', error)
      setErrorMessage(error?.message || 'Có lỗi xảy ra')
      setShowErrorModal(true)
    }
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false)
    // Refresh again when closing modal to ensure latest data
    setTimeout(() => {
      onSuccess?.()
    }, 100)
    onClose()
  }

  if (!open) return null

  return (
    <>
      {/* Image Preview Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center bg-black/90 backdrop-blur-sm p-2 sm:p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full h-full flex items-center justify-center">
            {/* Close button */}
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:text-gray-300 transition-colors bg-black/50 rounded-full p-1.5 sm:p-2 z-10"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>
            
            {/* Image */}
            <img
              src={selectedImage}
              alt="Preview"
              className="max-w-full max-h-[95vh] sm:max-h-[90vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 sm:mx-4 animate-in fade-in zoom-in duration-300">
            {/* Close button */}
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Error icon */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-red-100 rounded-full p-2 sm:p-3">
                <X size={36} className="sm:w-12 sm:h-12 text-red-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center pt-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Thông báo</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 break-words">
                {errorMessage}
              </p>

              {/* Action button */}
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl sm:rounded-2xl shadow-2xl p-4 sm:p-6 md:p-8 max-w-md w-full mx-2 sm:mx-4 animate-in fade-in zoom-in duration-300 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={handleCloseSuccessModal}
              className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600 transition-colors p-1 z-10"
            >
              <X size={20} className="sm:w-6 sm:h-6" />
            </button>

            {/* Success icon */}
            <div className="flex justify-center mb-3 sm:mb-4">
              <div className="bg-green-100 rounded-full p-2 sm:p-3">
                <CheckCircle2 size={36} className="sm:w-12 sm:h-12 text-green-600" />
              </div>
            </div>

            {/* Content */}
            <div className="text-center pt-2">
              <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Gửi thành công!</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                Phản ánh của bạn đã được tiếp nhận. Chúng tôi sẽ xem xét và phản hồi sớm nhất.
              </p>

              {/* Tracking Code */}
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 sm:p-4 mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-600 mb-2">Mã tra cứu của bạn:</p>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <code className="text-lg sm:text-2xl font-bold text-blue-600 break-all">{trackingCode}</code>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 sm:p-2 hover:bg-blue-100 rounded-lg transition-colors flex-shrink-0"
                    title="Sao chép mã"
                  >
                    {copied ? (
                      <Check size={18} className="sm:w-5 sm:h-5 text-green-600" />
                    ) : (
                      <Copy size={18} className="sm:w-5 sm:h-5 text-blue-600" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Vui lòng lưu lại mã này để tra cứu tiến độ xử lý
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleCloseSuccessModal}
                  className="flex-1 px-4 py-2.5 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base font-medium rounded-lg transition-colors"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Modal */}
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <div 
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Gửi phản ánh mới</h2>
              <p className="text-sm text-gray-600 mt-1">Thông tin sẽ được tự động điền từ tài khoản của bạn</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
            >
              <X size={24} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6">
            <Formik
              initialValues={initialValues}
              validationSchema={DashboardReportSchema}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={false}
              validateOnMount={false}
              enableReinitialize={true}
            >
              {({ values, setFieldValue }) => {
                // Memoize video URL to prevent re-creating on every render
                const videoUrl = useMemo(() => {
                  return values.video ? URL.createObjectURL(values.video) : null
                }, [values.video])
                
                // Cleanup video URL when component unmounts or video changes
                useEffect(() => {
                  return () => {
                    if (videoUrl) {
                      URL.revokeObjectURL(videoUrl)
                    }
                  }
                }, [videoUrl])
                
                return (
                  <Form className="space-y-4 sm:space-y-6" style={{ contain: 'layout' }}>
                    {/* Loại phản ánh */}
                    <div>
                      <label
                        htmlFor="category"
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                      >
                        Loại phản ánh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <Field
                          as="select"
                          name="category"
                          id="category"
                          disabled={isLoadingCategories}
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm whitespace-nowrap outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none pr-10"
                        >
                          <option value="">
                            {isLoadingCategories ? 'Đang tải...' : 'Chọn loại phản ánh'}
                          </option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                              {cat.ten}
                            </option>
                          ))}
                        </Field>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50"
                        />
                      </div>
                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="category" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Tiêu đề */}
                    <div>
                      <label
                        htmlFor="title"
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                      >
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                        <Field
                          name="title"
                          id="title"
                          type="text"
                          placeholder="Nhập tiêu đề phản ánh (tối đa 200 ký tự)"
                          autoComplete="off"
                          className="flex w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 mt-2 h-10"
                        />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 h-5 flex items-center">{values.title.length}/200 ký tự</p>
                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="title" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Mức độ */}
                    <div>
                      <label
                        htmlFor="priority"
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                      >
                        Mức độ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <Field
                          as="select"
                          name="priority"
                          id="priority"
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm whitespace-nowrap outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none pr-10"
                        >
                          <option value="Thông thường">Thông thường</option>
                          <option value="Khẩn cấp">Khẩn cấp</option>
                        </Field>
                        <ChevronDown
                          size={16}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none opacity-50"
                        />
                      </div>
                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="priority" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Mô tả chi tiết */}
                    <div>
                      <label
                        htmlFor="description"
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                      >
                        Mô tả chi tiết <span className="text-red-500">*</span>
                      </label>
                        <Field
                          name="description"
                          as="textarea"
                          id="description"
                          rows={5}
                          placeholder="Mô tả chi tiết vấn đề (tối đa 2000 ký tự)"
                          autoComplete="off"
                          className="flex field-sizing-content min-h-16 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 mt-2 resize-none"
                        />
                      <p className="text-xs sm:text-sm text-gray-500 mt-1 h-5 flex items-center">{values.description.length}/2000 ký tự</p>
                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage
                          name="description"
                          component="div"
                          className="text-red-500 text-xs sm:text-sm leading-tight"
                        />
                      </div>
                    </div>

                    {/* Địa điểm */}
                    <div>
                      <label
                        htmlFor="location"
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                      >
                        Địa điểm <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <MapPin
                          size={16}
                          className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none sm:w-[18px] sm:h-[18px]"
                        />
                        <Field
                          name="location"
                          as="input"
                          type="text"
                          id="location"
                          placeholder="Nhập địa chỉ hoặc khu phố"
                          autoComplete="off"
                          className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 sm:py-2.5 text-sm sm:text-base outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 pl-9 sm:pl-10"
                        />
                      </div>
                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="location" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Hình ảnh */}
                    <div>
                      <label className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                        Hình ảnh <span className="text-red-500">*</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          id="images"
                          className="hidden"
                          onChange={(e) => handleImageChange(e, setFieldValue, values.images)}
                        />
                        <label
                          htmlFor="images"
                          className="flex items-center justify-center gap-2 w-full p-4 sm:p-6 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <Camera size={20} className="sm:w-6 sm:h-6 text-gray-500" />
                          <span className="text-sm sm:text-base text-gray-600">Thêm ảnh ({values.images.length}/5)</span>
                        </label>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">Mỗi file tối đa 3MB</p>
                      </div>

                      {/* Image Preview */}
                      {values.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 transition-all duration-200 ease-in-out">
                          {values.images.map((file, index) => (
                            <div key={index} className="relative group">
                              <div 
                                className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer"
                                onClick={() => setSelectedImage(URL.createObjectURL(file))}
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
                              {/* Remove button */}
                              <button
                                type="button"
                                onClick={() => handleRemoveImage(index, setFieldValue, values.images)}
                                className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg transition-all opacity-0 group-hover:opacity-100"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="images" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Video (Tùy chọn) */}
                    <div>
                      <label className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50">
                        Video <span className="text-gray-500">(Tùy chọn)</span>
                      </label>
                      <div className="mt-2">
                        <input
                          type="file"
                          accept=".mp4,video/mp4"
                          id="video"
                          className="hidden"
                          onChange={(e) => handleVideoChange(e, setFieldValue)}
                        />
                        <label
                          htmlFor="video"
                          className="flex items-center justify-center gap-2 w-full p-4 sm:p-6 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <Video size={20} className="sm:w-6 sm:h-6 text-gray-500 flex-shrink-0" />
                          <span className="text-sm sm:text-base text-gray-600 truncate">
                            {values.video ? values.video.name : 'Thêm video'}
                          </span>
                        </label>
                        <p className="text-xs sm:text-sm text-gray-500 mt-2">Chỉ file .mp4, tối đa 150MB</p>
                      </div>

                      {/* Video Preview */}
                      {values.video && (
                        <div className="mt-4">
                          <div className="relative group">
                            <div className="relative rounded-lg overflow-hidden border-2 border-gray-200 h-64 bg-black flex items-center justify-center">
                              <video
                                src={videoUrl || undefined}
                                controls
                                preload="metadata"
                                className="w-full h-full object-contain"
                                style={{ minHeight: '256px', maxHeight: '256px' }}
                              />
                            </div>
                            {/* Remove button */}
                            <button
                              type="button"
                              onClick={() => handleRemoveVideo(setFieldValue)}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <X size={16} />
                            </button>
                          </div>
                          <p className="text-xs text-gray-500 mt-2 h-5">
                            {(values.video.size / (1024 * 1024)).toFixed(2)} MB
                          </p>
                        </div>
                      )}

                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="video" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isPending || isUploadingVideo}
                        className="flex-1 py-2.5 sm:py-3 text-sm sm:text-base bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isUploadingVideo ? 'Đang upload video...' : isPending ? 'Đang gửi...' : 'Gửi phản ánh'}
                      </button>
                    </div>
                  </Form>
                )
              }}
            </Formik>
          </div>
        </div>
      </div>
    </>
  )
}

