import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { Suspense, lazy } from "react";
// import Devices from './Modules/AdminModule/Pages/Devices/index';
// import Sidebar from './Common/SideBar/Sidebar';
// import Devices from "./Modules/AdminModule/Pages/Devices"

const Intents = lazy(() => import('./Modules/Intents/Intents'));
const CheckIn = lazy(() => import('./Modules/CheckIn/CheckIn'));
const Devices = lazy(() => import('./Modules/AdminModule/Pages/Devices/index'));
const Sidebar = lazy(() => import('./Common/SideBar/Sidebar'));

function App() {

  return (
    <Router>
      <Sidebar />
      <Routes>

        <Route
          path="/intents"
          element={<Intents />}
        />
        <Route
          path="/admin/devices"
          element={
            <Suspense fallback={<div>Devices are loading please wait...</div>} >
              <Devices />
            </Suspense>}
        />
        <Route
          path="/check-in"
          element={<CheckIn />}
        />
        {/*   <Route
            path="/services"
            element={<Services />}
        />
        <Route
            path="/services/services1"
            element={<ServicesOne />}
        />
        <Route
            path="/services/services2"
            element={<ServicesTwo />}
        />
        <Route
            path="/services/services3"
            element={<ServicesThree />}
        />
        <Route
            path="/contact"
            element={<Contact />}
        />
        <Route
            path="/events"
            element={<Events />}
        />
        <Route
            path="/events/events1"
            element={<EventsOne />}
        />
        <Route
            path="/events/events2"
            element={<EventsTwo />}
        />
        <Route
            path="/support"
            element={<Support />} 
        />*/}
      </Routes>
    </Router>
  );
}

export default App;
