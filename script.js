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
  if (window.Chatling) {
    window.Chatling.open();
  } else {
    console.error('Chatling object not found. Make sure the embed script is loaded.');
    alert('O chatbot não está disponível no momento. Tente novamente mais tarde.');
  }
}



// Eventos para todos os botões "Solicitar demonstração"
document.addEventListener('DOMContentLoaded', function() {
  // Função auxiliar para aguardar o Chatling carregar
  function waitForChatling(callback, maxAttempts = 50) {
    let attempts = 0;
    const checkInterval = setInterval(() => {
      attempts++;
      if (window.Chatling) {
        clearInterval(checkInterval);
        callback();
      } else if (attempts >= maxAttempts) {
        clearInterval(checkInterval);
        console.warn('Chatling não carregou após várias tentativas');
        alert('O chatbot não está disponível no momento. Tente novamente mais tarde.');
      }
    }, 100);
  }

  // Adicionar eventos a todos os links "Solicitar demonstração"
  const solicitarLinks = document.querySelectorAll('a.cta, a[href="#solicitar"], a[href="produto.html"]');
  solicitarLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      waitForChatling(() => {
        if (window.Chatling) {
          window.Chatling.open();
        } else {
          console.error('Chatling object not found. Make sure the embed script is loaded.');
          alert('O chatbot não está disponível no momento. Tente novamente mais tarde.');
        }
      });
    });
  });

});