import { h, render } from "preact";
import App from "./App";

const log = (val: any, prefix = "") => console.log(prefix, val);

log("hello there! whats up?!");

render(h(App, null), document.querySelector("#root") )