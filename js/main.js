// AL-HITAR CARS — site behavior (single file, no duplicates)
(function () {
  "use strict";

  /* ---------- Intro reveal ---------- */
  var intro = document.querySelector('.intro-reveal');
  if (intro) {
    if (sessionStorage.getItem('ahc_intro_seen')) {
      intro.classList.add('hide');
    } else {
      sessionStorage.setItem('ahc_intro_seen', '1');
      setTimeout(function () { intro.classList.add('hide'); }, 1300);
    }
  }

  /* ---------- Header scroll state ---------- */
  var header = document.querySelector('.site-header');
  function onScroll() {
    if (!header) return;
    if (window.scrollY > 40) header.classList.add('scrolled');
    else header.classList.remove('scrolled');
  }
  document.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () {
      nav.classList.toggle('open');
      document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
    });
    nav.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Scroll reveal ---------- */
  var revealEls = document.querySelectorAll('.reveal, .vehicle-card');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Hero: poster-as-background + video fades in on canplay ---------- */
  var heroEl = document.querySelector('.hero');
  var heroVideo = document.querySelector('.hero-media video');
  var vidToggle = document.querySelector('.hero-video-toggle');
  var ICON_PLAY = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="6 3 20 12 6 21 6 3"></polygon></svg>';
  var ICON_PAUSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="6" y="4" width="4" height="16"></rect><rect x="14" y="4" width="4" height="16"></rect></svg>';

  if (heroEl && heroVideo) {
    var posterUrl = heroVideo.getAttribute('poster');
    if (posterUrl) heroEl.style.backgroundImage = "url('" + posterUrl + "')";

    var markReady = function () { heroVideo.classList.add('is-ready'); };
    if (heroVideo.readyState >= 3) {
      markReady();
    } else {
      heroVideo.addEventListener('canplay', markReady, { once: true });
    }
    // Safety net: if canplay never fires (slow network), reveal after 2.5s anyway.
    setTimeout(markReady, 2500);

    var reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      heroVideo.pause();
      if (vidToggle) vidToggle.innerHTML = ICON_PLAY;
    }

    if (vidToggle) {
      vidToggle.innerHTML = reducedMotion ? ICON_PLAY : ICON_PAUSE;
      vidToggle.addEventListener('click', function () {
        if (heroVideo.paused) { heroVideo.play(); vidToggle.innerHTML = ICON_PAUSE; }
        else { heroVideo.pause(); vidToggle.innerHTML = ICON_PLAY; }
      });
    }
  }

  /* ---------- Fleet filters ---------- */
  var filterBar = document.querySelector('.filter-bar');
  if (filterBar) {
    var buttons = filterBar.querySelectorAll('.filter-btn');
    var cards = document.querySelectorAll('.vehicle-card');
    var countEl = document.querySelector('.filter-count');
    function applyFilter(cat) {
      var visible = 0;
      cards.forEach(function (c) {
        var match = cat === 'all' || c.getAttribute('data-cat') === cat;
        c.classList.toggle('hidden-card', !match);
        if (match) visible++;
      });
      if (countEl) countEl.textContent = visible + ' من ' + cards.length + ' سيارة';
    }
    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.classList.remove('active'); });
        b.classList.add('active');
        applyFilter(b.getAttribute('data-filter'));
      });
    });
    applyFilter('all');
  }

  /* ---------- Lightbox ---------- */
  var lightbox = document.querySelector('.lightbox');
  if (lightbox) {
    var lbImg = lightbox.querySelector('img');
    document.querySelectorAll('[data-lightbox]').forEach(function (trigger) {
      trigger.addEventListener('click', function () {
        var full = trigger.getAttribute('data-lightbox');
        lbImg.src = full;
        lightbox.classList.add('open');
      });
    });
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox || e.target.closest('.lightbox-close')) {
        lightbox.classList.remove('open');
        lbImg.src = '';
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { lightbox.classList.remove('open'); lbImg.src = ''; }
    });
  }

  /* ---------- FAQ accordion ---------- */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  /* ---------- Booking form -> WhatsApp ---------- */
  var form = document.getElementById('booking-form');
  if (form) {
    var WA_NUMBER_PRIMARY = '967777917111';

    function setError(field, msg) {
      var wrap = field.closest('.field');
      wrap.classList.add('error');
      var em = wrap.querySelector('.err-msg');
      if (em) em.textContent = msg;
    }
    function clearError(field) {
      field.closest('.field').classList.remove('error');
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var statusEl = document.getElementById('form-status');
      statusEl.className = 'form-status';
      statusEl.textContent = '';

      var required = form.querySelectorAll('[required]');
      var valid = true;
      required.forEach(function (f) {
        clearError(f);
        if (!f.value || !f.value.trim()) {
          setError(f, 'هذا الحقل مطلوب');
          valid = false;
        }
      });
      var phone = form.querySelector('#phone');
      if (phone && phone.value && !/^[0-9+\s-]{7,}$/.test(phone.value)) {
        setError(phone, 'رقم الهاتف غير صحيح');
        valid = false;
      }

      if (!valid) {
        statusEl.classList.add('error');
        statusEl.textContent = 'يرجى تعبئة الحقول المطلوبة بشكل صحيح.';
        return;
      }

      var data = {
        name: form.querySelector('#full-name').value.trim(),
        phone: form.querySelector('#phone').value.trim(),
        service: form.querySelector('#service').value,
        vehicle: form.querySelector('#vehicle-type') ? form.querySelector('#vehicle-type').value : '',
        pickup: form.querySelector('#pickup-loc') ? form.querySelector('#pickup-loc').value.trim() : '',
        dropoff: form.querySelector('#dropoff-loc') ? form.querySelector('#dropoff-loc').value.trim() : '',
        pickupDate: form.querySelector('#pickup-date') ? form.querySelector('#pickup-date').value : '',
        returnDate: form.querySelector('#return-date') ? form.querySelector('#return-date').value : '',
        passengers: form.querySelector('#passengers') ? form.querySelector('#passengers').value : '',
        notes: form.querySelector('#notes') ? form.querySelector('#notes').value.trim() : ''
      };

      var lines = [
        'طلب حجز جديد - الهتار كارز',
        '',
        'اسم العميل: ' + data.name,
        'رقم الهاتف: ' + data.phone,
        'نوع الخدمة: ' + data.service
      ];
      if (data.vehicle) lines.push('السيارة المطلوبة: ' + data.vehicle);
      if (data.pickup) lines.push('مكان الاستلام: ' + data.pickup);
      if (data.dropoff) lines.push('مكان التسليم: ' + data.dropoff);
      if (data.pickupDate) lines.push('تاريخ الاستلام: ' + data.pickupDate);
      if (data.returnDate) lines.push('تاريخ الإرجاع: ' + data.returnDate);
      if (data.passengers) lines.push('عدد الركاب: ' + data.passengers);
      if (data.notes) lines.push('ملاحظات إضافية: ' + data.notes);

      var message = encodeURIComponent(lines.join('\n'));
      var url = 'https://wa.me/' + WA_NUMBER_PRIMARY + '?text=' + message;

      statusEl.classList.add('success');
      statusEl.textContent = 'تم تجهيز طلبك — سيتم فتح واتساب الآن لإرساله مباشرة.';

      window.open(url, '_blank');
      form.reset();
    });
  }

  /* ---------- Prefill vehicle type from fleet page link ---------- */
  (function prefill() {
    var params = new URLSearchParams(window.location.search);
    var v = params.get('vehicle');
    var vt = document.getElementById('vehicle-type');
    if (v && vt) vt.value = decodeURIComponent(v);
  })();

  /* ---------- PWA: service worker + install prompt ---------- */
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('service-worker.js').catch(function () {});
    });
  }

  var deferredPrompt = null;
  var installBanner = document.querySelector('.install-banner');
  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    deferredPrompt = e;
    if (installBanner && !sessionStorage.getItem('ahc_install_dismissed')) {
      installBanner.classList.add('show');
    }
  });
  if (installBanner) {
    var installBtn = installBanner.querySelector('.install-btn');
    var dismissBtn = installBanner.querySelector('.dismiss');
    if (installBtn) installBtn.addEventListener('click', function () {
      installBanner.classList.remove('show');
      if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; }
    });
    if (dismissBtn) dismissBtn.addEventListener('click', function () {
      installBanner.classList.remove('show');
      sessionStorage.setItem('ahc_install_dismissed', '1');
    });
  }
})();
