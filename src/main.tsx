import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
import Providers from "./components/Providers.tsx";
import "./index.css";
import Capture from "./pages/capture.tsx";
import ErrorPage from "./pages/error-page.tsx";

const router = createBrowserRouter([
  {
    path: "/",
    errorElement: <ErrorPage />,
    element: <Providers />,
    children: [
      {
        index: true,
        element: <App />,
      },
      {
        path: "capture",
        element: <Capture />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>,
);
