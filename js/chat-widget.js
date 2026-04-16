/* ============================================================
   Agility Accounting & Advisors — Appointment Chat Widget
   Integrates with Google Calendar for oconnor1171@gmail.com
   ============================================================ */

const ChatWidget = {
  calendarEmail: 'oconnor1171@gmail.com',
  services: [
    { name: 'Tax Planning',                     duration: 60, price: 'Complimentary' },
    { name: 'Estate Planning',                   duration: 60, price: 'Complimentary' },
    { name: 'Business Formation / Reorganization', duration: 60, price: 'Complimentary' },
    { name: 'Tax Preparation',                   duration: 60, price: 'Negotiable' },
    { name: 'Accounting, Bookkeeping & Financial Analysis', duration: 60, price: 'Negotiable' },
    { name: 'Financial Consultation',            duration: 60, price: 'Negotiable' }
  ],

  state: { step: 'welcome', mode: null, service: null, name: '', email: '', phone: '', date: '', time: '', question: '' },

  init() {
    const body = document.querySelector('.chat-body');
    if (!body) return;
    this.body = body;
    this.render();
  },

  render() {
    if (this.state.mode === 'questions') {
      this.renderQuestions();
    } else {
      switch (this.state.step) {
        case 'welcome':    this.showWelcome(); break;
        case 'service':    this.showServices(); break;
        case 'info':       this.showInfoForm(); break;
        case 'datetime':   this.showDateTime(); break;
        case 'confirm':    this.showConfirm(); break;
        case 'done':       this.showDone(); break;
      }
    }
  },

  showWelcome() {
    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Welcome to Agility Accounting!</strong></p>
      <p>How can I help you today?</p>
      <div style="margin-top:16px;display:flex;flex-direction:column;gap:8px;">
        <button class="chat-action-btn" onclick="ChatWidget.startBooking()">Book an Appointment</button>
        <button class="chat-action-btn secondary" onclick="ChatWidget.startQuestions()">Ask Questions</button>
        <button class="chat-action-btn secondary" onclick="ChatWidget.showContact()">Contact Information</button>
      </div>`;
  },

  showServices() {
    let html = '<p style="margin-bottom:12px;"><strong>Select a service:</strong></p>';
    this.services.forEach((s, i) => {
      html += `<button class="chat-service-btn" onclick="ChatWidget.selectService(${i})">
        <span>${s.name}</span>
        <small>${s.duration} min &middot; ${s.price}</small>
      </button>`;
    });
    html += `<button class="chat-back-btn" onclick="ChatWidget.goTo('welcome')">&larr; Back</button>`;
    this.body.innerHTML = html;
  },

  startBooking() {
    this.state.mode = 'booking';
    this.goTo('service');
  },

  startQuestions() {
    this.state.mode = 'questions';
    this.state.question = '';
    this.render();
  },

  showInfoForm() {
    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Your information:</strong></p>
      <p class="chat-selected-service">${this.state.service.name}</p>
      <div class="chat-form-group">
        <input type="text" id="chat-name" placeholder="Full Name" value="${this.state.name}" />
      </div>
      <div class="chat-form-group">
        <input type="email" id="chat-email" placeholder="Email" value="${this.state.email}" />
      </div>
      <div class="chat-form-group">
        <input type="tel" id="chat-phone" placeholder="Phone (optional)" value="${this.state.phone}" />
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="chat-back-btn" onclick="ChatWidget.goTo('service')">&larr; Back</button>
        <button class="chat-action-btn" onclick="ChatWidget.submitInfo()">Next &rarr;</button>
      </div>`;
  },

  submitInfo() {
    const name  = document.getElementById('chat-name').value.trim();
    const email = document.getElementById('chat-email').value.trim();
    const phone = document.getElementById('chat-phone').value.trim();
    if (!name || !email) {
      alert('Please provide your name and email.');
      return;
    }
    this.state.name  = name;
    this.state.email = email;
    this.state.phone = phone;
    this.goTo('datetime');
  },

  showDateTime() {
    const today = new Date();
    const minDate = today.toISOString().split('T')[0];
    const maxDate = new Date(today.getTime() + 30 * 86400000).toISOString().split('T')[0];
    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Choose date & time:</strong></p>
      <p class="chat-selected-service">${this.state.service.name}</p>
      <div class="chat-form-group">
        <label>Date</label>
        <input type="date" id="chat-date" min="${minDate}" max="${maxDate}" value="${this.state.date}" />
      </div>
      <div class="chat-form-group">
        <label>Preferred Time</label>
        <select id="chat-time">
          <option value="">Select a time</option>
          <option value="09:00">9:00 AM</option>
          <option value="10:00">10:00 AM</option>
          <option value="11:00">11:00 AM</option>
          <option value="12:00">12:00 PM</option>
          <option value="13:00">1:00 PM</option>
          <option value="14:00">2:00 PM</option>
          <option value="15:00">3:00 PM</option>
          <option value="16:00">4:00 PM</option>
        </select>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="chat-back-btn" onclick="ChatWidget.goTo('info')">&larr; Back</button>
        <button class="chat-action-btn" onclick="ChatWidget.submitDateTime()">Review &rarr;</button>
      </div>`;
    if (this.state.time) document.getElementById('chat-time').value = this.state.time;
  },

  submitDateTime() {
    const date = document.getElementById('chat-date').value;
    const time = document.getElementById('chat-time').value;
    if (!date || !time) { alert('Please select a date and time.'); return; }
    this.state.date = date;
    this.state.time = time;
    this.goTo('confirm');
  },

  showConfirm() {
    const s = this.state;
    const dt = new Date(`${s.date}T${s.time}`);
    const dateStr = dt.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
    const timeStr = dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Confirm your appointment:</strong></p>
      <div class="chat-confirm-card">
        <p><strong>Service:</strong> ${s.service.name}</p>
        <p><strong>Price:</strong> ${s.service.price}</p>
        <p><strong>Date:</strong> ${dateStr}</p>
        <p><strong>Time:</strong> ${timeStr}</p>
        <p><strong>Name:</strong> ${s.name}</p>
        <p><strong>Email:</strong> ${s.email}</p>
        ${s.phone ? `<p><strong>Phone:</strong> ${s.phone}</p>` : ''}
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="chat-back-btn" onclick="ChatWidget.goTo('datetime')">&larr; Edit</button>
        <button class="chat-action-btn accent" onclick="ChatWidget.bookAppointment()">Confirm & Book</button>
      </div>`;
  },

  bookAppointment() {
    const s = this.state;
    // Build Google Calendar event link
    const start = new Date(`${s.date}T${s.time}`);
    const end   = new Date(start.getTime() + s.service.duration * 60000);
    const fmt   = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    const details = `Service: ${s.service.name}%0AClient: ${s.name}%0AEmail: ${s.email}${s.phone ? '%0APhone: ' + s.phone : ''}`;

    const calUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE`
      + `&text=${encodeURIComponent('Agility Accounting - ' + s.service.name)}`
      + `&dates=${fmt(start)}/${fmt(end)}`
      + `&details=${details}`
      + `&add=${this.calendarEmail}`
      + `&sf=true&output=xml`;

    // Open Google Calendar in new tab
    window.open(calUrl, '_blank');
    this.goTo('done');
  },

  showDone() {
    this.body.innerHTML = `
      <div style="text-align:center;padding:20px 0;">
        <div style="font-size:3rem;margin-bottom:12px;">&#9989;</div>
        <p><strong>Almost done!</strong></p>
        <p>A Google Calendar event has been opened. Please save it to complete your booking.</p>
        <p style="margin-top:12px;">We'll follow up at <strong>${this.state.email}</strong> to confirm.</p>
        <button class="chat-action-btn" style="margin-top:16px;" onclick="ChatWidget.reset()">Book Another</button>
      </div>`;
  },

  showContact() {
    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Get in touch:</strong></p>
      <p>&#128222; <a href="tel:4104562433">410-456-2433</a></p>
      <p>&#128231; <a href="mailto:oconnor1171@gmail.com">oconnor1171@gmail.com</a></p>
      <p style="margin-top:12px;">Or use our <a href="pages/contact.html">contact form</a>.</p>
      <button class="chat-back-btn" style="margin-top:12px;" onclick="ChatWidget.goTo('welcome')">&larr; Back</button>`;
  },

  renderQuestions() {
    const q = this.state.question;
    let response = '';

    if (q) {
      // First try keyword-based responses for simple questions
      const lowerQ = q.toLowerCase();
      let isSimpleQuestion = false;

      if (lowerQ.includes('price') || lowerQ.includes('cost') || lowerQ.includes('fee')) {
        response = 'Our initial consultations are complimentary. Pricing for ongoing services depends on your specific needs. We\'ll provide a detailed quote after discussing your situation.';
        isSimpleQuestion = true;
      } else if (lowerQ.includes('service') || lowerQ.includes('what do you do')) {
        response = 'We provide CPA-led financial analysis, tax planning, bookkeeping, business formation, estate planning, and operational benchmarking for various industries including restaurants, retail, real estate, and professional services.';
        isSimpleQuestion = true;
      } else if (lowerQ.includes('industry') || lowerQ.includes('restaurant') || lowerQ.includes('retail') || lowerQ.includes('real estate')) {
        response = 'We serve restaurants, retail businesses, real estate professionals, medical practices, legal firms, and other service-based businesses. Our financial analysis helps identify operational efficiencies and profitability improvements.';
        isSimpleQuestion = true;
      } else if (lowerQ.includes('how long') || lowerQ.includes('timeline')) {
        response = 'Initial consultations are typically 30-60 minutes. Financial analysis projects range from 1-4 weeks depending on complexity. We\'ll discuss timelines during your consultation.';
        isSimpleQuestion = true;
      } else if (lowerQ.includes('location') || lowerQ.includes('baltimore') || lowerQ.includes('remote')) {
        response = 'We\'re based in Baltimore, MD and serve clients throughout Maryland. We offer both in-person and virtual consultations to accommodate your preferences.';
        isSimpleQuestion = true;
      }

      // For complex questions, use AI if available
      if (!isSimpleQuestion) {
        this.getAIResponse(q);
        return; // Exit early, response will be shown when AI responds
      }
    }

    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Ask us anything!</strong></p>
      <p>What would you like to know about our services?</p>
      <div class="chat-form-group" style="margin-top:16px;">
        <textarea id="chat-question" placeholder="Type your question here..." rows="3">${q}</textarea>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="chat-back-btn" onclick="ChatWidget.backToWelcome()">&larr; Back</button>
        <button class="chat-action-btn" onclick="ChatWidget.submitQuestion()">Ask Question</button>
      </div>`;

    if (response) {
      this.body.innerHTML += `
        <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;">
          <p style="margin:0;"><strong>Our response:</strong></p>
          <p style="margin:8px 0 0 0;">${response}</p>
          <button class="chat-action-btn" style="margin-top:12px;" onclick="ChatWidget.startBooking()">Schedule Consultation</button>
        </div>`;
    }
  },

  submitQuestion() {
    const question = document.getElementById('chat-question').value.trim();
    if (!question) {
      alert('Please enter your question.');
      return;
    }
    this.state.question = question;
    this.render();
  },

  async getAIResponse(question) {
    // Show loading state
    this.body.innerHTML = `
      <p style="margin-bottom:12px;"><strong>Ask us anything!</strong></p>
      <p>What would you like to know about our services?</p>
      <div class="chat-form-group" style="margin-top:16px;">
        <textarea id="chat-question" placeholder="Type your question here..." rows="3">${question}</textarea>
      </div>
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button class="chat-back-btn" onclick="ChatWidget.backToWelcome()">&larr; Back</button>
        <button class="chat-action-btn" disabled>Loading...</button>
      </div>
      <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;">
        <p style="margin:0;"><strong>Thinking...</strong></p>
        <p style="margin:8px 0 0 0;">Getting you the best answer...</p>
      </div>`;

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: question
        })
      });

      if (response.ok) {
        const data = await response.json();
        const aiReply = data.reply;

        // Check if the AI response suggests booking
        const lowerReply = aiReply.toLowerCase();
        const suggestsBooking = lowerReply.includes('schedule') || lowerReply.includes('consultation') ||
                               lowerReply.includes('appointment') || lowerReply.includes('call us') ||
                               lowerReply.includes('contact us');

        this.body.innerHTML = `
          <p style="margin-bottom:12px;"><strong>Ask us anything!</strong></p>
          <p>What would you like to know about our services?</p>
          <div class="chat-form-group" style="margin-top:16px;">
            <textarea id="chat-question" placeholder="Type your question here..." rows="3">${question}</textarea>
          </div>
          <div style="display:flex;gap:8px;margin-top:12px;">
            <button class="chat-back-btn" onclick="ChatWidget.backToWelcome()">&larr; Back</button>
            <button class="chat-action-btn" onclick="ChatWidget.submitQuestion()">Ask Another Question</button>
          </div>
          <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;">
            <p style="margin:0;"><strong>Our response:</strong></p>
            <p style="margin:8px 0 0 0;">${aiReply}</p>
            ${suggestsBooking ? '<button class="chat-action-btn" style="margin-top:12px;" onclick="ChatWidget.startBooking()">Book Consultation Now</button>' : ''}
          </div>`;
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('AI Chat error:', error);
      // Fallback to simple response
      this.body.innerHTML = `
        <p style="margin-bottom:12px;"><strong>Ask us anything!</strong></p>
        <p>What would you like to know about our services?</p>
        <div class="chat-form-group" style="margin-top:16px;">
          <textarea id="chat-question" placeholder="Type your question here..." rows="3">${question}</textarea>
        </div>
        <div style="display:flex;gap:8px;margin-top:12px;">
          <button class="chat-back-btn" onclick="ChatWidget.backToWelcome()">&larr; Back</button>
          <button class="chat-action-btn" onclick="ChatWidget.submitQuestion()">Ask Question</button>
        </div>
        <div style="margin-top:16px;padding:12px;background:#f8f9fa;border-radius:8px;">
          <p style="margin:0;"><strong>Our response:</strong></p>
          <p style="margin:8px 0 0 0;">That\'s a great question! For detailed answers about your specific situation, I recommend scheduling a free consultation. We can discuss your needs and provide personalized guidance.</p>
          <button class="chat-action-btn" style="margin-top:12px;" onclick="ChatWidget.startBooking()">Schedule Consultation</button>
        </div>`;
    }
  },

  backToWelcome() {
    this.state.mode = null;
    this.state.step = 'welcome';
    this.render();
  },

  goTo(step) {
    this.state.step = step;
    this.render();
  },

  reset() {
    this.state = { step: 'welcome', mode: null, service: null, name: '', email: '', phone: '', date: '', time: '', question: '' };
    this.render();
  },

  reset() {
    this.state = { step: 'welcome', service: null, name: '', email: '', phone: '', date: '', time: '' };
    this.render();
  }
};

/* Chat widget internal styles */
(function injectChatStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .chat-action-btn {
      padding: 10px 20px; border: none; border-radius: 6px;
      background: #2e86c1; color: #fff; font-weight: 600; font-size: .88rem;
      cursor: pointer; transition: background .2s;
    }
    .chat-action-btn:hover { background: #1a3c5e; }
    .chat-action-btn.secondary { background: #6c757d; }
    .chat-action-btn.secondary:hover { background: #495057; }
    .chat-action-btn.accent { background: #f39c12; }
    .chat-action-btn.accent:hover { background: #e67e22; }
    .chat-service-btn {
      display: flex; flex-direction: column; width: 100%;
      padding: 10px 14px; margin-bottom: 6px; border: 1px solid #dee2e6;
      border-radius: 6px; background: #fff; cursor: pointer;
      text-align: left; transition: all .2s;
    }
    .chat-service-btn:hover { border-color: #2e86c1; background: #f0f7fd; }
    .chat-service-btn span { font-weight: 600; font-size: .9rem; }
    .chat-service-btn small { color: #6c757d; font-size: .8rem; margin-top: 2px; }
    .chat-form-group { margin-bottom: 10px; }
    .chat-form-group label { display: block; font-size: .82rem; font-weight: 600; margin-bottom: 4px; color: #495057; }
    .chat-form-group input, .chat-form-group select {
      width: 100%; padding: 8px 12px; border: 1px solid #dee2e6;
      border-radius: 6px; font-size: .9rem; font-family: inherit;
    }
    .chat-form-group input:focus, .chat-form-group select:focus { outline: none; border-color: #2e86c1; }
    .chat-back-btn {
      padding: 8px 16px; border: 1px solid #dee2e6; border-radius: 6px;
      background: #fff; color: #495057; font-size: .85rem; cursor: pointer;
    }
    .chat-back-btn:hover { background: #f8f9fa; }
    .chat-selected-service {
      display: inline-block; padding: 4px 12px; background: #eaf4fd;
      color: #2e86c1; border-radius: 20px; font-size: .82rem; font-weight: 600; margin-bottom: 12px;
    }
    .chat-confirm-card {
      background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px;
      padding: 14px; font-size: .88rem;
    }
    .chat-confirm-card p { margin-bottom: 4px; }
  `;
  document.head.appendChild(style);
})();

/* Auto-init when DOM ready */
document.addEventListener('DOMContentLoaded', () => ChatWidget.init());
