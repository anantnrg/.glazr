/* @refresh reload */
import "./index.css";
import { render } from "solid-js/web";
import { createSignal, onCleanup, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import * as zebar from "zebar";
import { MediaWidget } from "./MediaWidget";

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

function cleanTitle(title: string, artist: string): string {
  let t = title;

  const artistPattern = new RegExp(`^${artist}\\s*-\\s*`, "i");
  t = t.replace(artistPattern, "");

  t = t.replace(/\[.*?\]/g, "");
  t = t.replace(/No\.?\s*\d+/gi, "");
  t = t.replace(/[\p{Emoji_Presentation}]/gu, "");

  return t.trim();
}

function App() {
  const [output, setOutput] = createStore(providers.outputMap);
  const [shouldScroll, setShouldScroll] = createSignal(false);
  let titleRef: HTMLSpanElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  providers.onOutput((outputMap) => setOutput(outputMap));

  const splitDate = () => output.date?.formatted?.split(" | ") ?? ["", ""];

  const dateStr = () => splitDate()[0];
  const timeStr = () => splitDate()[1];

  const [isOnline, setIsOnline] = createSignal(navigator.onLine);

  onMount(() => {
    const updateStatus = () => setIsOnline(navigator.onLine);
    updateStatus();
    const interval_status = setInterval(updateStatus, 5000);
    onCleanup(() => clearInterval(interval_status));

    const checkScroll = () => {
      if (titleRef && containerRef) {
        const needsScroll = titleRef.scrollWidth > containerRef.clientWidth;
        setShouldScroll(needsScroll);
      }
    };

    requestAnimationFrame(checkScroll);

    const interval_scroll = setInterval(checkScroll, 3000);
    onCleanup(() => clearInterval(interval_scroll));
  });

  const cleanedTitle = () => {
    const session = output.media?.currentSession;
    if (!session) return "";
    return cleanTitle(session.title || "", session.artist || "");
  };

  return (
    <div class="app">
      <div class="left">
        <div class="module cyan">
          <span class="icon">󰸗</span> {dateStr()}
        </div>
        <div class="module yellow">
          <span class="icon">󰑭</span> {Math.round(output.memory?.usage ?? 0)}%
        </div>
        <div class="module blue">
          <span class="icon">{isOnline() ? "󰖩" : "󰖪"}</span>
          {isOnline() ? "Online" : "Offline"}
        </div>
      </div>
      <div class="center">
        <div class="module red workspace-mod">
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
        <div class="module red media">
          <MediaWidget session={output.media?.currentSession} />
        </div>
        <div class="module green">
          <span class="icon"> </span> {Math.round(output.cpu?.usage ?? 0)}%
        </div>
        <div class="module purple">
          <span class="icon">󰥔</span> {timeStr()}
        </div>
      </div>
    </div>
  );
}
