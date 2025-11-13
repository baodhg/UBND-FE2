import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Facebook } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="text-white" style={{ backgroundColor: '#1A202C' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Column 1: Ward Information */}
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🏛️</span>
              </div>
              <div>
                <h3 className="text-white">Phường Tăng Nhơn Phú</h3>
                <p className="text-sm text-gray-400">Quận 9, TP. Thủ Đức</p>
              </div>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Cổng thông tin điện tử - Kết nối cư dân với chính quyền địa phương, 
              cung cấp dịch vụ hành chính công hiện đại và hiệu quả.
            </p>
          </div>

          {/* Column 2: Contact Information */}
          <div>
            <h4 className="text-white mb-4">Thông tin liên hệ</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <MapPin size={18} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm">
                  Số 123 Đường Tăng Nhơn Phú<br />
                  Phường Tăng Nhơn Phú A, Quận 9<br />
                  TP. Thủ Đức, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={18} className="text-blue-500 flex-shrink-0" />
                <p className="text-sm">(028) 1234 5678</p>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={18} className="text-blue-500 flex-shrink-0" />
                <p className="text-sm">lienhe@tangnhonphu.gov.vn</p>
              </div>
            </div>
          </div>

          {/* Column 3: Links */}
          <div>
            <h4 className="text-white mb-4">Liên kết</h4>
            <div className="space-y-2">
              <Link
                to="#"
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Globe size={16} />
                <span>Cổng thông tin Quận 9</span>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Globe size={16} />
                <span>TP. Thủ Đức</span>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Globe size={16} />
                <span>TP. Hồ Chí Minh</span>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Facebook size={16} />
                <span>Facebook Phường</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-500">
            © 2025 UBND Phường Tăng Nhơn Phú. Bản quyền đã được bảo hộ.
          </p>
          <div className="flex gap-6 text-sm text-gray-500">
            <Link to="#" className="hover:text-blue-400 transition-colors">
              Chính sách bảo mật
            </Link>
            <Link to="#" className="hover:text-blue-400 transition-colors">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
