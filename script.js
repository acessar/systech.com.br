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
  const chatButton = document.querySelector('[data-id="7934253836"]') || 
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

/* ========================================
   ROBÔ ANIMADO COM SISTEMA DE FALA
   ======================================== */
(function() {
  'use strict';

  const robotContainer = document.getElementById('robotContainer');
  const robotWrapper = document.getElementById('robotWrapper');
  const speechBubble = document.getElementById('robotSpeechBubble');
  const speechContent = document.getElementById('speechBubbleContent');
  const speechClose = document.getElementById('speechClose');
  const speechBubbleWrapper = document.querySelector('.speech-bubble-wrapper');

  if (!robotContainer || !robotWrapper || !speechBubble || !speechContent) {
    return;
  }

  // Estado do robô
  let isSpeechVisible = false;
  let speechTimeout = null;
  let currentMessage = '';
  let sequenceTimeout = null;
  let isSequenceRunning = false;

  // Mensagens da sequência automática
  const initialMessage = 'Olá';
  const secondMessage = 'Venha fazer parte do alto nível do mercado 🚀';
  const thirdMessage = 'O futuro te espera!!';
  
  // Referência ao braço do robô para animação de aceno (será buscado quando necessário)
  let robotArmLeft = null;
  let robotArmRight = null;
  let waveAnimation = null;
  let raiseBothArmsAnimation = null;
  let raiseLeftArmAnimation = null;
  let lowerLeftArmAnimation = null;
  let lowerRightArmAnimation = null;
  
  // Buscar elementos após DOM carregar
  function initRobotElements() {
    robotArmLeft = document.querySelector('.robot-arm-left');
    robotArmRight = document.querySelector('.robot-arm-right');
    waveAnimation = document.getElementById('waveAnimation');
    raiseBothArmsAnimation = document.getElementById('raiseBothArmsAnimation');
    raiseLeftArmAnimation = document.getElementById('raiseLeftArmAnimation');
    lowerLeftArmAnimation = document.getElementById('lowerLeftArmAnimation');
    lowerRightArmAnimation = document.getElementById('lowerRightArmAnimation');
  }
  
  // Inicializar elementos
  initRobotElements();

  // Mensagens padrão (para quando clicar no robô)
  const defaultMessages = [
    secondMessage,
    thirdMessage,
    'Transforme seu negócio com IA de ponta! 💡'
  ];

  // Função para ativar animação de aceno
  function triggerWaveAnimation() {
    // Garantir que os elementos foram buscados
    if (!waveAnimation || !robotArmLeft) {
      initRobotElements();
    }
    
    if (waveAnimation) {
      // Reiniciar animação SVG
      try {
        waveAnimation.beginElement();
      } catch (e) {
        // Fallback se beginElement não funcionar
        waveAnimation.setAttribute('begin', '0s');
        setTimeout(() => {
          waveAnimation.removeAttribute('begin');
        }, 100);
      }
    } else if (robotArmLeft) {
      // Fallback: tentar encontrar a animação dentro do grupo
      const animateElement = robotArmLeft.querySelector('animateTransform');
      if (animateElement) {
        try {
          animateElement.beginElement();
        } catch (e) {
          animateElement.setAttribute('begin', '0s');
        }
      }
    }
  }

  // Função para ativar animação de levantar os dois braços
  function triggerRaiseBothArmsAnimation() {
    // Garantir que os elementos foram buscados
    if (!raiseBothArmsAnimation || !robotArmLeft || !robotArmRight) {
      initRobotElements();
    }
    
    // Resetar braço esquerdo para posição inicial primeiro (caso tenha alguma animação anterior)
    if (robotArmLeft) {
      const leftRect = robotArmLeft.querySelector('rect');
      if (leftRect) {
        // Forçar reset para posição inicial (eixo na parte superior: y=65)
        leftRect.setAttribute('transform', 'rotate(0 22 65)');
      }
    }
    
    // Resetar braço direito para posição inicial
    if (robotArmRight) {
      const rightRect = robotArmRight.querySelector('rect');
      if (rightRect) {
        rightRect.setAttribute('transform', 'rotate(0 78 65)');
      }
    }
    
    // Pequeno delay para garantir que o reset foi aplicado
    setTimeout(() => {
      // Executar ambas as animações simultaneamente
      // Braço esquerdo
      if (raiseLeftArmAnimation) {
        try {
          raiseLeftArmAnimation.beginElement();
        } catch (e) {
          // Fallback: aplicar transform diretamente (valor positivo para braço esquerdo, eixo na parte superior)
          const leftRect = robotArmLeft?.querySelector('rect');
          if (leftRect) {
            leftRect.setAttribute('transform', 'rotate(130 22 65)');
          }
        }
      } else if (robotArmLeft) {
        const animateElement = robotArmLeft.querySelector('#raiseLeftArmAnimation');
        if (animateElement) {
          try {
            animateElement.beginElement();
          } catch (e) {
            const leftRect = robotArmLeft.querySelector('rect');
            if (leftRect) {
              leftRect.setAttribute('transform', 'rotate(130 22 65)');
            }
          }
        } else {
          // Fallback direto (valor positivo para braço esquerdo, eixo na parte superior)
          const leftRect = robotArmLeft.querySelector('rect');
          if (leftRect) {
            leftRect.setAttribute('transform', 'rotate(130 22 65)');
          }
        }
      }
      
      // Braço direito (simultaneamente)
      if (raiseBothArmsAnimation) {
        try {
          raiseBothArmsAnimation.beginElement();
        } catch (e) {
          // Fallback: aplicar transform diretamente (eixo na parte superior)
          const rightRect = robotArmRight?.querySelector('rect');
          if (rightRect) {
            rightRect.setAttribute('transform', 'rotate(-130 78 65)');
          }
        }
      } else if (robotArmRight) {
        const animateElement = robotArmRight.querySelector('#raiseBothArmsAnimation');
        if (animateElement) {
          try {
            animateElement.beginElement();
          } catch (e) {
            const rightRect = robotArmRight.querySelector('rect');
            if (rightRect) {
              rightRect.setAttribute('transform', 'rotate(-130 78 65)');
            }
          }
        } else {
          // Fallback direto
          const rightRect = robotArmRight.querySelector('rect');
          if (rightRect) {
            rightRect.setAttribute('transform', 'rotate(-130 78 65)');
          }
        }
      }
    }, 10);
  }

  // Função para abaixar o braço esquerdo (mantém o direito levantado)
  function triggerLowerLeftArmAnimation() {
    if (!lowerLeftArmAnimation || !robotArmLeft) {
      initRobotElements();
    }
    
    if (lowerLeftArmAnimation) {
      try {
        lowerLeftArmAnimation.beginElement();
      } catch (e) {
        lowerLeftArmAnimation.setAttribute('begin', '0s');
      }
    } else if (robotArmLeft) {
      const animateElement = robotArmLeft.querySelector('#lowerLeftArmAnimation');
      if (animateElement) {
        try {
          animateElement.beginElement();
        } catch (e) {
          animateElement.setAttribute('begin', '0s');
        }
      }
    }
  }

  // Função para abaixar o braço direito
  function triggerLowerRightArmAnimation() {
    if (!lowerRightArmAnimation || !robotArmRight) {
      initRobotElements();
    }
    
    if (lowerRightArmAnimation) {
      try {
        lowerRightArmAnimation.beginElement();
      } catch (e) {
        lowerRightArmAnimation.setAttribute('begin', '0s');
      }
    } else if (robotArmRight) {
      const animateElement = robotArmRight.querySelector('#lowerRightArmAnimation');
      if (animateElement) {
        try {
          animateElement.beginElement();
        } catch (e) {
          animateElement.setAttribute('begin', '0s');
        }
      }
    }
  }

  // Função para exibir mensagem
  function showMessage(message, duration = 5000, triggerWave = false) {
    if (!message) return;

    currentMessage = message;
    
    // Limpar timeout anterior se existir
    if (speechTimeout) {
      clearTimeout(speechTimeout);
    }

    // Ativar animação de aceno se for a mensagem "Olá"
    if (triggerWave || message === initialMessage) {
      triggerWaveAnimation();
    }
    
    // Ativar animação de levantar os dois braços se for a segunda mensagem
    if (message === secondMessage || message.includes('alto nível do mercado')) {
      triggerRaiseBothArmsAnimation();
    }

    // Atualizar conteúdo
    speechContent.innerHTML = `<span class="speech-text">${message}</span>`;

    // Mostrar balão com animação GSAP se disponível
    if (typeof gsap !== 'undefined') {
      speechBubble.classList.add('active');
      if (speechBubbleWrapper) speechBubbleWrapper.classList.add('active');
      
      gsap.fromTo(speechBubble,
        {
          opacity: 0,
          scale: 0.9,
          y: 20
        },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 0.4,
          ease: 'back.out(1.7)'
        }
      );

      // Animar texto
      gsap.fromTo(speechContent.querySelector('.speech-text'),
        {
          opacity: 0,
          y: 8
        },
        {
          opacity: 1,
          y: 0,
          duration: 0.3,
          delay: 0.2,
          ease: 'power2.out'
        }
      );
    } else {
      // Fallback sem GSAP
      speechBubble.classList.add('active');
      if (speechBubbleWrapper) speechBubbleWrapper.classList.add('active');
    }

    isSpeechVisible = true;

    // Auto-fechar após duração especificada (apenas se não estiver na sequência automática)
    if (duration > 0 && !isSequenceRunning) {
      speechTimeout = setTimeout(() => {
        hideMessage(true); // skipSequence = true para não interferir
      }, duration);
    }
  }

  // Função para esconder mensagem
  function hideMessage(skipSequence = false) {
    if (!isSpeechVisible) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(speechBubble, {
        opacity: 0,
        scale: 0.9,
        y: 20,
        duration: 0.3,
        ease: 'power2.in',
        onComplete: () => {
          speechBubble.classList.remove('active');
          if (speechBubbleWrapper) speechBubbleWrapper.classList.remove('active');
          if (!skipSequence && isSequenceRunning) {
            // Continuar sequência após esconder
            continueSequence();
          }
        }
      });
    } else {
      speechBubble.classList.remove('active');
      if (speechBubbleWrapper) speechBubbleWrapper.classList.remove('active');
      if (!skipSequence && isSequenceRunning) {
        setTimeout(() => continueSequence(), 300);
      }
    }

    isSpeechVisible = false;
    currentMessage = '';

    if (speechTimeout) {
      clearTimeout(speechTimeout);
      speechTimeout = null;
    }
  }

  // Função para continuar a sequência automática
  let sequenceStep = 0;
  function continueSequence() {
    if (!isSequenceRunning) return;

    // Limpar timeout anterior
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
    }

    // Sequência: Olá (curto) → Segunda (menos tempo) → Terceira (fim)
    if (sequenceStep === 0) {
      // Passo 1: Olá (curto - 2.5 segundos) com animação de aceno
      showMessage(initialMessage, 0, true); // triggerWave = true
      sequenceTimeout = setTimeout(() => {
        hideMessage(true); // skipSequence para não chamar continueSequence dentro do hideMessage
        sequenceStep = 1;
        continueSequence(); // Continuar para próxima mensagem
      }, 2500);
    } else if (sequenceStep === 1) {
      // Passo 2: Segunda mensagem (menos tempo - 4 segundos) - dois braços levantados
      showMessage(secondMessage, 0);
      sequenceTimeout = setTimeout(() => {
        hideMessage(true); // skipSequence para não chamar continueSequence dentro do hideMessage
        // Abaixar braço esquerdo, mantendo o direito levantado
        triggerLowerLeftArmAnimation();
        sequenceStep = 2;
        // Continuar para próxima mensagem após um pequeno delay
        setTimeout(() => {
          continueSequence();
        }, 500);
      }, 4000);
    } else if (sequenceStep === 2) {
      // Passo 3: Terceira mensagem (5 segundos) - apenas braço direito levantado
      showMessage(thirdMessage, 0);
      sequenceTimeout = setTimeout(() => {
        hideMessage(true); // skipSequence para não chamar continueSequence dentro do hideMessage
        // Abaixar braço direito (voltar ao normal)
        triggerLowerRightArmAnimation();
        // Aguardar 6.5 segundos e reiniciar a sequência do início
        sequenceTimeout = setTimeout(() => {
          sequenceStep = 0;
          continueSequence();
        }, 6500);
      }, 5000);
    }
  }
  
  // Função para avançar para a próxima mensagem (usado no clique)
  function nextMessage() {
    if (isSequenceRunning) {
      // Se está na sequência, avançar para o próximo passo
      hideMessage(true); // skipSequence para não continuar automaticamente
      sequenceStep++;
      if (sequenceStep > 2) {
        sequenceStep = 0; // Reiniciar do início
        stopSequence();
      }
      // Continuar manualmente
      setTimeout(() => {
        continueSequence();
      }, 300);
    } else {
      // Se não está na sequência, iniciar do passo atual
      isSequenceRunning = true;
      continueSequence();
    }
  }

  // Iniciar sequência automática
  function startSequence() {
    if (isSequenceRunning) return;
    
    isSequenceRunning = true;
    sequenceStep = 0;
    continueSequence();
  }

  // Parar sequência automática
  function stopSequence() {
    isSequenceRunning = false;
    if (sequenceTimeout) {
      clearTimeout(sequenceTimeout);
      sequenceTimeout = null;
    }
  }

  // Função para adicionar mensagem (API pública)
  window.robotSay = function(message, duration = 5000) {
    showMessage(message, duration);
  };

  // Função para esconder mensagem (API pública)
  window.robotHide = function() {
    hideMessage();
  };

  // Event listeners
  if (speechClose) {
    speechClose.addEventListener('click', (e) => {
      e.stopPropagation();
      hideMessage(true); // skipSequence = true para não continuar sequência
      stopSequence();
    });
  }

  // Clicar no robô para abrir o chatbot
  if (robotWrapper) {
    robotWrapper.addEventListener('click', (e) => {
      e.stopPropagation();
      
      // Abrir o chatbot
      if (openChatbot()) {
        return;
      }
      
      // Se não conseguir abrir, aguardar o Chatling carregar
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

  // Animações do robô ao interagir
  if (robotWrapper && typeof gsap !== 'undefined') {
    robotWrapper.addEventListener('mouseenter', () => {
      gsap.to(robotWrapper, {
        scale: 1.1,
        y: -4,
        duration: 0.3,
        ease: 'power2.out'
      });
    });

    robotWrapper.addEventListener('mouseleave', () => {
      gsap.to(robotWrapper, {
        scale: 1,
        y: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
    });
  }

  // Iniciar sequência automática após um delay
  setTimeout(() => {
    if (!isSpeechVisible) {
      startSequence();
    }
  }, 2000);

  // Mostrar mensagem quando o usuário rola a página
  let scrollTimeout = null;
  let hasShownScrollMessage = false;

  window.addEventListener('scroll', () => {
    if (hasShownScrollMessage) return;

    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }

    scrollTimeout = setTimeout(() => {
      if (window.scrollY > 300 && !isSpeechVisible) {
        hasShownScrollMessage = true;
        showMessage('Quem não é visto, não é lembrado', 5000);
      }
    }, 500);
  }, { passive: true });

  // Prevenir que cliques no balão fechem o balão
  if (speechBubble) {
    speechBubble.addEventListener('click', (e) => {
      e.stopPropagation();
    });
  }

  // Fechar ao clicar fora (opcional)
  document.addEventListener('click', (e) => {
    if (isSpeechVisible && 
        !robotContainer.contains(e.target) &&
        !speechBubble.contains(e.target)) {
      // Não fechar automaticamente - deixar o usuário controlar
      // Mas se fechar manualmente, parar sequência
      // hideMessage(true);
      // stopSequence();
    }
  });

  console.log('🤖 Robô animado inicializado! Use robotSay("mensagem") para fazer o robô falar.');
})();

