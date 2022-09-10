import SmoothScrollbar from "smooth-scrollbar";

export default function initSmoothScrolling() {

  // Init smooth scrollbar
  const view = document.getElementById("viewport");

  const Scrollbar = SmoothScrollbar.init(view, 
    {
      renderByPixels: true,
      damping: 0.09,
      continuousScrolling: false
    });

  Scrollbar.setPosition(0, 0);
  Scrollbar.track.xAxis.element.remove()

  return Scrollbar

}