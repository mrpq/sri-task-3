const diagramHelpers = () => {
  console.log("Hello ???");
  const diagram = document.querySelector(".diagram");
  const setVerticalBarsHeigth = () => {
    console.log("Hello ???");
    const floorsBlock = document.querySelector(".floors");
    const floorsBlockHeight = parseInt(
      window.getComputedStyle(floorsBlock).height,
      10
    );
    const currHourLabelVerticalOffset =
      document.body.offsetWidth < 960 ? 8 : 16;
    const hoursBarStyle = document.createElement("style");
    hoursBarStyle.innerHTML = `.hours__bar {height: ${floorsBlockHeight}px;} .diagram__curr-time-label::after { height: ${floorsBlockHeight +
      currHourLabelVerticalOffset}px;}`;
    document.body.appendChild(hoursBarStyle);
  };
  const fixFloorLabels = () => {
    if (document.body.offsetWidth >= 960) {
      return;
    }
    const floorLabels = document.querySelectorAll(".floor__label");
    floorLabels.forEach(fl => {
      fl.style.left = `${diagram.scrollLeft + 16}px`;
    });
  };
  diagram.addEventListener("scroll", fixFloorLabels);
  window.addEventListener("resize", setVerticalBarsHeigth);
  // fix  vertical bars heights on diagram change
  let observer = new MutationObserver(setVerticalBarsHeigth);
  observer.observe(diagram, { childList: true });
  document.addEventListener("DOMContentLoaded", setVerticalBarsHeigth);
};
// document.addEventListener("DOMContentLoaded", diagramHelpers);
document.addEventListener("load", diagramHelpers);
