const DEFAULT_COPY = {
  question: 'Was this topic helpful?',
  upLabel: 'Yes, loved it',
  downLabel: 'Could be better',
  thankYou: 'Thank you for your feedback.',
};
// Placeholder only:
const FEEDBACK_ENDPOINT = '';

async function sendFeedback(endpoint, payload) {
  if (!endpoint) return;

  try {
    await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      keepalive: true,
    });

    // Placeholder only: response validation and retry behavior will be added later.
  } catch {
    // Placeholder only: error reporting will be added later.
  }
}

export default function decorate(block) {
  const question = DEFAULT_COPY.question;
  const upLabel = DEFAULT_COPY.upLabel;
  const downLabel = DEFAULT_COPY.downLabel;
  const thankYouText = DEFAULT_COPY.thankYou;
  const endpoint = FEEDBACK_ENDPOINT;

  block.textContent = '';

  const section = document.createElement('section');
  section.className = 'article-feedback-section';

  const prompt = document.createElement('p');
  prompt.className = 'article-feedback-prompt';
  prompt.textContent = question;

  const controls = document.createElement('div');
  controls.className = 'article-feedback-controls';

  const upButton = document.createElement('button');
  upButton.type = 'button';
  upButton.className = 'article-feedback-button article-feedback-button-up';
  upButton.setAttribute('aria-label', upLabel);
  upButton.textContent = upLabel;

  const downButton = document.createElement('button');
  downButton.type = 'button';
  downButton.className = 'article-feedback-button article-feedback-button-down';
  downButton.setAttribute('aria-label', downLabel);
  downButton.textContent = downLabel;

  controls.append(upButton, downButton);

  const thankYou = document.createElement('p');
  thankYou.className = 'article-feedback-thank-you';
  thankYou.textContent = thankYouText;
  thankYou.hidden = true;

  const submit = async (vote) => {
    if (block.classList.contains('article-feedback-submitted')) return;

    block.classList.add('article-feedback-submitted');
    upButton.disabled = true;
    downButton.disabled = true;

    // Placeholder only:
    const payload = {
      vote,
      pageUrl: window.location.href,
      pageTitle: document.title || '',
      submittedAt: new Date().toISOString(),
    };

    await sendFeedback(endpoint, payload);

    // Hide voting controls and show confirmation message after a vote.
    section.hidden = true;
    thankYou.hidden = false;
  };

  upButton.addEventListener('click', () => submit('up'));
  downButton.addEventListener('click', () => submit('down'));

  block.append(section, thankYou);
  section.append(prompt, controls);
}
