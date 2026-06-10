const header = document.getElementById('siteHeader');
const menuButton = document.getElementById('menuButton');
const mobileNav = document.getElementById('mobileNav');
const contactForm = document.getElementById('contactForm');
const needsFieldset = document.getElementById('needsFieldset');
let isSubmitting = false;

window.addEventListener('pageshow', () => {
  const payloadInput = document.getElementById('structured_payload');
  if (payloadInput) {
    payloadInput.value = '';
  }

  const submitBtn = document.getElementById('submitBtn');
  if (submitBtn) {
    submitBtn.classList.remove('is-submitting');
    submitBtn.removeAttribute('aria-disabled');
    submitBtn.style.pointerEvents = '';
    submitBtn.textContent = 'この内容で相談する';
  }

  isSubmitting = false;
});

window.addEventListener('scroll', () => {
  if (header) {
    header.classList.toggle('scrolled', window.scrollY > 12);
  }
});

if (menuButton && mobileNav) {
  menuButton.addEventListener('click', () => {
    const open = mobileNav.classList.toggle('open');
    menuButton.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      mobileNav.classList.remove('open');
      menuButton.classList.remove('open');
      menuButton.setAttribute('aria-expanded', 'false');
    });
  });
}

function getTextValue(element) {
  return element && typeof element.value === 'string' ? element.value.trim() : '';
}

function scrollToError(element) {
  if (!element || typeof element.scrollIntoView !== 'function') return;

  if (typeof element.focus === 'function') {
    try {
      element.focus({ preventScroll: true });
    } catch (_) {
      // Older browsers may not support focus options.
    }
  }

  element.scrollIntoView({ behavior: 'auto', block: 'center' });
}

if (contactForm) {
  const needNewSiteInitial = document.getElementById('need_new_site');
  const needRenewalInitial = document.getElementById('need_renewal');

  [needNewSiteInitial, needRenewalInitial].forEach(input => {
    if (input) {
      input.addEventListener('change', () => {
        if (needsFieldset) {
          needsFieldset.classList.remove('has-error');
        }
      });
    }
  });

  contactForm.addEventListener('submit', function(e) {
    if (isSubmitting) {
      e.preventDefault();
      return;
    }

    const needNewSite = document.getElementById('need_new_site');
    const needRenewal = document.getElementById('need_renewal');
    const locationSelect = document.getElementById('location');
    const privacyCheck = document.getElementById('privacy_agreement');
    const submitBtn = document.getElementById('submitBtn');

    const shopNameInput = document.getElementById('shop_name');
    const clientNameInput = document.getElementById('client_name');
    const clientEmailInput = document.getElementById('client_email');
    const businessTypeSelect = document.getElementById('business_type');
    const currentStatusSelect = document.getElementById('current_status');
    const currentUrlInput = document.getElementById('current_url');
    const cityInput = document.getElementById('city');
    const messageInput = document.getElementById('message');
    const honeypotInput = this.querySelector('input[name="_gotcha"]');

    const hasNeedNewSite = needNewSite ? Boolean(needNewSite.checked) : false;
    const hasNeedRenewal = needRenewal ? Boolean(needRenewal.checked) : false;
    const hasPrivacyAgreement = privacyCheck ? Boolean(privacyCheck.checked) : false;

    const errorMessages = [];
    let firstErrorElement = null;

    if (honeypotInput && honeypotInput.value) {
      e.preventDefault();
      return;
    }

    if (!hasNeedNewSite && !hasNeedRenewal) {
      errorMessages.push('「相談したいこと」は少なくとも1つ以上選択してください。');
      firstErrorElement = needsFieldset || needNewSite || needRenewal || null;
      if (needsFieldset) {
        needsFieldset.classList.add('has-error');
      }
    }

    if (!locationSelect || !getTextValue(locationSelect)) {
      errorMessages.push('都道府県を選択してください。');
      if (!firstErrorElement) firstErrorElement = locationSelect;
    }

    if (!hasPrivacyAgreement) {
      errorMessages.push('サービス案内およびプライバシーポリシーへの同意が必要です。');
      if (!firstErrorElement) firstErrorElement = privacyCheck;
    }

    const requiredInputs = this.querySelectorAll('[required]');
    requiredInputs.forEach(input => {
      if (!input) return;

      const tagName = input.tagName;
      const type = input.type;

      if (type === 'checkbox' || type === 'radio') {
        return;
      }

      if ((type === 'text' || type === 'email' || tagName === 'TEXTAREA' || tagName === 'SELECT') && !getTextValue(input)) {
        const label = this.querySelector(`label[for="${input.id}"]`);
        const labelText = label ? label.textContent.replace('必須', '').trim() : '必須項目';
        errorMessages.push('「' + labelText + '」を入力してください。');
        if (!firstErrorElement) firstErrorElement = input;
      }
    });

    if (errorMessages.length > 0) {
      e.preventDefault();
      const uniqueErrors = errorMessages.filter((value, index, array) => array.indexOf(value) === index);
      alert(uniqueErrors.join('\n'));
      scrollToError(firstErrorElement);
      return;
    }

    const selectedNeeds = [];
    if (hasNeedNewSite && needNewSite) selectedNeeds.push(needNewSite.value);
    if (hasNeedRenewal && needRenewal) selectedNeeds.push(needRenewal.value);

    const payload = {
      source: 'rixelia_official_site',
      intent: 'subscription_web_consultation',
      preferred_plan: 'monthly_subscription_only',
      shop_name: getTextValue(shopNameInput),
      client_name: getTextValue(clientNameInput),
      client_email: getTextValue(clientEmailInput),
      business_type: getTextValue(businessTypeSelect),
      current_status: getTextValue(currentStatusSelect),
      current_url: getTextValue(currentUrlInput),
      location: getTextValue(locationSelect),
      city: getTextValue(cityInput),
      full_location: `${getTextValue(locationSelect)}${getTextValue(cityInput)}`,
      message: getTextValue(messageInput),
      privacy_agreement: hasPrivacyAgreement,
      needs_summary: {
        need_new_site: hasNeedNewSite,
        need_renewal: hasNeedRenewal
      },
      need_new_site: hasNeedNewSite,
      need_renewal: hasNeedRenewal,
      needs_array: selectedNeeds,
      needs: selectedNeeds
    };

    const payloadInput = document.getElementById('structured_payload');
    if (payloadInput) {
      payloadInput.value = JSON.stringify(payload);
    }

    isSubmitting = true;

    if (submitBtn) {
      submitBtn.classList.add('is-submitting');
      submitBtn.setAttribute('aria-disabled', 'true');
      submitBtn.textContent = '送信中...';
      submitBtn.style.pointerEvents = 'none';
    }
  });
}
