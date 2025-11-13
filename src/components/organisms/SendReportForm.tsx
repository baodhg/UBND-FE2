import React, { useState } from 'react'
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { Button } from '../atoms/Button'

interface SendReportFormValues {
  reportType: string
  description: string
  images: File[]
  location: string
  isAnonymous: boolean
  fullName: string
  phoneNumber: string
}

const SendReportSchema = Yup.object().shape({
  reportType: Yup.string().required('Loại phản ánh là bắt buộc'),
  description: Yup.string()
    .max(2000, 'Mô tả không được vượt quá 2000 ký tự')
    .required('Mô tả là bắt buộc'),
  images: Yup.array()
    .max(5, 'Chỉ được tải lên tối đa 5 hình ảnh')
    .test('fileSize', 'Mỗi file tối đa 3MB', (files) => {
      if (!files) return true
      return files.every((file: any) => file.size <= 3 * 1024 * 1024)
    }),
  location: Yup.string().required('Địa điểm là bắt buộc'),
  isAnonymous: Yup.boolean(),
  fullName: Yup.string().when('isAnonymous', {
    is: false,
    then: (schema) => schema.required('Họ và tên là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
  phoneNumber: Yup.string().when('isAnonymous', {
    is: false,
    then: (schema) =>
      schema
        .matches(/^[0-9]{10}$/, 'Số điện thoại phải có 10 chữ số')
        .required('Số điện thoại là bắt buộc khi không gửi ẩn danh'),
    otherwise: (schema) => schema.notRequired(),
  }),
})

export const SendReportForm: React.FC = () => {
  const [imagePreview, setImagePreview] = useState<string[]>([])

  const initialValues: SendReportFormValues = {
    reportType: '',
    description: '',
    images: [],
    location: '',
    isAnonymous: false,
    fullName: '',
    phoneNumber: '',
  }

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    setFieldValue: (field: string, value: any) => void
  ) => {
    const files = Array.from(event.target.files || [])
    if (files.length > 5) {
      alert('Chỉ được tải lên tối đa 5 hình ảnh')
      return
    }

    // Check file sizes
    const oversizedFiles = files.filter((file) => file.size > 3 * 1024 * 1024)
    if (oversizedFiles.length > 0) {
      alert('Mỗi file tối đa 3MB')
      return
    }

    setFieldValue('images', files)

    // Create preview URLs
    const previews = files.map((file) => URL.createObjectURL(file))
    setImagePreview(previews)
  }

  const handleSubmit = (values: SendReportFormValues) => {
    console.log('Form values:', values)
    // Handle form submission here
    alert('Gửi phản ánh thành công!')
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={SendReportSchema}
      onSubmit={handleSubmit}
    >
      {({ values, setFieldValue }) => (
        <Form className="space-y-4 max-w-4xl">
          {/* Loại phản ánh */}
          <div>
            <label htmlFor="reportType" className="block text-sm font-medium text-gray-700 mb-2">
              Loại phản ánh <span className="text-red-500">*</span>
            </label>
            <Field
              as="select"
              name="reportType"
              className="bg-gray-100 w-full px-4 py-2.5 text-base rounded-lg focus:outline-none "
            >
              <option value="" className="bg-white text-gray-900">Chọn loại phản ánh</option>
              <option value="infrastructure" className="bg-white hover:bg-gray-100 border hover:border-gray-300">Cơ sở hạ tầng</option>
              <option value="environment" className="bg-white hover:bg-gray-100 border hover:border-gray-300">Môi trường</option>
              <option value="traffic" className="bg-white hover:bg-gray-100 border hover:border-gray-300">Giao thông</option>
              <option value="security" className="bg-white hover:bg-gray-100 border hover:border-gray-300">An ninh trật tự</option>
              <option value="education" className="bg-white hover:bg-gray-100 border hover:border-gray-300">Giáo dục</option>
              <option value="healthcare" className="bg-white hover:bg-gray-100 border hover:border-gray-300">Y tế</option>
              <option value="other" className="bg-white hover:bg-gray-100 border hover:border-gray-300">Khác</option>
            </Field>
            <ErrorMessage name="reportType" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Mô tả chi tiết */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <Field
              name="description"
              as="textarea"
              rows={4}
              placeholder="Mô tả chi tiết vấn đề (tối đa 2000 ký tự)"
              className="bg-gray-100 w-full px-4 py-2.5 text-base rounded-lg focus:ring-4 focus:ring-gray-300 focus:border focus:border-gray-400 focus:outline-none"
            />
            <ErrorMessage
              name="description"
              component="div"
              className="text-red-500 text-sm mt-1"
            />
            <div className="text-sm text-gray-500 mt-1">
              {values.description.length}/2000 ký tự
            </div>
          </div>

          {/* Hình ảnh/Video */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hình ảnh/Video <span className="text-gray-500">(Tùy chọn)</span>
            </label>
            <div className="border-2 border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50 transition-colors bg-white">
              <input
                type="file"
                accept="image/*,video/*"
                multiple
                max={5}
                id="images"
                className="hidden"
                onChange={(e) => handleImageChange(e, setFieldValue)}
              />
              <label
                htmlFor="images"
                className="cursor-pointer flex items-center justify-center gap-2"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-base text-gray-600">
                  Thêm ảnh/video ({values.images.length}/5)
                </span>
              </label>
            </div>
            <div className="text-sm text-gray-500 mt-2">Mỗi file tối đa 3MB</div>
            <ErrorMessage name="images" component="div" className="text-red-500 text-sm mt-1" />

            {/* Image Preview */}
            {imagePreview.length > 0 && (
              <div className="grid grid-cols-5 gap-2 mt-3">
                {imagePreview.map((preview, index) => (
                  <img
                    key={index}
                    src={preview}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-20 object-cover rounded-lg"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Địa điểm */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </span>
              <Field
                name="location"
                as="input"
                type="text"
                placeholder="Nhập địa chỉ hoặc khu phố"
                className="w-full pl-11 pr-4 py-2.5 text-base border border-gray-300 rounded-lg"
              />
            </div>
            <ErrorMessage name="location" component="div" className="text-red-500 text-sm mt-1" />
          </div>

          {/* Gửi ẩn danh */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-base font-medium text-gray-900">Gửi ẩn danh</div>
                <div className="text-sm text-gray-600">Không hiển thị thông tin cá nhân</div>
              </div>
              <button
                type="button"
                onClick={() => setFieldValue('isAnonymous', !values.isAnonymous)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  values.isAnonymous ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    values.isAnonymous ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Họ và tên (hiển thị khi không ẩn danh) */}
          {!values.isAnonymous && (
            <div className="bg-white rounded-lg p-6 border border-gray-200">
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="fullName"
                    as="input"
                    type="text"
                    placeholder="Nhập họ và tên"
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <ErrorMessage
                    name="fullName"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>

                {/* Số điện thoại */}
                <div>
                  <label
                    htmlFor="phoneNumber"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <Field
                    name="phoneNumber"
                    as="input"
                    type="tel"
                    placeholder="Nhập số điện thoại"
                    className="w-full px-4 py-2.5 text-base border border-gray-300 rounded-lg bg-gray-50"
                  />
                  <ErrorMessage
                    name="phoneNumber"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-2">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 text-base">
              Gửi phản ánh
            </Button>
          </div>
        </Form>
      )}
    </Formik>
  )
}
