import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Layout } from './layout'
import HomePage from './pages/index'
import { NotesPage } from './pages/NotesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/notes" element={<NotesPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
