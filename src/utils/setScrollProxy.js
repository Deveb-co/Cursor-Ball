import ScrollTrigger from 'gsap/ScrollTrigger';

export function setProxyOnGsapScrollTrigger(scroller) {

  // Kill existing scroll triggers if theres any
  const scrollTriggers = ScrollTrigger.getAll()
  if( scrollTriggers.length ) scrollTriggers.forEach( scrollT => scrollT.kill() )
  
  ScrollTrigger.scrollerProxy(document.body, {
    scrollTop(value) {
      if (arguments.length) {
        scroller.scrollTop = value;
      }
  
      return scroller.scrollTop;
    },
  });
  
  scroller.addListener(ScrollTrigger.update);

}