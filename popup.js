document.addEventListener('DOMContentLoaded', () => {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const engineBtns = document.querySelectorAll('.engine-btn');
  
  let selectedEngine = 'google';
  
  engineBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      engineBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedEngine = btn.dataset.engine;
      
      const placeholders = {
        google: 'ابحث في Google...',
        bing: 'ابحث في Bing...',
        duckduckgo: 'ابحث في DuckDuckGo...',
        yahoo: 'ابحث في Yahoo...',
        youtube: 'ابحث في YouTube...'
      };
      searchInput.placeholder = placeholders[selectedEngine];
    });
  });
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (!query) return;
    
    const urls = {
      google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
      bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
      duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
      yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`,
      youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`
    };
    
    chrome.tabs.create({ url: urls[selectedEngine] });
  }
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
});
