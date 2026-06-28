// router.tsx
import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { InstrumentsPage } from "./pages/InstrumentsPage";
import { EventsPage } from "./pages/EventsPage";
import Painel from "./pages/Painel";
import LoginPage from './pages/Login';
import {AdminPage} from './pages/AdminPage';

import { ProtectedRoute } from './auth/ProtectedRoute';

export const router = createBrowserRouter([
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
  { path: "/login", Component: LoginPage },
  { path: "*", Component: HomePage }
]);