/* ══════════════════════════════════════════════════════════════════════
   J.A.R.V.I.S MARK XXXV — Interactive Scripts
   ══════════════════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Particle System ─────────────────────────────────────────────────
    const canvas = document.getElementById('particles');
    const ctx = canvas.getContext('2d');
    let particles = [];
    let mouseX = 0, mouseY = 0;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    class Particle {
        constructor() {
            this.reset();
        }
        reset() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.3;
            this.speedY = (Math.random() - 0.5) * 0.3;
            this.opacity = Math.random() * 0.4 + 0.1;
            this.targetOpacity = this.opacity;
        }
        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Mouse interaction
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 150) {
                this.targetOpacity = 0.6;
                this.speedX += dx * 0.00003;
                this.speedY += dy * 0.00003;
            } else {
                this.targetOpacity = Math.random() * 0.3 + 0.1;
            }

            this.opacity += (this.targetOpacity - this.opacity) * 0.05;

            if (this.x < 0 || this.x > canvas.width ||
                this.y < 0 || this.y > canvas.height) {
                this.reset();
            }
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 212, 255, ${this.opacity})`;
            ctx.fill();
        }
    }

    // Create particles
    const particleCount = Math.min(80, Math.floor(window.innerWidth / 20));
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    function drawConnections() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    const opacity = (1 - dist / 120) * 0.12;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(0, 212, 255, ${opacity})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }
    }

    function animateParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        drawConnections();
        requestAnimationFrame(animateParticles);
    }
    animateParticles();

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // ── Navbar Scroll Effect ────────────────────────────────────────────
    const nav = document.getElementById('nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        if (scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
        lastScroll = scrollY;
    });

    // ── Smooth Scroll for Anchor Links ──────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ── Counter Animation ───────────────────────────────────────────────
    function animateCounters() {
        const counters = document.querySelectorAll('[data-count]');
        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-count'));
            const duration = 2000;
            const start = performance.now();

            function updateCounter(timestamp) {
                const elapsed = timestamp - start;
                const progress = Math.min(elapsed / duration, 1);
                const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
                const current = Math.floor(eased * target);
                counter.textContent = current;
                if (progress < 1) {
                    requestAnimationFrame(updateCounter);
                } else {
                    counter.textContent = target;
                }
            }
            requestAnimationFrame(updateCounter);
        });
    }

    // ── Scroll Reveal ───────────────────────────────────────────────────
    const revealElements = document.querySelectorAll(
        '.feature-card, .capability-row, .arch-card, .arch-diagram, .tool-item, .setup-step, .pricing-card'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -60px 0px'
    };

    let countersAnimated = false;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Find index for stagger delay
                const parent = entry.target.parentElement;
                const siblings = Array.from(parent.children).filter(
                    c => c.classList.contains('reveal')
                );
                const idx = siblings.indexOf(entry.target);
                entry.target.style.transitionDelay = `${idx * 0.08}s`;
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => observer.observe(el));

    // Observe the hero stats for counter animation
    const heroStats = document.querySelector('.hero-stats');
    if (heroStats) {
        const statsObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !countersAnimated) {
                    countersAnimated = true;
                    animateCounters();
                    statsObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.5 });
        statsObserver.observe(heroStats);
    }

    // ── Feature Card Glow Follow Mouse ──────────────────────────────────
    document.querySelectorAll('.feature-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const glow = card.querySelector('.feature-card-glow');
            if (glow) {
                glow.style.left = `${x - rect.width}px`;
                glow.style.top = `${y - rect.height}px`;
            }
        });
    });

    // ── Parallax Effect on Hero Visual ──────────────────────────────────
    const heroVisual = document.querySelector('.hero-visual');
    if (heroVisual) {
        window.addEventListener('scroll', () => {
            const scrollY = window.scrollY;
            if (scrollY < window.innerHeight) {
                heroVisual.style.transform = `translateY(${scrollY * 0.15}px)`;
            }
        });
    }

    // ── Arc Reactor Mouse Interaction ───────────────────────────────────
    const arcReactor = document.getElementById('arcReactor');
    if (arcReactor) {
        document.addEventListener('mousemove', (e) => {
            const rect = arcReactor.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const dx = (e.clientX - centerX) / 40;
            const dy = (e.clientY - centerY) / 40;
            arcReactor.style.transform = `translate(${dx}px, ${dy}px)`;
        });
    }

    // ── Typing Effect for Hero Title ────────────────────────────────────
    const heroTitle = document.querySelector('.hero-title-line--main');
    if (heroTitle) {
        const text = heroTitle.textContent;
        heroTitle.textContent = '';
        heroTitle.style.borderRight = '2px solid var(--cyan-200)';

        let i = 0;
        function typeChar() {
            if (i < text.length) {
                heroTitle.textContent += text[i];
                i++;
                setTimeout(typeChar, 60 + Math.random() * 40);
            } else {
                // Remove cursor after typing
                setTimeout(() => {
                    heroTitle.style.borderRight = 'none';
                }, 1500);
            }
        }
        setTimeout(typeChar, 800);
    }

    // ── Active Nav Link on Scroll ───────────────────────────────────────
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.style.color = '';
            if (link.getAttribute('href') === `#${current}`) {
                link.style.color = '#00d4ff';
            }
        });
    });

    // ── Console Easter Egg ──────────────────────────────────────────────
    console.log(
        '%c◈ J.A.R.V.I.S MARK XXXV Online',
        'color: #00d4ff; font-size: 18px; font-weight: bold; font-family: monospace;'
    );
    console.log(
        '%cKovak Industries · CLASSIFIED',
        'color: #4a7a8a; font-size: 11px; font-family: monospace;'
    );

});

// ══════════════════════════════════════════════════════════════════════
// PAYMENT MODAL (global scope — called via onclick)
// ══════════════════════════════════════════════════════════════════════

const PLAN_INFO = {
    standard:  { name: 'STANDARD',  price: '$20' },
    unlimited: { name: 'UNLIMITED', price: '$59.99' },
};

function openPaymentModal(plan) {
    const modal = document.getElementById('paymentModal');
    const info = PLAN_INFO[plan] || PLAN_INFO.standard;

    document.getElementById('modalTitle').textContent = 'Deploy J.A.R.V.I.S';
    document.getElementById('modalSubtitle').textContent = `${info.name} — ${info.price}`;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closePaymentModal() {
    const modal = document.getElementById('paymentModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset transaction verification state
    if (typeof txCheckInterval !== 'undefined' && txCheckInterval) {
        clearInterval(txCheckInterval);
        txCheckInterval = null;
    }
    const txInput = document.getElementById('txIdInput');
    const statusDiv = document.getElementById('txStatus');
    const verifyBtn = document.getElementById('txVerifyBtn');
    
    if (txInput) txInput.value = '';
    if (statusDiv) statusDiv.innerHTML = '';
    if (verifyBtn) {
        verifyBtn.textContent = 'Verify Transaction';
        verifyBtn.disabled = false;
        verifyBtn.style.display = 'inline-flex';
    }
}

function copyAddress(elementId) {
    const el = document.getElementById(elementId);
    const text = el.textContent.trim();
    const btn = el.parentElement.querySelector('.crypto-copy');

    navigator.clipboard.writeText(text).then(() => {
        btn.classList.add('copied');
        btn.querySelector('.copy-label').textContent = 'COPIED!';
        btn.querySelector('.copy-icon').textContent = '✓';

        setTimeout(() => {
            btn.classList.remove('copied');
            btn.querySelector('.copy-label').textContent = 'COPY';
            btn.querySelector('.copy-icon').textContent = '⧉';
        }, 2000);
    }).catch(() => {
        // Fallback for older browsers
        const range = document.createRange();
        range.selectNode(el);
        window.getSelection().removeAllRanges();
        window.getSelection().addRange(range);
        document.execCommand('copy');
        window.getSelection().removeAllRanges();

        btn.classList.add('copied');
        btn.querySelector('.copy-label').textContent = 'COPIED!';
        setTimeout(() => {
            btn.classList.remove('copied');
            btn.querySelector('.copy-label').textContent = 'COPY';
        }, 2000);
    });
}

// Close modal on overlay click or ESC key
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay')) {
        closePaymentModal();
    }
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePaymentModal();
    }
});

// ══════════════════════════════════════════════════════════════════════
// TRANSACTION VERIFICATION SYSTEM
// ══════════════════════════════════════════════════════════════════════

let txCheckInterval = null;

async function checkBTCTransaction(txid) {
    try {
        const res = await fetch(`https://mempool.space/api/tx/${txid}`);
        if (res.status === 400 || res.status === 404) return { error: true, message: "Transaction not found. Check TXID." };
        if (!res.ok) return { error: true, message: "API Error. Try again later." };
        const data = await res.json();
        return { confirmed: data.status && data.status.confirmed, error: false };
    } catch (e) {
        return { error: true, message: "Network error checking BTC transaction." };
    }
}

async function checkETHTransaction(txid) {
    try {
        const res = await fetch(`https://api.blockcypher.com/v1/eth/main/txs/${txid}`);
        if (res.status === 400 || res.status === 404) return { error: true, message: "Transaction not found. Check TXID." };
        if (!res.ok) return { error: true, message: "API limit reached. Try again later." };
        const data = await res.json();
        return { confirmed: data.confirmations > 0, error: false };
    } catch (e) {
        return { error: true, message: "Network error checking ETH transaction." };
    }
}

async function performTxCheck(txid, currency) {
    if (currency === 'btc') {
        return await checkBTCTransaction(txid);
    } else {
        return await checkETHTransaction(txid);
    }
}

async function startTxVerification() {
    const txInput = document.getElementById('txIdInput');
    const currencySelect = document.getElementById('txCurrency');
    const statusDiv = document.getElementById('txStatus');
    const verifyBtn = document.getElementById('txVerifyBtn');
    
    const txid = txInput.value.trim();
    const currency = currencySelect.value;
    
    if (!txid) {
        statusDiv.innerHTML = `<span class="tx-error">Please paste your Transaction ID.</span>`;
        return;
    }

    if (txCheckInterval) clearInterval(txCheckInterval);
    verifyBtn.textContent = 'Checking...';
    verifyBtn.disabled = true;
    statusDiv.innerHTML = `<div class="tx-loading"><div class="spinner"></div> Checking blockchain network...</div>`;

    const checkAndUpdate = async () => {
        const result = await performTxCheck(txid, currency);
        
        if (result.error) {
            statusDiv.innerHTML = `<span class="tx-error">⚠️ ${result.message}</span>`;
            verifyBtn.textContent = 'Verify Transaction';
            verifyBtn.disabled = false;
            if (txCheckInterval) { clearInterval(txCheckInterval); txCheckInterval = null; }
            return;
        }

        if (result.confirmed) {
            statusDiv.innerHTML = `<div class="tx-success">
                <span class="tx-success-icon">✓</span>
                <div>
                    <strong>Payment Confirmed!</strong>
                    <p>Your transaction has been securely verified on the blockchain.</p>
                    <button class="btn btn--primary download-btn" onclick="alert('In a production system, this would trigger a secure server-side download of J.A.R.V.I.S.')">Download J.A.R.V.I.S ✨</button>
                </div>
            </div>`;
            verifyBtn.style.display = 'none';
            if (txCheckInterval) { clearInterval(txCheckInterval); txCheckInterval = null; }
        } else {
            statusDiv.innerHTML = `<div class="tx-pending">
                <div class="tx-pending-header">
                    <div class="spinner spinner-small"></div> 
                    <strong>Transaction Pending...</strong>
                </div>
                <p>Detected on network, waiting for blockchain confirmations. Auto-checking every 60s.</p>
            </div>`;
            verifyBtn.textContent = 'Checking Automatically...';
        }
    };

    await checkAndUpdate();

    // Auto-check every 60 seconds if unconfirmed
    if (!txCheckInterval && statusDiv.querySelector('.tx-pending')) {
        txCheckInterval = setInterval(checkAndUpdate, 60000);
    }
}
