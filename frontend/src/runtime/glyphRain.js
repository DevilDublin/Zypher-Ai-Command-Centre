export function startGlyphRain(canvas){
  const ctx = canvas.getContext("2d");

  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };

  resize();
  window.addEventListener("resize", resize);

  const glyphs = "アカサタナハマヤラワ0123456789∆◼︎⧫⟁⟐";
  const fontSize = 16;
  let columns = Math.floor(canvas.width / fontSize);
  let drops = Array(columns).fill(0);

  ctx.font = fontSize + "px monospace";

  function draw(){
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "rgba(0,255,255,0.45)";

    for(let i = 0; i < drops.length; i++){
      const char = glyphs[Math.floor(Math.random() * glyphs.length)];
      ctx.fillText(char, i * fontSize, drops[i] * fontSize);

      if(drops[i] * fontSize > canvas.height && Math.random() > 0.975){
        drops[i] = 0;
      }
      drops[i]++;
    }
  }

  let raf;
  function loop(){
    draw();
    raf = requestAnimationFrame(loop);
  }
  loop();

  return () => cancelAnimationFrame(raf);
}
