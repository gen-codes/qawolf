import React from "react";
import {
  BrowserRouter as Router,
  Link,
  Redirect,
  Route,
  Switch
} from "react-router-dom";
import ContentEditables from "./pages/ContentEditables";
import Selects from "./pages/Selects";
import TextInputs from "./pages/TextInputs";
// CSS
import "./App.css";

function Navigation() {
  return (
    <ul>
      <li>
        <Link to="/content-editables">Content editables</Link>
      </li>
      <li>
        <Link to="/selects">Selects</Link>
      </li>
      <li>
        <Link to="/text-inputs">Text inputs</Link>
      </li>
    </ul>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        <Route component={Navigation} exact path="/" />
        <Route component={ContentEditables} path="/content-editables" />
        <Route component={Selects} path="/selects" />
        <Route component={TextInputs} path="/text-inputs" />
        <Redirect to="/" />
      </Switch>
    </Router>
  );
}

export default App;
