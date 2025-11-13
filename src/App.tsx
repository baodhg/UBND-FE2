import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider } from './context/AuthContext'
import { MainLayout } from './layouts/MainLayout'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { ProfilePage } from './pages/ProfilePage'
import { ProceduresPage } from './pages/ProceduresPage'
import { NewsPage } from './pages/NewsPage'
import { FeedbackPage } from './pages/FeedbackPage'

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<MainLayout><HomePage /></MainLayout>} />
            <Route path="/procedures" element={<MainLayout><ProceduresPage /></MainLayout>} />
            <Route path="/news" element={<MainLayout><NewsPage /></MainLayout>} />
            <Route path="/feedback" element={<MainLayout><FeedbackPage /></MainLayout>} />
            <Route path="/login" element={<MainLayout><LoginPage /></MainLayout>} />
            <Route path="/profile" element={<MainLayout><ProfilePage /></MainLayout>} />
            <Route path="/report" element={<MainLayout><ReportPage /></MainLayout>} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
