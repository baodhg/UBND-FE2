import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Phone, Mail, Globe, Facebook } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { committeeApi } from "../../features/committee/api/committeeApi";
import { QuocHuy } from "../atoms/QuocHuy";

export const Footer: React.FC = () => {
  const { data: committeeInfo, isLoading } = useQuery({
    queryKey: ["committee"],
    queryFn: () => committeeApi.getCommittee(),
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  if (isLoading) return <div className="p-4">Đang tải thông tin...</div>;
  const committee = committeeInfo?.data;
  if (!committee) return null;

  return (
    <footer
      className="text-white w-full"
      style={{ backgroundColor: "#1A202C" }}
    >
      <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Column 1: Ward Information */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8">
                <QuocHuy />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">
                  Phường Tăng Nhơn Phú
                </h3>
                <p className="text-xs text-gray-400">TP. Thủ Đức</p>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Cổng thông tin điện tử - Kết nối cư dân với chính quyền địa
              phương, cung cấp dịch vụ hành chính công hiện đại và hiệu quả.
            </p>
          </div>

          {/* Column 2: Contact Information */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">
              Thông tin liên hệ
            </h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin
                  size={16}
                  className="text-blue-500 mt-0.5 flex-shrink-0"
                />
                <a
                  href={committeeInfo?.data.link_google_map || "#"}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {committee.dia_chi_tru_so}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={16} className="text-blue-500 flex-shrink-0" />
                <a
                  href={`tel:${committee.so_dien_thoai}`}
                  className="text-xs text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {committee.so_dien_thoai}
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={16} className="text-blue-500 flex-shrink-0" />
                <a
                  href={`mailto:${committee.email}`}
                  className="text-xs text-gray-300 hover:text-blue-400 transition-colors"
                >
                  {committee.email}
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Liên kết</h4>
            <div className="space-y-1.5">
              <Link
                to="/"
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Globe size={14} />
                <span>Cổng thông tin Quận 9</span>
              </Link>
              <a
                href="https://hochiminhcity.gov.vn/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Globe size={14} />
                <span>TP. Hồ Chí Minh</span>
              </a>
              <a
                href="https://www.facebook.com/UBNDPHUONGTANGNHONPHU"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-blue-400 transition-colors"
              >
                <Facebook size={14} />
                <span>Facebook Phường</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
