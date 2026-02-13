import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://pvkbwpdxtaaetzwdyazy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a2J3cGR4dGFhZXR6d2R5YXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzI0NTMsImV4cCI6MjA4NjIwODQ1M30.0WC3c6RvjrvKmz6a-uhsIeOBwdf2k-6ZVSN9OENXc4Y';
const NOTIFY_EMAIL = 'grotkowskaaleksandra3@gmail.com';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== EMAIL HELPER =====
async function sendEmailNotification({ to, subject, html, reply_to }) {
    try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
            },
            body: JSON.stringify({ to, subject, html, reply_to }),
        });
    } catch (e) {
        console.warn('Email notification failed:', e);
    }
}

// ===== SMOOTH SCROLL REVEAL =====
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

function observeAll() {
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach(el => {
        observer.observe(el);
    });
}

// ===== NAV =====
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');
const nav = document.getElementById('nav');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
    });
});

window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

// ===== MENU =====
const categoryEmojis = {
    sandwich: '🥪',
    side: '🍟',
    drink: '🥤',
    dessert: '🍪',
    special: '⭐',
};

async function loadMenu() {
    const showcase = document.getElementById('menuShowcase');

    const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error || !items || items.length === 0) {
        showcase.innerHTML = '<div class="menu__empty">Menu coming soon — stay tuned!</div>';
        return;
    }

    showcase.innerHTML = items.map((item, i) => {
        const num = String(i + 1).padStart(2, '0');
        // Odd items: image left (reveal-left), text right (reveal-right)
        // Even items: image right (reveal-right), text left (reveal-left) — because of row-reverse
        const imgReveal = i % 2 === 0 ? 'reveal-left' : 'reveal-right';
        const txtReveal = i % 2 === 0 ? 'reveal-right' : 'reveal-left';

        return `
            <div class="showcase-item">
                <div class="showcase-item__image ${imgReveal}">
                    ${item.image_url
                        ? `<img src="${item.image_url}" alt="${item.name}" loading="lazy">`
                        : categoryEmojis[item.category] || '🥪'
                    }
                </div>
                <div class="showcase-item__text ${txtReveal}">
                    <div class="showcase-item__number">${num}</div>
                    <div class="showcase-item__category">${item.category}</div>
                    <h3 class="showcase-item__name">${item.name}</h3>
                    ${item.description ? `<p class="showcase-item__description">${item.description}</p>` : ''}
                    <div>
                        <span class="showcase-item__price">$${parseFloat(item.price).toFixed(2)}</span>
                        ${!item.is_available ? '<span class="showcase-item__unavailable">SOLD OUT</span>' : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');

    observeAll();
}

// ===== EVENTS =====
async function loadEvents() {
    const list = document.getElementById('eventsList');

    const { data: events, error } = await supabase
        .from('popup_events')
        .select('*')
        .eq('is_active', true)
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

    if (error || !events || events.length === 0) {
        list.innerHTML = '<div class="events__empty">No upcoming popups yet — check back soon!</div>';
        return;
    }

    list.innerHTML = events.map((event, i) => {
        const date = new Date(event.event_date + 'T00:00:00');
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = date.getDate();
        const startTime = formatTime(event.start_time);
        const endTime = event.end_time ? ` – ${formatTime(event.end_time)}` : '';

        return `
            <div class="event-card reveal" style="transition-delay: ${i * 0.1}s">
                <div class="event-card__date">
                    <span class="event-card__month">${month}</span>
                    <span class="event-card__day">${day}</span>
                </div>
                <div class="event-card__info">
                    <h3 class="event-card__title">${event.title}</h3>
                    <p class="event-card__location">${event.location_name}${event.address ? ` — ${event.address}` : ''}</p>
                    <p class="event-card__time">${startTime}${endTime}</p>
                    ${event.description ? `<p class="event-card__description">${event.description}</p>` : ''}
                </div>
            </div>
        `;
    }).join('');

    observeAll();
}

function formatTime(timeStr) {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${m} ${ampm}`;
}

// ===== MAILING LIST SIGNUP =====
const signupForm = document.getElementById('signupForm');
const signupStatus = document.getElementById('signupStatus');

signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('signupBtn');
    const email = document.getElementById('signupEmail').value.trim();
    const firstName = document.getElementById('signupName').value.trim();

    if (!email) return;

    btn.textContent = 'JOINING...';
    btn.disabled = true;

    const { error } = await supabase
        .from('mailing_list')
        .insert([{ email, first_name: firstName || null }]);

    if (error) {
        if (error.code === '23505') {
            signupStatus.textContent = "You're already on the list!";
        } else {
            signupStatus.textContent = 'Something went wrong. Try again?';
            signupStatus.style.color = 'var(--color-red)';
        }
    } else {
        signupStatus.textContent = "You're in! Welcome to the crew.";
        signupStatus.style.color = '#4ade80';
        signupForm.reset();

        // Notify you about new subscriber
        sendEmailNotification({
            to: NOTIFY_EMAIL,
            subject: `New subscriber: ${firstName || email}`,
            html: `
                <h2>New mailing list signup!</h2>
                <p><strong>Name:</strong> ${firstName || '(not provided)'}</p>
                <p><strong>Email:</strong> ${email}</p>
            `,
        });
    }

    btn.textContent = 'COUNT ME IN';
    btn.disabled = false;
});

// ===== CONTACT FORM =====
const contactForm = document.getElementById('contactForm');
const contactStatus = document.getElementById('contactStatus');

contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = document.getElementById('contactBtn');
    const name = document.getElementById('contactName').value.trim();
    const email = document.getElementById('contactEmail').value.trim();
    const message = document.getElementById('contactMessage').value.trim();

    if (!name || !email || !message) return;

    btn.textContent = 'SENDING...';
    btn.disabled = true;

    const { error } = await supabase
        .from('contact_messages')
        .insert([{ name, email, message }]);

    if (error) {
        contactStatus.textContent = 'Something went wrong. Try again?';
        contactStatus.style.color = 'var(--color-red)';
    } else {
        contactStatus.textContent = "Sent! We'll be in touch.";
        contactStatus.style.color = '#4ade80';
        contactForm.reset();

        // Send email notification
        sendEmailNotification({
            to: NOTIFY_EMAIL,
            subject: `New contact from ${name}`,
            html: `
                <h2>New message from Spanky's website</h2>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Message:</strong></p>
                <p>${message.replace(/\n/g, '<br>')}</p>
            `,
            reply_to: email,
        });
    }

    btn.textContent = 'SEND IT';
    btn.disabled = false;
});

// ===== AUDIO =====
let audioCtx = null;
let bgMusicPlaying = false;
let bgGain = null;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// Pug "boing" sound effect
function playBoingSound() {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.1);
    osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.4);
}

// Background music — fun chill synth loop
let bgNodes = [];
function startBgMusic() {
    const ctx = getAudioCtx();
    bgGain = ctx.createGain();
    bgGain.gain.value = 0.08;
    bgGain.connect(ctx.destination);

    const notes = [261.6, 329.6, 392.0, 349.2]; // C4, E4, G4, F4
    const beatLen = 0.5;

    function scheduleLoop(startTime) {
        notes.forEach((freq, i) => {
            const osc = ctx.createOscillator();
            const noteGain = ctx.createGain();
            osc.connect(noteGain);
            noteGain.connect(bgGain);
            osc.type = 'triangle';
            osc.frequency.value = freq;
            const t = startTime + i * beatLen;
            noteGain.gain.setValueAtTime(0, t);
            noteGain.gain.linearRampToValueAtTime(1, t + 0.05);
            noteGain.gain.linearRampToValueAtTime(0, t + beatLen - 0.05);
            osc.start(t);
            osc.stop(t + beatLen);
            bgNodes.push(osc);
        });
        // Schedule next loop
        const nextStart = startTime + notes.length * beatLen;
        if (bgMusicPlaying) {
            bgLoopTimer = setTimeout(() => {
                if (bgMusicPlaying) scheduleLoop(ctx.currentTime);
            }, (nextStart - ctx.currentTime - 0.1) * 1000);
        }
    }

    bgMusicPlaying = true;
    scheduleLoop(ctx.currentTime);
}

let bgLoopTimer = null;
function stopBgMusic() {
    bgMusicPlaying = false;
    clearTimeout(bgLoopTimer);
    if (bgGain) bgGain.gain.value = 0;
}

// Music toggle button
const musicToggle = document.getElementById('musicToggle');
const musicIcon = document.getElementById('musicIcon');

musicToggle.addEventListener('click', () => {
    if (bgMusicPlaying) {
        stopBgMusic();
        musicIcon.textContent = '🔇';
    } else {
        startBgMusic();
        musicIcon.textContent = '🔊';
    }
});

// ===== PUG MASCOT INTERACTION =====
const pugBtn = document.getElementById('pugBtn');
const pugCharacter = document.getElementById('pugCharacter');
const pugSpeech = document.getElementById('pugSpeech');
pugBtn.addEventListener('click', () => {
    // Play boing sound
    playBoingSound();

    // Reset animations
    pugCharacter.classList.remove('jumping');
    pugSpeech.classList.remove('show');

    // Force reflow so animation restarts
    void pugCharacter.offsetWidth;

    // Trigger jump + speech bubble
    pugCharacter.classList.add('jumping');
    pugSpeech.classList.add('show');

    // Scroll to menu after the jump animation
    setTimeout(() => {
        document.getElementById('menu').scrollIntoView({ behavior: 'smooth' });
    }, 900);

    // Clean up classes after animation completes
    setTimeout(() => {
        pugCharacter.classList.remove('jumping');
        pugSpeech.classList.remove('show');
    }, 2000);
});

// ===== INIT =====
observeAll();
loadMenu();
loadEvents();
