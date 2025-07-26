import { createSignal, onCleanup, onMount } from "solid-js";

export function MediaWidget(props: { session?: any }) {
  const [scrollX, setScrollX] = createSignal(0);
  const [transition, setTransition] = createSignal("none");

  let titleRef: HTMLSpanElement | undefined;
  let containerRef: HTMLDivElement | undefined;
  let scrollTimer: number | undefined;

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
    if (!props.session || !isKagi()) return "Nothing is playing...";
    return cleanTitle(props.session.title || "", props.session.artist || "");
  };

  const isKagi = () => props.session?.sessionId?.toLowerCase() === "kagi.exe";

  const animateScroll = () => {
    if (!titleRef || !containerRef || !isKagi()) return;

    const titleWidth = titleRef.scrollWidth;
    const containerWidth = containerRef.clientWidth;

    if (titleWidth <= containerWidth) {
      setScrollX(0);
      setTransition("none");
      return;
    }

    const distance = titleWidth - containerWidth;

    setTransition("transform 8s ease-in-out");
    setScrollX(-distance);

    scrollTimer = window.setTimeout(() => {
      setTransition("transform 8s ease-in-out");
      setScrollX(0);
    }, 8000);
  };

  const restartScroll = () => {
    if (scrollTimer) clearTimeout(scrollTimer);
    animateScroll();
  };

  onMount(() => {
    restartScroll();
    const interval = setInterval(restartScroll, 18000);
    onCleanup(() => {
      clearInterval(interval);
      if (scrollTimer) clearTimeout(scrollTimer);
    });
  });

  return (
    <div class="red media">
      <span class="icon"></span>
      <div class="media-scroll-wrapper" ref={containerRef}>
        <span
          ref={titleRef}
          class="media-title"
          style={{
            transform: `translateX(${scrollX()}px)`,
            transition: transition(),
          }}
        >
          {cleanedTitle()}
          {isKagi() && props.session?.artist ? `, ${props.session.artist}` : ""}
        </span>
      </div>
    </div>
  );
}
