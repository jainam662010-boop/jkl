/**
 * Gamification System - Duolingo-style XP, Levels, Badges, Streaks
 * Makes learning addictive and rewarding
 */

'use strict';

const Gamification = {
  // XP values for different actions
  XP_VALUES: {
    LESSON_COMPLETE: 20,
    QUIZ_CORRECT: 10,
    QUIZ_PERFECT: 50,
    CHAPTER_COMPLETE: 100,
    STREAK_MAINTAIN: 5,
    DAILY_LOGIN: 15,
    DAILY_GOAL_COMPLETE: 25,
    SUBJECT_MASTERY: 500,
    FIRST_LESSON: 30,
    PERFECT_STREAK_7: 100,
    PERFECT_STREAK_30: 300
  },

  // Level thresholds with titles
  LEVELS: [
    { level: 1, xp: 0, title: 'Beginner', icon: '🌱' },
    { level: 2, xp: 100, title: 'Explorer', icon: '🔍' },
    { level: 3, xp: 300, title: 'Learner', icon: '📚' },
    { level: 4, xp: 600, title: 'Scholar', icon: '🎓' },
    { level: 5, xp: 1000, title: 'Expert', icon: '⭐' },
    { level: 6, xp: 1500, title: 'Master', icon: '🏆' },
    { level: 7, xp: 2200, title: 'Genius', icon: '💡' },
    { level: 8, xp: 3000, title: 'Legend', icon: '👑' },
    { level: 9, xp: 4000, title: 'Prodigy', icon: '🚀' },
    { level: 10, xp: 5500, title: 'Champion', icon: '🏅' }
  ],

  // Badge definitions
  BADGES: [
    { id: 'first_step', icon: '🎯', title: 'First Step', desc: 'Complete your first lesson', xp: 50 },
    { id: 'quick_learner', icon: '⚡', title: 'Quick Learner', desc: 'Complete 5 lessons in one day', xp: 100 },
    { id: 'perfect_score', icon: '💯', title: 'Perfectionist', desc: 'Get 100% on a quiz', xp: 75 },
    { id: 'week_warrior', icon: '🔥', title: 'Week Warrior', desc: '7 day streak', xp: 150 },
    { id: 'month_master', icon: '📅', title: 'Month Master', desc: '30 day streak', xp: 500 },
    { id: 'math_whiz', icon: '📐', title: 'Math Whiz', desc: 'Complete all Math chapters', xp: 300 },
    { id: 'science_guru', icon: '🔬', title: 'Science Guru', desc: 'Complete all Science chapters', xp: 300 },
    { id: 'sst_master', icon: '🌍', title: 'SST Master', desc: 'Complete all Social Science chapters', xp: 300 },
    { id: 'quiz_champion', icon: '👑', title: 'Quiz Champion', desc: 'Complete 50 quizzes', xp: 200 },
    { id: 'night_owl', icon: '🦉', title: 'Night Owl', desc: 'Study after 10 PM', xp: 50 },
    { id: 'early_bird', icon: '🌅', title: 'Early Bird', desc: 'Study before 7 AM', xp: 50 },
    { id: 'goal_crusher', icon: '💪', title: 'Goal Crusher', desc: 'Complete all daily goals', xp: 100 },
    { id: 'persistent', icon: '🌟', title: 'Persistent', desc: 'Study 100 days total', xp: 400 }
  ],

  // Daily goals
  DAILY_GOALS: [
    { id: 'lesson', icon: '📚', title: 'Complete 2 lessons', target: 2, xp: 20 },
    { id: 'quiz', icon: '✅', title: 'Take 1 quiz', target: 1, xp: 15 },
    { id: 'streak', icon: '🔥', title: 'Maintain streak', target: 1, xp: 10 },
    { id: 'explore', icon: '🔍', title: 'Try a new chapter', target: 1, xp: 25 }
  ],

  // Encouraging messages
  MESSAGES: {
    lessonComplete: [
      'Awesome! 🎉 You\'re getting smarter!',
      'Great job! 🌟 Keep it up!',
      'Fantastic! 💪 You\'re on fire!',
      'Well done! 🎯 Nailed it!',
      'Super! ⭐ You\'re crushing it!'
    ],
    quizCorrect: [
      'Correct! 🎉 You got this!',
      'Nice! 🌟 Keep going!',
      'Brilliant! 💡 Smart thinking!',
      'Perfect! ⭐ Amazing!',
      'Excellent! 🏆 You\'re a star!'
    ],
    quizWrong: [
      'Almost! 💪 Try again!',
      'Close! 🎯 You\'ll get it next time!',
      'Not quite! 🌱 Keep learning!',
      'Good try! 📚 Practice makes perfect!'
    ],
    streakMaintained: [
      'Streak alive! 🔥 You\'re unstoppable!',
      'Keep it burning! 🔥 Don\'t stop now!',
      'Fire streak! 🎉 You\'re on a roll!'
    ],
    levelUp: [
      'Level up! 🎉 You\'re leveling up!',
      'New level! 🌟 Keep growing!',
      'Progress! 🚀 You\'re soaring!'
    ]
  },

  /**
   * Initialize gamification system
   */
  init() {
    this.checkDailyReset();
    this.updateStreak();
    this.loadUnlockedBadges();
  },

  /**
   * Get current XP from localStorage
   */
  getXP() {
    return parseInt(localStorage.getItem('vm_xp') || '0', 10);
  },

  /**
   * Save XP to localStorage
   */
  saveXP(xp) {
    localStorage.setItem('vm_xp', xp.toString());
  },

  /**
   * Get current level based on XP
   */
  getLevel() {
    const xp = this.getXP();
    let level = this.LEVELS[0];
    for (const l of this.LEVELS) {
      if (xp >= l.xp) level = l;
      else break;
    }
    return level;
  },

  /**
   * Get XP needed for next level
   */
  getNextLevelXP() {
    const currentLevel = this.getLevel();
    const nextLevel = this.LEVELS.find(l => l.level === currentLevel.level + 1);
    return nextLevel ? nextLevel.xp : null;
  },

  /**
   * Get XP progress in current level (0-100%)
   */
  getLevelProgress() {
    const currentLevel = this.getLevel();
    const nextLevelXP = this.getNextLevelXP();
    if (!nextLevelXP) return 100;
    
    const levelStartXP = currentLevel.xp;
    const xpInLevel = this.getXP() - levelStartXP;
    const xpNeeded = nextLevelXP - levelStartXP;
    return Math.round((xpInLevel / xpNeeded) * 100);
  },

  /**
   * Add XP and show animation
   */
  addXP(type, customAmount = null) {
    const amount = customAmount || this.XP_VALUES[type] || 10;
    const currentXP = this.getXP();
    const newXP = currentXP + amount;
    
    this.saveXP(newXP);
    
    // Check for level up
    const oldLevel = this.getLevel();
    this.checkLevelUp();
    const newLevel = this.getLevel();
    
    // Show XP gain animation
    this.showXPGain(amount);
    
    // Show level up celebration if leveled up
    if (newLevel.level > oldLevel.level) {
      setTimeout(() => this.showLevelUp(newLevel), 1000);
    }
    
    return { xp: newXP, gained: amount, leveledUp: newLevel.level > oldLevel.level };
  },

  /**
   * Show floating XP animation
   */
  showXPGain(amount) {
    const xpFloat = document.createElement('div');
    xpFloat.className = 'xp-float animate-float';
    xpFloat.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 2rem;
      font-weight: 800;
      color: #22C55E;
      z-index: 10000;
      pointer-events: none;
    `;
    xpFloat.textContent = `+${amount} XP`;
    document.body.appendChild(xpFloat);
    
    setTimeout(() => xpFloat.remove(), 1000);
  },

  /**
   * Check and handle level up
   */
  checkLevelUp() {
    const level = this.getLevel();
    const message = this.getRandomMessage('levelUp');
    // Level up is handled in addXP with celebration
  },

  /**
   * Show level up celebration
   */
  showLevelUp(level) {
    const message = this.getRandomMessage('levelUp');
    
    // Create celebration overlay
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration-card">
        <div class="celebration-icon">${level.icon}</div>
        <div class="celebration-title">Level ${level.level} - ${level.title}!</div>
        <div class="celebration-subtitle">${message}</div>
        <button class="btn-cta" style="margin-top: 24px;" onclick="this.closest('.celebration-overlay').remove()">
          Continue →
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Trigger confetti
    this.triggerConfetti(overlay.querySelector('.celebration-card'));
    
    // Show toast
    if (window.ToastSystem) {
      ToastSystem.show(`🎉 Level ${level.level} unlocked! You're now a ${level.title}!`, 'success');
    }
  },

  /**
   * Get current streak
   */
  getStreak() {
    return parseInt(localStorage.getItem('vm_streak') || '0', 10);
  },

  /**
   * Save streak
   */
  saveStreak(streak) {
    localStorage.setItem('vm_streak', streak.toString());
    localStorage.setItem('vm_last_study', new Date().toISOString());
  },

  /**
   * Update streak based on last study date
   */
  updateStreak() {
    const lastStudy = localStorage.getItem('vm_last_study');
    if (!lastStudy) return;
    
    const lastDate = new Date(lastStudy);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Reset streak if more than 1 day passed
    if (lastDate < yesterday && lastDate.toDateString() !== yesterday.toDateString()) {
      localStorage.setItem('vm_streak', '0');
    }
  },

  /**
   * Increment streak
   */
  incrementStreak() {
    const currentStreak = this.getStreak();
    const newStreak = currentStreak + 1;
    this.saveStreak(newStreak);
    
    // Check for streak badges
    this.checkBadge('week_warrior', newStreak >= 7);
    this.checkBadge('month_master', newStreak >= 30);
    this.checkBadge('persistent', this.getTotalStudyDays() >= 100);
    
    // Add streak XP
    if (newStreak > 1) {
      this.addXP('STREAK_MAINTAIN');
    }
    
    // Show streak message for milestones
    if ([7, 30, 50, 100].includes(newStreak)) {
      if (window.ToastSystem) {
        ToastSystem.show(`🔥 ${newStreak} day streak! Incredible!`, 'success');
      }
    }
    
    return newStreak;
  },

  /**
   * Get total study days
   */
  getTotalStudyDays() {
    const history = JSON.parse(localStorage.getItem('vm_study_history') || '[]');
    return history.length;
  },

  /**
   * Record study day
   */
  recordStudyDay() {
    const today = new Date().toDateString();
    let history = JSON.parse(localStorage.getItem('vm_study_history') || '[]');
    
    if (!history.includes(today)) {
      history.push(today);
      localStorage.setItem('vm_study_history', JSON.stringify(history));
    }
  },

  /**
   * Load unlocked badges
   */
  loadUnlockedBadges() {
    return JSON.parse(localStorage.getItem('vm_badges') || '[]');
  },

  /**
   * Unlock a badge
   */
  unlockBadge(badgeId) {
    const badges = this.loadUnlockedBadges();
    if (badges.includes(badgeId)) return false;
    
    badges.push(badgeId);
    localStorage.setItem('vm_badges', JSON.stringify(badges));
    
    const badge = this.BADGES.find(b => b.id === badgeId);
    if (badge) {
      // Add badge XP
      this.addXP(null, badge.xp);
      
      // Show celebration
      this.showBadgeUnlock(badge);
    }
    
    return true;
  },

  /**
   * Check and unlock badge if condition met
   */
  checkBadge(badgeId, condition) {
    if (condition) {
      this.unlockBadge(badgeId);
    }
  },

  /**
   * Show badge unlock celebration
   */
  showBadgeUnlock(badge) {
    // Create celebration overlay
    const overlay = document.createElement('div');
    overlay.className = 'celebration-overlay';
    overlay.innerHTML = `
      <div class="celebration-card">
        <div class="celebration-icon">${badge.icon}</div>
        <div class="celebration-title">Badge Unlocked!</div>
        <div class="celebration-subtitle">${badge.title} - ${badge.desc}</div>
        <div style="margin-top: 16px; font-size: 1.2rem; color: #22C55E; font-weight: 700;">
          +${badge.xp} XP
        </div>
        <button class="btn-cta" style="margin-top: 24px;" onclick="this.closest('.celebration-overlay').remove()">
          Awesome! →
        </button>
      </div>
    `;
    document.body.appendChild(overlay);
    
    // Trigger confetti
    this.triggerConfetti(overlay.querySelector('.celebration-card'));
    
    // Show toast
    if (window.ToastSystem) {
      ToastSystem.show(`🏅 New badge: ${badge.title}! +${badge.xp} XP`, 'success');
    }
  },

  /**
   * Get daily goals progress
   */
  getDailyGoals() {
    const today = new Date().toDateString();
    const saved = localStorage.getItem(`vm_goals_${today}`);
    if (saved) return JSON.parse(saved);
    
    // Initialize new day
    const goals = this.DAILY_GOALS.map(g => ({ ...g, current: 0, completed: false }));
    this.saveDailyGoals(goals);
    return goals;
  },

  /**
   * Save daily goals
   */
  saveDailyGoals(goals) {
    const today = new Date().toDateString();
    localStorage.setItem(`vm_goals_${today}`, JSON.stringify(goals));
  },

  /**
   * Update goal progress
   */
  updateGoal(goalId, increment = 1) {
    const goals = this.getDailyGoals();
    const goal = goals.find(g => g.id === goalId);
    if (!goal || goal.completed) return;
    
    goal.current += increment;
    if (goal.current >= goal.target) {
      goal.completed = true;
      this.addXP('DAILY_GOAL_COMPLETE');
      
      if (window.ToastSystem) {
        ToastSystem.show(`🎯 Goal complete: ${goal.title}! +${goal.xp} XP`, 'success');
      }
      
      // Check if all goals completed
      if (goals.every(g => g.completed)) {
        this.unlockBadge('goal_crusher');
      }
    }
    
    this.saveDailyGoals(goals);
    return goal;
  },

  /**
   * Check for daily reset
   */
  checkDailyReset() {
    const today = new Date().toDateString();
    const lastCheck = localStorage.getItem('vm_last_check');
    
    if (lastCheck !== today) {
      // New day - reset daily goals
      const goals = this.DAILY_GOALS.map(g => ({ ...g, current: 0, completed: false }));
      this.saveDailyGoals(goals);
      localStorage.setItem('vm_last_check', today);
      
      // Check streak maintenance
      this.updateStreak();
    }
  },

  /**
   * Get random encouraging message
   */
  getRandomMessage(type) {
    const messages = this.MESSAGES[type] || ['Great job!'];
    return messages[Math.floor(Math.random() * messages.length)];
  },

  /**
   * Trigger confetti effect
   */
  triggerConfetti(element) {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8', '#F7DC6F', '#6366F1'];
    const rect = element ? element.getBoundingClientRect() : { 
      left: window.innerWidth / 2, 
      top: window.innerHeight / 2,
      width: 0,
      height: 0
    };
    
    for (let i = 0; i < 50; i++) {
      const confetti = document.createElement('div');
      const size = Math.random() * 10 + 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const angle = (Math.random() * 360);
      const velocity = Math.random() * 300 + 100;
      const x = Math.cos(angle * Math.PI / 180) * velocity;
      const y = Math.sin(angle * Math.PI / 180) * velocity - 200;
      
      confetti.style.cssText = `
        position: fixed;
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        left: ${rect.left + rect.width / 2}px;
        top: ${rect.top + rect.height / 2}px;
        border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        pointer-events: none;
        z-index: 9999;
      `;
      
      document.body.appendChild(confetti);
      
      // Animate
      confetti.animate([
        { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
        { transform: `translate(${x}px, ${y}px) rotate(${Math.random() * 720}deg)`, opacity: 0 }
      ], {
        duration: Math.random() * 1000 + 1000,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
      }).onfinish = () => confetti.remove();
    }
  },

  /**
   * Get user stats summary
   */
  getStats() {
    return {
      xp: this.getXP(),
      level: this.getLevel(),
      streak: this.getStreak(),
      totalDays: this.getTotalStudyDays(),
      badges: this.loadUnlockedBadges(),
      goals: this.getDailyGoals(),
      progress: this.getLevelProgress()
    };
  },

  /**
   * Render XP bar HTML
   */
  renderXPBar() {
    const progress = this.getLevelProgress();
    const level = this.getLevel();
    const nextLevel = this.getNextLevelXP();
    
    return `
      <div class="xp-display" style="margin-bottom: 8px;">
        <span class="level-badge">${level.level}</span>
        <span style="font-weight: 700; color: var(--ink);">${level.title}</span>
        <span style="margin-left: auto; color: var(--ink-3); font-size: 0.875rem;">${this.getXP()} XP</span>
      </div>
      <div class="xp-bar-container">
        <div class="xp-bar-fill" style="width: ${progress}%"></div>
      </div>
      ${nextLevel ? `<div style="text-align: right; font-size: 0.75rem; color: var(--ink-4); margin-top: 4px;">${nextLevel - this.getXP()} XP to next level</div>` : ''}
    `;
  },

  /**
   * Render streak display HTML
   */
  renderStreak() {
    const streak = this.getStreak();
    return `
      <div class="streak-display">
        <span class="streak-flame">🔥</span>
        <div>
          <div class="streak-count">${streak}</div>
          <div class="streak-label">Day Streak</div>
        </div>
      </div>
    `;
  },

  /**
   * Render daily goals HTML
   */
  renderDailyGoals() {
    const goals = this.getDailyGoals();
    return `
      <div class="goals-list">
        ${goals.map(g => `
          <div class="goal-widget ${g.completed ? 'completed' : ''}" data-goal="${g.id}">
            <div class="goal-icon">${g.icon}</div>
            <div class="goal-progress">
              <div class="goal-title">${g.title}</div>
              <div class="goal-bar">
                <div class="goal-bar-fill" style="width: ${Math.min(100, (g.current / g.target) * 100)}%"></div>
              </div>
            </div>
            ${g.completed ? '✅' : `<span style="font-size: 0.75rem; color: var(--ink-4);">${g.current}/${g.target}</span>`}
          </div>
        `).join('')}
      </div>
    `;
  },

  /**
   * Render badges grid HTML
   */
  renderBadges() {
    const unlocked = this.loadUnlockedBadges();
    return `
      <div class="badge-grid">
        ${this.BADGES.map(b => `
          <div class="badge ${unlocked.includes(b.id) ? 'badge-unlocked' : ''}" title="${b.desc}">
            <span class="badge-icon">${unlocked.includes(b.id) ? b.icon : '🔒'}</span>
            <span>${b.title}</span>
          </div>
        `).join('')}
      </div>
    `;
  }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.Gamification = Gamification;
  Gamification.init();
}
