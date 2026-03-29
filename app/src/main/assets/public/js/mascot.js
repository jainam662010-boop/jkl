/**
 * EduBuddy Mascot - Friendly AI companion for Class 10Edu
 * Provides encouraging messages, tips, and personality to the learning experience
 */

'use strict';

const EduBuddy = {
  // Encouraging messages based on context
  MESSAGES: {
    welcome: [
      "Hey there! 👋 Ready to learn something awesome today?",
      "Welcome back! 🎉 Let's make today count!",
      "Hey superstar! 🌟 Excited to learn with you!",
      "Good to see you! 💪 Ready to crush some goals?",
      "Hello learner! 📚 Let's do this!"
    ],
    
    morning: [
      "Good morning! ☀️ Fresh start, fresh knowledge!",
      "Rise and shine! 🌅 Time to feed your brain!",
      "Morning! 🦉 Early bird gets the wisdom!"
    ],
    
    afternoon: [
      "Afternoon! ☕ Coffee break? More like learning break!",
      "Hey! 🌤️ Ready for an afternoon of discovery?",
      "Good afternoon! 🎯 Let's keep that momentum going!"
    ],
    
    evening: [
      "Evening! 🌙 Night owl mode activated!",
      "Hey there! 💡 Lighting up your evening with knowledge!",
      "Evening learner! 🔥 The grind doesn't stop!"
    ],
    
    streak: [
      "🔥 Streak alive! You're on fire!",
      "Keep it burning! 🔥 Don't break the chain!",
      "Streak master! 🔥 Consistency is key!",
      "You're building an amazing habit! 🔥"
    ],
    
    firstLesson: [
      "First lesson! 🎉 Great start!",
      "Way to begin! 🌱 Every expert started here!",
      "Awesome first step! 🚀 The journey of 1000 miles..."
    ],
    
    lessonComplete: [
      "Lesson done! 🎉 You're getting smarter!",
      "Crushed it! 💪 Keep the momentum!",
      "Nice work! 🌟 Progress feels good, right?",
      "Another one down! 🎯 You're unstoppable!",
      "Boom! 💥 Knowledge acquired!"
    ],
    
    quizCorrect: [
      "Correct! 🎯 You got this!",
      "Nailed it! ⭐ Sharp thinking!",
      "Right on! 🎉 Brain power activated!",
      "Yes! 💡 You're on fire!"
    ],
    
    quizWrong: [
      "Almost! 💪 Try again - learning is trying!",
      "Close! 🌱 Mistakes help us grow!",
      "Not quite! 📚 Every wrong answer is progress!",
      "Good effort! 🎯 You'll get it next time!"
    ],
    
    levelUp: [
      "Level up! 🎉 You're leveling up in life!",
      "New level! 🌟 Keep growing!",
      "Progress! 🚀 You're soaring!",
      "Amazing! 💪 Hard work pays off!"
    ],
    
    breakSuggestion: [
      "You've been crushing it! 🧠 Maybe take a quick break?",
      "Brain power at 100%! ☕ Hydrate and celebrate!",
      "Wow, dedicated learner! 🎯 Don't forget to breathe!"
    ],
    
    idle: [
      "Still there? 👋 I'm ready when you are!",
      "Taking a break? 🌱 Come back soon!",
      "I'll be right here! 📚 Ready to learn together!"
    ]
  },

  // Get time-appropriate greeting
  getTimeContext() {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  },

  // Get random message from category
  getRandomMessage(category) {
    const messages = this.MESSAGES[category] || this.MESSAGES.welcome;
    return messages[Math.floor(Math.random() * messages.length)];
  },

  // Get personalized welcome message
  getWelcomeMessage(name, streak) {
    let message = '';
    
    // Add time-based greeting
    message += this.getRandomMessage(this.getTimeContext()) + ' ';
    
    // Add name if provided
    if (name) {
      message = message.replace('!', `, ${name}!`);
    }
    
    // Add streak encouragement if active
    if (streak && streak > 1) {
      message += ` ${this.getRandomMessage('streak')} `;
    }
    
    return message.trim();
  },

  // Create mascot HTML element
  createElement(message = null, type = 'default') {
    const msg = message || this.getWelcomeMessage();
    const avatar = type === 'celebration' ? '🎉' : type === 'thinking' ? '🤔' : '🦉';
    
    const el = document.createElement('div');
    el.className = 'edubuddy';
    el.innerHTML = `
      <span class="edubuddy-avatar">${avatar}</span>
      <span class="edubuddy-message">${msg}</span>
      <button class="edubuddy-close" style="background: none; border: none; cursor: pointer; font-size: 16px; margin-left: 8px;">×</button>
    `;
    
    // Auto-dismiss after 8 seconds unless hovered
    let dismissTimer = setTimeout(() => {
      if (el.parentNode) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-10px)';
        setTimeout(() => el.remove(), 300);
      }
    }, 8000);
    
    el.addEventListener('mouseenter', () => clearTimeout(dismissTimer));
    el.addEventListener('mouseleave', () => {
      dismissTimer = setTimeout(() => {
        if (el.parentNode) {
          el.style.opacity = '0';
          setTimeout(() => el.remove(), 300);
        }
      }, 3000);
    });
    
    // Close button
    el.querySelector('.edubuddy-close').addEventListener('click', () => {
      el.style.opacity = '0';
      setTimeout(() => el.remove(), 300);
    });
    
    return el;
  },

  // Show mascot with message
  show(message = null, type = 'default', container = null) {
    const target = container || document.querySelector('.dashboard-container') || document.body;
    const el = this.createElement(message, type);
    
    // Insert at top of container
    if (target.firstChild) {
      target.insertBefore(el, target.firstChild);
    } else {
      target.appendChild(el);
    }
    
    // Animate in
    requestAnimationFrame(() => {
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
    
    return el;
  },

  // Show celebration
  celebrate(message) {
    return this.show(message || this.getRandomMessage('lessonComplete'), 'celebration');
  },

  // Show thinking state
  think(message = 'Hmm... let me think about that... 🤔') {
    return this.show(message, 'thinking');
  },

  // Show encouraging message for action
  encourage(action) {
    const messages = {
      'lesson-start': ["Let's do this! 📚", "You've got this! 💪", "Ready to learn! 🎯"],
      'quiz-start': ["Show what you know! 🧠", "Test time! Good luck! 🍀", "You've prepared for this! ⭐"],
      'streak-risk': ["Don't break the chain! 🔥", "Your streak needs you! 🔥", "Quick lesson to keep it alive! ⚡"]
    };
    
    const actionMessages = messages[action] || this.MESSAGES.welcome;
    const msg = actionMessages[Math.floor(Math.random() * actionMessages.length)];
    return this.show(msg);
  },

  // Initialize on page
  init() {
    // Only show on dashboard
    if (!document.querySelector('.dashboard-container')) return;
    
    // Get user info
    const profile = window.App ? App.getProfile() : null;
    const name = profile?.name || null;
    const streak = window.Gamification ? Gamification.getStreak() : 0;
    
    // Show welcome after a short delay
    setTimeout(() => {
      this.show(this.getWelcomeMessage(name, streak));
    }, 1000);
    
    // Idle detection - show message if inactive for 2 minutes
    let idleTimer;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        this.show(this.getRandomMessage('idle'), 'thinking');
      }, 120000); // 2 minutes
    };
    
    ['click', 'scroll', 'keypress'].forEach(event => {
      document.addEventListener(event, resetIdle);
    });
    resetIdle();
  }
};

// Auto-initialize
if (typeof window !== 'undefined') {
  window.EduBuddy = EduBuddy;
  
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => EduBuddy.init());
  } else {
    setTimeout(() => EduBuddy.init(), 500);
  }
}
