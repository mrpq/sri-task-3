import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import registerServiceWorker from "./registerServiceWorker";

import "./main.css";
import "core-js/fn/array/find";
import "core-js/fn/array/includes";

ReactDOM.render(<App />, document.getElementById("root"));
registerServiceWorker();
