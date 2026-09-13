(function(){
  function attach(){
    var vids=document.querySelectorAll(".hero-media video");
    if(!vids.length)return;
    vids.forEach(function(v){
      v.muted=true;v.defaultMuted=true;v.playsInline=true;v.setAttribute("muted","");v.setAttribute("playsinline","");v.setAttribute("webkit-playsinline","");v.autoplay=true;v.loop=true;
      var go=function(){var p=v.play();if(p&&p.catch)p.catch(function(){})};
      if(v.readyState>=2)go();
      v.addEventListener("loadeddata",go,{once:false});
      v.addEventListener("canplay",go,{once:false});
      v.addEventListener("canplaythrough",go,{once:false});
      v.addEventListener("stalled",go,{once:false});
    });
    var once=function(){vids.forEach(function(v){var p=v.play();if(p&&p.catch)p.catch(function(){})})};
    document.addEventListener("touchstart",once,{once:true,passive:true});
    document.addEventListener("click",once,{once:true});
    document.addEventListener("scroll",once,{once:true,passive:true});
    document.addEventListener("visibilitychange",function(){if(!document.hidden)once()});
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",attach);else attach();
  window.addEventListener("load",function(){setTimeout(attach,300)});
})();
