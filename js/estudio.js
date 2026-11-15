/* LitleJacob Studio Web · interacción y animaciones (v2, 15/11/2026)
   Librerías (CDN, versión fija, cargadas con defer antes que este archivo): GSAP 3.13.0 + ScrollTrigger, Lenis 1.3.4.
   Si alguna no carga, la página funciona igual (sin animaciones). */
(function(){
  var quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pcFino = matchMedia('(min-width: 900px) and (pointer: fine)').matches;

  /* ---------- Menú del celular ---------- */
  var btn=document.getElementById('menu'),dr=document.getElementById('drawer');
  btn.addEventListener('click',function(){var o=dr.hidden;dr.hidden=!o;btn.setAttribute('aria-expanded',String(o));btn.setAttribute('aria-label',o?'Cerrar menú':'Abrir menú');});
  dr.addEventListener('click',function(e){if(e.target.tagName==='A'){dr.hidden=true;btn.setAttribute('aria-expanded','false');}});

  /* ---------- Copiar número ---------- */
  document.getElementById('copy').addEventListener('click',function(){
    var el=document.getElementById('wsp'),m=document.getElementById('copy-msg');
    function sel(){var r=document.createRange();r.selectNodeContents(el);var s=getSelection();s.removeAllRanges();s.addRange(r);m.textContent='Número seleccionado: cópialo manualmente.';}
    try{navigator.clipboard.writeText(el.textContent.replace(/\s/g,'')).then(function(){m.textContent='Número copiado.';},sel);}catch(e){sel();}
  });

  /* ---------- Menú con línea al bajar ---------- */
  var nav=document.querySelector('nav');
  function navSombra(){nav.classList.toggle('scrolled',scrollY>8);}
  addEventListener('scroll',navSombra,{passive:true});navSombra();

  /* ---------- Videos: se cargan cerca de la pantalla y solo se reproducen mientras se ven ---------- */
  var videos=[].slice.call(document.querySelectorAll('video[data-lazy]'));
  function cargar(v){if(v.dataset.cargado)return;v.dataset.cargado='1';[].forEach.call(v.querySelectorAll('source[data-src]'),function(s){s.src=s.dataset.src;});v.load();}
  function play(v){if(quieto)return;var p=v.play();if(p&&p.catch)p.catch(function(){});}
  if('IntersectionObserver' in window){
    var cerca=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cargar(e.target);cerca.unobserve(e.target);}});},{rootMargin:'400px 0px'});
    var visto=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cargar(e.target);play(e.target);}else{e.target.pause();}});},{threshold:.35});
    videos.forEach(function(v){cerca.observe(v);visto.observe(v);});
  }else{videos.forEach(function(v){cargar(v);play(v);});}
  if(quieto){[].forEach.call(document.querySelectorAll('video[autoplay]'),function(v){v.removeAttribute('autoplay');v.pause();});}

  /* ---------- Precio tachado (si no hay GSAP, igual funciona) ---------- */
  var packs=document.querySelector('.packs');
  function precioAntes(){
    if(!packs||quieto)return null;
    var r=packs.getBoundingClientRect();
    if(r.top<=innerHeight*0.6)return null;
    packs.classList.add('pre');
    return function(){setTimeout(function(){packs.classList.remove('pre');},500);};
  }

  /* ---------- Sin GSAP: solo el precio con IntersectionObserver ---------- */
  if(quieto||!window.gsap||!window.ScrollTrigger){
    var fin=precioAntes();
    if(fin&&'IntersectionObserver' in window){var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){io.disconnect();fin();}});},{threshold:.35});io.observe(packs);}
    else if(fin){fin();}
    return;
  }

  /* ---------- Con GSAP ---------- */
  var gsap=window.gsap,ST=window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add('gs');

  /* Desplazamiento suave solo en PC (en celular el normal es más rápido) */
  if(pcFino&&window.Lenis){
    var lenis=new window.Lenis({duration:1.1,smoothWheel:true});
    lenis.on('scroll',ST.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000);});
    gsap.ticker.lagSmoothing(0);
    document.addEventListener('click',function(e){
      var a=e.target.closest&&e.target.closest('a[href^="#"]');if(!a)return;
      var id=a.getAttribute('href');var t=id.length>1&&document.querySelector(id);if(!t)return;
      e.preventDefault();lenis.scrollTo(t,{offset:-70});history.replaceState(null,'',id);
    });
  }

  /* Portada: título palabra por palabra, texto y dispositivos */
  var hero=gsap.timeline({defaults:{ease:'power3.out'}});
  hero.from('.hero .eyebrow',{y:14,opacity:0,duration:.6})
      .from('.hero h1 .w > span',{yPercent:110,duration:.9,stagger:.06},'-=.35')
      .from('.hero h1 + p, .hero .cta',{y:18,opacity:0,duration:.7,stagger:.1},'-=.55')
      .from('.stage .laptop',{y:40,opacity:0,duration:1},'-=.9')
      .from('.stage .cel',{y:70,opacity:0,duration:1},'-=.75')
      .from('.stage figcaption',{opacity:0,duration:.6},'-=.4');

  /* Movimiento leve de los dispositivos al bajar */
  gsap.to('.stage .laptop',{yPercent:-6,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.stage .cel',{yPercent:-16,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

  /* Aparición de bloques y grupos */
  gsap.utils.toArray('[data-reveal]').forEach(function(el){
    gsap.from(el,{y:32,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  gsap.utils.toArray('[data-stagger]').forEach(function(g){
    gsap.from(g.children,{y:36,opacity:0,duration:.8,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:g,start:'top 85%',once:true}});
  });

  /* Números que cuentan */
  gsap.utils.toArray('[data-count]').forEach(function(el){
    var n={v:0},meta=+el.dataset.count;
    gsap.to(n,{v:meta,duration:1.2,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true},onUpdate:function(){el.textContent=Math.round(n.v);}});
  });

  /* Precio tachado */
  var finPrecio=precioAntes();
  if(finPrecio)ST.create({trigger:packs,start:'top 70%',once:true,onEnter:finPrecio});

  /* Proceso: la línea dorada se llena al bajar */
  var vertical=matchMedia('(max-width: 860px)').matches;
  gsap.fromTo('.track i',vertical?{scaleY:0}:{scaleX:0},Object.assign(vertical?{scaleY:1}:{scaleX:1},{ease:'none',scrollTrigger:{trigger:'.proc',start:'top 80%',end:'bottom 55%',scrub:true}}));

  addEventListener('load',function(){ST.refresh();});
})();
