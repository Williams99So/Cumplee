/* ==========================================================================
   Regalo de cumpleaños — interacciones
   Todo funciona sin librerías ni conexión a internet.
   ========================================================================== */
(function () {
    'use strict';

    var $ = function (s, c) { return (c || document).querySelector(s); };
    var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

    var reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var movil = window.matchMedia('(max-width: 600px)').matches;

    var datos = { mensajes: [], musica: false };
    try { datos = JSON.parse($('#datosApp').textContent); } catch (e) { /* valores por defecto */ }

    function aleatorio(a, b) { return a + Math.random() * (b - a); }
    function elegir(lista) { return lista[Math.floor(Math.random() * lista.length)]; }

    /* ---------------------------------------------------------------
       Aviso flotante
       --------------------------------------------------------------- */
    var aviso = $('#aviso');
    var avisoTimer = null;
    function mostrarAviso(texto, ms) {
        if (!aviso) { return; }
        aviso.textContent = texto;
        aviso.classList.add('visible');
        clearTimeout(avisoTimer);
        avisoTimer = setTimeout(function () { aviso.classList.remove('visible'); }, ms || 2600);
    }

    /* ---------------------------------------------------------------
       Chispas (estrellas y corazones al pulsar)
       --------------------------------------------------------------- */
    var SIMBOLOS = ['✦', '❤', '✨', '💖', '⭐', '✧', '💗'];
    function chispas(x, y, cantidad) {
        if (reducido) { return; }
        cantidad = cantidad || 10;
        for (var i = 0; i < cantidad; i++) {
            var el = document.createElement('span');
            var ang = (Math.PI * 2 * i) / cantidad + aleatorio(-0.3, 0.3);
            var dist = aleatorio(50, 120);
            el.className = 'chispa';
            el.textContent = elegir(SIMBOLOS);
            el.style.left = x + 'px';
            el.style.top = y + 'px';
            el.style.setProperty('--dx', Math.cos(ang) * dist + 'px');
            el.style.setProperty('--dy', Math.sin(ang) * dist - 20 + 'px');
            el.style.setProperty('--giro', aleatorio(-80, 80) + 'deg');
            el.style.setProperty('--t', aleatorio(0.9, 1.7) + 'rem');
            document.body.appendChild(el);
            (function (nodo) { setTimeout(function () { nodo.remove(); }, 1100); })(el);
        }
    }
    function centroDe(el) {
        var r = el.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
    }
    function puntoEvento(ev, el) {
        if (ev && (ev.clientX || ev.clientY)) { return { x: ev.clientX, y: ev.clientY }; }
        return centroDe(el);
    }

    // Estrellas al pulsar botones, tarjetas y fotos
    document.addEventListener('click', function (ev) {
        var objetivo = ev.target.closest('.btn, [data-tarjeta], .polaroid__boton');
        if (!objetivo) { return; }
        var p = puntoEvento(ev, objetivo);
        chispas(p.x, p.y, objetivo.classList.contains('btn') ? 7 : 9);
    });

    /* ---------------------------------------------------------------
       Confeti (canvas)
       --------------------------------------------------------------- */
    var canvas = $('#confeti');
    var ctx = canvas && canvas.getContext ? canvas.getContext('2d') : null;
    var piezas = [];
    var animando = false;
    var COLORES = ['#ff6fa5', '#ff9ec4', '#ffd6e7', '#c9a7ff', '#f3c46a', '#ffffff', '#e83a82', '#a9d8ff'];

    function ajustarCanvas() {
        if (!canvas) { return; }
        var dpr = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(window.innerWidth * dpr);
        canvas.height = Math.floor(window.innerHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function dibujarCorazon(c, s) {
        c.beginPath();
        c.moveTo(0, s * 0.35);
        c.bezierCurveTo(-s, -s * 0.3, -s * 0.5, -s, 0, -s * 0.45);
        c.bezierCurveTo(s * 0.5, -s, s, -s * 0.3, 0, s * 0.35);
        c.closePath();
        c.fill();
    }

    function lanzarConfeti() {
        if (reducido || !ctx) {
            mostrarAviso('¡Feliz cumpleaños, mi amor! 🎉');
            return;
        }
        ajustarCanvas();
        var cuantas = movil ? 90 : 160;
        for (var i = 0; i < cuantas; i++) {
            piezas.push({
                x: aleatorio(0, window.innerWidth),
                y: aleatorio(-window.innerHeight * 0.6, -10),
                vx: aleatorio(-1.2, 1.2),
                vy: aleatorio(2, 5),
                t: aleatorio(7, 15),
                r: aleatorio(0, Math.PI * 2),
                vr: aleatorio(-0.1, 0.1),
                osc: aleatorio(0, Math.PI * 2),
                forma: Math.random() < 0.5 ? 'corazon' : (Math.random() < 0.5 ? 'rect' : 'circulo'),
                color: elegir(COLORES)
            });
        }
        if (!animando) { animando = true; requestAnimationFrame(pasoConfeti); }
    }

    function pasoConfeti() {
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        for (var i = piezas.length - 1; i >= 0; i--) {
            var p = piezas[i];
            p.osc += 0.05;
            p.x += p.vx + Math.sin(p.osc) * 0.8;
            p.y += p.vy;
            p.r += p.vr;
            if (p.y > window.innerHeight + 30) { piezas.splice(i, 1); continue; }
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.r);
            ctx.fillStyle = p.color;
            if (p.forma === 'corazon') { dibujarCorazon(ctx, p.t * 0.8); }
            else if (p.forma === 'rect') { ctx.fillRect(-p.t / 2, -p.t / 4, p.t, p.t / 2); }
            else { ctx.beginPath(); ctx.arc(0, 0, p.t / 3, 0, Math.PI * 2); ctx.fill(); }
            ctx.restore();
        }
        if (piezas.length) { requestAnimationFrame(pasoConfeti); }
        else { animando = false; ctx.clearRect(0, 0, window.innerWidth, window.innerHeight); }
    }
    window.addEventListener('resize', function () { if (animando) { ajustarCanvas(); } });

    /* ---------------------------------------------------------------
       Corazones y brillos flotantes de fondo
       --------------------------------------------------------------- */
    (function fondo() {
        var capa = $('#fondoFlotante');
        if (!capa || reducido) { return; }
        var simbolos = ['❤', '💗', '💕', '✦', '🌸', '✧', '💖', '🦋'];
        var cantidad = movil ? 8 : 15;
        for (var i = 0; i < cantidad; i++) {
            var el = document.createElement('span');
            el.className = 'flota';
            el.textContent = simbolos[i % simbolos.length];
            el.style.setProperty('--x', aleatorio(2, 96) + '%');
            el.style.setProperty('--t', aleatorio(0.9, 1.9) + 'rem');
            el.style.setProperty('--dur', aleatorio(14, 26) + 's');
            el.style.setProperty('--ret', -aleatorio(0, 24) + 's');
            el.style.setProperty('--vaiven', aleatorio(-40, 40) + 'px');
            capa.appendChild(el);
        }
    })();

    /* ---------------------------------------------------------------
       Música (solo si existe un archivo en public/audio/)
       --------------------------------------------------------------- */
    var audio = $('#musica');
    var btnMusica = $('#btnMusica');
    function actualizarMusica(sonando) {
        if (!btnMusica) { return; }
        btnMusica.setAttribute('aria-pressed', sonando ? 'true' : 'false');
        btnMusica.setAttribute('aria-label', sonando ? 'Pausar música' : 'Activar música');
        var texto = $('.btn-musica__texto', btnMusica);
        if (texto) { texto.textContent = sonando ? 'Pausar' : 'Música'; }
    }
    function reproducir() {
        if (!audio) { return; }
        audio.volume = 0.35; // volumen inicial moderado
        var promesa = audio.play();
        if (promesa && promesa.then) {
            promesa.then(function () { actualizarMusica(true); })
                   .catch(function () { actualizarMusica(false); });
        } else { actualizarMusica(true); }
    }
    if (audio && btnMusica) {
        btnMusica.addEventListener('click', function () {
            if (audio.paused) { reproducir(); } else { audio.pause(); actualizarMusica(false); }
        });
        audio.addEventListener('error', function () { btnMusica.hidden = true; });
    }
    // La música es opcional: los botones solo aparecen si existe audio/musica.mp3
    var btnAbrirMusicaEl = $('#btnAbrirMusica');
    function revelarMusica() {
        if (btnMusica) { btnMusica.hidden = false; }
        if (btnAbrirMusicaEl) { btnAbrirMusicaEl.hidden = false; }
    }
    if (audio) {
        audio.addEventListener('loadedmetadata', revelarMusica);
        audio.addEventListener('canplay', revelarMusica);
        if (audio.readyState >= 1) { revelarMusica(); }
    }

    /* ---------------------------------------------------------------
       Bienvenida: abrir el regalo
       --------------------------------------------------------------- */
    var bienvenida = $('#bienvenida');
    var regalo = $('#regalo');
    var btnRegalo = $('#btnAbrirRegalo');
    var btnRegaloMusica = $('#btnAbrirMusica');
    var abriendo = false;

    function abrirRegalo(conMusica) {
        if (abriendo) { return; }
        abriendo = true;
        regalo.classList.add('abriendo');
        var c = centroDe(regalo);
        chispas(c.x, c.y - 30, 16);
        if (conMusica) { reproducir(); }
        setTimeout(function () {
            bienvenida.classList.add('abierta');
            document.body.classList.remove('bloqueado');
            window.scrollTo(0, 0);
            lanzarConfeti();
            abriendo = false;
            if (audio && btnMusica && !btnMusica.hidden && !conMusica && audio.paused) {
                setTimeout(function () { mostrarAviso('Toca ♪ arriba si quieres música 🎶', 3200); }, 1800);
            }
        }, reducido ? 50 : 1100);
    }
    if (btnRegalo) { btnRegalo.addEventListener('click', function () { abrirRegalo(false); }); }
    if (btnRegaloMusica) { btnRegaloMusica.addEventListener('click', function () { abrirRegalo(true); }); }

    /* ---------------------------------------------------------------
       Aparición al desplazarse
       --------------------------------------------------------------- */
    (function revelar() {
        var elementos = $$('.reveal');
        if (!('IntersectionObserver' in window)) {
            elementos.forEach(function (el) { el.classList.add('visible'); });
            return;
        }
        var obs = new IntersectionObserver(function (entradas) {
            entradas.forEach(function (e) {
                if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
        elementos.forEach(function (el) { obs.observe(el); });
    })();

    /* ---------------------------------------------------------------
       Vela del pastel
       --------------------------------------------------------------- */
    var btnVela = $('#btnVela');
    var pistaVela = $('#pistaVela');
    if (btnVela) {
        btnVela.addEventListener('click', function () {
            var apagada = btnVela.classList.toggle('apagada');
            var r = btnVela.getBoundingClientRect();
            if (apagada) {
                chispas(r.left + r.width / 2, r.top + r.height * 0.15, 14);
                mostrarAviso('Pide un deseo, mi amor ✨', 3200);
                pistaVela.textContent = 'Deseo pedido 💫 (toca otra vez para prender)';
            } else {
                pistaVela.textContent = 'Toca la velita ✨';
            }
        });
    }

    /* ---------------------------------------------------------------
       Corazones secretos
       --------------------------------------------------------------- */
    var secretos = $$('[data-secreto]');
    var encontrados = 0;
    var pistaSecretos = $('#pistaSecretos');
    secretos.forEach(function (btn) {
        btn.addEventListener('click', function (ev) {
            if (btn.classList.contains('encontrado')) { return; }
            btn.classList.add('encontrado');
            encontrados++;
            var p = puntoEvento(ev, btn);
            chispas(p.x, p.y, 12);
            if (encontrados === secretos.length) {
                mostrarAviso('¡Encontraste todos los corazones secretos! Te amo 💖', 4200);
                lanzarConfeti();
            } else {
                var lista = datos.mensajes && datos.mensajes.length ? datos.mensajes : ['Te amo ❤️'];
                mostrarAviso(elegir(lista) + '  (' + encontrados + '/' + secretos.length + ')', 2800);
            }
            if (pistaSecretos) {
                pistaSecretos.hidden = false;
                pistaSecretos.textContent = '💗 Corazones secretos encontrados: ' + encontrados + ' de ' + secretos.length;
            }
        });
    });

    /* ---------------------------------------------------------------
       Galería: visor ampliado
       --------------------------------------------------------------- */
    (function galeria() {
        var visor = $('#visor');
        if (!visor) { return; }
        var botones = $$('[data-foto]');
        var img = $('#visorImg');
        var pie = $('#visorPie');
        var cerrar = $('#visorCerrar');
        var prev = $('#visorPrev');
        var next = $('#visorNext');
        var indice = 0;
        var ultimoFoco = null;

        function datosDe(i) {
            var b = botones[i];
            var im = $('img', b);
            return { src: im.currentSrc || im.src, alt: im.alt, pie: $('figcaption', b.closest('figure')).textContent };
        }
        function mostrar(i) {
            indice = (i + botones.length) % botones.length;
            var d = datosDe(indice);
            img.src = d.src;
            img.alt = d.alt;
            pie.textContent = d.pie;
            // precarga de vecinas
            [indice - 1, indice + 1].forEach(function (j) {
                var k = (j + botones.length) % botones.length;
                var pre = new Image();
                pre.src = datosDe(k).src;
            });
        }
        function abrir(i) {
            ultimoFoco = document.activeElement;
            mostrar(i);
            visor.hidden = false;
            document.body.style.overflow = 'hidden';
            cerrar.focus();
        }
        function cerrarVisor() {
            if (visor.hidden) { return; }
            visor.hidden = true;
            document.body.style.overflow = '';
            if (ultimoFoco && ultimoFoco.focus) { ultimoFoco.focus({ preventScroll: true }); }
        }
        window.__cerrarVisor = cerrarVisor;

        botones.forEach(function (b, i) { b.addEventListener('click', function () { abrir(i); }); });
        cerrar.addEventListener('click', cerrarVisor);
        prev.addEventListener('click', function () { mostrar(indice - 1); });
        next.addEventListener('click', function () { mostrar(indice + 1); });
        visor.addEventListener('click', function (ev) {
            if (ev.target === visor || ev.target.classList.contains('visor__figura')) { cerrarVisor(); }
        });
        document.addEventListener('keydown', function (ev) {
            if (visor.hidden) { return; }
            if (ev.key === 'Escape') { cerrarVisor(); }
            else if (ev.key === 'ArrowLeft') { mostrar(indice - 1); }
            else if (ev.key === 'ArrowRight') { mostrar(indice + 1); }
            else if (ev.key === 'Tab') { // mantener el foco dentro del visor
                var foco = [cerrar, prev, next];
                var pos = foco.indexOf(document.activeElement);
                ev.preventDefault();
                foco[(pos + (ev.shiftKey ? -1 : 1) + foco.length) % foco.length].focus();
            }
        });
        // deslizar con el dedo
        var x0 = null;
        visor.addEventListener('touchstart', function (ev) { x0 = ev.changedTouches[0].clientX; }, { passive: true });
        visor.addEventListener('touchend', function (ev) {
            if (x0 === null) { return; }
            var dx = ev.changedTouches[0].clientX - x0;
            x0 = null;
            if (Math.abs(dx) > 50) { mostrar(indice + (dx < 0 ? 1 : -1)); }
        }, { passive: true });
    })();

    /* ---------------------------------------------------------------
       Tarjetas de personajes (voltear)
       --------------------------------------------------------------- */
    var tarjetas = $$('[data-tarjeta]');
    tarjetas.forEach(function (t) {
        var nombreOriginal = t.getAttribute('aria-label');
        var mensaje = $('.tarjeta__mensaje', t).textContent;
        t.addEventListener('click', function () {
            var abierta = t.getAttribute('aria-pressed') === 'true';
            t.setAttribute('aria-pressed', abierta ? 'false' : 'true');
            t.setAttribute('aria-label', abierta ? nombreOriginal : mensaje + ' Toca para volver.');
        });
    });
    function reiniciarTarjetas() {
        tarjetas.forEach(function (t) { t.setAttribute('aria-pressed', 'false'); });
    }

    /* ---------------------------------------------------------------
       Carta: sobre, despliegue y escritura progresiva (opcional)
       --------------------------------------------------------------- */
    var sobre = $('#sobre');
    var btnCarta = $('#btnCarta');
    var btnCartaTexto = $('#btnCartaTexto');
    var envoltorio = $('#cartaEnvoltorio');
    var papel = $('#cartaPapel');
    var cartaTexto = $('#cartaTexto');
    var btnEscribir = $('#btnEscribir');
    var btnMostrarTodo = $('#btnMostrarTodo');
    var parrafos = $$('.carta__parrafo', cartaTexto);
    var textosCompletos = parrafos.map(function (p) { return p.textContent; });
    var cartaAbierta = false;
    var escribiendo = false;
    var timerEscritura = null;

    function restaurarTexto() {
        clearTimeout(timerEscritura);
        escribiendo = false;
        parrafos.forEach(function (p, i) {
            p.classList.remove('escribiendo');
            p.textContent = textosCompletos[i];
        });
        cartaTexto.removeAttribute('aria-busy');
        btnMostrarTodo.hidden = true;
        btnEscribir.disabled = false;
        btnEscribir.textContent = '✨ Verla escribirse otra vez';
    }

    function alternarCarta(abrir) {
        cartaAbierta = typeof abrir === 'boolean' ? abrir : !cartaAbierta;
        sobre.classList.toggle('abierto', cartaAbierta);
        envoltorio.classList.toggle('abierta', cartaAbierta);
        btnCarta.setAttribute('aria-expanded', cartaAbierta ? 'true' : 'false');
        btnCartaTexto.textContent = cartaAbierta ? 'Cerrar carta 💌' : 'Abrir carta 💌';
        if (cartaAbierta) {
            var c = centroDe(sobre);
            chispas(c.x, c.y, 12);
            setTimeout(function () {
                papel.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'start' });
                papel.focus({ preventScroll: true });
            }, reducido ? 50 : 750);
        } else {
            if (escribiendo) { restaurarTexto(); }
            sobre.scrollIntoView({ behavior: reducido ? 'auto' : 'smooth', block: 'center' });
        }
    }
    btnCarta.addEventListener('click', function () { alternarCarta(); });

    function escribirCarta() {
        if (!cartaAbierta) { alternarCarta(true); }
        clearTimeout(timerEscritura);
        escribiendo = true;
        cartaTexto.setAttribute('aria-busy', 'true');
        btnEscribir.disabled = true;
        btnMostrarTodo.hidden = false;

        // Estructura estable: parte escrita + parte oculta (el alto no salta mientras se escribe)
        var estados = parrafos.map(function (p, i) {
            var letras = Array.from(textosCompletos[i]);
            p.textContent = '';
            var v = document.createElement('span'); v.className = 'v';
            var h = document.createElement('span'); h.className = 'h'; h.textContent = textosCompletos[i];
            p.appendChild(v); p.appendChild(h);
            return { letras: letras, v: v, h: h, n: 0 };
        });

        var actual = 0;
        var POR_PASO = 3;
        function paso() {
            if (!escribiendo) { return; }
            if (actual >= estados.length) { restaurarTexto(); return; }
            var e = estados[actual];
            var p = parrafos[actual];
            p.classList.add('escribiendo');
            e.n = Math.min(e.n + POR_PASO, e.letras.length);
            e.v.textContent = e.letras.slice(0, e.n).join('');
            e.h.textContent = e.letras.slice(e.n).join('');
            if (e.n >= e.letras.length) {
                p.classList.remove('escribiendo');
                actual++;
                timerEscritura = setTimeout(paso, 320);
            } else {
                timerEscritura = setTimeout(paso, 22);
            }
        }
        paso();
    }
    if (reducido) { btnEscribir.hidden = true; }
    btnEscribir.addEventListener('click', escribirCarta);
    btnMostrarTodo.addEventListener('click', restaurarTexto);

    /* ---------------------------------------------------------------
       Final: estrellas, confeti y volver a empezar
       --------------------------------------------------------------- */
    (function final() {
        var capa = $('#finalEstrellas');
        if (capa && !reducido) {
            var n = movil ? 28 : 55;
            for (var i = 0; i < n; i++) {
                var s = document.createElement('span');
                s.className = 'estrella';
                s.style.setProperty('--x', aleatorio(1, 99) + '%');
                s.style.setProperty('--y', aleatorio(1, 99) + '%');
                s.style.setProperty('--t', aleatorio(2, 5) + 'px');
                s.style.setProperty('--dur', aleatorio(2, 5) + 's');
                s.style.setProperty('--ret', -aleatorio(0, 5) + 's');
                capa.appendChild(s);
            }
        }

        var seccion = $('#final');
        var yaCelebro = false;
        if (seccion && 'IntersectionObserver' in window) {
            new IntersectionObserver(function (entradas) {
                entradas.forEach(function (e) {
                    if (e.isIntersecting && !yaCelebro && !document.body.classList.contains('bloqueado')) {
                        yaCelebro = true;
                        setTimeout(lanzarConfeti, 500);
                    } else if (!e.isIntersecting && e.boundingClientRect.top > 0) {
                        yaCelebro = false; // permite celebrar de nuevo si vuelve a bajar
                    }
                });
            }, { threshold: 0.55 }).observe(seccion);
        }

        $('#btnConfeti').addEventListener('click', lanzarConfeti);

        $('#btnReiniciar').addEventListener('click', function () {
            if (window.__cerrarVisor) { window.__cerrarVisor(); }
            if (cartaAbierta) { alternarCarta(false); }
            restaurarTexto();
            btnEscribir.textContent = '✨ Verla escribirse';
            reiniciarTarjetas();
            if (btnVela) { btnVela.classList.remove('apagada'); pistaVela.textContent = 'Toca la velita ✨'; }
            document.body.classList.add('bloqueado');
            window.scrollTo(0, 0);
            regalo.classList.remove('abriendo');
            bienvenida.classList.remove('abierta');
            abriendo = false;
        });
    })();
})();
