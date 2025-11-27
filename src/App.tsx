import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { MainLayout } from './layouts/MainLayout'
import { ScrollToTop } from './components/ScrollToTop'
import { HomePage } from './pages/home-page/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProceduresPage } from './pages/procedures-page/ProceduresPage'
import { NewsPage } from './pages/news-page/NewsPage'
import { NewsDetailPage } from './pages/news-page/NewsDetailPage'
import { DashboardPage } from './pages/dashboard-page/DashboardPage'
import { TrackReportPage } from './pages/TrackReportPage'
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/procedures" element={<MainLayout><ProceduresPage /></MainLayout>} />
            <Route path="/news" element={<MainLayout><NewsPage /></MainLayout>} />
            <Route path="/news/:id" element={<MainLayout><NewsDetailPage /></MainLayout>} />
            <Route path="/track-report" element={<MainLayout><TrackReportPage /></MainLayout>} />
            <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
            <Route path="/dashboard" element={<MainLayout><DashboardPage /></MainLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
