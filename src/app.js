const revealItems = [...document.querySelectorAll('.reveal')];
document.querySelectorAll('[data-write]').forEach(item => {
  const text = item.dataset.write || item.textContent;
  item.setAttribute('aria-label', text);
  item.textContent = '';

  let characterIndex = 0;
  const tokens = text.split(/(\s+)/);
  tokens.forEach(token => {
    if (!token) return;
    if (token.includes('\n')) {
      item.appendChild(document.createElement('br'));
      return;
    }
    if (/^\s+$/.test(token)) {
      item.append(' ');
      return;
    }

    const wordSpan = document.createElement('span');
    wordSpan.className = 'write-word';

    [...token].forEach(character => {
      const span = document.createElement('span');
      span.className = 'write-char';
      span.style.setProperty('--char-index', characterIndex);
      span.textContent = character;
      wordSpan.appendChild(span);
      characterIndex += 1;
    });

    item.appendChild(wordSpan);
  });
});

const nav = document.querySelector('.nav');
const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
const mobileMenu = document.querySelector('.mobile-menu');
const mobileMenuLinks = [...document.querySelectorAll('.mobile-menu a')];
const mobileStoryQuery = window.matchMedia('(max-width: 620px)');
const isAndroidMobile = document.documentElement.classList.contains('android-mobile');
const updateNavState = () => {
  if (!nav) return;
  nav.classList.toggle('is-scrolled', window.scrollY > 90);
};
updateNavState();
window.addEventListener('scroll', updateNavState, { passive: true });

const setMobileMenuOpen = isOpen => {
  document.body.classList.toggle('mobile-menu-open', isOpen);
  mobileMenuToggle?.setAttribute('aria-expanded', String(isOpen));
  mobileMenu?.setAttribute('aria-hidden', String(!isOpen));
};

mobileMenuToggle?.addEventListener('click', () => {
  setMobileMenuOpen(!document.body.classList.contains('mobile-menu-open'));
});

mobileMenuLinks.forEach(link => {
  link.addEventListener('click', () => setMobileMenuOpen(false));
});

const scrollToAnchor = target => {
  if (!target) return;
  const navHeight = nav?.getBoundingClientRect().height || 0;
  const offset = Math.ceil(navHeight + (mobileStoryQuery.matches ? 28 : 22));
  const top = target.getBoundingClientRect().top + window.scrollY - offset;
  window.scrollTo({ top, behavior: 'smooth' });
};

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const hash = link.getAttribute('href');
    if (!hash || hash === '#') return;
    const target = document.querySelector(hash);
    if (!target) return;
    event.preventDefault();
    setMobileMenuOpen(false);
    history.pushState(null, '', hash);
    scrollToAnchor(target);
  });
});

if (window.location.hash) {
  const correctInitialAnchor = () => scrollToAnchor(document.querySelector(window.location.hash));
  window.addEventListener('load', correctInitialAnchor, { once: true });
  requestAnimationFrame(correctInitialAnchor);
  window.setTimeout(correctInitialAnchor, 450);
}

const hero = document.querySelector('.hero');
let heroFrame = null;
let mobileHeroTextStarted = false;

const completeMobileHeroText = () => {
  if (!mobileStoryQuery.matches) return;
  if (mobileHeroTextStarted) return;
  mobileHeroTextStarted = true;
  document.querySelectorAll('.write-on').forEach(item => {
    item.classList.remove('is-write-complete');
    item.querySelectorAll('.write-char').forEach(char => {
      char.style.animation = 'none';
    });
    void item.offsetWidth;
    item.querySelectorAll('.write-char').forEach(char => {
      char.style.animation = '';
    });
    window.setTimeout(() => item.classList.add('is-write-complete'), 3400);
  });
};

window.addEventListener('load', completeMobileHeroText);
window.addEventListener('pageshow', completeMobileHeroText);
mobileStoryQuery.addEventListener?.('change', event => {
  if (event.matches) {
    mobileHeroTextStarted = false;
    completeMobileHeroText();
  }
});
completeMobileHeroText();

const resetRestoredMobileHeroScroll = () => {
  if (!hero || !mobileStoryQuery.matches || window.location.hash) return;
  const heroBottom = hero.offsetTop + hero.offsetHeight;
  if (window.scrollY > 0 && window.scrollY < heroBottom) {
    window.scrollTo(0, 0);
    updateNavState();
  }
};

window.addEventListener('pageshow', () => {
  resetRestoredMobileHeroScroll();
  requestAnimationFrame(resetRestoredMobileHeroScroll);
});
resetRestoredMobileHeroScroll();

const updateHeroMotion = () => {
  if (!hero) return;

  const rect = hero.getBoundingClientRect();
  const progress = Math.min(1, Math.max(0, -rect.top / Math.max(1, rect.height)));
  const y = progress * 150;
  const x = (progress - 0.5) * 22;
  const scale = 1.04 + progress * 0.04;
  const androidImageY = progress * 82;
  const androidImageX = (progress - 0.5) * 12;
  const androidImageScale = 1.025 + progress * 0.025;
  const mobileHeroLock = mobileStoryQuery.matches
    ? Math.round(Math.max(0, -rect.top))
    : 0;
  hero.style.setProperty('--hero-image-x', `${isAndroidMobile ? androidImageX : x}px`);
  hero.style.setProperty('--hero-image-y', `${isAndroidMobile ? androidImageY : y}px`);
  hero.style.setProperty('--hero-image-scale', (isAndroidMobile ? androidImageScale : scale).toFixed(3));
  hero.style.setProperty('--hero-content-y', `${mobileHeroLock}px`);
};

const scheduleHeroMotion = () => {
  if (heroFrame) return;
  heroFrame = requestAnimationFrame(() => {
    heroFrame = null;
    updateHeroMotion();
  });
};

updateHeroMotion();
window.addEventListener('scroll', scheduleHeroMotion, { passive: true });
window.addEventListener('resize', updateHeroMotion);

const observer = new IntersectionObserver(
  entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('is-visible');
    });
  },
  { rootMargin: '0px 0px -2% 0px', threshold: 0.04 }
);

revealItems.forEach(item => observer.observe(item));
if (!mobileStoryQuery.matches) {
  setTimeout(() => revealItems.forEach(item => item.classList.add('is-visible')), 650);
}

document.querySelectorAll('details').forEach(item => {
  item.addEventListener('toggle', () => {
    if (item.open) {
      document.querySelectorAll('details').forEach(other => {
        if (other !== item) other.open = false;
      });
    }
  });
});

const fee = document.querySelector('#fee');
const output = document.querySelector('#fee-output');
if (fee && output) {
  fee.addEventListener('input', () => {
    output.textContent = `$${Number(fee.value).toLocaleString()}`;
  });
}

document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('pointermove', event => {
    const rect = card.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    card.style.setProperty('--tilt', `${x * 10}deg`);
  });
});

const stripTrack = document.querySelector('.strip-track');
if (stripTrack && !stripTrack.dataset.cloned) {
  stripTrack.dataset.cloned = 'true';
  const originalItems = [...stripTrack.children];
  originalItems.forEach(child => stripTrack.appendChild(child.cloneNode(true)));

  const updateStripLoopDistance = () => {
    const firstClone = stripTrack.children[originalItems.length];
    if (!firstClone) return;
    stripTrack.style.setProperty('--strip-loop-distance', `${Math.round(firstClone.offsetLeft)}px`);
  };

  updateStripLoopDistance();
  window.addEventListener('load', updateStripLoopDistance);
  window.addEventListener('resize', updateStripLoopDistance);
}

const storyPanels = [...document.querySelectorAll('[data-story]')];
const storyImages = [...document.querySelectorAll('[data-story-image]')];
const storyFloats = [...document.querySelectorAll('[data-story-float]')];
const storySection = document.querySelector('.story-scroll');

const setStoryState = index => {
  storyImages.forEach(image => image.classList.toggle('is-active', image.dataset.storyImage === String(index)));
  storyFloats.forEach(float => float.classList.toggle('is-active', float.dataset.storyFloat === String(index)));
};

if (storySection && storyPanels.length && storyImages.length) {
  const resetMobileStory = () => {
    storyPanels.forEach(panel => {
      panel.style.removeProperty('--story-y');
      panel.style.removeProperty('--story-opacity');
      panel.style.removeProperty('--story-scale');
      panel.style.opacity = '';
      panel.style.transform = '';
      panel.classList.add('is-current');
    });
    storySection.style.removeProperty('--story-progress');
    storySection.style.removeProperty('--story-stage');
  };

  const updateStoryFromScroll = () => {
    if (mobileStoryQuery.matches) {
      resetMobileStory();
      return;
    }

    const rect = storySection.getBoundingClientRect();
    const scrollable = Math.max(1, rect.height - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / scrollable));
    const stage = progress * (storyPanels.length - 1);
    const activeIndex = Math.min(storyPanels.length - 1, Math.max(0, Math.round(stage)));

    storyPanels.forEach((panel, index) => {
      const distance = index - stage;
      const y = distance * 100;
      const opacity = Math.max(0, 1 - Math.abs(distance) * 1.25);
      const scale = 1 - Math.min(0.045, Math.abs(distance) * 0.025);
      const compactStage = window.matchMedia('(max-width: 920px)').matches;
      const transform = compactStage
        ? `translate3d(0, ${y}vh, 0) scale(${scale.toFixed(3)})`
        : `translate3d(0, calc(-50% + ${y}vh), 0) scale(${scale.toFixed(3)})`;

      panel.style.setProperty('--story-y', `${y}vh`);
      panel.style.setProperty('--story-opacity', opacity.toFixed(3));
      panel.style.setProperty('--story-scale', scale.toFixed(3));
      panel.style.opacity = opacity.toFixed(3);
      panel.style.transform = transform;
      panel.classList.toggle('is-current', index === activeIndex);
    });

    storySection.style.setProperty('--story-progress', progress.toFixed(4));
    storySection.style.setProperty('--story-stage', stage.toFixed(4));
    setStoryState(activeIndex);
  };

  window.addEventListener('scroll', updateStoryFromScroll, { passive: true });
  window.addEventListener('resize', updateStoryFromScroll);
  mobileStoryQuery.addEventListener?.('change', updateStoryFromScroll);
  updateStoryFromScroll();
}

const proofSection = document.querySelector('.field-proof');
const proofQuotes = [...document.querySelectorAll('[data-proof]')];
const proofThumbs = [...document.querySelectorAll('[data-proof-thumb]')];
const proofImages = [...document.querySelectorAll('[data-proof-image]')];

const setProofState = index => {
  proofQuotes.forEach(quote => quote.classList.toggle('is-active', quote.dataset.proof === String(index)));
  proofThumbs.forEach(thumb => thumb.classList.toggle('is-active', thumb.dataset.proofThumb === String(index)));
  proofImages.forEach(image => image.classList.toggle('is-active', image.dataset.proofImage === String(index)));
};

if (proofSection && proofQuotes.length) {
  const updateProofFromScroll = () => {
    const viewportCenter = window.innerHeight * 0.52;
    let activeIndex = 0;
    let smallestDistance = Infinity;

    proofQuotes.forEach((quote, index) => {
      const rect = quote.getBoundingClientRect();
      const quoteCenter = rect.top + rect.height * 0.5;
      const distance = Math.abs(quoteCenter - viewportCenter);

      if (distance < smallestDistance) {
        smallestDistance = distance;
        activeIndex = index;
      }
    });

    setProofState(activeIndex);
  };

  window.addEventListener('scroll', updateProofFromScroll, { passive: true });
  window.addEventListener('resize', updateProofFromScroll);
  proofThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      const quote = proofQuotes[Number(thumb.dataset.proofThumb)];
      quote?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  });
  updateProofFromScroll();
}

const facilitatorCover = document.querySelector('.facilitator-cover');
const bioToggle = document.querySelector('.bio-toggle');
const bioCollapse = document.querySelector('.bio-collapse');
const bioPanel = document.querySelector('#bedge-bio');

const setBioOpen = isOpen => {
  facilitatorCover?.classList.toggle('is-open', isOpen);
  bioToggle?.setAttribute('aria-expanded', String(isOpen));
  bioToggle?.setAttribute('aria-label', 'Read full bio');
};

if (facilitatorCover && bioToggle && bioPanel) {
  bioToggle.addEventListener('pointerdown', event => event.preventDefault());
  bioToggle.addEventListener('click', event => {
    event.preventDefault();
    const scrollTop = window.scrollY;
    setBioOpen(true);
    bioToggle.blur();
    requestAnimationFrame(() => window.scrollTo(0, scrollTop));
    window.setTimeout(() => window.scrollTo(0, scrollTop), 80);
    window.setTimeout(() => window.scrollTo(0, scrollTop), 220);
  });
  bioCollapse?.addEventListener('pointerdown', event => event.preventDefault());
  bioCollapse?.addEventListener('click', event => {
    event.preventDefault();
    const scrollTop = window.scrollY;
    setBioOpen(false);
    bioCollapse.blur();
    requestAnimationFrame(() => window.scrollTo(0, scrollTop));
    window.setTimeout(() => window.scrollTo(0, scrollTop), 80);
    window.setTimeout(() => window.scrollTo(0, scrollTop), 220);
  });
}
