/* Mushu Birthday FX
   - Cuenta regresiva y desbloqueo automático (00:00 del 14/12)
   - Canvas: constelación + confetti + deseos + fuegos
   - Tilt/Parallax + orb interactivo
   - Carta tipeada + sonido (WebAudio) sin archivos
*/

(() => {
  // ========= CONFIG =========
  const CONFIG = {
    unlock: { year: 2025, month: 12, day: 14, hour: 0, minute: 0, second: 0 }, // 14/12 00:00
    names: { person: "Osidaysi", nickname: "Mushu" },
    headlineLocked: "La caja se abre a medianoche.",
    headlineOpen: "Feliz cumpleaños, Mushu.",
    letter: `Mushu ❤️

Hoy el mundo se pone bonito porque existes.
No quiero un "feliz cumple" cualquiera:
quiero que te acuerdes que te miro con orgullo,
que me das paz, y que mi corazón te elige (sí, todos los días).

Que este año te devuelva en amor lo que tú das sin pedir.
Y que cada vez que dudes, te acuerdes de esto:
yo estoy. Yo te cuido. Yo te celebro.

Feliz cumpleaños, Osidaysi.
Mi Mushu.`,
    wishes: [
      "Salud ✨","Amor 💖","Risas 🤭","Calma 🌙","Sueños 🌠","Abrazos 🤗","Brillo ✨","Fortuna 🍀",
      "Viajes 🧳","Paz ☁️","Energía ⚡","Magia 🪄"
    ]
  };


  // ========= Timezone-safe Uruguay time =========
  const TZ = "America/Montevideo";

  function tsInTZ(d, tz=TZ){
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      hour12: false,
    }).formatToParts(d).reduce((acc,p)=>{ acc[p.type]=p.value; return acc; }, {});
    const y = Number(parts.year), mo = Number(parts.month), da = Number(parts.day);
    const h = Number(parts.hour), mi = Number(parts.minute), s = Number(parts.second);
    return Date.UTC(y, mo-1, da, h, mi, s);
  }

  function targetTsUruguay(){
    const u = CONFIG.unlock;
    return Date.UTC(u.year, u.month-1, u.day, u.hour, u.minute, u.second);
  }


  // ========= DOM =========
  const $ = (id) => document.getElementById(id);
  const el = {
    cdD: $("cdD"), cdH: $("cdH"), cdM: $("cdM"), cdS: $("cdS"),
    headline: $("headline"), sub: $("sub"),
    tzLine: $("tzLine"),
    statusPill: $("statusPill"), unlockPill: $("unlockPill"),
    clockLine: $("clockLine"),
    btnSound: $("btnSound"),
    btnFX: $("btnFX"),
    btnBurst: $("btnBurst"),
    btnWishes: $("btnWishes"),
    orb: $("orb"),
    heroCard: $("heroCard"),
    type: $("type"),
    caret: $("caret"),
    finalTitle: $("finalTitle"),
    finalText: $("finalText"),
    panel1: $("panel1"),
    fx: $("fx"),
  };

  // ========= Helpers =========
  const pad2 = (n) => String(n).padStart(2,"0");
  const clamp = (v,a,b) => Math.max(a, Math.min(b, v));
  const rand = (a,b) => a + Math.random()*(b-a);
  const pick = (arr) => arr[(Math.random()*arr.length)|0];

  function unlockDateLocal(){
    const u = CONFIG.unlock;
    return new Date(u.year, u.month-1, u.day, u.hour, u.minute, u.second);
  }

  // ========= Audio (WebAudio) =========
  let audioOn = false;
  let ctx = null;

  function ensureAudio(){
    if(!ctx){
      ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
    return ctx;
  }

  function chord(){
    if(!audioOn) return;
    try{
      const ac = ensureAudio();
      ac.resume?.();
      const now = ac.currentTime;
      const freqs = [523.25, 659.25, 783.99]; // C5 E5 G5
      freqs.forEach((f,i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o.frequency.setValueAtTime(f, now);
        o.frequency.linearRampToValueAtTime(f*1.02, now + 0.18 + i*0.02);
        g.gain.setValueAtTime(0.0001, now);
        g.gain.exponentialRampToValueAtTime(0.10, now + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35 + i*0.03);
        o.connect(g); g.connect(ac.destination);
        o.start(now); o.stop(now + 0.45 + i*0.03);
      });
    }catch(e){}
  }

  function tick(){
    if(!audioOn) return;
    try{
      const ac = ensureAudio();
      ac.resume?.();
      const now = ac.currentTime;
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(880, now);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.03, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.08);
      o.connect(g); g.connect(ac.destination);
      o.start(now); o.stop(now + 0.09);
    }catch(e){}
  }

  // ========= Typewriter =========
  async function typeText(text){
    el.type.textContent = "";
    el.caret.style.display = "inline-block";
    el.type.appendChild(el.caret);

    const pause = (ms) => new Promise(r => setTimeout(r, ms));

    let i=0;
    while(i < text.length){
      const ch = text[i];
      el.caret.insertAdjacentText("beforebegin", ch);
      i++;

      let delay = 14 + Math.random()*26;

      if(ch === "\n") delay += 170;
      if(ch === "." || ch === "!" || ch === "?" ) delay += 220;
      if(ch === "," || ch === ";" || ch === ":" ) delay += 110;

      const tail = text.slice(Math.max(0, i-30), i);
      if(/yo estoy\.$/i.test(tail)) delay += 260;
      if(/yo te cuido\.$/i.test(tail)) delay += 220;
      if(/yo te celebro\.$/i.test(tail)) delay += 260;
      if(/mi mushu\.$/i.test(tail)) delay += 220;

      await pause(delay);
    }
    el.caret.style.display = "none";
  }

  // ========= Tilt / Parallax =========
  function attachTilt(node){
    let mx=0, my=0, inside=false;

    const onMove = (x,y) => {
      const r = node.getBoundingClientRect();
      const nx = (x - (r.left + r.width/2)) / (r.width/2);
      const ny = (y - (r.top + r.height/2)) / (r.height/2);
      mx = clamp(nx,-1,1);
      my = clamp(ny,-1,1);
    };

    const raf = () => {
      if(!inside){
        node.style.transform = `perspective(900px) rotateX(0deg) rotateY(0deg)`;
        return;
      }
      const rx = (-my * 6);
      const ry = (mx * 8);
      node.style.transform = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(0)`;
      requestAnimationFrame(raf);
    };

    node.addEventListener("pointerenter", () => { inside=true; requestAnimationFrame(raf); });
    node.addEventListener("pointerleave", () => { inside=false; });
    node.addEventListener("pointermove", (e) => onMove(e.clientX, e.clientY));
  }

  // ========= Canvas FX =========
  const FX = (() => {
    const c = el.fx;
    const ctx2 = c.getContext("2d", { alpha: true });
    let DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
    let W=0, H=0;

    let enabled = true;

    const pointer = { x: 0, y: 0, down:false, vx:0, vy:0, px:0, py:0, t:0 };
    const stars = [];
    const confetti = [];
    const sparks = [];
    const words = [];
    const fireworks = [];

    function resize(){
      DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      W = c.width = Math.floor(window.innerWidth * DPR);
      H = c.height = Math.floor(window.innerHeight * DPR);
      c.style.width = "100%";
      c.style.height = "100%";
      stars.length = 0;
      const count = Math.floor((window.innerWidth * window.innerHeight) / 14000);
      for(let i=0;i<count;i++){
        stars.push({
          x: Math.random()*W,
          y: Math.random()*H,
          r: rand(0.8, 2.2)*DPR,
          tw: rand(0.002, 0.01),
          a: rand(0.10, 0.55),
          hue: Math.random()<.5 ? 315 : 270
        });
      }
    }
    window.addEventListener("resize", resize);

    function setEnabled(v){
      enabled = v;
      if(!enabled){
        ctx2.clearRect(0,0,W,H);
      }
    }

    function onPointer(e){
      const x = (e.clientX || 0) * DPR;
      const y = (e.clientY || 0) * DPR;
      pointer.vx = x - pointer.px;
      pointer.vy = y - pointer.py;
      pointer.px = x; pointer.py = y;
      pointer.x = x; pointer.y = y;
    }

    window.addEventListener("pointermove", onPointer, { passive:true });
    window.addEventListener("pointerdown", (e) => { pointer.down=true; onPointer(e); burst(pointer.x, pointer.y, 18); });
    window.addEventListener("pointerup", () => { pointer.down=false; });

    function glowCircle(x,y,r, color, alpha){
      ctx2.save();
      ctx2.globalAlpha = alpha;
      const g = ctx2.createRadialGradient(x,y,0,x,y,r);
      g.addColorStop(0, color);
      g.addColorStop(1, "rgba(0,0,0,0)");
      ctx2.fillStyle = g;
      ctx2.beginPath();
      ctx2.arc(x,y,r,0,Math.PI*2);
      ctx2.fill();
      ctx2.restore();
    }

    function burst(x,y,n=80){
      for(let i=0;i<n;i++){
        sparks.push({
          x, y,
          vx: rand(-2.2,2.2)*DPR,
          vy: rand(-2.6,1.6)*DPR,
          life: rand(40, 90),
          r: rand(1.2, 2.8)*DPR,
          hue: Math.random()<.5 ? 315 : 270,
          a: rand(0.25, 0.65)
        });
      }
    }

    function confettiRain(n=180){
      for(let i=0;i<n;i++){
        confetti.push({
          x: Math.random()*W,
          y: -40*DPR,
          vx: rand(-1.2, 1.2)*DPR,
          vy: rand(2.0, 5.5)*DPR,
          r: rand(2.0, 5.5)*DPR,
          rot: rand(0, Math.PI*2),
          vr: rand(-0.10, 0.10),
          life: rand(180, 320),
          col: Math.random()<.5 ? "rgba(255,79,216,.90)" : "rgba(138,43,226,.90)"
        });
      }
    }

    function dropWish(x,y){
      words.push({
        x, y,
        text: pick(CONFIG.wishes),
        vx: rand(-0.8,0.8)*DPR,
        vy: rand(-2.2,-0.9)*DPR,
        a: 0.0,
        life: rand(70, 120),
        scale: rand(0.95, 1.15),
      });
    }

    function firework(x,y){
      fireworks.push({
        x,y,
        t:0,
        done:false,
        hue: Math.random()<.5 ? 315 : 270
      });
    }

    function step(){
      if(!enabled) return requestAnimationFrame(step);
      ctx2.clearRect(0,0,W,H);

      const speed = Math.hypot(pointer.vx, pointer.vy);
      glowCircle(pointer.x, pointer.y, (90 + speed*0.8)*DPR, "rgba(255,79,216,.22)", 0.8);
      glowCircle(pointer.x, pointer.y, (120 + speed*1.2)*DPR, "rgba(138,43,226,.18)", 0.8);

      ctx2.save();
      ctx2.lineWidth = 1*DPR;
      for(const s of stars){
        s.a += Math.sin((performance.now()*s.tw)) * 0.0008;
        const a = clamp(s.a, 0.08, 0.65);
        ctx2.fillStyle = `hsla(${s.hue}, 95%, 75%, ${a})`;
        ctx2.beginPath();
        ctx2.arc(s.x, s.y, s.r, 0, Math.PI*2);
        ctx2.fill();

        const dx = s.x - pointer.x;
        const dy = s.y - pointer.y;
        const d = Math.hypot(dx,dy);
        if(d < 160*DPR){
          const la = (1 - d/(160*DPR))*0.25;
          ctx2.strokeStyle = `rgba(255,214,247,${la})`;
          ctx2.beginPath();
          ctx2.moveTo(s.x, s.y);
          ctx2.lineTo(pointer.x, pointer.y);
          ctx2.stroke();
        }
      }
      ctx2.restore();

      for(let i=sparks.length-1;i>=0;i--){
        const p = sparks[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.03*DPR;
        p.vx *= 0.99;
        p.life -= 1;

        glowCircle(p.x, p.y, 18*DPR, `hsla(${p.hue}, 95%, 70%, .18)`, 1);
        ctx2.fillStyle = `hsla(${p.hue}, 95%, 70%, ${p.a})`;
        ctx2.beginPath();
        ctx2.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx2.fill();

        if(p.life <= 0 || p.y > H + 60*DPR) sparks.splice(i,1);
      }

      for(let i=confetti.length-1;i>=0;i--){
        const p = confetti[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.02*DPR;
        p.rot += p.vr;
        p.life -= 1;

        ctx2.save();
        ctx2.translate(p.x, p.y);
        ctx2.rotate(p.rot);
        ctx2.fillStyle = p.col;
        ctx2.fillRect(-p.r, -p.r, p.r*2.2, p.r*1.5);
        ctx2.restore();

        if(p.life <= 0 || p.y > H + 60*DPR) confetti.splice(i,1);
      }

      ctx2.save();
      ctx2.font = `${Math.floor(16*DPR)}px "DM Sans", system-ui, sans-serif`;
      ctx2.textBaseline = "middle";
      for(let i=words.length-1;i>=0;i--){
        const w = words[i];
        w.x += w.vx;
        w.y += w.vy;
        w.vy += 0.02*DPR;
        w.life -= 1;
        w.a = Math.min(1, w.a + 0.05);
        const alpha = Math.min(w.a, w.life/40);
        ctx2.globalAlpha = alpha;
        ctx2.fillStyle = "rgba(255,255,255,.92)";
        ctx2.fillText(w.text, w.x, w.y);
        glowCircle(w.x + 24*DPR, w.y, 40*DPR, "rgba(255,214,247,.14)", 1);

        if(w.life <= 0) words.splice(i,1);
      }
      ctx2.restore();

      for(let i=fireworks.length-1;i>=0;i--){
        const f = fireworks[i];
        f.t += 1;
        const t = f.t;
        const maxT = 55;
        const prog = t/maxT;
        const r = (prog*prog) * 220*DPR;
        const a = (1-prog) * 0.55;

        ctx2.save();
        ctx2.globalAlpha = a;
        ctx2.strokeStyle = `hsla(${f.hue}, 95%, 70%, ${a})`;
        ctx2.lineWidth = 2*DPR;
        ctx2.beginPath();
        ctx2.arc(f.x, f.y, r, 0, Math.PI*2);
        ctx2.stroke();
        ctx2.restore();

        const points = 26;
        for(let k=0;k<points;k++){
          const ang = (k/points)*Math.PI*2 + prog*0.6;
          const px = f.x + Math.cos(ang)*r;
          const py = f.y + Math.sin(ang)*r;
          glowCircle(px, py, 20*DPR, `hsla(${f.hue},95%,70%,.18)`, 1);
          ctx2.fillStyle = `hsla(${f.hue},95%,70%,${a})`;
          ctx2.beginPath();
          ctx2.arc(px, py, 2.2*DPR, 0, Math.PI*2);
          ctx2.fill();
        }

        if(t >= maxT) fireworks.splice(i,1);
      }

      requestAnimationFrame(step);
    }

    function megaShow(){
      confettiRain(260);
      for(let i=0;i<7;i++){
        setTimeout(() => firework(rand(0.2*W, 0.8*W), rand(0.15*H, 0.55*H)), i*220);
      }
      burst(W*0.5, H*0.22, 60);
    }

    resize();
    requestAnimationFrame(step);

    return { setEnabled, burst, confettiRain, dropWish, firework, megaShow };
  })();

  // ========= Unlock logic =========
  let unlocked = false;

  function updateClockUI(){
    const now = new Date();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "desconocida";
    el.tzLine.textContent = `TZ detectada: ${tz}. (Apertura fija en Uruguay: ${TZ})`;
    el.clockLine.textContent = `Hora local: ${now.toLocaleString("es-UY", { hour12:false })}`;
    el.unlockPill.textContent = `Desbloqueo (Uruguay): 14/12/${CONFIG.unlock.year}, 00:00:00`;

    const diff = targetTsUruguay() - tsInTZ(now, TZ);
    if(diff <= 0){
      setCountdown(0);
      if(!unlocked) openGift();
      return;
    }
    setCountdown(diff);
  }

  function setCountdown(ms){
    const total = Math.max(0, Math.floor(ms/1000));
    const d = Math.floor(total / 86400);
    const h = Math.floor((total % 86400) / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;

    el.cdD.textContent = pad2(d);
    el.cdH.textContent = pad2(h);
    el.cdM.textContent = pad2(m);
    el.cdS.textContent = pad2(s);

    if(audioOn && total <= 10 && total > 0 && s !== 0){
      tick();
    }
  }

  async function openGift(){
    if(unlocked) return;
    unlocked = true;

    document.body.classList.remove("locked");
    el.statusPill.textContent = "Estado: abierto";
    el.headline.textContent = CONFIG.headlineOpen;
    el.finalTitle.textContent = "Feliz cumpleaños, Mushu 💖";
    el.finalText.textContent =
      "Si tocas o haces clic en el fondo, sueltas chispas y deseos. Y sí: lo hice para ti.";

    document.body.classList.add("opened");
    FX.megaShow();
    chord();

    const ov = document.getElementById("midnightOverlay");
    if(ov){
      ov.classList.add("on");
      setTimeout(()=>ov.classList.remove("on"), 3200);
    }

    await typeText(CONFIG.letter);
    el.orb.classList.add("open");

    let t = 0;
    const id = setInterval(() => {
      if(t++ > 16) return clearInterval(id);
      FX.dropWish(rand(0.15*el.fx.width, 0.75*el.fx.width), rand(0.2*el.fx.height, 0.6*el.fx.height));
    }, 180);
  }

  // ========= Interactions =========
  function setupButtons(){
    el.btnSound.addEventListener("click", async () => {
      audioOn = !audioOn;
      el.btnSound.textContent = `Sonido: ${audioOn ? "ON" : "OFF"}`;
      if(audioOn){
        try{
          ensureAudio();
          await ctx.resume?.();
          chord();
        }catch(e){}
      }
    });

    let fxOn = true;
    el.btnFX.addEventListener("click", () => {
      fxOn = !fxOn;
      el.btnFX.textContent = `Efectos: ${fxOn ? "ON" : "OFF"}`;
      FX.setEnabled(fxOn);
    });

    el.btnBurst.addEventListener("click", () => {
      FX.confettiRain(120);
      FX.firework(rand(0.2*el.fx.width, 0.8*el.fx.width), rand(0.18*el.fx.height, 0.55*el.fx.height));
      for(let i=0;i<10;i++){
        FX.dropWish(rand(0.12*el.fx.width, 0.86*el.fx.width), rand(0.22*el.fx.height, 0.70*el.fx.height));
      }
      chord();
    });

    el.btnWishes.addEventListener("click", () => {
      FX.dropWish(rand(0.20*el.fx.width, 0.80*el.fx.width), rand(0.25*el.fx.height, 0.70*el.fx.height));
      FX.burst(rand(0.15*el.fx.width, 0.85*el.fx.width), rand(0.2*el.fx.height, 0.7*el.fx.height), 14);
    });

    el.orb.addEventListener("pointerdown", (e) => {
      const rect = el.fx.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (el.fx.width / rect.width);
      const y = (e.clientY - rect.top) * (el.fx.height / rect.height);
      FX.burst(x, y, 26);
      FX.dropWish(x + 14, y - 8);
      if(unlocked) chord();
    });

    window.addEventListener("pointerdown", (e) => {
      const rect = el.fx.getBoundingClientRect();
      const x = (e.clientX - rect.left) * (el.fx.width / rect.width);
      const y = (e.clientY - rect.top) * (el.fx.height / rect.height);
      FX.burst(x, y, unlocked ? 24 : 10);
      if(unlocked) FX.dropWish(x + 18, y - 8);
    });

    attachTilt(el.panel1);
  }

  // ========= Init =========
  function init(){
    document.body.classList.add("locked");
    el.statusPill.textContent = "Estado: bloqueado";
    el.headline.textContent = CONFIG.headlineLocked;
    el.type.textContent = "⏳ Esperando la hora mágica";

    const u = unlockDateLocal();
    el.unlockPill.textContent = `Desbloqueo: ${u.toLocaleString("es-UY", { hour12:false })}`;

    setInterval(updateClockUI, 250);
    updateClockUI();
    setupButtons();
  }

  init();
})();
