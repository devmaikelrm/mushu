# Mushu Birthday Site 💜🩷

## Qué es
Una mini web “sorpresa” para cumpleaños con:
- Cuenta regresiva y desbloqueo automático (14/12 00:00)
- Efectos canvas (constelación, confetti, fuegos, “deseos”)
- Parallax/tilt, carta con máquina de escribir, sonido sin archivos (WebAudio)

## Cómo usar
1) Abre `index.html` en el navegador (doble clic).
2) Si lo dejas abierto, se desbloquea solo al llegar 00:00 del 14/12.

## Personalizar en 10 segundos
Edita `app.js`:
- `CONFIG.unlock` (año/mes/día/hora)
- `CONFIG.letter` (tu carta)
- `CONFIG.wishes` (las frases que vuelan)

## Poner fotos reales (opcional)
En `index.html`, en la sección `gallery`, reemplaza los div `.ph` por imágenes:

Ejemplo:
```html
<div class="ph" style="background-image:url('./assets/foto1.jpg'); background-size:cover; background-position:center;"></div>
```

Luego crea una carpeta `assets/` y pon `foto1.jpg`, etc.

## Subir a internet (gratis)
- GitHub Pages o Netlify: subes la carpeta tal cual.


## Fotos
Las fotos ya están incluidas en `assets/`.
- principal.jpg (orb central)
- divertida.jpg, brillo.jpg, normal.jpg, normal1.jpg (galería)
