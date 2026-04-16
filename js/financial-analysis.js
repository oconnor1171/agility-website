// Financial Analysis Landing Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // FAQ Accordion
  const faqItems = document.querySelectorAll('.fa-faq-item');
  faqItems.forEach(item => {
    item.addEventListener('click', function() {
      this.classList.toggle('open');
    });
  });

  // Scroll to mock on CTA click
  const scrollBtn = document.querySelector('.fa-cta-outline');
  if (scrollBtn) {
    scrollBtn.addEventListener('click', function(e) {
      e.preventDefault();
      const mock = document.querySelector('.fa-mock-panel');
      if (mock) {
        mock.scrollIntoView({ behavior: 'smooth' });
        // Add highlight effect
        mock.style.boxShadow = '0 0 0 3px rgba(158,140,44,0.3)';
        setTimeout(() => {
          mock.style.boxShadow = '';
        }, 2000);
      }
    });
  }

  // Mock Analysis Tabs
  const mockTabs = document.querySelectorAll('.fa-mock-tab');
  const mockSections = document.querySelectorAll('.fa-mock-section');

  mockTabs.forEach((tab, index) => {
    tab.addEventListener('click', function() {
      // Remove active class from all tabs
      mockTabs.forEach(t => t.classList.remove('active'));

      // Add active class to clicked tab
      this.classList.add('active');

      // Hide all sections
      mockSections.forEach(section => {
        section.style.display = 'none';
      });

      // Show corresponding section
      const sectionClasses = ['operational-analysis', 'income-statement', 'benchmarks', 'cost-analysis'];
      const targetSection = document.querySelector('.fa-mock-section.' + sectionClasses[index]);
      if (targetSection) {
        targetSection.style.display = 'block';
      }
    });
  });

  function normalizeWebsite(url) {
    if (!url) return '';
    const trimmed = url.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return 'https://' + trimmed;
  }

  // Contact Form Submission to Google Apps Script
  const form = document.querySelector('.fa-contact-form');
  if (form) {
    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwKtwnBjH6N71jFsFRMbTrRzHC8LW6waau2Fam77l9Ne_F_fd1_qXECsZIqQgZsicJU6Q/exec';
    let isSubmitting = false;

    form.addEventListener('submit', async function(e) {
      e.preventDefault();
      if (isSubmitting) return;
      isSubmitting = true;

      const btn = form.querySelector('.fa-submit-btn');
      const originalButtonText = btn ? btn.textContent : 'Submit';
      if (btn) {
        btn.disabled = true;
        btn.textContent = 'Sending...';
      }

      const payload = {
        firstName: form.querySelector('[name="firstName"]').value.trim(),
        lastName: form.querySelector('[name="lastName"]').value.trim(),
        email: form.querySelector('[name="email"]').value.trim(),
        company: (form.querySelector('[name="company"]') || {}).value || '',
        website: normalizeWebsite((form.querySelector('[name="website"]') || {}).value || ''),
        phone: (form.querySelector('[name="phone"]') || {}).value.trim() || '',
        industry: (form.querySelector('[name="industry"]') || {}).value.trim() || '',
        notes: (form.querySelector('[name="message"]') || {}).value.trim() || '',
        sendWorkbook: false,
        submittedAt: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
      };

      if (!payload.firstName || !payload.email) {
        alert('Please enter your name and email address.');
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalButtonText;
        }
        isSubmitting = false;
        return;
      }

      try {
        await fetch(SCRIPT_URL, {
          method: 'POST',
          mode: 'no-cors',
          body: JSON.stringify(payload)
        });

        form.innerHTML = '<div style="text-align:center;padding:40px 20px;">'
          + '<div style="font-size:48px;margin-bottom:16px;color:#2E6B3E;">✓</div>'
          + '<h3 style="color:#1F2D3B;font-size:20px;font-weight:700;margin:0 0 10px;">Thank you, ' + payload.firstName + '!</h3>'
          + '<p style="color:#5A6B78;font-size:15px;line-height:1.6;">'
          + 'Someone from our office will contact you within 1–2 business days.<br>'
          + 'Need to reach us sooner? Call <a href="tel:410-456-2433" style="color:#2E6B3E;font-weight:700;">410-456-2433</a>'
          + '</p></div>';
      } catch (err) {
        alert('Something went wrong. Please try again or email us at oconnor1171@gmail.com');
        if (btn) {
          btn.disabled = false;
          btn.textContent = originalButtonText;
        }
      } finally {
        isSubmitting = false;
      }
    });
  }

  // Chat Widget
  let chatOpen = false;
  let chatMsgs = [
    { role: 'bot', text: 'Hi! I\'m the Agility assistant. Ask me anything about our financial analysis services, pricing, industries we cover, or how to get started.' }
  ];
  let chatLoading = false;

  const chatToggle = document.querySelector('.fa-chat-toggle');
  const chatPanel = document.querySelector('.fa-chat-panel');
  const chatInput = document.querySelector('.fa-chat-input');
  const chatSend = document.querySelector('.fa-chat-send');
  const chatMessages = document.querySelector('.fa-chat-messages');

  function updateChatUI() {
    // Toggle panel visibility
    chatPanel.style.display = chatOpen ? 'flex' : 'none';
    chatToggle.innerHTML = chatOpen ? '✕' : '💬';

    // Update messages
    chatMessages.innerHTML = '';
    chatMsgs.forEach(msg => {
      const msgDiv = document.createElement('div');
      msgDiv.className = `fa-chat-msg ${msg.role}`;
      msgDiv.textContent = msg.text;
      chatMessages.appendChild(msgDiv);

      // Add action buttons if needed
      if (msg.action) {
        const actionDiv = document.createElement('div');
        actionDiv.className = 'fa-chat-actions';
        actionDiv.style.marginTop = '8px';

        if (msg.action === 'booking') {
          const bookBtn = document.createElement('button');
          bookBtn.className = 'fa-chat-action-btn';
          bookBtn.textContent = 'Book Consultation';
          bookBtn.onclick = function() {
            // Open main booking widget
            const mainChatBtn = document.querySelector('.chat-widget-btn');
            if (mainChatBtn) {
              mainChatBtn.click();
              // Switch to booking mode after opening
              setTimeout(() => {
                if (window.ChatWidget && window.ChatWidget.startBooking) {
                  window.ChatWidget.startBooking();
                }
              }, 500);
            } else {
              // Fallback - redirect to contact page
              window.open('pages/contact.html', '_blank');
            }
          };
          actionDiv.appendChild(bookBtn);
        } else if (msg.action === 'contact') {
          const contactBtn = document.createElement('button');
          contactBtn.className = 'fa-chat-action-btn';
          contactBtn.textContent = 'Contact Us';
          contactBtn.onclick = function() {
            window.open('pages/contact.html', '_blank');
          };
          actionDiv.appendChild(contactBtn);
        }

        msgDiv.appendChild(actionDiv);
      }
    });

    if (chatLoading) {
      const loadingDiv = document.createElement('div');
      loadingDiv.className = 'fa-chat-loading';
      loadingDiv.textContent = 'Typing...';
      chatMessages.appendChild(loadingDiv);
    }

    // Scroll to bottom
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // Update send button
    chatSend.disabled = chatLoading;
  }

  if (chatToggle) {
    chatToggle.addEventListener('click', function() {
      chatOpen = !chatOpen;
      updateChatUI();
    });
  }

  async function sendChatMessage() {
    const text = chatInput.value.trim();
    if (!text || chatLoading) return;

    chatInput.value = '';
    chatMsgs.push({ role: 'user', text });
    chatLoading = true;
    updateChatUI();

    // Check for booking intent before calling API
    const lowerText = text.toLowerCase();
    const bookingKeywords = ['book', 'schedule', 'appointment', 'consultation', 'meeting', 'call', 'talk', 'speak', 'meet'];
    const hasBookingIntent = bookingKeywords.some(keyword => lowerText.includes(keyword));

    if (hasBookingIntent) {
      // Offer to switch to booking widget
      chatMsgs.push({
        role: 'bot',
        text: 'I\'d be happy to help you schedule a consultation! Let me connect you with our booking assistant who can help you find the perfect time.'
      });
      chatLoading = false;
      updateChatUI();

      // Add booking button after a short delay
      setTimeout(() => {
        chatMsgs.push({
          role: 'bot',
          text: '',
          action: 'booking'
        });
        updateChatUI();
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: text
        })
      });

      if (response.ok) {
        const data = await response.json();
        let botReply = data.reply;

        // Check if AI response suggests booking
        const lowerReply = botReply.toLowerCase();
        const suggestsBooking = lowerReply.includes('schedule') || lowerReply.includes('consultation') ||
                               lowerReply.includes('appointment') || lowerReply.includes('call us') ||
                               lowerReply.includes('contact us');

        if (suggestsBooking) {
          botReply += '\n\nWould you like me to help you book a consultation?';
          chatMsgs.push({ role: 'bot', text: botReply, action: 'booking' });
        } else {
          chatMsgs.push({ role: 'bot', text: botReply });
        }
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      chatMsgs.push({
        role: 'bot',
        text: 'I\'m sorry, I\'m having trouble connecting right now. Please call us at 410-456-2433 or email oconnor1171@gmail.com to schedule your free consultation.',
        action: 'contact'
      });
    }

    chatLoading = false;
    updateChatUI();
  }

  if (chatSend) {
    chatSend.addEventListener('click', sendChatMessage);
  }

  if (chatInput) {
    chatInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        sendChatMessage();
      }
    });
  }

  // Initialize chat UI
  updateChatUI();
});