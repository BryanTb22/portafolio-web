/* Demo Asesor Comercial · animaciones (v1, 15/11/2026) — mismo patrón que portafolio-web/js/estudio.js
   Librerías (CDN, versión fija, con defer antes que este archivo): GSAP 3.13.0 + ScrollTrigger, Lenis 1.3.4.
   Si alguna no carga, la página funciona igual (sin animaciones). */
(function(){
  var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pcFino = matchMedia('(min-width: 900px) and (pointer: fine)').matches;

  /* Menú con sombra al bajar */
  var head=document.getElementById('top');
  function sombra(){head.classList.toggle('scrolled',scrollY>40);}
  addEventListener('scroll',sombra,{passive:true});sombra();

  if(quieto||!window.gsap||!window.ScrollTrigger)return;

  var gsap=window.gsap,ST=window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add('gs');

  /* Aparición corta cuando cambia el contenido (recomendador, filtros del catálogo) */
  window.animar=function(els){
    els=[].slice.call(els||[]);if(!els.length)return;
    gsap.fromTo(els,{y:16,opacity:0},{y:0,opacity:1,duration:.5,ease:'power3.out',stagger:.05,overwrite:true,clearProps:'transform,opacity'});
    ST.refresh();
  };

  /* Desplazamiento suave solo en PC */
  if(pcFino&&window.Lenis){
    var lenis=new window.Lenis({duration:1.1,smoothWheel:true});
    lenis.on('scroll',ST.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000);});
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
      var id=a.getAttribute('href');var t=id.length>1&&document.querySelector(id);if(!t)return;
      e.preventDefault();lenis.scrollTo(t,{offset:-(head.offsetHeight+8)});history.replaceState(null,'',id);
    });
  }

  /* Portada: título palabra por palabra, texto, botones y fotos */
  var tl=gsap.timeline({defaults:{ease:'power3.out'}});
  tl.from('.hero .eyebrow',{y:14,opacity:0,duration:.6})
    .from('.hero h1 .w > span',{yPercent:110,duration:.9,stagger:.05},'-=.35')
    .from('.hero h1 + p, .hero .cta, .hero .trust',{y:18,opacity:0,duration:.7,stagger:.1},'-=.6')
    .from('.collage .ph',{y:50,opacity:0,duration:1,stagger:.12},'-=1.1')
    .from('.collage .badge',{y:20,opacity:0,duration:.6},'-=.5');

  /* Movimiento leve de las fotos al bajar (cada una a su ritmo) */
  [['.p1',-8],['.p2',-18],['.p3',-26]].forEach(function(x){
    gsap.to('.collage '+x[0],{yPercent:x[1],ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  });

  /* Bloques y grupos */
  gsap.utils.toArray('[data-reveal]').forEach(function(el){
    gsap.from(el,{y:32,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  gsap.utils.toArray('[data-stagger]').forEach(function(g){
    gsap.from(g.children,{y:30,opacity:0,duration:.8,ease:'power3.out',stagger:.07,scrollTrigger:{trigger:g,start:'top 86%',once:true}});
  });

  /* Números que cuentan */
  gsap.utils.toArray('[data-count]').forEach(function(el){
    var n={v:0},meta=+el.dataset.count;
    gsap.to(n,{v:meta,duration:1.2,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 92%',once:true},onUpdate:function(){el.textContent=Math.round(n.v);}});
  });

  addEventListener('load',function(){ST.refresh();});
})();
