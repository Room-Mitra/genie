import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";

import Devices from './Modules/AdminModule/Pages/Devices/index';
import Sidebar from './Common/SideBar/Sidebar';
// import Devices from "./Modules/AdminModule/Pages/Devices"

function App() {

  return (
    <Router>
      <Sidebar />
      <Routes>
        <Route
          path="/admin"
          element={<Devices />}
        />
        <Route
          path="/admin/devices"
          element={<Devices />}
        />
        {/* <Route
            path="/about-us/vision"
            element={<OurVision />}
        />
        <Route
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
