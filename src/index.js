import './assets/main.scss'
import initSmoothScrolling from './utils/initializeSmoothScroll'
import gsap from 'gsap'
import ScrollTrigger from "gsap/ScrollTrigger";
import { setProxyOnGsapScrollTrigger } from './utils/setScrollProxy';

gsap.registerPlugin(ScrollTrigger);

document.addEventListener("DOMContentLoaded", () => {

  const scrollBar = initSmoothScrolling()

  setProxyOnGsapScrollTrigger(scrollBar)
})