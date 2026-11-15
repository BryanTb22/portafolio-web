/* ALBA · movimiento (v1, 15/11/2026)
   Librerías (CDN, versión fija, con defer antes que este archivo): GSAP 3.13.0 + ScrollTrigger, Lenis 1.3.4 (solo PC).
   La tienda llama a los ganchos de window.ALBA_MOV (grilla, abrir, cerrar, ficha, pago, ir).
   Si GSAP no carga o la persona pidió "reducir movimiento", los ganchos quedan vacíos y todo funciona igual. */
(function(){
  var quieto=matchMedia('(prefers-reduced-motion: reduce)').matches;
  var pcFino=matchMedia('(min-width: 900px) and (pointer: fine)').matches;
  var MOV=window.ALBA_MOV=window.ALBA_MOV||{};
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return [].slice.call((r||document).querySelectorAll(s))};

  /* Encabezado con sombra fina al bajar (también sin GSAP) */
  var header=$('header');
  function sombra(){header.classList.toggle('scrolled',scrollY>8)}
  addEventListener('scroll',sombra,{passive:true});sombra();

  if(quieto||!window.gsap||!window.ScrollTrigger) return;

  var gsap=window.gsap,ST=window.ScrollTrigger;
  gsap.registerPlugin(ST);
  document.documentElement.classList.add('gs');
  var SALE={opacity:1,x:0,y:0,ease:'power3.out',clearProps:'opacity,transform'};
  function entra(el,desde,extra){if(!el||(el.length===0))return;return gsap.fromTo(el,desde,Object.assign({},SALE,extra))}

  /* ---------- Desplazamiento suave solo en PC ---------- */
  var lenis=null;
  if(pcFino&&window.Lenis){
    lenis=new window.Lenis({duration:1.1,smoothWheel:true});
    lenis.on('scroll',ST.update);
    gsap.ticker.add(function(t){lenis.raf(t*1000)});
    gsap.ticker.lagSmoothing(0);
    MOV.ir=function(y,suave){lenis.scrollTo(y,{immediate:!suave,duration:1.2,force:true})};
    document.addEventListener('click',function(e){
      if(e.defaultPrevented)return;
      var a=e.target.closest&&e.target.closest('a[href="#"]');if(!a)return;
      e.preventDefault();lenis.scrollTo(0,{duration:1.2});
    });
  }

  /* ---------- Portada: foto que se acerca, título por palabras ---------- */
  var hero=gsap.timeline({defaults:{ease:'power3.out'}});
  hero.fromTo('.hero-img',{scale:1.16},{scale:1.08,duration:2.4,ease:'power2.out'},0)
      .from('.hero .kick',{y:12,opacity:0,duration:.7},.25)
      .from('.hero h1 .w > span',{yPercent:110,duration:1,stagger:.08},.35)
      .fromTo('.hero .tx .btn',{y:14,opacity:0},{y:0,opacity:1,duration:.7,clearProps:'opacity,transform'},'-=.6');
  gsap.to('.hero-img',{yPercent:4,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
  gsap.to('.hero .tx',{y:-40,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});

  /* ---------- Bloques que aparecen al bajar ---------- */
  $$('[data-reveal]').forEach(function(el){
    gsap.from(el,{y:28,opacity:0,duration:.9,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  $$('[data-stagger]').forEach(function(g){
    gsap.from(g.children,{y:32,opacity:0,duration:.85,ease:'power3.out',stagger:.08,scrollTrigger:{trigger:g,start:'top 86%',once:true}});
  });
  /* Banda partida: la foto se asienta mientras pasa */
  gsap.fromTo('.split-img',{scale:1.12},{scale:1,ease:'none',scrollTrigger:{trigger:'.split',start:'top bottom',end:'bottom top',scrub:true}});

  /* ---------- Catálogo: tarjetas en cascada (también después de filtrar o buscar) ---------- */
  var grid=$('#grid'),antes=[],lote=[],titulo=$('#tTitle'),tituloAntes=titulo.textContent,refrescar=0;
  function animarTarjetas(cards){
    lote.forEach(function(t){t.kill()});lote=[];
    var vh=innerHeight,ya=[],luego=[];
    cards.forEach(function(c){var r=c.getBoundingClientRect();if(r.top>=vh*.96)luego.push(c);else if(r.bottom>0)ya.push(c);});
    entra(ya,{opacity:0,y:22},{duration:.75,stagger:.05});
    if(luego.length){
      gsap.set(luego,{opacity:0,y:28});
      lote=ST.batch(luego,{start:'top 94%',once:true,onEnter:function(b){entra(b,{opacity:0,y:28},{duration:.8,stagger:.07,overwrite:true})}});
    }
  }
  function idsDe(){return $$('.card',grid).map(function(c){return c.dataset.open})}
  MOV.grilla=function(ids){
    var cards=$$('.card',grid),desde=0;
    var crece=ids.length>antes.length&&antes.every(function(id,i){return ids[i]===id});
    var quita=ids.length<antes.length&&ids.every(function(id){return antes.indexOf(id)>-1});
    if(crece)desde=antes.length;
    if(quita){lote.forEach(function(t){t.kill()});lote=[];}
    else animarTarjetas(cards.slice(desde));
    var vacio=$('.none',grid);if(vacio)entra(vacio,{opacity:0,y:12},{duration:.6});
    if(titulo.textContent!==tituloAntes){tituloAntes=titulo.textContent;entra(titulo,{opacity:0,y:10},{duration:.6});}
    entra($('#cnt'),{opacity:0},{duration:.5});
    antes=ids.slice();
    cancelAnimationFrame(refrescar);refrescar=requestAnimationFrame(function(){ST.refresh(true)}); /* true: espera a que termine el desplazamiento en curso */
  };
  antes=idsDe();animarTarjetas($$('.card',grid));

  /* ---------- Capas: carrito, menú, ficha y pago ---------- */
  MOV.abrir=function(el){
    if(lenis)lenis.stop();
    if(el.id==='cart'){entra($$('#items > *'),{opacity:0,x:18},{duration:.6,stagger:.05,delay:.15});entra($('#cartF'),{opacity:0,y:14},{duration:.6,delay:.25});}
    if(el.id==='menu')entra($$('.mnav a'),{opacity:0,x:-16},{duration:.6,stagger:.045,delay:.15});
  };
  MOV.cerrar=function(){if(lenis)lenis.start()};
  MOV.ficha=function(){
    var box=$('#pbox');
    entra($$('.gal img',box),{opacity:0,scale:1.04},{scale:1,duration:1,stagger:.08});
    entra($$('.pi > *',box),{opacity:0,y:12},{duration:.65,stagger:.045,delay:.12});
  };
  MOV.pago=function(n){
    var box=$('#cbox');
    if(n===3){
      entra($('.done .ok',box),{opacity:0,scale:.6},{scale:1,duration:.7,ease:'back.out(1.8)'});
      gsap.fromTo($('.done .ok path',box),{strokeDashoffset:24},{strokeDashoffset:0,duration:.6,delay:.3,ease:'power2.out'});
      entra($$('.done > :not(.ok)',box),{opacity:0,y:12},{duration:.6,stagger:.07,delay:.2});
      return;
    }
    entra($$('.ckm > *',box),{opacity:0,y:10},{duration:.55,stagger:.035,delay:.05});
  };

  /* ---------- Detalles: corazón que late y contadores que saltan ---------- */
  document.addEventListener('click',function(e){
    var f=e.target.closest&&e.target.closest('.fav[data-fav]');if(!f)return;
    setTimeout(function(){$$('.fav[data-fav="'+f.dataset.fav+'"].on svg').forEach(function(s){gsap.fromTo(s,{scale:.55},{scale:1,duration:.55,ease:'back.out(3)',clearProps:'transform'})})},0);
  });
  ['#cartN','#favN'].forEach(function(s){
    var b=$(s),ultimo=b.textContent;
    new MutationObserver(function(){
      if(b.textContent===ultimo)return;ultimo=b.textContent;
      if(b.classList.contains('on'))gsap.fromTo(b,{scale:1.45},{scale:1,duration:.5,ease:'back.out(3)',clearProps:'transform'});
    }).observe(b,{childList:true,characterData:true,subtree:true});
  });

  addEventListener('load',function(){ST.refresh()});
})();
