import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/HomePage";
import { InstrumentsPage } from "./pages/InstrumentsPage";
import { EventsPage } from "./pages/EventsPage";

export const router = createBrowserRouter([
  { path: "/", Component: HomePage },
  { path: "/instrumentos", Component: InstrumentsPage },
  { path: "/eventos", Component: EventsPage },
  { path: "*", Component: HomePage },
]);
