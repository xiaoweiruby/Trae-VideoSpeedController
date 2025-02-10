// 视频选择器配置
const VIDEO_SELECTORS = {
  'youtube.com': ['video.html5-main-video', '.video-stream', '.html5-main-video'],
  'bilibili.com': ['.bilibili-player-video video', '#bilibili-player video', '.bwp-video'],
  'iqiyi.com': ['.iqp-player video', '#flashbox video', '.iqp-player-video'],
  'youku.com': ['#ykPlayer video', '#player video', '.youku-player video'],
  'tudou.com': ['#tudou-player video', '#player video'],
  'qq.com': ['video', '.txp_video_container video', '#tenvideo_video_player_0']
};

// 获取当前网站的视频元素选择器
function getVideoSelector() {
  const hostname = window.location.hostname;
  console.log('当前网站:', hostname);
  
  for (const domain in VIDEO_SELECTORS) {
    if (hostname.includes(domain)) {
      console.log('匹配到域名:', domain);
      return VIDEO_SELECTORS[domain];
    }
  }
  console.log('未匹配到特定域名，使用通用选择器');
  return ['video'];
}

// 查找视频元素
function findVideoElements() {
  const selectors = getVideoSelector();
  let videos = new Set();
  
  selectors.forEach(selector => {
    const found = document.querySelectorAll(selector);
    console.log(`使用选择器 "${selector}" 找到 ${found.length} 个视频元素`);
    found.forEach(video => videos.add(video));
  });
  
  return Array.from(videos);
}

// 设置视频速度
function setVideoSpeed(speed) {
  const videos = findVideoElements();
  console.log(`找到 ${videos.length} 个视频元素`);
  
  if (videos.length === 0) {
    console.log('未找到视频元素，尝试延迟重试...');
    setTimeout(() => {
      const retryVideos = findVideoElements();
      if (retryVideos.length > 0) {
        applySpeed(retryVideos, speed);
      } else {
        chrome.runtime.sendMessage({
          action: 'updateStatus',
          status: '未找到视频元素'
        });
      }
    }, 1000);
    return;
  }
  
  applySpeed(videos, speed);
}

function applySpeed(videos, speed) {
  let successCount = 0;
  
  videos.forEach(video => {
    try {
      video.playbackRate = speed;
      successCount++;
      console.log(`成功设置视频速度: ${speed}x`);
    } catch (error) {
      console.error('设置视频速度失败:', error);
    }
  });

  chrome.runtime.sendMessage({
    action: 'updateStatus',
    status: `已将${successCount}个视频设置为 ${speed}x 速度`
  });
}

// 监听来自popup的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'setSpeed') {
    setVideoSpeed(message.speed);
  }
});

// 创建MutationObserver以监视DOM变化
const observer = new MutationObserver(() => {
  chrome.storage.local.get(['playbackSpeed'], (result) => {
    if (result.playbackSpeed) {
      setVideoSpeed(result.playbackSpeed);
    }
  });
});

// 开始观察DOM变化
observer.observe(document.body, {
  childList: true,
  subtree: true
});

// 页面加载完成后应用保存的速度
window.addEventListener('load', () => {
  chrome.storage.local.get(['playbackSpeed'], (result) => {
    if (result.playbackSpeed) {
      setVideoSpeed(result.playbackSpeed);
    }
  });
});