import { createSignal, createEffect, onCleanup, onMount } from "solid-js";

export function MediaWidget(props: { session?: any }) {
  const [shouldScroll, setShouldScroll] = createSignal(false);
  let titleRef: HTMLSpanElement | undefined;
  let containerRef: HTMLDivElement | undefined;

  const cleanTitle = (title: string, artist: string): string => {
    const artistPattern = new RegExp(`^${artist}\\s*-\\s*`, "i");
    return title
      .replace(artistPattern, "")
      .replace(/\[.*?\]/g, "")
      .replace(/No\.?\s*\d+/gi, "")
      .replace(/[\p{Emoji_Presentation}]/gu, "")
      .trim();
  };

  const cleanedTitle = () => {
    if (!props.session) return "";
    return cleanTitle(props.session.title || "", props.session.artist || "");
  };

  const checkScroll = () => {
    if (!titleRef || !containerRef) return;
    const needsScroll = titleRef.scrollWidth > containerRef.clientWidth;
    setShouldScroll(needsScroll);
  };

  onMount(() => {
    checkScroll();
    const int = setInterval(checkScroll, 3000);
    onCleanup(() => clearInterval(int));
  });

  createEffect(() => {
    props.session?.title && checkScroll();
  });

  return (
    <div class="module red media">
      <span class="icon"></span>
      <div class="media-scroll-wrapper" ref={(el) => (containerRef = el)}>
        <span
          ref={(el) => (titleRef = el)}
          class="media-title"
          classList={{ scroll: shouldScroll() }}
          style={{
            transform: `translateX(${scrolling() ? scrollX() + "px" : "0"})`,
            transition: scrolling() ? "transform 8s ease-in-out" : "none",
          }}
        >
          {cleanedTitle()}, {artist}
        </span>
      </div>
    </div>
  );
}
