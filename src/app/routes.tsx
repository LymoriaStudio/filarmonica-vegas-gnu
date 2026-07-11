// router.tsx
import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { InstrumentsPage } from "./pages/InstrumentsPage";
import { EventsPage } from "./pages/EventsPage";
import Painel from "./pages/Painel";
import LoginPage from './pages/Login';
import {AdminPage} from './pages/AdminPage';
import PerfilPage from './pages/PerfilPage';
import { ProtectedRoute } from './auth/ProtectedRoute';
import RootLayout from './RootLayout';
import ErrorPage from './pages/ErrorPage';

export const router = createBrowserRouter([
  {
    Component: RootLayout,
    errorElement: <ErrorPage />,
    children: [
      { path: "/", Component: HomePage },
      { path: "/instrumentos", Component: InstrumentsPage },
      { path: "/eventos", Component: EventsPage },
      {
        path: "/painel",
        element: (
          <ProtectedRoute>
            <Painel />
          </ProtectedRoute>
        )
      },
      {
        path: "/admin",
        element: (
          <ProtectedRoute>
            <AdminPage />
          </ProtectedRoute>
        )
      },
      {
        path: "/painel/perfil",
        element: (
          <ProtectedRoute>
            <PerfilPage />
          </ProtectedRoute>
        )
      },
      { path: "/login", Component: LoginPage },
      { path: "*", Component: ErrorPage },
    ]
  }
]);
