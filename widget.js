(function () {
  const script = document.currentScript;
  const botId = script.getAttribute('data-bot-id');
  const N8N_CHAT_URL = 'https://mtisha.app.n8n.cloud/webhook-test/chat';

  if (!botId) return;

  const style = document.createElement('style');
  style.textContent = `
    #cb-btn {
      position: fixed; bottom: 24px; right: 24px;
      width: 56px; height: 56px; border-radius: 50%;
      background: #6B4EFF; color: #fff; font-size: 26px;
      border: none; cursor: pointer; z-index: 9999;
      box-shadow: 0 4px 16px rgba(107,78,255,0.4);
    }
    #cb-box {
      position: fixed; bottom: 90px; right: 24px;
      width: 340px; height: 480px; background: #fff;
      border-radius: 16px; display: none;
      flex-direction: column; z-index: 9999;
      box-shadow: 0 8px 32px rgba(0,0,0,0.15);
      font-family: sans-serif; overflow: hidden;
    }
    #cb-box.open { display: flex; }
    #cb-head {
      background: #6B4EFF; color: #fff;
      padding: 14px 16px; font-weight: 600; font-size: 15px;
    }
    #cb-msgs {
      flex: 1; overflow-y: auto; padding: 12px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .cb-msg {
      max-width: 80%; padding: 9px 13px;
      border-radius: 12px; font-size: 14px; line-height: 1.5;
    }
    .cb-msg.bot { background: #f0f0f0; color: #222; align-self: flex-start; }
    .cb-msg.user { background: #6B4EFF; color: #fff; align-self: flex-end; }
    .cb-typing { opacity: 0.5; font-style: italic; }
    #cb-foot {
      display: flex; padding: 10px; gap: 8px;
      border-top: 1px solid #eee;
    }
    #cb-input {
      flex: 1; border: 1px solid #ddd; border-radius: 8px;
      padding: 8px 12px; font-size: 14px; outline: none;
    }
    #cb-send {
      background: #6B4EFF; color: #fff; border: none;
      border-radius: 8px; padding: 8px 16px;
      cursor: pointer; font-size: 14px;
    }
  `;
  document.head.appendChild(style);

  document.body.insertAdjacentHTML('beforeend', `
    <button id="cb-btn">💬</button>
    <div id="cb-box">
      <div id="cb-head">Chat with us</div>
      <div id="cb-msgs">
        <div class="cb-msg bot">Hi! How can I help you today?</div>
      </div>
      <div id="cb-foot">
        <input id="cb-input" placeholder="Type your question..." />
        <button id="cb-send">Send</button>
      </div>
    </div>
  `);

  document.getElementById('cb-btn').onclick = () =>
    document.getElementById('cb-box').classList.toggle('open');

  async function sendMsg() {
    const input = document.getElementById('cb-input');
    const question = input.value.trim();
    if (!question) return;

    input.value = '';
    input.disabled = true;

    const msgs = document.getElementById('cb-msgs');

    msgs.insertAdjacentHTML('beforeend',
      `<div class="cb-msg user">${question}</div>`
    );
    msgs.insertAdjacentHTML('beforeend',
      `<div class="cb-msg bot cb-typing" id="cb-typing">Typing...</div>`
    );
    msgs.scrollTop = msgs.scrollHeight;

    try {
      const res = await fetch(N8N_CHAT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatbot_id: botId, question })
      });
      const data = await res.json();
      document.getElementById('cb-typing').remove();
      msgs.insertAdjacentHTML('beforeend',
        `<div class="cb-msg bot">${data.answer}</div>`
      );
    } catch (err) {
      document.getElementById('cb-typing').remove();
      msgs.insertAdjacentHTML('beforeend',
        `<div class="cb-msg bot">Sorry, something went wrong.</div>`
      );
    }

    input.disabled = false;
    input.focus();
    msgs.scrollTop = msgs.scrollHeight;
  }

  document.getElementById('cb-send').onclick = sendMsg;
  document.getElementById('cb-input').onkeydown = e => {
    if (e.key === 'Enter') sendMsg();
  };
})();
