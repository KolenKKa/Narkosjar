/* =========================================================
   Narkosha Portfolio — script.js
   1) Помощники          2) Хедер, прогресс, меню, тема
   3) Появление на скролле + счётчики
   4) Печатающийся текст 5) Лепестки сакуры (canvas)
   6) Фильтр работ       7) Демо-чат SakuraShop Bot
   8) Копирование ника
   ========================================================= */
(function(){
  'use strict';

  /* ---------- 1. Помощники ---------- */
  function q(s, r){ return (r || document).querySelector(s); }
  function qa(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var toast = q('#toast'), toastTimer;
  function showToast(text){
    toast.textContent = text;
    toast.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function(){ toast.classList.remove('on'); }, 2200);
  }

  /* ---------- 2. Хедер, прогресс, меню, тема ---------- */
  var header = q('#header'), progress = q('#progress'), ticking = false;
  function onScroll(){
    var y = window.scrollY || 0;
    header.classList.toggle('scrolled', y > 24);
    var h = document.documentElement.scrollHeight - window.innerHeight;
    progress.style.transform = 'scaleX(' + (h > 0 ? Math.min(y / h, 1) : 0) + ')';
    ticking = false;
  }
  window.addEventListener('scroll', function(){
    if(!ticking){ requestAnimationFrame(onScroll); ticking = true; }
  }, { passive:true });
  onScroll();

  // Подсветка активного пункта меню
  var links = qa('.nav a');
  var spy = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      links.forEach(function(a){
        a.classList.toggle('active', a.getAttribute('href') === '#' + e.target.id);
      });
    });
  }, { rootMargin:'-45% 0px -50% 0px' });
  ['top','about','works','demo','path','services','contacts'].forEach(function(id){
    var el = document.getElementById(id);
    if(el) spy.observe(el);
  });

  // Бургер-меню на телефоне
  var nav = q('#nav'), burger = q('#burger');
  function closeMenu(){ nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
  });
  links.forEach(function(a){ a.addEventListener('click', closeMenu); });
  document.addEventListener('click', function(e){
    if(!nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
  });

  // Тема (светлая / тёмная), выбор запоминается
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('narkosha-theme');
    if(saved) root.setAttribute('data-theme', saved);
  } catch(err) {}
  q('#theme').addEventListener('click', function(){
    var cur = root.getAttribute('data-theme');
    if(!cur) cur = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    var next = cur === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('narkosha-theme', next); } catch(err) {}
  });

  /* ---------- 3. Появление на скролле + счётчики ---------- */
  var reveal = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(e.isIntersecting){ e.target.classList.add('in'); reveal.unobserve(e.target); }
    });
  }, { threshold:.15, rootMargin:'0px 0px -6% 0px' });
  qa('.reveal:not(.in)').forEach(function(el){ reveal.observe(el); });

  var counters = new IntersectionObserver(function(entries){
    entries.forEach(function(e){
      if(!e.isIntersecting) return;
      var el = e.target, end = +el.dataset.count, suffix = el.dataset.suffix || '', t0 = null;
      function step(t){
        if(t0 === null) t0 = t;
        var p = Math.min((t - t0) / 1600, 1);
        el.textContent = Math.round(end * (1 - Math.pow(1 - p, 4))) + (p === 1 ? suffix : '');
        if(p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
      counters.unobserve(el);
    });
  }, { threshold:.6 });
  qa('[data-count]').forEach(function(el){ counters.observe(el); });

  /* ---------- 4. Печатающийся текст ---------- */
  var typedEl = q('#typed');
  var phrases = ['Telegram-ботов', 'сайты на HTML и CSS', 'проекты на Python', 'то, что нравится людям'];
  if(reduce){
    typedEl.textContent = phrases[0];
  } else {
    var pi = 0, ci = 0, deleting = false;
    (function tick(){
      var word = phrases[pi];
      typedEl.textContent = word.slice(0, ci);
      var delay = deleting ? 40 : 85;
      if(!deleting && ci === word.length){ deleting = true; delay = 1400; }
      else if(deleting && ci === 0){ deleting = false; pi = (pi + 1) % phrases.length; delay = 350; }
      else { ci += deleting ? -1 : 1; }
      setTimeout(tick, delay);
    })();
  }

  /* ---------- 5. Лепестки сакуры ---------- */
  (function petals(){
    if(reduce) return;
    var canvas = q('#petals'), ctx = canvas.getContext('2d');
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2), list = [], running = true;

    function resize(){
      w = window.innerWidth; h = window.innerHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function make(initial){
      return {
        x: Math.random() * w,
        y: initial ? Math.random() * h : -20,
        s: 6 + Math.random() * 8,          // размер
        vy: 0.5 + Math.random() * 1,       // скорость падения
        vx: 0.2 + Math.random() * 0.6,     // снос ветром
        a: Math.random() * 6.28,           // угол
        va: (Math.random() - 0.5) * 0.04,  // скорость вращения
        sw: Math.random() * 6.28,          // фаза покачивания
        al: 0.35 + Math.random() * 0.5     // прозрачность
      };
    }
    function draw(p){
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.globalAlpha = p.al;
      ctx.fillStyle = '#ff9cc4';
      ctx.beginPath();
      ctx.moveTo(0, -p.s);
      ctx.bezierCurveTo(p.s * 0.9, -p.s * 0.6, p.s * 0.8, p.s * 0.6, 0, p.s);
      ctx.bezierCurveTo(-p.s * 0.8, p.s * 0.6, -p.s * 0.9, -p.s * 0.6, 0, -p.s);
      ctx.fill();
      ctx.restore();
    }
    function frame(){
      if(!running) return;
      ctx.clearRect(0, 0, w, h);
      list.forEach(function(p, i){
        p.sw += 0.02;
        p.x += p.vx + Math.sin(p.sw) * 0.6;
        p.y += p.vy;
        p.a += p.va;
        if(p.y > h + 20 || p.x > w + 20){ list[i] = make(false); list[i].x = Math.random() * w * 0.9; }
        draw(p);
      });
      requestAnimationFrame(frame);
    }
    resize();
    var count = window.innerWidth < 700 ? 14 : 30;
    for(var i = 0; i < count; i++) list.push(make(true));
    window.addEventListener('resize', resize);
    // экономим батарею: на скрытой вкладке лепестки стоят
    document.addEventListener('visibilitychange', function(){
      running = !document.hidden;
      if(running) requestAnimationFrame(frame);
    });
    requestAnimationFrame(frame);
  })();

  /* ---------- 6. Фильтр работ ---------- */
  qa('.fchip').forEach(function(chip){
    chip.addEventListener('click', function(){
      qa('.fchip').forEach(function(c){ c.classList.remove('on'); });
      chip.classList.add('on');
      var f = chip.dataset.f;
      qa('.card').forEach(function(card, i){
        var show = f === 'all' || card.dataset.type === f;
        card.hidden = !show;
        card.classList.add('in');
        card.classList.remove('pop');
        if(show){
          void card.offsetWidth; // перезапуск анимации
          card.style.animationDelay = (i * 0.06) + 's';
          card.classList.add('pop');
        }
      });
    });
  });

  /* ---------- 7. Демо-чат SakuraShop Bot ---------- */
  // Товары демо-магазина. Меняй названия и цены как хочешь.
  var PRODUCTS = [
    { id:1, emoji:'🍵', name:'Чай «Сакура»',   price:250 },
    { id:2, emoji:'🍡', name:'Набор моти',     price:400 },
    { id:3, emoji:'🎴', name:'Открытки Сакуры', price:150 }
  ];
  var cart = {};          // { id: количество }
  var busy = false;       // пока бот «печатает», кнопки не работают
  var body = q('#chatBody');

  function scrollDown(){ body.scrollTop = body.scrollHeight; }

  function addMsg(html, who, keyboard){
    var el = document.createElement('div');
    el.className = 'msg ' + who;
    el.innerHTML = html;
    if(keyboard){
      var kb = document.createElement('div');
      kb.className = 'inline';
      keyboard.forEach(function(btn){
        var b = document.createElement('button');
        b.type = 'button';
        b.textContent = btn.t;
        b.addEventListener('click', function(){ if(!busy) handle(btn.a, btn.t); });
        kb.appendChild(b);
      });
      el.appendChild(kb);
    }
    body.appendChild(el);
    scrollDown();
  }

  // Бот «печатает» и отвечает с небольшой задержкой
  function botSay(html, keyboard, delay){
    busy = true;
    var t = document.createElement('div');
    t.className = 'typing';
    t.innerHTML = '<i></i><i></i><i></i>';
    body.appendChild(t);
    scrollDown();
    setTimeout(function(){
      t.remove();
      addMsg(html, 'bot', keyboard);
      busy = false;
    }, delay || 650);
  }

  function cartTotal(){
    var sum = 0;
    PRODUCTS.forEach(function(p){ sum += (cart[p.id] || 0) * p.price; });
    return sum;
  }
  function cartCount(){
    var n = 0;
    Object.keys(cart).forEach(function(k){ n += cart[k]; });
    return n;
  }

  // Обработчик всех действий (как обработчики callback в aiogram)
  function handle(action, label){
    if(label && action.indexOf('add:') !== 0 && action !== 'catalog' && action !== 'cart' && action !== 'help'){
      addMsg(label, 'me');
    }
    var parts = action.split(':');

    if(action === 'catalog'){
      botSay('<b>🛍 Каталог</b><br>Выбери товар, и я добавлю его в корзину:',
        PRODUCTS.map(function(p){ return { t: p.emoji + ' ' + p.name + ' — ' + p.price + ' ₽', a:'add:' + p.id }; }));
    }
    else if(parts[0] === 'add'){
      var p = PRODUCTS.filter(function(x){ return x.id === +parts[1]; })[0];
      cart[p.id] = (cart[p.id] || 0) + 1;
      botSay('Добавлено в корзину ✅<br><b>' + p.emoji + ' ' + p.name + '</b><br>Всего товаров: ' + cartCount(),
        [{ t:'🛒 Открыть корзину', a:'cart' }, { t:'➕ Ещё товары', a:'catalog' }], 450);
    }
    else if(action === 'cart'){
      if(!cartCount()){
        botSay('🛒 Корзина пока пустая.<br>Загляни в каталог!', [{ t:'🛍 Открыть каталог', a:'catalog' }]);
        return;
      }
      var lines = PRODUCTS.filter(function(x){ return cart[x.id]; }).map(function(x){
        return x.emoji + ' ' + x.name + ' × ' + cart[x.id] + ' — ' + (cart[x.id] * x.price) + ' ₽';
      });
      botSay('<b>🛒 Твоя корзина</b><br>' + lines.join('<br>') + '<br><br><b>Итого: ' + cartTotal() + ' ₽</b>',
        [{ t:'💳 Оплатить', a:'pay' }, { t:'🗑 Очистить', a:'clear' }]);
    }
    else if(action === 'clear'){
      cart = {};
      botSay('Корзина очищена 🗑', [{ t:'🛍 В каталог', a:'catalog' }], 400);
    }
    else if(action === 'pay'){
      var total = cartTotal();
      botSay('Обрабатываю платёж… 💳', null, 700);
      setTimeout(function(){
        var order = 1000 + Math.floor(Math.random() * 9000);
        cart = {};
        botSay('<b>Оплата прошла успешно ✅</b><br>Заказ №' + order + ' на сумму ' + total + ' ₽ принят.<br>Спасибо за покупку! 🌸',
          [{ t:'🛍 Купить ещё', a:'catalog' }], 800);
      }, 1500);
    }
    else if(action === 'help'){
      botSay('ℹ️ Это демо-версия <b>SakuraShop Bot</b>.<br>Настоящий бот работает в Telegram на Python и aiogram. Здесь я показываю, как выглядят меню, корзина и оплата.');
    }
  }

  // Нижняя клавиатура (reply keyboard)
  qa('#chatKb button').forEach(function(btn){
    btn.addEventListener('click', function(){
      if(busy) return;
      addMsg(btn.textContent, 'me');
      handle(btn.dataset.a);
    });
  });

  function startChat(){
    body.innerHTML = '';
    cart = {};
    busy = false;
    botSay('Привет! 🌸<br>Добро пожаловать в <b>SakuraShop</b>. Что хочешь сделать?',
      [{ t:'🛍 Открыть каталог', a:'catalog' }], 500);
  }
  q('#chatReset').addEventListener('click', startChat);

  // Запускаем чат, когда секция появилась на экране
  var chatStarted = false;
  new IntersectionObserver(function(entries, obs){
    if(entries[0].isIntersecting && !chatStarted){ chatStarted = true; startChat(); obs.disconnect(); }
  }, { threshold:.3 }).observe(q('#demo'));

  /* ---------- 8. Копирование ника ---------- */
  q('#copy').addEventListener('click', function(){
    var text = this.dataset.copy;
    function ok(){ showToast('Ник ' + text + ' скопирован 🌸'); }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(ok, function(){ showToast('Не получилось скопировать'); });
    } else {
      showToast('Ник: ' + text);
    }
  });
})();
