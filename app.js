import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL = 'https://pvkbwpdxtaaetzwdyazy.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InB2a2J3cGR4dGFhZXR6d2R5YXp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MzI0NTMsImV4cCI6MjA4NjIwODQ1M30.0WC3c6RvjrvKmz6a-uhsIeOBwdf2k-6ZVSN9OENXc4Y';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ===== NAV =====
const navToggle = document.getElementById('navToggle');
const mobileMenu = document.getElementById('mobileMenu');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
});

// Close mobile menu on link click
mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        mobileMenu.classList.remove('open');
    });
});

// Sticky nav background
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 50
        ? 'rgba(255, 243, 220, 0.95)'
        : 'rgba(255, 243, 220, 0.9)';
});

// ===== MENU =====
const categoryEmojis = {
    sandwich: '🥪',
    side: '🍟',
    drink: '🥤',
    dessert: '🍪',
    special: '⭐',
};

async function loadMenu() {
    const grid = document.getElementById('menuGrid');

    const { data: items, error } = await supabase
        .from('menu_items')
        .select('*')
        .order('sort_order', { ascending: true });

    if (error || !items || items.length === 0) {
        grid.innerHTML = '<div class="menu__empty">Menu coming soon — stay tuned!</div>';
        return;
    }

    grid.innerHTML = items.map(item => `
        <div class="menu-card">
            <div class="menu-card__image">
                ${item.image_url
                    ? `<img src="${item.image_url}" alt="${item.name}" loading="lazy">`
                    : categoryEmojis[item.category] || '🥪'
                }
            </div>
            <div class="menu-card__body">
                <div class="menu-card__category">${item.category}</div>
                <h3 class="menu-card__name">${item.name}</h3>
                ${item.description ? `<p class="menu-card__description">${item.description}</p>` : ''}
                <div>
                    <span class="menu-card__price">$${parseFloat(item.price).toFixed(2)}</span>
                    ${!item.is_available ? '<span class="menu-card__unavailable">Sold Out</span>' : ''}
                </div>
            </div>
        </div>
    `).join('');
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

    list.innerHTML = events.map(event => {
        const date = new Date(event.event_date + 'T00:00:00');
        const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
        const day = date.getDate();

        const startTime = formatTime(event.start_time);
        const endTime = event.end_time ? ` – ${formatTime(event.end_time)}` : '';

        return `
            <div class="event-card">
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
            signupStatus.textContent = "You're already on the list! 🎉";
            signupStatus.style.color = 'var(--color-yellow)';
        } else {
            signupStatus.textContent = 'Something went wrong. Try again?';
            signupStatus.style.color = 'var(--color-red)';
        }
    } else {
        signupStatus.textContent = "You're in! Welcome to the crew 🥪";
        signupStatus.style.color = '#4ade80';
        signupForm.reset();
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
        contactStatus.textContent = "Message sent! We'll get back to you 🤙";
        contactStatus.style.color = '#4ade80';
        contactForm.reset();
    }

    btn.textContent = 'SEND IT';
    btn.disabled = false;
});

// ===== INIT =====
loadMenu();
loadEvents();
