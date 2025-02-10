document.addEventListener('DOMContentLoaded', () => {
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');
  const presetButtons = document.querySelectorAll('.preset-btn');
  const status = document.getElementById('status');

  // 从存储中获取上次设置的速度
  chrome.storage.local.get(['playbackSpeed'], (result) => {
    const savedSpeed = result.playbackSpeed || 1;
    speedSlider.value = savedSpeed;
    speedValue.textContent = savedSpeed + 'x';
  });

  // 更新速度显示
  function updateSpeedDisplay(speed) {
    speedValue.textContent = speed + 'x';
  }

  // 发送速度更新消息到content script
  function updateVideoSpeed(speed) {
    chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, {action: 'setSpeed', speed: speed});
        chrome.storage.local.set({playbackSpeed: speed});
        status.textContent = `已设置为 ${speed}x 速度`;
      }
    });
  }

  // 滑块事件监听
  speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    updateSpeedDisplay(speed);
  });

  speedSlider.addEventListener('change', (e) => {
    const speed = parseFloat(e.target.value);
    updateVideoSpeed(speed);
  });

  // 预设按钮事件监听
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const speed = parseFloat(button.dataset.speed);
      speedSlider.value = speed;
      updateSpeedDisplay(speed);
      updateVideoSpeed(speed);
    });
  });

  // 监听来自content script的消息
  chrome.runtime.onMessage.addListener((message) => {
    if (message.action === 'updateStatus') {
      status.textContent = message.status;
    }
  });
})