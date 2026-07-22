// Theme toggle
(function () {
    const themeBtn = document.getElementById('themeBtn');
    const body = document.body;
    function setTheme(t) {
        body.setAttribute('data-theme', t);
        if (themeBtn) themeBtn.textContent = t === 'dark' ? '🌙' : '☀️';
        localStorage.setItem('site-theme', t);
    }
    const saved = localStorage.getItem('site-theme');
    if (saved) { setTheme(saved); }
    if (themeBtn) {
        themeBtn.addEventListener('click', () => {
            const current = body.getAttribute('data-theme');
            setTheme(current === 'dark' ? 'light' : 'dark');
        });
    }
})();

// Mobile nav toggle
(function () {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    if (navToggle && navLinks) {
        navToggle.addEventListener('click', () => navLinks.classList.toggle('open'));
        navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => navLinks.classList.remove('open')));
    }
})();

// Reveal on scroll + counters + skill bars
(function () {
    const revealEls = document.querySelectorAll('.reveal');
    if (!revealEls.length) return;
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => entry.target.classList.add('in'), (i % 4) * 70);
                io.unobserve(entry.target);
                if (entry.target.classList.contains('stats')) animateCounters(entry.target);
                if (entry.target.classList.contains('skill-card')) animateBars(entry.target);
            }
        });
    }, { threshold: 0.15 });
    revealEls.forEach(el => io.observe(el));

    function animateCounters(container) {
        container.querySelectorAll('.num[data-count]').forEach(el => {
            const target = parseInt(el.getAttribute('data-count'), 10);
            const duration = 1200;
            const start = performance.now();
            function tick(now) {
                const progress = Math.min((now - start) / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3);
                el.textContent = Math.round(eased * target);
                if (progress < 1) requestAnimationFrame(tick);
                else el.textContent = target;
            }
            requestAnimationFrame(tick);
        });
    }
    function animateBars(card) {
        card.querySelectorAll('.skill-bar span[data-fill]').forEach(bar => {
            const fill = bar.getAttribute('data-fill') + '%';
            bar.style.setProperty('--fill', fill);
            requestAnimationFrame(() => bar.classList.add('filled'));
        });
    }
})();

// Rotating role typewriter (home page only)
(function () {
    const el = document.getElementById('roleType');
    if (!el) return;
    const roles = ['Data Science Student', 'Python Developer', 'ML Enthusiast', 'R Programmer', 'Aspiring Data Analyst'];
    let ri = 0, ci = 0, deleting = false;
    function tick() {
        const word = roles[ri];
        if (!deleting) {
            ci++;
            el.textContent = word.slice(0, ci);
            if (ci === word.length) { deleting = true; setTimeout(tick, 1400); return; }
            setTimeout(tick, 65);
        } else {
            ci--;
            el.textContent = word.slice(0, ci);
            if (ci === 0) { deleting = false; ri = (ri + 1) % roles.length; setTimeout(tick, 300); return; }
            setTimeout(tick, 35);
        }
    }
    tick();
})();

// Terminal typewriter (home page only)
(function () {
    const termBody = document.getElementById('termBody');
    const termWindow = document.getElementById('termWindow');
    if (!termBody || !termWindow) return;
    const termLines = [
        { type: 'prompt', text: '$ whoami' },
        { type: 'output', text: 'asif_sajad — BSc Data Science student, Python & R' },
        { type: 'prompt', text: '$ cat focus.txt' },
        { type: 'output', text: 'data analysis · machine learning · python · r · applied stats' },
        { type: 'prompt', text: '$ ls skills/' },
        { type: 'output', text: 'python.py  r_stats.R  c.c  cpp.cpp  ml_models/' },
        { type: 'prompt', text: '$ echo $STATUS' },
        { type: 'output', text: 'open_to_entry_level_roles' }
    ];
    let termStarted = false;
    function typeTerminal() {
        if (termStarted) return;
        termStarted = true;
        let li = 0, ci = 0;
        function typeChar() {
            if (li >= termLines.length) {
                termBody.innerHTML += '<span class="term-cursor"></span>';
                return;
            }
            const line = termLines[li];
            if (ci === 0) {
                if (li > 0) termBody.appendChild(document.createTextNode('\n'));
                const span = document.createElement('span');
                span.className = line.type === 'prompt' ? 'term-prompt' : 'term-output';
                span.id = 'term-line-' + li;
                termBody.appendChild(span);
            }
            const target = document.getElementById('term-line-' + li);
            if (ci < line.text.length) {
                target.textContent += line.text[ci];
                ci++;
                setTimeout(typeChar, line.type === 'prompt' ? 32 : 14);
            } else {
                li++; ci = 0;
                setTimeout(typeChar, 200);
            }
        }
        typeChar();
    }
    const termIo = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) { typeTerminal(); termIo.unobserve(entry.target); }
        });
    }, { threshold: 0.3 });
    termIo.observe(termWindow);
})();

// Contact form — submit quietly via FormSubmit's AJAX endpoint (no page redirect)
(function () {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;
    const formStatus = document.getElementById('formStatus');
    const sendBtn = document.getElementById('sendBtn');
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const originalBtnText = sendBtn.textContent;
        sendBtn.disabled = true;
        sendBtn.textContent = 'Sending...';
        formStatus.textContent = 'Sending your message...';
        try {
            const res = await fetch('https://formsubmit.co/ajax/aasifsajad2@gmail.com', {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });
            if (res.ok) {
                formStatus.textContent = "Message sent — thanks! I'll get back to you soon.";
                contactForm.reset();
            } else {
                formStatus.textContent = "Something went wrong. Please email me directly instead.";
            }
        } catch (err) {
            formStatus.textContent = "Something went wrong. Please email me directly instead.";
        } finally {
            sendBtn.disabled = false;
            sendBtn.textContent = originalBtnText;
        }
    });
})();

// Preloader — boot sequence (home page only)
(function () {
    const pre = document.getElementById('preloader');
    const container = document.getElementById('bootLines');
    if (!pre || !container) return;
    const lines = [
        { label: 'BOOT', text: 'initializing portfolio.v1 ...' },
        { label: 'MOUNT', text: '/home/asif ... OK' },
        { label: 'LOAD', text: 'skills.json, experience.json ... OK' },
        { label: 'READY', text: 'welcome to asif\'s portfolio' }
    ];
    lines.forEach((line, i) => {
        const div = document.createElement('div');
        div.className = 'boot-line';
        div.style.animationDelay = (i * 0.32) + 's';
        div.innerHTML = '<span class="boot-label">' + line.label + ':</span> ' + line.text +
            (i === lines.length - 1 ? '<span class="boot-cursor"></span>' : '');
        container.appendChild(div);
    });
    const totalDelay = lines.length * 320 + 700;
    setTimeout(() => pre.classList.add('hide'), totalDelay);
})();