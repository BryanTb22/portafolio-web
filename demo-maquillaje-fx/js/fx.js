/* Sombra FX · movimiento (v3, 15/11/2026). Mismo patrón que portafolio-web/js/estudio.js.
   Librerías (CDN, versión fija, con defer antes que este archivo): GSAP 3.13.0 + ScrollTrigger, Lenis 1.3.4.
   Si alguna no carga, la página funciona igual (sin animaciones). La web tiene pestañas (data-page):
   las animaciones se arman solo para lo que se ve y se vuelven a armar al cambiar de pestaña. */
(function(){
  var quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pcFino=matchMedia('(min-width: 900px) and (pointer: fine)').matches;

  /* ---------- Menú con línea al bajar ---------- */
  var head=document.querySelector('header');
  function linea(){head.classList.toggle('scrolled',scrollY>8);}
  addEventListener('scroll',linea,{passive:true});linea();

  /* ---------- Videos de la portada ---------- */
  var clip=document.querySelector('.hero-clip video[data-src]');
  if(clip&&matchMedia('(min-width: 961px)').matches){clip.src=clip.dataset.src;if(!quieto){var p=clip.play();if(p&&p.catch)p.catch(function(){});}}
  if(quieto){[].forEach.call(document.querySelectorAll('video[autoplay]'),function(v){v.removeAttribute('autoplay');v.pause();});}
  /* el video de fondo solo corre mientras se ve */
  var bgv=document.querySelector('.hero2 .bgv');
  if(bgv&&!quieto&&'IntersectionObserver' in window){
    new IntersectionObserver(function(es){es.forEach(function(e){
      if(e.isIntersecting){var p=e.target.play();if(p&&p.catch)p.catch(function(){});}else e.target.pause();
    });},{threshold:.05}).observe(bgv);
  }

  if(quieto||!window.gsap||!window.ScrollTrigger)return;

  /* ---------- Con GSAP ---------- */
  var gsap=window.gsap,ST=window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add('gs');

  /* Desplazamiento suave solo en PC. Las pestañas usan window.SFX_LENIS (ver route() en index.html). */
  if(pcFino&&window.Lenis){
    var lenis=new window.Lenis({duration:1.1,smoothWheel:true});
    lenis.on('scroll',ST.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000);});
    gsap.ticker.lagSmoothing(0);
    window.SFX_LENIS=lenis;
    /* paneles con su propio scroll: carrito, pago y video */
    ['items','modal','vbox'].forEach(function(id){var el=document.getElementById(id);if(el)el.setAttribute('data-lenis-prevent','');});
  }

  /* Portada: título palabra por palabra */
  var hero=gsap.timeline({defaults:{ease:'power3.out'}});
  hero.from('.hero2 .live',{y:14,opacity:0,duration:.6})
      .from('.hero2 h1 .w > span',{yPercent:110,duration:1,stagger:.07},'-=.35')
      .from('.hero2 .lead, .hero2 .hero-cta, .hero2 .meta',{y:18,opacity:0,duration:.8,stagger:.1},'-=.6')
      .from('.hero-clip',{y:50,opacity:0,duration:1.1},'-=1');

  /* Movimiento leve (parallax) en la portada y el cierre */
  gsap.to('.hero-clip',{yPercent:-10,ease:'none',scrollTrigger:{trigger:'.hero2',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero2 .wrap',{y:-60,ease:'none',scrollTrigger:{trigger:'.hero2',start:'top top',end:'bottom top',scrub:true}});
  gsap.fromTo('#contacto .bgc',{yPercent:-6},{yPercent:6,ease:'none',scrollTrigger:{trigger:'#contacto',start:'top bottom',end:'bottom top',scrub:true}});

  var vertical=matchMedia('(max-width: 860px)').matches;
  function visible(el){return el.offsetParent!==null||el.getClientRects().length>0;}
  function armar(){
    gsap.utils.toArray('[data-reveal]').forEach(function(el){
      if(el.dataset.armado||!visible(el))return;el.dataset.armado='1';
      gsap.from(el,{y:32,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
    });
    gsap.utils.toArray('[data-stagger]').forEach(function(g){
      if(g.dataset.armado||!visible(g))return;g.dataset.armado='1';
      /* grupos grandes (galería): cada pieza aparece cuando llega a la pantalla */
      if(g.children.length>6){
        gsap.set(g.children,{y:36,opacity:0});
        ST.batch(g.children,{start:'top 92%',once:true,onEnter:function(els){gsap.to(els,{y:0,opacity:1,duration:.8,ease:'power3.out',stagger:.07,overwrite:true});}});
        return;
      }
      gsap.from(g.children,{y:36,opacity:0,duration:.8,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:g,start:'top 86%',once:true}});
    });
    /* barras de cupos que se llenan */
    gsap.utils.toArray('.cupos .bar i').forEach(function(b){
      if(b.dataset.armado||!visible(b))return;b.dataset.armado='1';
      gsap.from(b,{scaleX:0,duration:1.2,ease:'power2.out',scrollTrigger:{trigger:b,start:'top 92%',once:true}});
    });
    /* línea del proceso que se llena al bajar */
    var tr=document.querySelector('.pasos .track i');
    if(tr&&!tr.dataset.armado&&visible(tr)){tr.dataset.armado='1';
      gsap.fromTo(tr,vertical?{scaleY:0}:{scaleX:0},Object.assign(vertical?{scaleY:1}:{scaleX:1},{ease:'none',scrollTrigger:{trigger:'.pasos',start:'top 80%',end:'bottom 60%',scrub:true}}));
    }
    ST.refresh();
  }
  armar();
  /* al cambiar de pestaña (route() corre antes que esto) */
  addEventListener('hashchange',function(){setTimeout(armar,30);});
  /* filtros de la galería y del nivel de cursos cambian el alto de la página */
  document.addEventListener('click',function(e){
    if(!e.target.closest('#filters .f,#lvl [data-l]'))return;
    /* al filtrar, lo elegido se muestra al instante */
    var g=e.target.closest('#filters')?document.getElementById('gallery'):document.getElementById('courseGrid');
    gsap.killTweensOf(g.children);gsap.set(g.children,{y:0,opacity:1});
    setTimeout(function(){ST.refresh();},30);
  });
  addEventListener('load',function(){ST.refresh();});
})();
