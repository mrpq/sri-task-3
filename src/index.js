import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

import "./main.css";
import "./utils/diagram.js";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
