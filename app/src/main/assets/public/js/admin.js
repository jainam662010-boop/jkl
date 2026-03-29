const Admin = {
  data: {},
  activeSection: 'dashboard',
  subjects: [],
  chapters: [],
  _editCtx: { sid: '', cid: '', lid: '' },
  
  config: {
    dashboard: {
      label: 'Dashboard', icon: '📊',
      render: (panel) => {
        const stats = Admin.calculateStats();
        panel.innerHTML = `
          <div class="admin-header">
            <h1>Welcome, Teacher! 👋</h1>
            <p class="subtitle">Manage all your educational content from one place</p>
          </div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">📚</div>
              <div class="stat-info">
                <div class="stat-value">${stats.subjects}</div>
                <div class="stat-label">Subjects</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📖</div>
              <div class="stat-info">
                <div class="stat-value">${stats.chapters}</div>
                <div class="stat-label">Chapters</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎬</div>
              <div class="stat-info">
                <div class="stat-value">${stats.videos}</div>
                <div class="stat-label">Videos</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">📁</div>
              <div class="stat-info">
                <div class="stat-value">${stats.pdfs}</div>
                <div class="stat-label">PDFs</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🧩</div>
              <div class="stat-info">
                <div class="stat-value">${stats.quizzes}</div>
                <div class="stat-label">Questions</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">👨‍🏫</div>
              <div class="stat-info">
                <div class="stat-value">${stats.teachers}</div>
                <div class="stat-label">Teachers</div>
              </div>
            </div>
          </div>
          
          <div class="quick-actions">
            <h3>⚡ Quick Actions</h3>
            <div class="quick-grid">
              <button class="quick-card" onclick="Admin.switchSection('lessonEditor')">
                <div class="quick-icon">📝</div>
                <div class="quick-label">Edit Lesson</div>
              </button>
              <button class="quick-card" onclick="Admin.switchSection('addContent')">
                <div class="quick-icon">➕</div>
                <div class="quick-label">Add New Content</div>
              </button>
              <button class="quick-card" onclick="Admin.switchSection('links')">
                <div class="quick-icon">🔗</div>
                <div class="quick-label">Manage Links</div>
              </button>
              <button class="quick-card" onclick="Admin.switchSection('pdfs')">
                <div class="quick-icon">📄</div>
                <div class="quick-label">Upload PDFs</div>
              </button>
              <button class="quick-card" onclick="Admin.switchSection('pyqs')">
                <div class="quick-icon">📝</div>
                <div class="quick-label">Add PYQs</div>
              </button>
            </div>
          </div>
        `;
      }
    },

    lessonEditor: {
      label: 'Lesson Editor', icon: '📝',
      render: (panel) => Admin.renderLessonEditor(panel)
    },
    
    addContent: {
      label: 'Add Content', icon: '➕',
      render: (panel) => {
        panel.innerHTML = `
          <div class="admin-header">
            <h1>Add New Content</h1>
            <p class="subtitle">Choose what type of content you want to add</p>
          </div>
          
          <div class="content-type-grid">
            <div class="content-type-card" onclick="Admin.showContentForm('video')">
              <div class="type-icon">🎬</div>
              <h3>Video Lesson</h3>
              <p>Add YouTube video links for lessons</p>
            </div>
            <div class="content-type-card" onclick="Admin.showContentForm('notes')">
              <div class="type-icon">📝</div>
              <h3>Study Notes</h3>
              <p>Add notes and explanations</p>
            </div>
            <div class="content-type-card" onclick="Admin.showContentForm('pdf')">
              <div class="type-icon">📄</div>
              <h3>PDF Document</h3>
              <p>Upload PDF notes or worksheets</p>
            </div>
            <div class="content-type-card" onclick="Admin.showContentForm('quiz')">
              <div class="type-icon">🧩</div>
              <h3>Quiz Question</h3>
              <p>Add MCQ questions with answers</p>
            </div>
            <div class="content-type-card" onclick="Admin.showContentForm('pyq')">
              <div class="type-icon">📋</div>
              <h3>Previous Year Question</h3>
              <p>Add PYQs with solutions</p>
            </div>
            <div class="content-type-card" onclick="Admin.showContentForm('paper')">
              <div class="type-icon">📑</div>
              <h3>Question Paper</h3>
              <p>Add sample or board papers</p>
            </div>
          </div>
          
          <div id="contentFormArea" class="form-area"></div>
        `;
      }
    },
    
    links: {
      label: 'Video Links', icon: '�',
      render: (panel) => Admin.renderContentManager(panel, 'video', 'Manage Video Links', 'YouTube Video')
    },
    
    notes: {
      label: 'Notes', icon: '📝',
      render: (panel) => Admin.renderNotesManager(panel)
    },
    
    pdfs: {
      label: 'PDFs', icon: '📁',
      render: (panel) => Admin.renderContentManager(panel, 'pdf', 'Manage PDF Documents', 'PDF')
    },
    
    pyqs: {
      label: 'PYQs', icon: '📋',
      render: (panel) => Admin.renderPYQManager(panel)
    },
    
    papers: {
      label: 'Question Papers', icon: '📑',
      render: (panel) => Admin.renderPaperManager(panel)
    },
    
    quiz: {
      label: 'Quiz Bank', icon: '🧩',
      render: (panel) => Admin.renderQuizManager(panel)
    },
    
    teachers: {
      label: 'Teachers', icon: '👨‍🏫',
      render: (panel) => Admin.renderTeacherManager(panel)
    },
    
    settings: {
      label: 'Settings', icon: '⚙️',
      render: (panel) => {
        panel.innerHTML = `
          <div class="admin-header">
            <h1>Settings</h1>
            <p class="subtitle">Manage your admin preferences</p>
          </div>
          
          <div class="settings-grid">
            <div class="setting-card">
              <h3>💾 Data Management</h3>
              <div class="setting-actions">
                <button class="btn btn-primary" onclick="Admin.exportData()">
                  📥 Export All Data
                </button>
                <button class="btn btn-secondary" onclick="Admin.clearAllData()">
                  🗑️ Clear All Data
                </button>
              </div>
            </div>
            
            <div class="setting-card">
              <h3>🔐 Security</h3>
              <div class="setting-actions">
                <button class="btn btn-secondary" onclick="Admin.logout()">
                  🚪 Logout
                </button>
              </div>
            </div>
          </div>
        `;
      }
    }
  },

  init() {
    if (!this.checkLogin()) return;
    this.loadData().then(() => {
      this.loadSubjectsAndChapters();
      this.renderNav();
      this.renderPanels();
      this.switchSection(this.activeSection);
    });
  },

  loadSubjectsAndChapters() {
    this.subjects = this.data.subjects || [];
    this.chapters = [];
    this.subjects.forEach(subj => {
      if (subj.chapters) {
        subj.chapters.forEach(ch => {
          this.chapters.push({
            id: ch.id,
            title: ch.title,
            subjectId: subj.id,
            subjectName: subj.name
          });
        });
      }
    });
  },

  calculateStats() {
    return {
      subjects: this.data.subjects?.length || 0,
      chapters: this.chapters.length,
      videos: (this.data.videos || []).length,
      pdfs: (this.data.pdfs || []).length,
      quizzes: (this.data.quiz || []).length,
      teachers: (this.data.teachers || []).length
    };
  },

  renderNav() {
    const navEl = document.getElementById('adminNavLinks');
    const html = Object.keys(this.config).map(sectionId => {
      const section = this.config[sectionId];
      return `
        <div class="al-link ${this.activeSection === sectionId ? 'on' : ''}" 
             id="al-${sectionId}" 
             onclick="Admin.switchSection('${sectionId}')">
          <span class="al-icon">${section.icon}</span>
          <span class="al-label">${section.label}</span>
        </div>
      `;
    }).join('');
    navEl.innerHTML = html;
  },

  renderPanels() {
    const panelsEl = document.getElementById('adminPanels');
    let html = '';
    for (const sectionId in this.config) {
      html += `<div class="a-panel ${this.activeSection === sectionId ? 'on' : ''}" id="ap-${sectionId}"></div>`;
    }
    panelsEl.innerHTML = html;
  },

  switchSection(sectionId) {
    this.activeSection = sectionId;
    document.querySelectorAll('.al-link').forEach(el => el.classList.remove('on'));
    document.getElementById(`al-${sectionId}`)?.classList.add('on');

    document.querySelectorAll('.a-panel').forEach(el => el.classList.remove('on'));
    const panel = document.getElementById(`ap-${sectionId}`);
    panel?.classList.add('on');

    // Close mobile navigation when switching sections
    this.closeMobileNav();

    const section = this.config[sectionId];
    if (section?.render) {
      section.render(panel);
    }
  },

  showContentForm(type) {
    const formArea = document.getElementById('contentFormArea');
    if (!formArea) return;
    
    const getSubjectOptions = () => this.subjects.map(s => 
      `<option value="${s.id}">${s.icon || '📚'} ${s.name}</option>`
    ).join('');
    
    const forms = {
      video: `
        <div class="form-card">
          <h3>🎬 Add Video Lesson</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Subject *</label>
              <select class="fc" id="videoSubject" onchange="Admin.loadChapters('videoSubject', 'videoChapter')">
                <option value="">Select Subject</option>
                ${getSubjectOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Chapter *</label>
              <select class="fc" id="videoChapter">
                <option value="">Select Chapter</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Video Title *</label>
              <input type="text" class="fc" id="videoTitle" placeholder="e.g., Introduction to Trigonometry">
            </div>
            <div class="form-group full-width">
              <label>YouTube Video ID or URL *</label>
              <input type="text" class="fc" id="videoUrl" placeholder="e.g., dQw4w9WgXcQ or full URL">
              <small class="form-help">Paste full YouTube URL or just video ID</small>
            </div>
            <div class="form-group">
              <label>Teacher</label>
              <select class="fc" id="videoTeacher">
                <option value="">Select Teacher</option>
                ${this.getTeacherOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Video Type</label>
              <select class="fc" id="videoType">
                <option value="oneshot">One Shot</option>
                <option value="revision">Revision</option>
                <option value="detailed">Detailed</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.saveVideo()">💾 Save Video</button>
            <button class="btn btn-secondary" onclick="Admin.previewVideo()">👁️ Preview</button>
          </div>
        </div>
      `,
      
      pdf: `
        <div class="form-card">
          <h3>📄 Add PDF Document</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Subject *</label>
              <select class="fc" id="pdfSubject" onchange="Admin.loadChapters('pdfSubject', 'pdfChapter')">
                <option value="">Select Subject</option>
                ${getSubjectOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Chapter</label>
              <select class="fc" id="pdfChapter">
                <option value="">All Chapters</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>PDF Name *</label>
              <input type="text" class="fc" id="pdfName" placeholder="e.g., NCERT Solutions">
            </div>
            <div class="form-group full-width">
              <label>PDF URL *</label>
              <input type="url" class="fc" id="pdfUrl" placeholder="https://example.com/doc.pdf">
            </div>
            <div class="form-group">
              <label>Category</label>
              <select class="fc" id="pdfCategory">
                <option value="notes">Notes</option>
                <option value="worksheet">Worksheet</option>
                <option value="solution">Solutions</option>
                <option value="pyq">PYQ</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.savePDF()">💾 Save PDF</button>
          </div>
        </div>
      `,
      
      quiz: `
        <div class="form-card">
          <h3>🧩 Add Quiz Question</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Subject *</label>
              <select class="fc" id="quizSubject" onchange="Admin.loadChapters('quizSubject', 'quizChapter')">
                <option value="">Select Subject</option>
                ${getSubjectOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Chapter *</label>
              <select class="fc" id="quizChapter">
                <option value="">Select Chapter</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Question *</label>
              <textarea class="fc" id="quizQuestion" rows="3" placeholder="Enter question..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>Options * (one per line)</label>
              <textarea class="fc" id="quizOptions" rows="4" placeholder="Option A&#10;Option B&#10;Option C&#10;Option D"></textarea>
            </div>
            <div class="form-group">
              <label>Correct Answer *</label>
              <select class="fc" id="quizAnswer">
                <option value="0">A</option>
                <option value="1">B</option>
                <option value="2">C</option>
                <option value="3">D</option>
              </select>
            </div>
            <div class="form-group">
              <label>Difficulty</label>
              <select class="fc" id="quizDifficulty">
                <option value="easy">Easy</option>
                <option value="medium" selected>Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.saveQuiz()">💾 Save & Next</button>
            <button class="btn btn-gh" onclick="Admin.saveQuiz(); Admin.showContentForm('quiz')">➕ Save & Add Another</button>
          </div>
        </div>
      `,
      
      pyq: `
        <div class="form-card">
          <h3>📋 Add Previous Year Question</h3>
          <div class="form-grid">
            <div class="form-group">
              <label>Subject *</label>
              <select class="fc" id="pyqSubject">
                <option value="">Select Subject</option>
                ${getSubjectOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Year *</label>
              <select class="fc" id="pyqYear">
                <option value="">Select Year</option>
                ${[2024,2023,2022,2021,2020,2019,2018].map(y => `<option value="${y}">${y}</option>`).join('')}
              </select>
            </div>
            <div class="form-group">
              <label>Board</label>
              <select class="fc" id="pyqBoard">
                <option value="cbse">CBSE</option>
                <option value="icse">ICSE</option>
                <option value="state">State</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Question *</label>
              <textarea class="fc" id="pyqQuestion" rows="4" placeholder="Enter question..."></textarea>
            </div>
            <div class="form-group full-width">
              <label>Solution *</label>
              <textarea class="fc" id="pyqSolution" rows="6" placeholder="Enter solution..."></textarea>
            </div>
            <div class="form-group">
              <label>Marks</label>
              <input type="number" class="fc" id="pyqMarks" placeholder="e.g., 5">
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.savePYQ()">💾 Save PYQ</button>
          </div>
        </div>
      `,
      
      paper: `
        <div class="form-card">
          <h3>📑 Add Question Paper</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>Title *</label>
              <input type="text" class="fc" id="paperTitle" placeholder="e.g., CBSE Sample Paper 2024">
            </div>
            <div class="form-group">
              <label>Subject *</label>
              <select class="fc" id="paperSubject">
                <option value="">Select Subject</option>
                ${getSubjectOptions()}
              </select>
            </div>
            <div class="form-group">
              <label>Year</label>
              <input type="number" class="fc" id="paperYear" placeholder="2024">
            </div>
            <div class="form-group">
              <label>Type</label>
              <select class="fc" id="paperType">
                <option value="sample">Sample</option>
                <option value="board">Board</option>
                <option value="preboard">Pre-Board</option>
                <option value="mock">Mock</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>PDF URL *</label>
              <input type="url" class="fc" id="paperUrl" placeholder="https://example.com/paper.pdf">
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.savePaper()">💾 Save Paper</button>
          </div>
        </div>
      `
    };
    
    formArea.innerHTML = forms[type] || '';
    formArea.scrollIntoView({ behavior: 'smooth' });
  },

  loadChapters(subjectSelectId, chapterSelectId) {
    const subjectId = document.getElementById(subjectSelectId).value;
    const chapterSelect = document.getElementById(chapterSelectId);
    const subject = this.subjects.find(s => s.id === subjectId);
    
    if (subject?.chapters) {
      chapterSelect.innerHTML = `
        <option value="">Select Chapter</option>
        ${subject.chapters.map(ch => `<option value="${ch.id}">${ch.title}</option>`).join('')}
      `;
    }
  },

  getTeacherOptions() {
    return (this.data.teachers || []).map(t => 
      `<option value="${t.name}::${t.channel}">${t.name}</option>`
    ).join('');
  },

  saveVideo() {
    const videoId = this.extractVideoId(document.getElementById('videoUrl').value);
    if (!videoId) { alert('Please enter a valid YouTube URL or video ID'); return; }
    
    const video = {
      id: 'vid_' + Date.now(),
      subject: document.getElementById('videoSubject').value,
      chapter: document.getElementById('videoChapter').value,
      title: document.getElementById('videoTitle').value,
      videoId: videoId,
      teacher: document.getElementById('videoTeacher').value,
      type: document.getElementById('videoType').value,
      createdAt: new Date().toISOString()
    };
    
    if (!video.subject || !video.chapter || !video.title) {
      alert('Please fill all required fields (*)!'); return;
    }
    
    if (!this.data.videos) this.data.videos = [];
    this.data.videos.push(video);
    this.saveData();
    alert('✅ Video saved successfully!');
    document.getElementById('videoTitle').value = '';
    document.getElementById('videoUrl').value = '';
  },

  savePDF() {
    const pdf = {
      id: 'pdf_' + Date.now(),
      subject: document.getElementById('pdfSubject').value,
      chapter: document.getElementById('pdfChapter').value,
      name: document.getElementById('pdfName').value,
      url: document.getElementById('pdfUrl').value,
      category: document.getElementById('pdfCategory').value,
      createdAt: new Date().toISOString()
    };
    
    if (!pdf.subject || !pdf.name || !pdf.url) {
      alert('Please fill all required fields (*)!'); return;
    }
    
    if (!this.data.pdfs) this.data.pdfs = [];
    this.data.pdfs.push(pdf);
    this.saveData();
    alert('✅ PDF saved successfully!');
    this.switchSection('pdfs');
  },

  saveQuiz() {
    const optionsText = document.getElementById('quizOptions').value;
    const options = optionsText.split('\n').filter(o => o.trim());
    
    if (options.length < 2) { alert('Please provide at least 2 options'); return; }
    
    const quiz = {
      id: 'quiz_' + Date.now(),
      subject: document.getElementById('quizSubject').value,
      chapter: document.getElementById('quizChapter').value,
      q: document.getElementById('quizQuestion').value,
      options: options,
      ans: parseInt(document.getElementById('quizAnswer').value),
      difficulty: document.getElementById('quizDifficulty').value,
      createdAt: new Date().toISOString()
    };
    
    if (!quiz.subject || !quiz.chapter || !quiz.q) {
      alert('Please fill all required fields (*)!'); return;
    }
    
    if (!this.data.quiz) this.data.quiz = [];
    this.data.quiz.push(quiz);
    this.saveData();
    alert('✅ Quiz question saved!');
  },

  savePYQ() {
    const pyq = {
      id: 'pyq_' + Date.now(),
      subject: document.getElementById('pyqSubject').value,
      year: document.getElementById('pyqYear').value,
      board: document.getElementById('pyqBoard').value,
      question: document.getElementById('pyqQuestion').value,
      solution: document.getElementById('pyqSolution').value,
      marks: document.getElementById('pyqMarks').value,
      createdAt: new Date().toISOString()
    };
    
    if (!pyq.subject || !pyq.year || !pyq.question || !pyq.solution) {
      alert('Please fill all required fields (*)!'); return;
    }
    
    if (!this.data.pyqs) this.data.pyqs = [];
    this.data.pyqs.push(pyq);
    this.saveData();
    alert('✅ PYQ saved successfully!');
    this.switchSection('pyqs');
  },

  savePaper() {
    const paper = {
      id: 'paper_' + Date.now(),
      title: document.getElementById('paperTitle').value,
      subject: document.getElementById('paperSubject').value,
      year: document.getElementById('paperYear').value,
      type: document.getElementById('paperType').value,
      url: document.getElementById('paperUrl').value,
      createdAt: new Date().toISOString()
    };
    
    if (!paper.title || !paper.subject || !paper.url) {
      alert('Please fill all required fields (*)!'); return;
    }
    
    if (!this.data.papers) this.data.papers = [];
    this.data.papers.push(paper);
    this.saveData();
    alert('✅ Question paper saved successfully!');
    this.switchSection('papers');
  },

  extractVideoId(url) {
    if (!url) return null;
    if (url.length === 11 && !url.includes('/')) return url;
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s?]+)/);
    return match ? match[1] : null;
  },

  previewVideo() {
    const videoId = this.extractVideoId(document.getElementById('videoUrl').value);
    if (videoId) { window.open(`https://youtube.com/watch?v=${videoId}`, '_blank'); }
    else { alert('Please enter a valid YouTube URL first'); }
  },

  tryLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === '6610') {
      localStorage.setItem('vm_admin_key', pass);
      this.init();
    } else {
      document.getElementById('loginErr').textContent = 'Invalid Access Key';
    }
  },

  logout() {
    localStorage.removeItem('vm_admin_key');
    window.location.reload();
  },

  async loadData() {
    try {
      const response = await fetch('data/subjects.json');
      const builtInData = await response.json();
      const adminData = JSON.parse(localStorage.getItem('vm_admin_data') || '{}');
      this.data = { ...builtInData, ...adminData };
    } catch (e) {
      console.error("Failed to load data", e);
      this.data = JSON.parse(localStorage.getItem('vm_admin_data') || '{}');
    }
  },

  _parseLS(k, def) {
    try {
      return JSON.parse(localStorage.getItem(k) || 'null') ?? def;
    } catch {
      return def;
    }
  },

  _saveLS(k, v) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {}
  },

  _getOverrides() {
    return this._parseLS('vm_overrides', {});
  },

  _setOverride(sid, cid, patch) {
    const ov = this._getOverrides();
    const key = `${sid}::${cid}`;
    ov[key] = { ...(ov[key] || {}), ...patch };
    this._saveLS('vm_overrides', ov);
  },

  _setLessonPatch(sid, cid, lid, patch) {
    const ov = this._getOverrides();
    const key = `${sid}::${cid}`;
    const cur = ov[key] || {};
    const lp = cur.lessonPatches || {};
    lp[lid] = { ...(lp[lid] || {}), ...patch };
    ov[key] = { ...cur, lessonPatches: lp };
    this._saveLS('vm_overrides', ov);
  },

  renderLessonEditor(panel) {
    panel.innerHTML = `
      <div class="admin-header">
        <h1>📝 Lesson Editor</h1>
        <p class="subtitle">Choose a lesson and update video, notes, quiz, PYQs and papers</p>
      </div>

      <div class="form-card">
        <h3>Select Lesson</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Subject</label>
            <select class="fc" id="leSubject" onchange="Admin.leLoadChapters()">
              <option value="">Select Subject</option>
              ${(this.subjects || []).map(s => `<option value="${s.id}">${(s.icon || '📚')} ${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label>Chapter</label>
            <select class="fc" id="leChapter" onchange="Admin.leLoadLessons()">
              <option value="">Select Chapter</option>
            </select>
          </div>
          <div class="form-group">
            <label>Lesson</label>
            <select class="fc" id="leLesson" onchange="Admin.leLoadLessonData()">
              <option value="">Select Lesson</option>
            </select>
          </div>
        </div>
      </div>

      <div id="leEditor" style="display:none">
        <div class="form-card">
          <h3>🎬 YouTube Video</h3>
          <div class="form-grid">
            <div class="form-group full-width">
              <label>YouTube URL or ID</label>
              <input class="fc" id="leVideo" placeholder="https://youtube.com/watch?v=... or dQw4w9WgXcQ">
            </div>
          </div>
          <div class="form-actions">
            <button class="btn btn-secondary" onclick="Admin.lePreviewVideo()">Preview</button>
            <button class="btn btn-primary" onclick="Admin.leSaveVideo()">Save Video</button>
          </div>
        </div>

        <div class="form-card">
          <h3>📝 Notes</h3>
          <div class="form-group full-width">
            <label>Notes Text</label>
            <textarea class="fc" id="leNotesText" rows="8" placeholder="Write notes here..."></textarea>
          </div>
          <div class="form-group full-width">
            <label>Notes PDF URL</label>
            <input class="fc" id="leNotesPdfUrl" placeholder="https://drive.google.com/...">
          </div>
          <div class="form-group full-width">
            <label>Upload Notes PDF (Max 1MB)</label>
            <input type="file" class="fc" id="leNotesFile" accept=".pdf" onchange="Admin.uploadNotesPdf()">
            <div class="form-help">Or upload a small PDF file directly (base64 encoded, under 1MB)</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.leSaveNotes()">Save Notes</button>
          </div>
        </div>

        <div class="form-card">
          <h3>🧩 Quiz (per chapter)</h3>
          <div class="form-group full-width">
            <label>Quiz Text (one question per line)</label>
            <textarea class="fc" id="leQuizText" rows="8" placeholder="Question?*Option1*Option2*Option3*Option4*CorrectIndex(0-3)"></textarea>
            <div class="form-help">Example: What is 2+2?*2*3*4*5*2</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.leSaveQuiz()">Save Quiz</button>
          </div>
        </div>

        <div class="form-card">
          <h3>📋 PYQs</h3>
          <div class="form-group full-width">
            <label>PYQ Text</label>
            <textarea class="fc" id="lePyqText" rows="6" placeholder="Paste PYQs here..."></textarea>
          </div>
          <div class="form-group full-width">
            <label>PYQ PDF URL</label>
            <input class="fc" id="lePyqUrl" placeholder="https://...">
          </div>
          <div class="form-group full-width">
            <label>Upload PYQ PDF (Max 1MB)</label>
            <input type="file" class="fc" id="lePyqFile" accept=".pdf" onchange="Admin.uploadPyqPdf()">
            <div class="form-help">Upload small PDF directly (base64 encoded, under 1MB)</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.leSavePyq()">Save PYQs</button>
          </div>
        </div>

        <div class="form-card">
          <h3>📑 Question Paper</h3>
          <div class="form-group full-width">
            <label>Paper Text</label>
            <textarea class="fc" id="lePaperText" rows="6" placeholder="Paste question paper here..."></textarea>
          </div>
          <div class="form-group full-width">
            <label>Paper PDF URL</label>
            <input class="fc" id="lePaperUrl" placeholder="https://...">
          </div>
          <div class="form-group full-width">
            <label>Upload Paper PDF (Max 1MB)</label>
            <input type="file" class="fc" id="lePaperFile" accept=".pdf" onchange="Admin.uploadPaperPdf()">
            <div class="form-help">Upload small PDF directly (base64 encoded, under 1MB)</div>
          </div>
          <div class="form-actions">
            <button class="btn btn-primary" onclick="Admin.leSavePaper()">Save Paper</button>
          </div>
        </div>
      </div>
    `;
  },

  leLoadChapters() {
    const sid = document.getElementById('leSubject')?.value || '';
    const chSel = document.getElementById('leChapter');
    const lsSel = document.getElementById('leLesson');
    const ed = document.getElementById('leEditor');
    if (ed) ed.style.display = 'none';
    if (lsSel) lsSel.innerHTML = '<option value="">Select Lesson</option>';
    const subj = (this.subjects || []).find(s => s.id === sid);
    if (!chSel) return;
    if (!subj?.chapters?.length) {
      chSel.innerHTML = '<option value="">Select Chapter</option>';
      return;
    }
    chSel.innerHTML = `<option value="">Select Chapter</option>${subj.chapters.map(ch => `<option value="${ch.id}">${ch.title}</option>`).join('')}`;
  },

  leLoadLessons() {
    const sid = document.getElementById('leSubject')?.value || '';
    const cid = document.getElementById('leChapter')?.value || '';
    const subj = (this.subjects || []).find(s => s.id === sid);
    const ch = (subj?.chapters || []).find(c => c.id === cid);
    const lsSel = document.getElementById('leLesson');
    const ed = document.getElementById('leEditor');
    if (ed) ed.style.display = 'none';
    if (!lsSel) return;
    const lessons = (ch?.lessons || []).map(l => ({ ...l, id: l.id || (l.title ? this._slug(l.title) : '') }));
    lsSel.innerHTML = `<option value="">Select Lesson</option>${lessons.map(l => `<option value="${l.id}">${l.title || l.id}</option>`).join('')}`;
  },

  _slug(s) {
    return (s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  },

  leLoadLessonData() {
    const sid = document.getElementById('leSubject')?.value || '';
    const cid = document.getElementById('leChapter')?.value || '';
    const lid = document.getElementById('leLesson')?.value || '';
    if (!sid || !cid || !lid) return;
    this._editCtx = { sid, cid, lid };

    const ov = this._getOverrides()[`${sid}::${cid}`] || {};
    const lp = (ov.lessonPatches || {})[lid] || {};

    const ed = document.getElementById('leEditor');
    if (ed) ed.style.display = 'block';

    const v = document.getElementById('leVideo');
    if (v) v.value = lp.videoId || '';

    const nt = document.getElementById('leNotesText');
    if (nt) nt.value = lp.notesText || '';
    const nu = document.getElementById('leNotesPdfUrl');
    if (nu) nu.value = lp.notesPdfUrl || '';

    const qt = document.getElementById('leQuizText');
    if (qt) qt.value = '';
    const pt = document.getElementById('lePyqText');
    if (pt) pt.value = lp.pyqText || '';
    const pu = document.getElementById('lePyqUrl');
    if (pu) pu.value = lp.pyqUrl || '';
    const papt = document.getElementById('lePaperText');
    if (papt) papt.value = lp.paperText || '';
    const pau = document.getElementById('lePaperUrl');
    if (pau) pau.value = lp.paperUrl || '';
  },

  lePreviewVideo() {
    const val = document.getElementById('leVideo')?.value || '';
    const vid = this.extractVideoId(val);
    if (!vid) { alert('Enter a valid YouTube URL/ID'); return; }
    window.open(`https://youtube.com/watch?v=${vid}`, '_blank');
  },

  leSaveVideo() {
    const { sid, cid, lid } = this._editCtx;
    const val = document.getElementById('leVideo')?.value || '';
    const vid = this.extractVideoId(val);
    if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
    if (!vid) { alert('Enter a valid YouTube URL/ID'); return; }
    this._setLessonPatch(sid, cid, lid, { videoId: vid });
    alert('✅ Lesson video saved');
  },

  leSaveNotes() {
    const { sid, cid, lid } = this._editCtx;
    if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
    const notesText = document.getElementById('leNotesText')?.value || '';
    const notesPdfUrl = document.getElementById('leNotesPdfUrl')?.value || '';
    this._setLessonPatch(sid, cid, lid, { notesText, notesPdfUrl });
    alert('✅ Notes saved');
  },

  _parseQuizLines(text) {
    return (text || '')
      .split(/\r?\n/)
      .map(l => l.trim())
      .filter(Boolean)
      .map(line => {
        const parts = line.split('*').map(p => p.trim());
        if (parts.length < 6) return null;
        const q = parts[0];
        const options = parts.slice(1, 5);
        const ans = parseInt(parts[5], 10);
        if (!q || options.some(o => !o) || Number.isNaN(ans) || ans < 0 || ans > 3) return null;
        return { q, options, ans, difficulty: 'medium', createdAt: new Date().toISOString() };
      })
      .filter(Boolean);
  },

  leSaveQuiz() {
    const { sid, cid } = this._editCtx;
    if (!sid || !cid) { alert('Select a lesson first'); return; }
    const raw = document.getElementById('leQuizText')?.value || '';
    const items = this._parseQuizLines(raw);
    if (!items.length) { alert('No valid quiz lines found'); return; }
    // Chapter quiz is chapter-level in the app, so we store into overrides
    this._setOverride(sid, cid, { extraQuiz: items });
    alert('✅ Quiz saved to chapter');
  },

  leSavePyq() {
    const { sid, cid, lid } = this._editCtx;
    if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
    const pyqText = document.getElementById('lePyqText')?.value || '';
    const pyqUrl = document.getElementById('lePyqUrl')?.value || '';
    this._setLessonPatch(sid, cid, lid, { pyqText, pyqUrl });
    alert('✅ PYQs saved');
  },

  leSavePaper() {
    const { sid, cid, lid } = this._editCtx;
    if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
    const paperText = document.getElementById('lePaperText')?.value || '';
    const paperUrl = document.getElementById('lePaperUrl')?.value || '';
    this._setLessonPatch(sid, cid, lid, { paperText, paperUrl });
    alert('✅ Paper saved');
  },

  saveData() {
    localStorage.setItem('vm_admin_data', JSON.stringify(this.data));
    alert('Data saved successfully!');
  },

  exportData() {
    const dataStr = JSON.stringify(this.data, null, 2);
    const blob = new Blob([dataStr], {type: "application/json"});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'class10edu_backup_' + new Date().toISOString().split('T')[0] + '.json';
    a.click();
    URL.revokeObjectURL(url);
  },

  // Content Managers
  renderContentManager(panel, type, title, itemName) {
    const items = this.data[type === 'pdf' ? 'pdfs' : type + 's'] || [];
    const getSubjectName = (id) => {
      const subj = this.subjects.find(s => s.id === id);
      return subj ? subj.name : id;
    };
    const getChapterName = (id) => {
      const ch = this.chapters.find(c => c.id === id);
      return ch ? ch.title : id || 'All Chapters';
    };
    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    };
    
    panel.innerHTML = `
      <div class="admin-header">
        <h1>${title}</h1>
        <button class="btn btn-primary btn-sm" onclick="Admin.switchSection('addContent')">➕ Add New</button>
      </div>
      
      <div class="content-table-wrapper">
        <table class="content-table">
          <thead>
            <tr>
              <th>${itemName}</th>
              <th>Subject</th>
              <th>Chapter</th>
              <th>Added</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${items.map((item, idx) => `
              <tr>
                <td>
                  <div class="item-info">
                    <span class="item-icon">${type === 'video' ? '🎬' : '📄'}</span>
                    <span class="item-name">${item.title || item.name}</span>
                  </div>
                </td>
                <td>${getSubjectName(item.subject)}</td>
                <td>${getChapterName(item.chapter)}</td>
                <td>${formatDate(item.createdAt)}</td>
                <td>
                  <div class="action-btns">
                    ${item.url || item.videoId ? `<button class="btn-icon" onclick="window.open('${item.url || `https://youtube.com/watch?v=${item.videoId}`}', '_blank')" title="Open">🔗</button>` : ''}
                    <button class="btn-icon delete" onclick="Admin.deleteItem('${type === 'pdf' ? 'pdfs' : type + 's'}', ${idx})" title="Delete">🗑️</button>
                  </div>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        ${items.length === 0 ? `<div class="empty-state">No ${itemName.toLowerCase()}s added yet. <a href="#" onclick="Admin.switchSection('addContent')">Add your first one!</a></div>` : ''}
      </div>
    `;
  },

  renderNotesManager(panel) {
    const notes = this.data.notes || [];
    panel.innerHTML = `
      <div class="admin-header">
        <h1>Study Notes</h1>
        <button class="btn btn-primary btn-sm" onclick="Admin.switchSection('addContent')">➕ Add Notes</button>
      </div>
      <div class="notes-grid">
        ${notes.map((note, idx) => `
          <div class="note-card">
            <div class="note-header">
              <span class="note-subject">${this.getSubjectName(note.subject)}</span>
              <span class="note-date">${this.formatDate(note.createdAt)}</span>
            </div>
            <h4>${note.title}</h4>
            <p class="note-preview">${note.content?.substring(0, 100) || 'No content'}...</p>
            <div class="note-actions">
              <button class="btn btn-sm btn-gh" onclick="Admin.deleteItem('notes', ${idx})">Delete</button>
            </div>
          </div>
        `).join('')}
        ${notes.length === 0 ? '<div class="empty-state">No notes added yet.</div>' : ''}
      </div>
    `;
  },

  renderQuizManager(panel) {
    const quizzes = this.data.quiz || [];
    panel.innerHTML = `
      <div class="admin-header">
        <h1>Quiz Bank</h1>
        <button class="btn btn-primary btn-sm" onclick="Admin.switchSection('addContent')">➕ Add Question</button>
      </div>
      <div class="quiz-stats">
        <span class="stat-pill">Total: ${quizzes.length}</span>
        <span class="stat-pill easy">Easy: ${quizzes.filter(q => q.difficulty === 'easy').length}</span>
        <span class="stat-pill medium">Medium: ${quizzes.filter(q => q.difficulty === 'medium').length}</span>
        <span class="stat-pill hard">Hard: ${quizzes.filter(q => q.difficulty === 'hard').length}</span>
      </div>
      <div class="quiz-list">
        ${quizzes.map((q, idx) => `
          <div class="quiz-item ${q.difficulty}">
            <div class="quiz-main">
              <span class="difficulty-badge ${q.difficulty}">${q.difficulty}</span>
              <p class="quiz-question">${q.q}</p>
              <div class="quiz-meta">${this.getSubjectName(q.subject)} • ${this.getChapterName(q.chapter)}</div>
            </div>
            <div class="quiz-actions">
              <button class="btn btn-sm btn-gh" onclick="Admin.deleteItem('quiz', ${idx})">Delete</button>
            </div>
          </div>
        `).join('')}
        ${quizzes.length === 0 ? '<div class="empty-state">No quiz questions added yet.</div>' : ''}
      </div>
    `;
  },

  renderPYQManager(panel) {
    const pyqs = this.data.pyqs || [];
    panel.innerHTML = `
      <div class="admin-header">
        <h1>Previous Year Questions</h1>
        <button class="btn btn-primary btn-sm" onclick="Admin.switchSection('addContent')">➕ Add PYQ</button>
      </div>
      <div class="pyq-timeline">
        ${pyqs.map((pyq, idx) => `
          <div class="pyq-item">
            <div class="pyq-year">${pyq.year}</div>
            <div class="pyq-content">
              <div class="pyq-subject">${this.getSubjectName(pyq.subject)} • ${pyq.board?.toUpperCase() || 'CBSE'}</div>
              <p class="pyq-question">${pyq.question?.substring(0, 150)}...</p>
              <div class="pyq-actions">
                <button class="btn btn-sm btn-gh" onclick="Admin.deleteItem('pyqs', ${idx})">Delete</button>
              </div>
            </div>
          </div>
        `).join('')}
        ${pyqs.length === 0 ? '<div class="empty-state">No PYQs added yet.</div>' : ''}
      </div>
    `;
  },

  renderPaperManager(panel) {
    const papers = this.data.papers || [];
    panel.innerHTML = `
      <div class="admin-header">
        <h1>Question Papers</h1>
        <button class="btn btn-primary btn-sm" onclick="Admin.switchSection('addContent')">➕ Add Paper</button>
      </div>
      <div class="papers-list">
        ${papers.map((paper, idx) => `
          <div class="paper-card">
            <div class="paper-icon">📑</div>
            <div class="paper-info">
              <h4>${paper.title}</h4>
              <div class="paper-meta">
                <span>${this.getSubjectName(paper.subject)}</span>
                <span>${paper.year}</span>
                <span class="paper-type">${paper.type}</span>
              </div>
            </div>
            <div class="paper-actions">
              <a href="${paper.url}" target="_blank" class="btn btn-sm btn-primary">Open</a>
              <button class="btn btn-sm btn-gh" onclick="Admin.deleteItem('papers', ${idx})">Delete</button>
            </div>
          </div>
        `).join('')}
        ${papers.length === 0 ? '<div class="empty-state">No question papers added yet.</div>' : ''}
      </div>
    `;
  },

  renderTeacherManager(panel) {
    const teachers = this.data.teachers || [];
    panel.innerHTML = `
      <div class="admin-header">
        <h1>Teachers</h1>
        <button class="btn btn-primary btn-sm" onclick="Admin.showAddTeacherForm()">➕ Add Teacher</button>
      </div>
      <div class="teachers-grid-admin">
        ${teachers.map((t, idx) => `
          <div class="teacher-card-admin" style="border-left-color: ${t.color || '#6366F1'}">
            <div class="teacher-avatar-admin" style="background: ${t.color || '#6366F1'}">
              ${t.avatar || t.name?.[0] || 'T'}
            </div>
            <div class="teacher-info-admin">
              <h4>${t.name}</h4>
              <p>${t.channel || 'No channel'}</p>
            </div>
            <div class="teacher-actions">
              <button class="btn btn-sm btn-gh" onclick="Admin.deleteItem('teachers', ${idx})">Delete</button>
            </div>
          </div>
        `).join('')}
        ${teachers.length === 0 ? '<div class="empty-state">No teachers added yet.</div>' : ''}
      </div>
      
      <div id="teacherFormArea"></div>
    `;
  },

  showAddTeacherForm() {
    const formArea = document.getElementById('teacherFormArea');
    formArea.innerHTML = `
      <div class="form-card" style="margin-top: 24px;">
        <h3>👨‍🏫 Add New Teacher</h3>
        <div class="form-grid">
          <div class="form-group">
            <label>Name *</label>
            <input type="text" class="fc" id="teacherName" placeholder="e.g., R.K. Sharma">
          </div>
          <div class="form-group">
            <label>Channel</label>
            <input type="text" class="fc" id="teacherChannel" placeholder="e.g., Physics Wallah">
          </div>
          <div class="form-group">
            <label>Avatar (initials)</label>
            <input type="text" class="fc" id="teacherAvatar" placeholder="e.g., RS" maxlength="2">
          </div>
          <div class="form-group">
            <label>Color</label>
            <input type="color" class="fc" id="teacherColor" value="#6366F1">
          </div>
        </div>
        <div class="form-actions">
          <button class="btn btn-primary" onclick="Admin.saveTeacher()">💾 Save Teacher</button>
          <button class="btn btn-gh" onclick="document.getElementById('teacherFormArea').innerHTML=''">Cancel</button>
        </div>
      </div>
    `;
  },

  saveTeacher() {
    const teacher = {
      name: document.getElementById('teacherName').value,
      channel: document.getElementById('teacherChannel').value,
      avatar: document.getElementById('teacherAvatar').value,
      color: document.getElementById('teacherColor').value
    };
    
    if (!teacher.name) { alert('Teacher name is required!'); return; }
    
    if (!this.data.teachers) this.data.teachers = [];
    this.data.teachers.push(teacher);
    this.saveData();
    alert('✅ Teacher added!');
    this.switchSection('teachers');
  },

  clearAllData() {
    if (confirm('⚠️ WARNING: This will delete ALL admin data! Are you sure?')) {
      localStorage.removeItem('vm_admin_data');
      this.data = {};
      alert('All data cleared. Page will refresh.');
      location.reload();
    }
  },

  // Helpers
  getSubjectName(id) {
    const subj = this.subjects.find(s => s.id === id);
    return subj ? subj.name : id;
  },

  getChapterName(id) {
    const ch = this.chapters.find(c => c.id === id);
    return ch ? ch.title : id || '-';
  },

  // Mobile Navigation
  toggleMobileNav() {
    const nav = document.getElementById('adminNav');
    const backdrop = document.getElementById('adminNavBackdrop');
    
    if (nav.classList.contains('open')) {
      nav.classList.remove('open');
      if (backdrop) backdrop.remove();
      document.body.style.overflow = '';
    } else {
      nav.classList.add('open');
      // Create backdrop
      if (!backdrop) {
        const bd = document.createElement('div');
        bd.id = 'adminNavBackdrop';
        bd.className = 'backdrop on';
        bd.style.zIndex = '899';
        bd.onclick = () => this.toggleMobileNav();
        document.body.appendChild(bd);
      }
      document.body.style.overflow = 'hidden';
    }
  },

  // Close mobile navigation
  closeMobileNav() {
    const nav = document.getElementById('adminNav');
    const backdrop = document.getElementById('adminNavBackdrop');
    nav.classList.remove('open');
    if (backdrop) backdrop.remove();
    document.body.style.overflow = '';
  },

  formatDate(dateStr) {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  },

  deleteItem(key, idx) {
    if (confirm('Are you sure you want to delete this item?')) {
      if (this.data[key]) {
        this.data[key].splice(idx, 1);
        this.saveData();
        // Refresh current section
        const sectionMap = {
          'videos': 'links', 'pdfs': 'pdfs', 'quiz': 'quiz',
          'pyqs': 'pyqs', 'papers': 'papers', 'notes': 'notes', 'teachers': 'teachers'
        };
        this.switchSection(sectionMap[key] || 'dashboard');
      }
    }
  },

  // PDF File Upload with Base64 encoding (for small files < 1MB)
  handlePdfFileUpload(inputId, callback) {
    const input = document.getElementById(inputId);
    if (!input || !input.files || !input.files[0]) return;
    
    const file = input.files[0];
    const maxSize = 1024 * 1024; // 1MB limit
    
    if (file.size > maxSize) {
      alert('File too large. Please use files under 1MB or paste a URL instead.');
      return;
    }
    
    if (file.type !== 'application/pdf') {
      alert('Please upload a PDF file only.');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target.result;
      callback(base64, file.name);
    };
    reader.onerror = () => {
      alert('Error reading file. Please try again or use a URL.');
    };
    reader.readAsDataURL(file);
  },

  // Upload PDF for Notes
  uploadNotesPdf() {
    this.handlePdfFileUpload('leNotesFile', (base64, name) => {
      const { sid, cid, lid } = this._editCtx;
      if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
      
      this._setLessonPatch(sid, cid, lid, { 
        notesPdfBase64: base64,
        notesPdfName: name 
      });
      alert('✅ Notes PDF uploaded and saved');
    });
  },

  // Upload PDF for PYQ
  uploadPyqPdf() {
    this.handlePdfFileUpload('lePyqFile', (base64, name) => {
      const { sid, cid, lid } = this._editCtx;
      if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
      
      this._setLessonPatch(sid, cid, lid, { 
        pyqPdfBase64: base64,
        pyqPdfName: name 
      });
      alert('✅ PYQ PDF uploaded and saved');
    });
  },

  // Upload PDF for Question Paper
  uploadPaperPdf() {
    this.handlePdfFileUpload('lePaperFile', (base64, name) => {
      const { sid, cid, lid } = this._editCtx;
      if (!sid || !cid || !lid) { alert('Select a lesson first'); return; }
      
      this._setLessonPatch(sid, cid, lid, { 
        paperPdfBase64: base64,
        paperPdfName: name 
      });
      alert('✅ Question Paper PDF uploaded and saved');
    });
  },

  // Parse PDF to text (simplified - extracts text from base64 PDFs if possible)
  async parsePdfToText(base64Data) {
    // This is a placeholder - in a real implementation you'd use a PDF parsing library
    // For now, we just store the base64 data and display it as a downloadable link
    return null;
  },

  checkLogin() {
    const key = localStorage.getItem('vm_admin_key');
    if (key === '6610') {
      document.getElementById('loginWall').style.display = 'none';
      document.getElementById('adminBody').style.display = 'block';
      return true;
    }
    return false;
  },
};