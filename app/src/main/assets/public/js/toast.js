/**
 * Toast Notification System - Non-intrusive user feedback
 * Duolingo-style instant notifications
 */

'use strict';

const ToastSystem = {
  container: null,
  toasts: [],
  defaultDuration: 3000,

  /**
   * Initialize toast container
   */
  init() {
    if (this.container) return;
    
    this.container = document.createElement('div');
    this.container.className = 'toast-container';
    document.body.appendChild(this.container);
  },

  /**
   * Get icon for toast type
   */
  getIcon(type) {
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
      xp: '⭐',
      badge: '🏅',
      streak: '🔥',
      level: '🎉'
    };
    return icons[type] || icons.info;
  },

  /**
   * Get color for toast type
   */
  getColor(type) {
    const colors = {
      success: '#22C55E',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#3B82F6',
      xp: '#F59E0B',
      badge: '#F59E0B',
      streak: '#F97316',
      level: '#8B5CF6'
    };
    return colors[type] || colors.info;
  },

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type: success, error, warning, info, xp, badge, streak, level
   * @param {number} duration - Duration in ms (default: 3000)
   * @param {boolean} persistent - If true, toast won't auto-dismiss
   */
  show(message, type = 'info', duration = null, persistent = false) {
    this.init();
    
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Apply custom styles based on type
    const color = this.getColor(type);
    toast.style.borderLeft = `4px solid ${color}`;
    
    toast.innerHTML = `
      <div class="toast-icon" style="color: ${color}">${this.getIcon(type)}</div>
      <div class="toast-message">${message}</div>
      ${persistent ? '' : '<button class="toast-close" style="background: none; border: none; font-size: 18px; cursor: pointer; color: var(--ink-4);">×</button>'}
    `;
    
    // Add close button functionality
    const closeBtn = toast.querySelector('.toast-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.dismiss(toast));
    }
    
    this.container.appendChild(toast);
    this.toasts.push(toast);
    
    // Trigger animation
    requestAnimationFrame(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    });
    
    // Auto dismiss
    if (!persistent) {
      const actualDuration = duration || this.defaultDuration;
      setTimeout(() => this.dismiss(toast), actualDuration);
    }
    
    return toast;
  },

  /**
   * Dismiss a toast
   */
  dismiss(toast) {
    toast.classList.add('toast-exit');
    toast.style.transform = 'translateX(100%)';
    toast.style.opacity = '0';
    
    setTimeout(() => {
      toast.remove();
      this.toasts = this.toasts.filter(t => t !== toast);
    }, 300);
  },

  /**
   * Show success toast
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  },

  /**
   * Show error toast
   */
  error(message, duration) {
    return this.show(message, 'error', duration);
  },

  /**
   * Show warning toast
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  },

  /**
   * Show info toast
   */
  info(message, duration) {
    return this.show(message, 'info', duration);
  },

  /**
   * Show XP gain toast
   */
  xp(amount, reason = '') {
    const message = reason ? `+${amount} XP - ${reason}` : `+${amount} XP`;
    return this.show(message, 'xp', 2000);
  },

  /**
   * Show badge unlock toast
   */
  badge(title) {
    return this.show(`New Badge: ${title}!`, 'badge', 4000);
  },

  /**
   * Show streak toast
   */
  streak(days) {
    return this.show(`${days} Day Streak! 🔥 Keep it up!`, 'streak', 4000);
  },

  /**
   * Show level up toast
   */
  level(level, title) {
    return this.show(`Level ${level} - ${title}! 🎉`, 'level', 5000);
  },

  /**
   * Clear all toasts
   */
  clear() {
    this.toasts.forEach(toast => this.dismiss(toast));
  }
};

// Auto-initialize on load
if (typeof window !== 'undefined') {
  window.ToastSystem = ToastSystem;
  // Initialize on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => ToastSystem.init());
  } else {
    ToastSystem.init();
  }
}
