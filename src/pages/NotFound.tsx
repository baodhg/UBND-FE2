import { useState, useEffect } from "react";

export default function NotFound() {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    if (countdown <= 0) {
      window.location.href = "/";
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  return (
    <div className="text-center mt-20">
      <h2 className="md:text-5xl text-2xl font-bold mb-3">404 - Not Found</h2>
      <p className="md:text-xl text-xl mb-2">Trang bạn tìm kiếm không tồn tại.</p>
      <p className="text-gray-500 mb-2">
        Tự động quay về trang chủ sau <span>{countdown}</span> giây
      </p>
      <button
        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => (window.location.href = "/")}
      >
        Quay về trang chủ
      </button>
    </div>
  );
}
