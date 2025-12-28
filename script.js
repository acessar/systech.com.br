// Video autoplay otimizado
(function() {
  const video = document.getElementById('bg-video');
  if (!video) return;

  video.muted = true;
  video.volume = 0;
  video.defaultMuted = true;
  video.setAttribute('muted', '');
  video.setAttribute('autoplay', '');
  video.setAttribute('playsinline', '');
  video.setAttribute('webkit-playsinline', '');
  video.playsInline = true;
  video.controls = false;
  video.disablePictureInPicture = true;

  let attempts = 0;
  const maxAttempts = 500;
  let hasPlayed = false;

  function forcePlay() {
    if (attempts >= maxAttempts || hasPlayed) return;
    attempts++;

    video.play()
      .then(() => {
        hasPlayed = true;
      })
      .catch(() => {
        setTimeout(forcePlay, 10);
      });
  }

  const events = ['loadstart', 'loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'];
  events.forEach(event => video.addEventListener(event, forcePlay, { once: true }));

  forcePlay();

  const interval = setInterval(() => {
    if (hasPlayed) {
      clearInterval(interval);
    } else {
      forcePlay();
    }
  }, 100);

  setTimeout(() => clearInterval(interval), 3000);

  [10, 50, 100, 200, 500, 1000, 1500, 2000].forEach(delay => {
    setTimeout(forcePlay, delay);
  });

  video.addEventListener('ended', () => {
    video.currentTime = 0;
    forcePlay();
  });

  video.addEventListener('pause', () => {
    if (!video.ended && hasPlayed) {
      setTimeout(forcePlay, 100);
    }
  });

  const interactionEvents = ['touchstart', 'touchend', 'click', 'scroll', 'mousemove', 'keydown'];
  const handleInteraction = () => {
    if (!hasPlayed) {
      forcePlay();
      interactionEvents.forEach(evt => {
        document.removeEventListener(evt, handleInteraction);
      });
    }
  };
  
  interactionEvents.forEach(evt => {
    document.addEventListener(evt, handleInteraction, { once: true, passive: true });
  });
})();

// FAQ Accordion
document.querySelectorAll('.faq-item').forEach(item => {
  item.querySelector('.faq-question').addEventListener('click', () => {
    const isActive = item.classList.contains('active');
    document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
    if (!isActive) item.classList.add('active');
  });
});

// Menu Hambúrguer e Dropdown Flutuante com GSAP
const hamburgerMenu = document.querySelector('.hamburger-menu');
const dropdown = document.querySelector('.quick-nav-dropdown');
const quickNavItems = document.querySelectorAll('.quick-nav-item');

// Timeline para animação do hambúrguer (declarada globalmente)
let hamburgerTL = null;

// Inicializar GSAP quando disponível
if (typeof gsap !== 'undefined') {
  hamburgerTL = gsap.timeline({ paused: true });

  // Animações das barrinhas do hambúrguer
  hamburgerTL.to('.hamburger-menu span:nth-child(1)', {
    rotation: 45,
    y: 6.5,
    duration: 0.4,
    ease: 'power2.out'
  }, 0)
  .to('.hamburger-menu span:nth-child(2)', {
    opacity: 0,
    duration: 0.3,
    ease: 'power2.in'
  }, 0)
  .to('.hamburger-menu span:nth-child(3)', {
    rotation: -45,
    y: -6.5,
    duration: 0.4,
    ease: 'power2.out'
  }, 0);
}

function openDropdown() {
  if (typeof gsap === 'undefined') {
    // Fallback caso GSAP não carregue
    if (dropdown) {
      dropdown.classList.add('active');
      hamburgerMenu.classList.add('active');
      dropdownOpen = true;
    }
    return;
  }

  if (dropdown) {
    // Animar dropdown: opacity, translateY, scale
    gsap.fromTo(dropdown,
      {
        opacity: 0,
        visibility: 'hidden',
        y: -10,
        scale: 0.96
      },
      {
        opacity: 1,
        visibility: 'visible',
        y: 0,
        scale: 1,
        duration: 0.35,
        ease: 'power3.out'
      }
    );

    // Animar itens do menu com stagger
    gsap.fromTo(quickNavItems, 
      {
        y: -8,
        opacity: 0
      },
      {
        y: 0,
        opacity: 1,
        duration: 0.4,
        stagger: 0.08,
        ease: 'power3.out',
        delay: 0.1
      }
    );

    hamburgerMenu.classList.add('active');
    if (hamburgerTL) hamburgerTL.play();
    dropdownOpen = true;
  }
}

function closeDropdown() {
  if (typeof gsap === 'undefined') {
    // Fallback caso GSAP não carregue
    if (dropdown) {
      dropdown.classList.remove('active');
      hamburgerMenu.classList.remove('active');
      dropdownOpen = false;
    }
    return;
  }

  if (dropdown) {
    // Animar dropdown de volta
    gsap.to(dropdown, {
      opacity: 0,
      visibility: 'hidden',
      y: -10,
      scale: 0.96,
      duration: 0.3,
      ease: 'power2.in'
    });

    // Animar itens do menu
    gsap.to(quickNavItems, {
      y: -8,
      opacity: 0,
      duration: 0.25,
      stagger: 0.05,
      ease: 'power2.in'
    });

    hamburgerMenu.classList.remove('active');
    if (hamburgerTL) hamburgerTL.reverse();
    dropdownOpen = false;
  }
}

// Estado do dropdown
let dropdownOpen = false;

if (hamburgerMenu) {
  hamburgerMenu.addEventListener('click', (e) => {
    e.stopPropagation();
    if (dropdownOpen) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });
}

// Fechar dropdown ao clicar fora
document.addEventListener('click', (e) => {
  if (dropdownOpen && 
      !hamburgerMenu.contains(e.target) && 
      !dropdown.contains(e.target)) {
    closeDropdown();
  }
});

// Função para configurar navegação
function setupNavigation() {
  const navItems = document.querySelectorAll('.quick-nav-item');
  
  navItems.forEach(item => {
    // Remover listeners anteriores
    const newItem = item.cloneNode(true);
    item.parentNode.replaceChild(newItem, item);
    
    // Adicionar novo listener
    newItem.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const targetId = this.getAttribute('href');
      if (!targetId) {
        console.error('Link sem href:', this);
        return;
      }
      
      console.log('Navegando para:', targetId);
      
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        console.log('Seção encontrada:', targetSection);
        
        // Fechar dropdown
        if (typeof closeDropdown === 'function') {
          closeDropdown();
        }
        
        // Scroll suave
        setTimeout(() => {
          const nav = document.querySelector('nav');
          const navHeight = nav ? nav.offsetHeight : 80;
          const targetPosition = targetSection.offsetTop - navHeight;
          
          console.log('Fazendo scroll para:', targetPosition);
          
          window.scrollTo({
            top: Math.max(0, targetPosition),
            behavior: 'smooth'
          });
        }, 200);
      } else {
        console.error('Seção NÃO encontrada:', targetId);
        alert(`Seção não encontrada: ${targetId}`);
      }
    });
  });
}

// Executar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupNavigation);
} else {
  setupNavigation();
}

// Também executar após um pequeno delay para garantir
setTimeout(setupNavigation, 100);

// Fechar dropdown com ESC
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && dropdownOpen) {
    closeDropdown();
  }
});

// Função para abrir o chatbot
function openChatbot() {
  if (window.Chatling && typeof window.Chatling.open === 'function') {
    window.Chatling.open();
    return true;
  }
  
  // Tentar métodos alternativos
  if (window.Chatling && typeof window.Chatling.show === 'function') {
    window.Chatling.show();
    return true;
  }
  
  // Tentar encontrar e clicar no botão do chatbot
  const chatButton = document.querySelector('[data-id="3553371319"]') || 
                     document.querySelector('.chatling-widget-button') ||
                     document.querySelector('#chtl-script')?.nextElementSibling?.querySelector('button');
  
  if (chatButton) {
    chatButton.click();
    return true;
  }
  
  return false;
}

// Função auxiliar para aguardar o Chatling carregar
function waitForChatling(callback, maxAttempts = 100) {
  let attempts = 0;
  const checkInterval = setInterval(() => {
    attempts++;
    if (window.Chatling && typeof window.Chatling.open === 'function') {
      clearInterval(checkInterval);
      callback();
    } else if (attempts >= maxAttempts) {
      clearInterval(checkInterval);
      // Tentar abrir mesmo sem a API disponível (pode funcionar se o botão já estiver renderizado)
      if (callback) callback();
    }
  }, 100);
}

// Configurar eventos para todos os botões "Solicitar demonstração"
function setupChatbotButtons() {
  // Listener específico para o link do menu de navegação
  const navSolicitarLink = document.getElementById('nav-solicitar-demo');
  if (navSolicitarLink && !navSolicitarLink.dataset.chatbotListenerAdded) {
    navSolicitarLink.dataset.chatbotListenerAdded = 'true';
    navSolicitarLink.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      if (openChatbot()) {
        return;
      }
      
      waitForChatling(() => {
        if (!openChatbot()) {
          console.warn('Não foi possível abrir o chatbot. Tentando novamente...');
          setTimeout(() => {
            if (!openChatbot()) {
              console.error('Chatbot não está disponível no momento.');
            }
          }, 500);
        }
      });
    });
  }
  
  // Buscar todos os links com classe "cta"
  const allCtaLinks = document.querySelectorAll('a.cta');
  
  allCtaLinks.forEach(link => {
    const href = link.getAttribute('href');
    const text = link.textContent.trim();
    
    // Verificar se é um link "Solicitar demonstração"
    if (href === '#solicitar' || text.includes('Solicitar demonstração')) {
      // Verificar se já tem um listener (evitar duplicação)
      if (link.dataset.chatbotListenerAdded) {
        return;
      }
      
      // Marcar que já adicionamos o listener
      link.dataset.chatbotListenerAdded = 'true';
      
      // Adicionar listener
      link.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // Tentar abrir imediatamente se já estiver disponível
        if (openChatbot()) {
          return;
        }
        
        // Caso contrário, aguardar o Chatling carregar
        waitForChatling(() => {
          if (!openChatbot()) {
            console.warn('Não foi possível abrir o chatbot. Tentando novamente...');
            setTimeout(() => {
              if (!openChatbot()) {
                console.error('Chatbot não está disponível no momento.');
              }
            }, 500);
          }
        });
      });
    }
  });
}

// Executar quando DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupChatbotButtons);
} else {
  setupChatbotButtons();
}

// Também executar após um delay para garantir que o script do Chatling carregou
setTimeout(setupChatbotButtons, 1000);

// Listener para quando o script do Chatling carregar
const chatlingScript = document.getElementById('chtl-script');
if (chatlingScript) {
  chatlingScript.addEventListener('load', function() {
    // Aguardar um pouco mais para garantir que a API está disponível
    setTimeout(() => {
      setupChatbotButtons();
      customizeChatbotWidget();
    }, 500);
  });
}

// Função para customizar o widget do Chatling
function customizeChatbotWidget() {
  // Tentar encontrar e estilizar o botão do widget
  function applyChatbotStyles() {
    // Buscar por diversos seletores possíveis do widget
    const selectors = [
      '.chatling-widget-button',
      '[class*="chatling-button"]',
      '[class*="chatling-widget"]',
      '[id*="chatling"]',
      'iframe[src*="chatling"]'
    ];

    selectors.forEach(selector => {
      try {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
          // Aplicar estilos inline se necessário
          if (el.tagName === 'BUTTON' || el.classList.toString().includes('button')) {
            el.style.cssText += `
              background: rgba(107, 159, 255, 0.15) !important;
              backdrop-filter: blur(12px) saturate(180%) !important;
              -webkit-backdrop-filter: blur(12px) saturate(180%) !important;
              border: 1px solid rgba(107, 159, 255, 0.3) !important;
              border-radius: 50% !important;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(107, 159, 255, 0.2) inset, 0 0 30px rgba(107, 159, 255, 0.2) !important;
            `;
            
            // Estilizar SVG/ícone dentro do botão
            const svg = el.querySelector('svg');
            if (svg) {
              svg.style.cssText += `
                fill: #dbe6ff !important;
                filter: drop-shadow(0 0 8px rgba(107, 159, 255, 0.5)) !important;
              `;
              
              const paths = svg.querySelectorAll('path');
              paths.forEach(path => {
                path.style.cssText += `
                  fill: #dbe6ff !important;
                `;
              });
            }
          }
          
          // Estilizar iframe do widget
          if (el.tagName === 'IFRAME') {
            el.style.cssText += `
              border-radius: 16px !important;
              border: 1px solid rgba(107, 159, 255, 0.2) !important;
              box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(107, 159, 255, 0.15) inset !important;
            `;
          }
        });
      } catch (e) {
        // Ignorar erros de seletores inválidos
      }
    });
  }

  // Aplicar estilos imediatamente
  applyChatbotStyles();

  // Usar MutationObserver para detectar quando o widget é adicionado
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.addedNodes.length) {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.classList?.toString().includes('chatling') || 
                node.id?.includes('chatling') ||
                node.tagName === 'IFRAME' && node.src?.includes('chatling')) {
              setTimeout(applyChatbotStyles, 100);
            }
          }
        });
      }
    });
  });

  // Observar mudanças no body
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  // Reaplicar estilos periodicamente para garantir que não sejam sobrescritos
  const interval = setInterval(() => {
    applyChatbotStyles();
  }, 2000);

  // Parar após 30 segundos (tempo suficiente para o widget carregar)
  setTimeout(() => {
    clearInterval(interval);
    observer.disconnect();
  }, 30000);
}

// Tentar customizar quando o DOM estiver pronto
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(customizeChatbotWidget, 1000);
  });
} else {
  setTimeout(customizeChatbotWidget, 1000);
}