/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import { createStore } from "solid-js/store";
import * as zebar from "zebar";

const providers = zebar.createProviderGroup({
  audio: { type: "audio" },
  cpu: { type: "cpu", refreshInterval: 1000 },
  memory: { type: "memory", refreshInterval: 1000 },
  weather: { type: "weather" },
  media: { type: "media" },
  date: {
    type: "date",
    formatting: "cccc, LLLL dd | TT",
    refreshInterval: 1000,
  },
  glazewm: { type: "glazewm" },
});

render(() => <App />, document.getElementById("root")!);

function App() {
  const [output, setOutput] = createStore(providers.outputMap);

  providers.onOutput((outputMap) => setOutput(outputMap));

  const splitDate = () => output.date?.formatted?.split(" | ") ?? ["", ""];

  const dateStr = () => splitDate()[0];
  const timeStr = () => splitDate()[1];
  return (
    <div class="app">
      <div class="left">
        <div class="module cyan">
          <span class="icon">󰸗</span> {dateStr()}
        </div>
        <div class="module yellow">
          <span class="icon">󰑭</span> {Math.round(output.memory?.usage ?? 0)}%
        </div>
      </div>
      <div class="center">
        <div class="module red workspace-mod">
          32
          {[...Array(8)].map((_, i) => (
            <div
              class={`workspace ${output.glazewm?.focusedWorkspace?.name === (i + 1).toString() ? "active" : ""}`}
              onClick={() =>
                output.glazewm?.runCommand(`focus --workspace ${i + 1}`)
              }
            />
          ))}
        </div>
      </div>
      <div class="right">
        <div class="module green">
          <span class="icon"> </span> {Math.round(output.cpu?.usage ?? 0)}%
        </div>
        <div class="module purple">
          <span class="icon"></span> {timeStr()}
        </div>
      </div>
    </div>
  );
}
