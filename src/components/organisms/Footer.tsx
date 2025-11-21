import React from 'react'
import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail, Globe, Facebook, Building2 } from 'lucide-react'

export const Footer: React.FC = () => {
  return (
    <footer className="text-white w-full" style={{ backgroundColor: '#1A202C' }}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Column 1: Ward Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Building2 size={16} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Phường Tăng Nhơn Phú</h3>
                <p className="text-xs text-gray-400">Quận 9, TP. Thủ Đức</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Cổng thông tin điện tử - Kết nối cư dân với chính quyền địa phương, 
              cung cấp dịch vụ hành chính công hiện đại và hiệu quả.
            </p>
          </div>

          {/* Column 2: Contact Information */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Thông tin liên hệ</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-gray-300">
                  Số 123 Đường Tăng Nhơn Phú, Phường Tăng Nhơn Phú A, Quận 9, TP. Thủ Đức, TP. Hồ Chí Minh
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500 flex-shrink-0" />
                <p className="text-xs text-gray-300">(028) 1234 5678</p>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500 flex-shrink-0" />
                <p className="text-xs text-gray-300">lienhe@tangnhonphu.gov.vn</p>
              </div>
            </div>
          </div>

          {/* Column 3: Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Liên kết</h4>
            <div className="space-y-1.5">
              <Link
                to="#"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Globe size={14} />
                <span>Cổng thông tin Quận 9</span>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Globe size={14} />
                <span>TP. Thủ Đức</span>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Globe size={14} />
                <span>TP. Hồ Chí Minh</span>
              </Link>
              <Link
                to="#"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Facebook size={14} />
                <span>Facebook Phường</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
