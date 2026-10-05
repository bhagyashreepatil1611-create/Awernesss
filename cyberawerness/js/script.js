// Shared navigation, motion, and page-specific interactions for CyberSafe.
document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;
  const themeButton = document.querySelector('[data-theme-toggle]');
  const savedTheme = localStorage.getItem('cybersafe-theme');

  if (savedTheme) root.dataset.theme = savedTheme;
  themeButton?.addEventListener('click', () => {
    root.dataset.theme = root.dataset.theme === 'light' ? 'dark' : 'light';
    localStorage.setItem('cybersafe-theme', root.dataset.theme);
    themeButton.setAttribute('aria-label', `Switch to ${root.dataset.theme === 'dark' ? 'light' : 'dark'} mode`);
  });

  const menuButton = document.querySelector('[data-menu-toggle]');
  const nav = document.querySelector('[data-site-nav]');
  menuButton?.addEventListener('click', () => {
    const isOpen = nav.classList.toggle('is-open');
    menuButton.setAttribute('aria-expanded', String(isOpen));
  });
  nav?.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      nav.classList.remove('is-open');
      menuButton?.setAttribute('aria-expanded', 'false');
    });
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((item) => revealObserver.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }

  const topButton = document.querySelector('[data-back-to-top]');
  const updateTopButton = () => topButton?.classList.toggle('is-visible', window.scrollY > 480);
  window.addEventListener('scroll', updateTopButton, { passive: true });
  updateTopButton();
  topButton?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const counters = document.querySelectorAll('[data-count]');
  if (counters.length && 'IntersectionObserver' in window) {
    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const element = entry.target;
        const target = Number(element.dataset.count);
        const start = performance.now();
        const duration = 1200;
        const render = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          element.textContent = Math.round(target * (1 - (1 - progress) ** 3)).toLocaleString();
          if (progress < 1) requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        observer.unobserve(element);
      });
    }, { threshold: 0.5 });
    counters.forEach((counter) => counterObserver.observe(counter));
  }

  const scene = document.querySelector('[data-awareness-scene]');
  const sceneButton = document.querySelector('[data-scene-toggle]');
  sceneButton?.addEventListener('click', () => {
    const isPaused = scene.classList.toggle('is-paused');
    sceneButton.textContent = isPaused ? 'Play animation' : 'Pause animation';
    sceneButton.setAttribute('aria-pressed', String(!isPaused));
  });

  document.querySelectorAll('[data-clip-toggle]').forEach((button) => {
    const clip = button.closest('[data-clip-scene]');
    button.addEventListener('click', () => {
      const isPaused = clip.classList.toggle('is-paused');
      button.textContent = isPaused ? 'Play clip' : 'Pause clip';
      button.setAttribute('aria-label', `${isPaused ? 'Play' : 'Pause'} ${button.dataset.clipToggle}`);
      button.setAttribute('aria-pressed', String(!isPaused));
    });
  });

  const threatDialog = document.querySelector('[data-threat-dialog]');
  const threatTitle = document.querySelector('[data-threat-title]');
  const threatCopy = document.querySelector('[data-threat-copy]');
  document.querySelectorAll('[data-threat]').forEach((card) => {
    card.addEventListener('click', () => {
      threatTitle.textContent = card.dataset.title;
      threatCopy.textContent = card.dataset.details;
      if (typeof threatDialog.showModal === 'function') threatDialog.showModal();
      else threatDialog.setAttribute('open', '');
    });
  });
  document.querySelector('[data-dialog-close]')?.addEventListener('click', () => threatDialog.close());
  threatDialog?.addEventListener('click', (event) => {
    if (event.target === threatDialog) threatDialog.close();
  });

  const tipButtons = document.querySelectorAll('[data-tip-toggle]');
  const checklistProgress = document.querySelector('[data-checklist-progress]');
  const updateChecklistProgress = () => {
    const checked = document.querySelectorAll('[data-tip-toggle].is-checked').length;
    if (checklistProgress) checklistProgress.textContent = `${checked} of ${tipButtons.length} habits reviewed`;
  };
  tipButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const isChecked = button.classList.toggle('is-checked');
      button.setAttribute('aria-pressed', String(isChecked));
      button.querySelector('.tip-check').textContent = isChecked ? '✓' : '';
      updateChecklistProgress();
    });
  });
  updateChecklistProgress();

  const scenarios = [
    { text: 'A friend texts you a link to a free concert ticket and asks you to sign in with your social password.', safe: false, why: 'Unexpected sign-in links can steal your account. Visit the official ticket site yourself.' },
    { text: 'You review who can see your stories and limit them to people you know.', safe: true, why: 'Regularly checking audience controls helps keep personal posts with the right people.' },
    { text: 'A new account you do not recognize asks for your phone number to verify a giveaway.', safe: false, why: 'Do not share your phone number with unknown accounts. Verify promotions on official channels.' },
    { text: 'You receive a login alert you did not trigger, so you change your password from the official app.', safe: true, why: 'Using the official app and changing a compromised password is a good first response.' },
    { text: 'You post a photo that shows your school badge and the street sign outside your home.', safe: false, why: 'Background details can reveal where you study or live. Check photos before posting.' },
    { text: 'You report a profile that is impersonating a classmate instead of messaging it.', safe: true, why: 'Reporting impersonation through the platform helps protect the person and others.' },
  ];
  const gameText = document.querySelector('[data-scenario-text]');
  const gameFeedback = document.querySelector('[data-scenario-feedback]');
  const gameNext = document.querySelector('[data-scenario-next]');
  let scenarioIndex = 0;
  let scenarioAnswered = false;
  const showScenario = () => {
    if (!gameText) return;
    if (scenarioIndex >= scenarios.length) scenarioIndex = 0;
    gameText.textContent = scenarios[scenarioIndex].text;
    gameFeedback.textContent = '';
    gameFeedback.className = 'game-feedback';
    scenarioAnswered = false;
    document.querySelectorAll('[data-scenario-answer]').forEach((button) => { button.disabled = false; });
    gameNext.textContent = scenarioIndex === scenarios.length - 1 ? 'Play again' : 'Next situation';
  };
  document.querySelectorAll('[data-scenario-answer]').forEach((button) => {
    button.addEventListener('click', () => {
      if (scenarioAnswered) return;
      scenarioAnswered = true;
      const scenario = scenarios[scenarioIndex];
      const correct = button.dataset.scenarioAnswer === String(scenario.safe);
      gameFeedback.textContent = `${correct ? 'That is right.' : 'Not quite.'} ${scenario.why}`;
      gameFeedback.classList.add(correct ? 'is-correct' : 'is-incorrect');
      document.querySelectorAll('[data-scenario-answer]').forEach((answer) => { answer.disabled = true; });
    });
  });
  gameNext?.addEventListener('click', () => { scenarioIndex += 1; showScenario(); });
  showScenario();

  const questions = [
    { question: 'What is phishing?', answers: ['A fake message that tries to steal information', 'A way to back up photos', 'A kind of secure Wi-Fi'], correct: 0 },
    { question: 'Should you share a one-time passcode (OTP) with someone who calls you?', answers: ['Only if they know your name', 'No, never share it', 'Yes, if they say they are support'], correct: 1 },
    { question: 'Which password is strongest?', answers: ['summer2026', 'Password123!', 'A long, unique passphrase you do not reuse'], correct: 2 },
    { question: 'What does two-factor authentication add?', answers: ['A second verification step', 'A second username', 'A public profile'], correct: 0 },
    { question: 'What should you do with an unexpected link asking you to log in?', answers: ['Open it quickly', 'Forward it to friends', 'Avoid it and visit the official site directly'], correct: 2 },
    { question: 'What is malware?', answers: ['Software designed to harm or misuse a device', 'A secure browser setting', 'A type of password manager'], correct: 0 },
    { question: 'A suspicious email claims your account will close today. What is a good first step?', answers: ['Reply with your details', 'Use the official app or website to check', 'Download its attachment'], correct: 1 },
    { question: 'Why install software updates?', answers: ['They can fix security weaknesses', 'They make passwords unnecessary', 'They remove the need for backups'], correct: 0 },
    { question: 'What is safest on public Wi-Fi?', answers: ['Use it for sensitive banking without checking', 'Share the network password publicly', 'Avoid sensitive tasks or use a trusted secure connection'], correct: 2 },
    { question: 'What should you do if a social account is impersonating you?', answers: ['Send them your login details', 'Report it through the platform and tell trusted contacts', 'Post your phone number to prove your identity'], correct: 1 },
  ];
  const quiz = document.querySelector('[data-quiz]');
  if (quiz) {
    const questionText = quiz.querySelector('[data-quiz-question]');
    const answerList = quiz.querySelector('[data-quiz-answers]');
    const feedback = quiz.querySelector('[data-quiz-feedback]');
    const nextButton = quiz.querySelector('[data-quiz-next]');
    const progress = quiz.querySelector('[data-quiz-progress]');
    const scoreText = quiz.querySelector('[data-quiz-score]');
    let questionIndex = 0;
    let score = 0;
    let answered = false;

    const renderQuestion = () => {
      const current = questions[questionIndex];
      answered = false;
      questionText.textContent = current.question;
      progress.textContent = `Question ${questionIndex + 1} of ${questions.length}`;
      quiz.querySelector('[data-quiz-progress-bar]').style.width = `${(questionIndex / questions.length) * 100}%`;
      feedback.textContent = '';
      feedback.className = 'quiz-feedback';
      nextButton.hidden = true;
      answerList.replaceChildren(...current.answers.map((answer, index) => {
        const option = document.createElement('button');
        option.type = 'button';
        option.className = 'quiz-answer';
        option.textContent = answer;
        option.addEventListener('click', () => {
          if (answered) return;
          answered = true;
          const correct = index === current.correct;
          if (correct) score += 1;
          option.classList.add(correct ? 'is-correct' : 'is-incorrect');
          if (!correct) answerList.children[current.correct].classList.add('is-correct');
          feedback.textContent = correct ? 'Correct. Nice work.' : `Not quite. ${current.answers[current.correct]} is the safer answer.`;
          feedback.classList.add(correct ? 'is-correct' : 'is-incorrect');
          nextButton.hidden = false;
          nextButton.textContent = questionIndex === questions.length - 1 ? 'See your results' : 'Next question';
        });
        return option;
      }));
    };

    const showResults = () => {
      quiz.querySelector('[data-quiz-content]').hidden = true;
      quiz.querySelector('[data-quiz-results]').hidden = false;
      quiz.querySelector('[data-quiz-progress-bar]').style.width = '100%';
      scoreText.textContent = `${score} / ${questions.length}`;
      quiz.querySelector('[data-quiz-message]').textContent = score === questions.length
        ? 'Excellent work. You spotted every safer choice.'
        : 'Every question is a chance to build a safer online habit.';
    };

    nextButton.addEventListener('click', () => {
      if (!answered) return;
      if (questionIndex === questions.length - 1) showResults();
      else { questionIndex += 1; renderQuestion(); }
    });
    quiz.querySelector('[data-quiz-retry]').addEventListener('click', () => {
      questionIndex = 0;
      score = 0;
      quiz.querySelector('[data-quiz-content]').hidden = false;
      quiz.querySelector('[data-quiz-results]').hidden = true;
      renderQuestion();
    });
    renderQuestion();
  }

  document.querySelectorAll('[data-faq-question]').forEach((button) => {
    button.addEventListener('click', () => {
      const expanded = button.getAttribute('aria-expanded') === 'true';
      button.setAttribute('aria-expanded', String(!expanded));
      button.nextElementSibling.hidden = expanded;
    });
  });

  const contactForm = document.querySelector('[data-contact-form]');
  contactForm?.addEventListener('submit', (event) => {
    event.preventDefault();
    const status = contactForm.querySelector('[data-form-status]');
    if (!contactForm.reportValidity()) {
      status.textContent = 'Please check the highlighted fields and try again.';
      status.className = 'form-status is-error';
      return;
    }
    status.textContent = 'Thanks for sharing your message. This demo form has been validated locally; it does not send or store data.';
    status.className = 'form-status is-success';
    contactForm.reset();
  });
});