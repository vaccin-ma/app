import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Signup from './pages/Signup'
import Signin from './pages/Signin'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import './App.css'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LandingPage />,
  },
  {
    path: '/signup',
    element: <Signup />,
  },
  {
    path: '/signin',
    element: <Signin />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />,
  },
  {
    path: '/admin',
    element: <AdminDashboard />,
  },
])

function App() {
  return <RouterProvider router={router} />
}

export default App
