import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { InstrumentsPage } from "./pages/InstrumentsPage";
import { EventsPage } from "./pages/EventsPage";
import Painel from "./pages/Painel";


export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/instrumentos", Component: InstrumentsPage },
  { path: "/eventos", Component: EventsPage },
  { path: "/painel", Component: Painel },
  { path: "*", Component: HomePage }
]);
