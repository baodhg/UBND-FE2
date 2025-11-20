import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Camera, MapPin, ChevronDown, X, Video } from 'lucide-react'
import { Switch } from 'antd'
import { useReportCategories } from '../../features/report-categories'
import { useCreateReport } from '../../features/reports'
import { useUploadVideo } from '../../features/video-upload'

interface ReportModalProps {
  open: boolean
  onClose: () => void
  onSuccess?: () => void
}

interface SendReportFormValues {
  category: string
  title: string
  description: string
  images: File[]
  video: File | null
  location: string
  priority: string
  isAnonymous: boolean
  name: string
  phone: string
}

const SendReportSchema = Yup.object().shape({
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
  isAnonymous: Yup.boolean(),
  name: Yup.string().when('isAnonymous', {
    is: false,
    then: (schema) => schema.required('Họ và tên là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
  phone: Yup.string().when('isAnonymous', {
    is: false,
    then: (schema) =>
      schema
        .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
        .required('Số điện thoại là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

export const ReportModal: React.FC<ReportModalProps> = ({ open, onClose, onSuccess }) => {
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

  const initialValues: SendReportFormValues = {
    category: '',
    title: '',
    description: '',
    images: [],
    video: null,
    location: '',
    priority: 'Thông thường',
    isAnonymous: false,
    name: '',
    phone: '',
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
    if (file) {
      if (file.size > 150 * 1024 * 1024) {
        setErrorMessage('File video tối đa 150MB')
        setShowErrorModal(true)
        return
      }
      if (!file.type.includes('mp4') && !file.name.toLowerCase().endsWith('.mp4')) {
        setErrorMessage('Chỉ chấp nhận file .mp4')
        setShowErrorModal(true)
        return
      }
      setFieldValue('video', file)
    }
    event.target.value = ''
  }

  const handleRemoveVideo = (setFieldValue: (field: string, value: any) => void) => {
    setFieldValue('video', null)
  }

  const handleSubmit = async (values: SendReportFormValues, { resetForm }: any) => {
    try {
      let videoId: string | undefined = undefined

      // Upload video first if exists
      if (values.video) {
        try {
          const videoResult = await uploadVideoAsync({ file: values.video })
          videoId = videoResult.idVideo
        } catch (error: any) {
          console.error('Video upload error:', error)
          setErrorMessage('Lỗi khi upload video. Vui lòng thử lại.')
          setShowErrorModal(true)
          return
        }
      }

      const requestData = {
        idLinhVucPhanAnh: values.category,
        tieuDe: values.title,
        moTa: values.description,
        viTri: values.location,
        mucDo: values.priority,
        tenNguoiPhanAnh: values.isAnonymous ? undefined : values.name,
        soDienThoaiNguoiPhanAnh: values.isAnonymous ? undefined : values.phone,
        idVideo: videoId ? [videoId] : undefined,
      }

      // Submit report
      createReport(
        { 
          data: requestData, 
          images: values.images.length > 0 ? values.images : undefined,
        },
        {
          onSuccess: () => {
            resetForm()
            onSuccess?.()
            onClose()
          },
          onError: (error: any) => {
            let errorMsg = 'Có lỗi xảy ra khi gửi phản ánh'
            
            if (error?.response?.data) {
              const errorData = error.response.data
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

  if (!open) return null

  return (
    <>
      {/* Modal Overlay */}
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
              <p className="text-sm text-gray-600 mt-1">Điền thông tin phản ánh từ người dân</p>
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
              validationSchema={SendReportSchema}
              onSubmit={handleSubmit}
              validateOnChange={false}
              validateOnBlur={false}
              validateOnMount={false}
            >
              {({ values, setFieldValue }) => {
                // Memoize video URL to prevent re-creating on every render
                const videoUrl = React.useMemo(() => {
                  return values.video ? URL.createObjectURL(values.video) : null
                }, [values.video])
                
                // Cleanup video URL when component unmounts or video changes
                React.useEffect(() => {
                  return () => {
                    if (videoUrl) {
                      URL.revokeObjectURL(videoUrl)
                    }
                  }
                }, [videoUrl])
                
                return (
                  <Form className="space-y-4">
                    {/* Loại phản ánh */}
                    <div>
                      <label
                        htmlFor="category"
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
                      >
                        Loại phản ánh <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <Field
                          as="select"
                          name="category"
                          id="category"
                          disabled={isLoadingCategories}
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none pr-10"
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
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
                      >
                        Tiêu đề <span className="text-red-500">*</span>
                      </label>
                      <Field
                        name="title"
                        id="title"
                        type="text"
                        placeholder="Nhập tiêu đề phản ánh (tối đa 200 ký tự)"
                        autoComplete="off"
                        className="flex w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 mt-2 h-10"
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
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
                      >
                        Mức độ <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <Field
                          as="select"
                          name="priority"
                          id="priority"
                          className="flex w-full items-center justify-between gap-2 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 h-10 appearance-none pr-10"
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
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
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
                        className="flex field-sizing-content min-h-16 w-full rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:cursor-not-allowed disabled:opacity-50 mt-2 resize-none"
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
                        className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
                      >
                        Địa điểm <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-2">
                        <MapPin
                          size={16}
                          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                        />
                        <Field
                          name="location"
                          as="input"
                          type="text"
                          id="location"
                          placeholder="Nhập địa chỉ hoặc khu phố"
                          autoComplete="off"
                          className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 pl-9"
                        />
                      </div>
                      <div className="h-5 mt-1 overflow-hidden">
                        <ErrorMessage name="location" component="div" className="text-red-500 text-xs sm:text-sm leading-tight" />
                      </div>
                    </div>

                    {/* Hình ảnh */}
                    <div>
                      <label className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none">
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
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <Camera size={20} className="text-gray-500" />
                          <span className="text-sm text-gray-600">Thêm ảnh ({values.images.length}/5)</span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Mỗi file tối đa 3MB</p>
                      </div>

                      {/* Image Preview */}
                      {values.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 transition-all duration-200 ease-in-out">
                          {values.images.map((file, index) => (
                            <div key={index} className="relative group">
                              <div 
                                className="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 cursor-pointer"
                              >
                                <img
                                  src={URL.createObjectURL(file)}
                                  alt={`Preview ${index + 1}`}
                                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                                />
                              </div>
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
                      <label className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none">
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
                          className="flex items-center justify-center gap-2 w-full p-4 border-2 border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all"
                        >
                          <Video size={20} className="text-gray-500 flex-shrink-0" />
                          <span className="text-sm text-gray-600 truncate">
                            {values.video ? values.video.name : 'Thêm video'}
                          </span>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">Chỉ file .mp4, tối đa 150MB</p>
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

                    {/* Gửi ẩn danh */}
                    <div className="flex items-center justify-between p-3 border border-gray-200 bg-gray-50 rounded-xl gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800">Gửi ẩn danh</p>
                        <p className="text-xs text-gray-600">Không hiển thị thông tin cá nhân</p>
                      </div>
                      <Switch 
                        checked={values.isAnonymous}
                        onChange={(checked) => setFieldValue('isAnonymous', checked)}
                        style={{
                          backgroundColor: values.isAnonymous ? '#0e0e0fff' : '#d1d5db',
                        }}
                        className="flex-shrink-0"
                      />
                    </div>

                    {/* Thông tin cá nhân (hiển thị khi không ẩn danh) */}
                    <div 
                      className={`space-y-3 border border-gray-200 rounded-xl bg-white overflow-hidden ${
                        values.isAnonymous 
                          ? 'max-h-0 p-0 border-0 opacity-0 pointer-events-none mt-0' 
                          : 'max-h-[500px] opacity-100 p-3 mt-0'
                      }`}
                      style={{ 
                        willChange: 'max-height, opacity',
                        transition: 'max-height 200ms ease-in-out, opacity 200ms ease-in-out'
                      }}
                    >
                      <div>
                        <label
                          htmlFor="name"
                          className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
                        >
                          Họ và tên <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="name"
                          as="input"
                          type="text"
                          id="name"
                          placeholder="Nhập họ và tên"
                          autoComplete="name"
                          disabled={values.isAnonymous}
                          className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                        />
                        <div className="h-6 mt-1 overflow-hidden">
                          <ErrorMessage 
                            name="name" 
                            component="div" 
                            className="text-red-500 text-xs sm:text-sm leading-tight"
                          />
                        </div>
                      </div>
                      <div>
                        <label
                          htmlFor="phone"
                          className="flex items-center gap-2 text-xs sm:text-sm leading-none font-medium select-none"
                        >
                          Số điện thoại <span className="text-red-500">*</span>
                        </label>
                        <Field
                          name="phone"
                          as="input"
                          type="tel"
                          id="phone"
                          placeholder="Nhập số điện thoại"
                          autoComplete="tel"
                          inputMode="numeric"
                          disabled={values.isAnonymous}
                          className="flex h-10 w-full min-w-0 rounded-md border border-gray-300 bg-gray-100 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 mt-2"
                        />
                        <div className="h-6 mt-1 overflow-hidden">
                          <ErrorMessage 
                            name="phone" 
                            component="div" 
                            className="text-red-500 text-xs sm:text-sm leading-tight"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                      >
                        Hủy
                      </button>
                      <button
                        type="submit"
                        disabled={isPending || isUploadingVideo}
                        className="flex-1 py-2.5 text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="relative bg-white rounded-xl shadow-2xl p-6 max-w-md w-full">
            <button
              onClick={() => setShowErrorModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={20} />
            </button>
            <div className="text-center pt-2">
              <div className="bg-red-100 rounded-full p-3 w-fit mx-auto mb-4">
                <X size={36} className="text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Thông báo</h3>
              <p className="text-sm text-gray-600 mb-6 break-words">
                {errorMessage}
              </p>
              <button
                onClick={() => setShowErrorModal(false)}
                className="w-full px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

