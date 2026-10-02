document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    gsap.registerPlugin(ScrollTrigger);

    const $ = (s) => document.querySelector(s);
    const $$ = (s) => [...document.querySelectorAll(s)];
    const calm = matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. INFINITE BACKGROUND SLIDER (unchanged behaviour)
    const slides = $$('.slide');
    let currentIndex = 0;

    function playSlider() {
        const currentSlide = slides[currentIndex];
        const nextIndex = (currentIndex + 1) % slides.length;
        const img = currentSlide.querySelector('img');

        gsap.timeline()
            .to(currentSlide, { opacity: 1, duration: 1.5 })
            .to(img, { scale: 1, duration: 8, ease: 'none' }, 0)
            .to(currentSlide, { opacity: 0, duration: 1.5 }, '-=1.5')
            .call(() => {
                currentIndex = nextIndex;
                gsap.set(img, { scale: 1.15 });
                playSlider();
            });
    }
    calm ? gsap.set(slides[0], { opacity: 1 }) : playSlider();

    // 2. HERO CONTENT ANIMATION (unchanged)
    gsap.timeline()
        .to('#hero-title', { opacity: 1, y: 0, duration: 1, delay: 0.5 })
        .to('#hero-subtext', { opacity: 1, y: 0, duration: 1 }, '-=0.7')
        .to('#hero-cta', { opacity: 1, y: 0, duration: 1 }, '-=0.7');

    // 3. SCROLL REVEALS — one batched trigger for every section, with a light stagger
    ScrollTrigger.batch('.reveal, .reveal-left, .reveal-right', {
        start: 'top 90%',
        once: true,
        onEnter: (els) => gsap.to(els, { opacity: 1, x: 0, y: 0, duration: 1.2, ease: 'power2.out', stagger: 0.12, overwrite: true })
    });
    window.addEventListener('load', () => ScrollTrigger.refresh());

    // 4. NAV: background, scroll progress, back-to-top (single rAF-throttled listener)
    const nav = $('#main-nav'), bar = $('#progress'), toTop = $('#to-top');
    let ticking = false;
    const onScroll = () => {
        const max = document.documentElement.scrollHeight - innerHeight;
        nav.classList.toggle('scrolled', scrollY > 50);
        bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
        toTop.classList.toggle('show', scrollY > 700);
        ticking = false;
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
    onScroll();
    toTop.addEventListener('click', () => scrollTo({ top: 0, behavior: calm ? 'auto' : 'smooth' }));

    // 5. MOBILE MENU (links cloned from the desktop nav so they never drift apart)
    const btn = $('#mobile-menu-btn'), menu = $('#mobile-menu');
    menu.prepend(...$$('#nav-links a').map((a) => a.cloneNode(true)));
    const setMenu = (open) => {
        menu.classList.toggle('hidden', !open);
        btn.setAttribute('aria-expanded', open);
        $('.ic-menu').classList.toggle('hidden', open);
        $('.ic-close').classList.toggle('hidden', !open);
    };
    btn.addEventListener('click', () => setMenu(menu.classList.contains('hidden')));
    menu.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
    addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
    matchMedia('(min-width: 1024px)').addEventListener('change', (e) => e.matches && setMenu(false));

    // 6. ACTIVE NAV LINK (IntersectionObserver — no scroll maths)
    const links = $$('.nav-link');
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) links.forEach((a) => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    $$('main section[id]').forEach((s) => io.observe(s));

    // 7. LEAD FORM — front-end confirmation only.
    // TODO: send the data to your backend, WhatsApp link, or a form service here.
    $('#lead-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const submit = e.target.querySelector('button');
        submit.textContent = 'Pass Requested ✓';
        submit.disabled = true;
        setTimeout(() => { e.target.reset(); submit.textContent = 'Get Started'; submit.disabled = false; }, 4000);
    });
});
