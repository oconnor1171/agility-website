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

  // Contact Form Validation
  const form = document.querySelector('.fa-contact-form');
  if (form) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = form.querySelector('input[name="name"]').value.trim();
      const email = form.querySelector('input[name="email"]').value.trim();

      if (!name || !email) {
        alert('Please fill in all required fields.');
        return;
      }

      if (!/\S+@\S+\.\S+/.test(email)) {
        alert('Please enter a valid email address.');
        return;
      }

      // Show success message
      const successMsg = document.createElement('div');
      successMsg.className = 'fa-success-msg';
      successMsg.textContent = 'Thank you! We\'ll be in touch within 24 hours to schedule your free consultation.';
      form.appendChild(successMsg);

      // Reset form
      form.reset();

      // Remove success message after 5 seconds
      setTimeout(() => {
        if (successMsg.parentNode) {
          successMsg.parentNode.removeChild(successMsg);
        }
      }, 5000);
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

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Note: In production, this would need proper API key handling
          // For demo purposes, this will likely fail due to CORS
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: `You are the chat assistant for Agility Accountants & Advisors, a CPA-led financial analysis, tax planning, and bookkeeping firm in Baltimore, MD. Principal: Robert O'Connor, CPA. Phone: 410-456-2433. Email: oconnor1171@gmail.com. Location: Baltimore, Maryland. Facebook: https://www.facebook.com/profile.php?id=100092463736032. You help with questions about financial analysis services, operational benchmarking, industry coverage, pricing, and getting started. Be helpful, professional, and direct users to schedule consultations for detailed quotes.`,
          messages: [{ role: 'user', content: text }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        const botReply = data.content[0].text;
        chatMsgs.push({ role: 'bot', text: botReply });
      } else {
        throw new Error('API request failed');
      }
    } catch (error) {
      console.error('Chat API error:', error);
      chatMsgs.push({
        role: 'bot',
        text: 'I\'m sorry, I\'m having trouble connecting right now. Please call us at 410-456-2433 or email oconnor1171@gmail.com to schedule your free consultation.'
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