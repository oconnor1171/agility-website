# Claude Code Prompt: Add Google Calendar Appointment Scheduling to Book Online Page

## Objective

Replace the current static service cards on `pages/book-online.html` with a live Google Calendar Appointment Scheduling embed. The page should show a monthly calendar view where visitors can see available time slots and book directly. The calendar is tied to `oconnor1171@gmail.com`.

Push all changes to GitHub when complete.

---

## Repository Details

- **Repo:** `https://github.com/oconnor1171/agility-website.git`
- **Branch:** `main`
- **Primary file:** `pages/book-online.html`
- **Stylesheet:** `css/style.css`

---

## Part 1: Restructure book-online.html

Replace the entire `<main>` section of `pages/book-online.html` (everything between `</header>` and `<!-- Footer -->`) with the following. This keeps the service info as compact chips and embeds the live Google Calendar below.

### New `<main>` content:

```html
<main>
  <!-- Hero Section -->
  <section class="hero">
    <div class="container">
      <h1>Book an Appointment</h1>
      <p class="hero-subtitle">View availability and schedule your consultation</p>
    </div>
  </section>

  <!-- Service Selection -->
  <section class="booking-services">
    <div class="container">
      <h2 style="margin-bottom: 8px;">Our Services</h2>
      <p style="color: var(--text-muted); margin-bottom: 24px;">Select a time below that works for you. If you need a specific service, mention it in the booking notes.</p>
      <div class="services-grid" style="grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 16px;">
        <div class="service-chip">
          <strong>Tax Planning</strong>
          <span>60-90 min · From $250</span>
        </div>
        <div class="service-chip">
          <strong>Estate Planning</strong>
          <span>60-90 min · From $300</span>
        </div>
        <div class="service-chip">
          <strong>Business Formation</strong>
          <span>45-60 min · From $200</span>
        </div>
        <div class="service-chip">
          <strong>Tax Preparation</strong>
          <span>30-45 min · From $150</span>
        </div>
        <div class="service-chip">
          <strong>Accounting & Bookkeeping</strong>
          <span>Ongoing · From $500/mo</span>
        </div>
        <div class="service-chip">
          <strong>Financial Consultation</strong>
          <span>60 min · From $200</span>
        </div>
      </div>
    </div>
  </section>

  <!-- Calendar Embed -->
  <section class="booking-calendar" id="calendar">
    <div class="container">
      <h2 style="margin-bottom: 8px;">Select a Date & Time</h2>
      <p style="color: var(--text-muted); margin-bottom: 24px;">Choose an available slot from the calendar below. All times are shown in Eastern Time (ET).</p>
      <div class="calendar-embed-wrapper">
        <!-- Google Calendar Appointment Scheduling begin -->
        <iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ199PbjLzlfJ-QzRtvf_zLr9v8ZagghbwxnMrVagxuNvNIWUeaIQvioCBUE93f4pJNsdMJqzg0P?gv=true" style="border: 0" width="100%" height="800" frameborder="0"></iframe>
        <!-- end Google Calendar Appointment Scheduling -->
      </div>
    </div>
  </section>
</main>
```

---

## Part 2: Add CSS for New Booking Page Elements

Add the following to the end of `css/style.css`:

```css
/* Booking page — service chips */
.service-chip {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 16px;
  text-align: center;
  box-shadow: var(--shadow);
  transition: border-color var(--transition), box-shadow var(--transition);
}
.service-chip:hover {
  border-color: var(--secondary);
  box-shadow: 0 4px 12px rgba(46, 134, 193, .15);
}
.service-chip strong { display: block; margin-bottom: 4px; color: var(--primary); font-size: .95rem; }
.service-chip span { font-size: .82rem; color: var(--text-muted); }

/* Booking page — calendar embed */
.booking-calendar { padding: 48px 0 64px; }
.calendar-embed-wrapper {
  background: #fff;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  overflow: hidden;
  min-height: 600px;
}
.calendar-embed-wrapper iframe {
  display: block;
  width: 100%;
  min-height: 800px;
  border: none;
}
```

---

## Part 3: Verification

1. Open `pages/book-online.html` in a browser.
2. Verify the hero section renders with "Book an Appointment" heading.
3. Verify all 6 service chips display in a responsive grid.
4. Verify the Google Calendar appointment scheduling iframe loads and shows the monthly calendar with available time slots.
5. Click a date in the calendar — available appointment times should appear.
6. Verify the nav bar is intact at the top.
7. Verify mobile responsiveness — service chips stack to fewer columns, the calendar iframe remains usable.

---

## Part 4: Commit and Push

```bash
git add pages/book-online.html css/style.css
git commit -m "Redesign Book Online page with service chips and live Google Calendar appointment scheduling"
git push origin main
```

---

## Important Notes

- Do NOT modify the iframe `src` URL — it contains the unique appointment schedule ID for the owner's Google Calendar.
- The iframe height is set to 800px (increased from Google's default 600px) for better usability — the monthly calendar view needs vertical space.
- The `.calendar-embed-wrapper iframe` CSS overrides inline styles from Google's embed code to ensure full-width responsive behavior.
- All existing service info (pricing, durations) is preserved in the compact chip format.
- Do NOT remove the service images from `/images/` — other pages may reference them.
- The `?gv=true` parameter in the iframe URL enables the Google-hosted visual booking interface.
