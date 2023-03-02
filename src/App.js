import React from "react";
import './App.css';
import Home from "./components/Home";
import Polls from "./components/pollCentre/Polls";
import Poll from "./components/pollCentre/Poll";
import PollCreation from "./components/pollCentre/PollCreation";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';

const App = function AppWrapper() {

    return (
      <BrowserRouter>
        <Routes>
          <Route index element={<Home />} />
          <Route path="/polls" element={<Polls />} />
          <Route path="/vote" element={<Poll />} />
          <Route path="/create" element={<PollCreation />} />
        </Routes>
      </BrowserRouter>
    );
}

export default App;