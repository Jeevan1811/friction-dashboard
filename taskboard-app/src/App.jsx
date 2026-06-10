import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import Layout from './Layout.jsx'
import TaskBoard from './pages/TaskBoard.jsx'
import Analytics from './pages/Analytics.jsx'
import Clients from './pages/Clients.jsx'
import Docs from './pages/Docs.jsx'
import Backend from './pages/Backend.jsx'

const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true,           element: <TaskBoard /> },
      { path: 'analytics',     element: <Analytics /> },
      { path: 'clients',       element: <Clients /> },
      { path: 'docs',          element: <Docs /> },
      { path: 'backend',       element: <Backend /> },
    ],
  },
])

export default function App() {
  return <RouterProvider router={router} />
}
