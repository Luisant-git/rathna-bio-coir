/* ==========================================================================
   Language Switcher — searchable language selector backed by Google Translate
   ========================================================================== */
(function () {
    'use strict';

    var DEFAULT_CODE = 'en';
    var STORE_KEY = 'rathna:language';
    var COOKIE_NAME = 'googtrans';
    var COOKIE_DAYS = 365;

    var LANGUAGES = [
        { code: 'en', name: 'English', native: 'English' },
        { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
        { code: 'ta', name: 'Tamil', native: 'தமிழ்' },
        { code: 'te', name: 'Telugu', native: 'తెలుగు' },
        { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ' },
        { code: 'ml', name: 'Malayalam', native: 'മലയാളം' },
        { code: 'mr', name: 'Marathi', native: 'मराठी' },
        { code: 'gu', name: 'Gujarati', native: 'ગુજરાતી' },
        { code: 'bn', name: 'Bengali', native: 'বাংলা' },
        { code: 'pa', name: 'Punjabi', native: 'ਪੰਜਾਬੀ' },
        { code: 'ur', name: 'Urdu', native: 'اردو' },
        { code: 'ar', name: 'Arabic', native: 'العربية' },
        { code: 'zh-CN', name: 'Chinese (Simplified)', native: '简体中文' },
        { code: 'ja', name: 'Japanese', native: '日本語' },
        { code: 'ko', name: 'Korean', native: '한국어' },
        { code: 'fr', name: 'French', native: 'Français' },
        { code: 'de', name: 'German', native: 'Deutsch' },
        { code: 'es', name: 'Spanish', native: 'Español' },
        { code: 'pt', name: 'Portuguese', native: 'Português' },
        { code: 'it', name: 'Italian', native: 'Italiano' },
        { code: 'nl', name: 'Dutch', native: 'Nederlands' },
        { code: 'ru', name: 'Russian', native: 'Русский' },
        { code: 'tr', name: 'Turkish', native: 'Türkçe' },
        { code: 'vi', name: 'Vietnamese', native: 'Tiếng Việt' },
        { code: 'th', name: 'Thai', native: 'ไทย' },
        { code: 'id', name: 'Indonesian', native: 'Bahasa Indonesia' },
        { code: 'pl', name: 'Polish', native: 'Polski' },
        { code: 'sw', name: 'Swahili', native: 'Kiswahili' },
        { code: 'af', name: 'Afrikaans', native: 'Afrikaans' }
    ];

    var ICONS = {
        globe: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="9"></circle><path d="M3 12h18"></path><path d="M12 3c2.6 2.6 3.9 5.6 3.9 9S14.6 18.4 12 21c-2.6-2.6-3.9-5.6-3.9-9S9.4 5.6 12 3z"></path></svg>',
        chevron: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"></path></svg>',
        search: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"></circle><path d="m20.5 20.5-3.6-3.6"></path></svg>',
        check: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="m5 12.5 4.4 4.4L19 7.5"></path></svg>',
        close: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"></path></svg>',
        empty: '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="7"></circle><path d="m20.5 20.5-3.6-3.6"></path><path d="M8.5 11h5"></path></svg>'
    };

    var instances = [];
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;

    /* ---------------------------------------------------------------------- */
    /* Helpers                                                                */
    /* ---------------------------------------------------------------------- */
    function findLanguage(code) {
        if (!code) return null;
        var wanted = String(code).toLowerCase();
        for (var i = 0; i < LANGUAGES.length; i++) {
            if (LANGUAGES[i].code.toLowerCase() === wanted) return LANGUAGES[i];
        }
        var base = wanted.split('-')[0];
        for (var j = 0; j < LANGUAGES.length; j++) {
            if (LANGUAGES[j].code.toLowerCase().split('-')[0] === base) return LANGUAGES[j];
        }
        return null;
    }

    function normalizeCode(code) {
        var lang = findLanguage(code);
        return lang ? lang.code : DEFAULT_CODE;
    }

    function shortName(lang) {
        return lang ? String(lang.name).split(' (')[0] : 'English';
    }

    function badgeText(lang) {
        return lang ? lang.code.split('-')[0].toUpperCase() : 'EN';
    }

    function escapeHtml(value) {
        return String(value).replace(/[&<>"']/g, function (character) {
            return {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#39;'
            }[character];
        });
    }

    function normalizeSearch(value) {
        var text = String(value || '').toLowerCase();
        if (text.normalize) {
            text = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        }
        return text.replace(/\s+/g, ' ').trim();
    }

    function getCookie(name) {
        var pairs = document.cookie ? document.cookie.split('; ') : [];
        for (var i = 0; i < pairs.length; i++) {
            var separator = pairs[i].indexOf('=');
            var key = separator > -1 ? pairs[i].slice(0, separator) : pairs[i];
            if (key === name) {
                return decodeURIComponent(pairs[i].slice(separator + 1));
            }
        }
        return '';
    }

    function setCookie(value) {
        var cookie = COOKIE_NAME + '=' + value + '; path=/; SameSite=Lax;';

        if (value) {
            var expires = new Date();
            expires.setTime(expires.getTime() + COOKIE_DAYS * 24 * 60 * 60 * 1000);
            cookie += ' expires=' + expires.toUTCString();
        } else {
            cookie += ' expires=Thu, 01 Jan 1970 00:00:00 GMT';
        }

        document.cookie = cookie;

        /* Clean any copy scoped to the current host name */
        if (!value) {
            var host = window.location.hostname;
            if (host) {
                document.cookie = COOKIE_NAME + '=; path=/; domain=' + host +
                    '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
                document.cookie = COOKIE_NAME + '=; path=/; domain=.' + host +
                    '; expires=Thu, 01 Jan 1970 00:00:00 GMT';
            }
        }
    }

    function getSavedLanguage() {
        var stored = '';
        try {
            stored = window.localStorage.getItem(STORE_KEY) || '';
        } catch (error) {
            stored = '';
        }
        if (findLanguage(stored)) return normalizeCode(stored);

        var cookie = getCookie(COOKIE_NAME);
        if (cookie) {
            var parts = cookie.split('/');
            var cookieCode = parts[parts.length - 1];
            if (findLanguage(cookieCode)) return normalizeCode(cookieCode);
        }
        return DEFAULT_CODE;
    }

    function saveLanguage(code) {
        try {
            window.localStorage.setItem(STORE_KEY, code);
        } catch (error) {
            /* Storage can be unavailable (private mode / blocked cookies) */
        }
        if (code === DEFAULT_CODE) {
            setCookie('');
        } else {
            setCookie('/en/' + code);
        }
    }

    /* ---------------------------------------------------------------------- */
    /* Google Translate bridge                                                */
    /* ---------------------------------------------------------------------- */
    function isTranslated(code) {
        var current = (document.documentElement.getAttribute('lang') || '').toLowerCase();
        return current === String(code).toLowerCase();
    }

    function pushToTranslate(code, force) {
        var combo = document.querySelector('.goog-te-combo');
        if (!combo) return false;

        var value = code === DEFAULT_CODE ? '' : code;
        if (!force && combo.value === value) return true;

        combo.value = value;
        combo.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
    }

    /*
     * The Google widget initialises asynchronously and resets its own select
     * while booting, so keep nudging it until the document really is in the
     * requested language.
     */
    function ensureLanguage(code) {
        var attempts = 0;
        var maxAttempts = 30;

        pushToTranslate(code);

        if (isTranslated(code)) return;

        var timer = window.setInterval(function () {
            attempts += 1;

            if (isTranslated(code)) {
                window.clearInterval(timer);
                return;
            }

            pushToTranslate(code, attempts > 3 && attempts % 3 === 0);

            if (attempts >= maxAttempts) {
                window.clearInterval(timer);
            }
        }, 300);
    }

    function applyLanguage(code) {
        var lang = normalizeCode(code);
        saveLanguage(lang);
        syncInstances(lang);

        if (lang !== DEFAULT_CODE) {
            ensureLanguage(lang);
            return;
        }

        /* Back to the original language: the widget cannot always undo a
           translation on its own, so gracefully revert and fall back to a
           reload (with the cookie already cleared) when needed. */
        pushToTranslate(DEFAULT_CODE);

        if (isTranslated(DEFAULT_CODE)) return;

        window.setTimeout(function () {
            if (!isTranslated(DEFAULT_CODE)) {
                window.location.reload();
            }
        }, 900);
    }

    function reapplySavedLanguage() {
        var saved = getSavedLanguage();
        if (saved === DEFAULT_CODE) return;
        ensureLanguage(saved);
    }

    /* ---------------------------------------------------------------------- */
    /* Rendering                                                              */
    /* ---------------------------------------------------------------------- */
    function buildInstance(root) {
        var options = LANGUAGES.map(function (lang) {
            return '<li class="lang-option" role="option" tabindex="-1" aria-selected="false"' +
                ' data-code="' + escapeHtml(lang.code) + '"' +
                ' data-search="' + escapeHtml(normalizeSearch(lang.name + ' ' + lang.native + ' ' + lang.code)) + '">' +
                '<div class="lang-option__badge">' + escapeHtml(badgeText(lang)) + '</div>' +
                '<div class="lang-option__text">' +
                '<div class="lang-option__name">' + escapeHtml(lang.name) + '</div>' +
                '<div class="lang-option__native">' + escapeHtml(lang.native) + '</div>' +
                '</div>' +
                '<div class="lang-option__check">' + ICONS.check + '</div>' +
                '</li>';
        }).join('');

        root.classList.add('lang-switcher');
        root.classList.add('notranslate');
        root.setAttribute('translate', 'no');
        root.innerHTML =
            '<button type="button" class="lang-toggle" aria-haspopup="listbox" aria-expanded="false">' +
            '<span class="lang-toggle__icon">' + ICONS.globe + '</span>' +
            '<span class="lang-toggle__label">English</span>' +
            '<span class="lang-toggle__code">EN</span>' +
            '<span class="lang-toggle__chevron">' + ICONS.chevron + '</span>' +
            '</button>' +
            '<div class="lang-panel" role="dialog" aria-label="Select language">' +
            '<div class="lang-panel__head">' +
            '<div class="lang-search">' +
            '<span class="lang-search__icon">' + ICONS.search + '</span>' +
            '<input type="text" class="lang-search__input" placeholder="Search language..."' +
            ' aria-label="Search language" autocomplete="off" spellcheck="false">' +
            '<button type="button" class="lang-search__clear" aria-label="Clear search" tabindex="-1">' +
            ICONS.close +
            '</button>' +
            '</div>' +
            '</div>' +
            '<ul class="lang-list" role="listbox" aria-label="Languages">' + options + '</ul>' +
            '<div class="lang-empty">' + ICONS.empty + 'No language found.<br>Try a different search.</div>' +
            '<div class="lang-panel__foot"><div class="lang-panel__foot-icon">' + ICONS.globe + '</div>Powered by Google Translate</div>' +
            '</div>';

        var instance = {
            root: root,
            toggle: root.querySelector('.lang-toggle'),
            label: root.querySelector('.lang-toggle__label'),
            code: root.querySelector('.lang-toggle__code'),
            input: root.querySelector('.lang-search__input'),
            clear: root.querySelector('.lang-search__clear'),
            list: root.querySelector('.lang-list'),
            options: Array.prototype.slice.call(root.querySelectorAll('.lang-option'))
        };

        bindInstance(instance);
        instances.push(instance);
    }

    function bindInstance(instance) {
        var root = instance.root;

        instance.toggle.addEventListener('click', function (event) {
            event.preventDefault();
            event.stopPropagation();
            if (root.classList.contains('is-open')) {
                closeInstance(instance);
            } else {
                openInstance(instance);
            }
        });

        instance.input.addEventListener('input', function () {
            filterOptions(instance, instance.input.value);
        });

        instance.clear.addEventListener('click', function (event) {
            event.preventDefault();
            instance.input.value = '';
            filterOptions(instance, '');
            instance.input.focus();
        });

        instance.list.addEventListener('click', function (event) {
            var option = event.target.closest('.lang-option');
            if (!option) return;
            chooseLanguage(instance, option.getAttribute('data-code'));
        });

        root.addEventListener('keydown', function (event) {
            if (event.key === 'Escape') {
                event.preventDefault();
                closeInstance(instance, true);
                return;
            }

            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                var visible = getVisibleOptions(instance);
                if (!visible.length) return;

                event.preventDefault();
                var current = visible.indexOf(document.activeElement);
                var step = event.key === 'ArrowDown' ? 1 : -1;
                var next;

                if (current === -1) {
                    next = step === 1 ? 0 : visible.length - 1;
                } else {
                    next = (current + step + visible.length) % visible.length;
                }
                visible[next].focus();
                return;
            }

            if (event.key === 'Enter' && document.activeElement &&
                document.activeElement.classList.contains('lang-option')) {
                event.preventDefault();
                chooseLanguage(instance, document.activeElement.getAttribute('data-code'));
            }
        });

        document.addEventListener('click', function (event) {
            if (!root.classList.contains('is-open')) return;
            if (root.contains(event.target)) return;
            closeInstance(instance);
        });

        window.addEventListener('resize', function () {
            closeInstance(instance);
        });

        document.addEventListener('keydown', function (event) {
            if (event.key === 'Escape' && root.classList.contains('is-open')) {
                closeInstance(instance, true);
            }
        });
    }

    function getVisibleOptions(instance) {
        return instance.options.filter(function (option) {
            return !option.hidden;
        });
    }

    function openInstance(instance) {
        instances.forEach(function (other) {
            if (other !== instance) closeInstance(other);
        });

        instance.root.classList.add('is-open');
        instance.toggle.setAttribute('aria-expanded', 'true');
        instance.input.value = '';
        filterOptions(instance, '');

        var active = instance.root.querySelector('.lang-option[aria-selected="true"]');
        if (active) {
            active.scrollIntoView({ block: 'nearest' });
        }

        if (!isTouch) {
            window.setTimeout(function () {
                instance.input.focus();
            }, 60);
        }
    }

    function closeInstance(instance, focusToggle) {
        if (!instance.root.classList.contains('is-open')) return;

        instance.root.classList.remove('is-open');
        instance.toggle.setAttribute('aria-expanded', 'false');

        if (focusToggle) {
            instance.toggle.focus();
        }
    }

    function filterOptions(instance, query) {
        var term = normalizeSearch(query);
        var visibleCount = 0;

        instance.options.forEach(function (option) {
            var haystack = option.getAttribute('data-search') || '';
            var matches = !term || haystack.indexOf(term) !== -1;
            option.hidden = !matches;
            if (matches) visibleCount += 1;
        });

        instance.root.classList.toggle('has-query', term.length > 0);
        instance.root.classList.toggle('has-no-results', visibleCount === 0);
    }

    function chooseLanguage(instance, code) {
        applyLanguage(code);
        closeInstance(instance, true);
    }

    function syncInstances(code) {
        var lang = findLanguage(code) || findLanguage(DEFAULT_CODE);
        var label = shortName(lang);

        instances.forEach(function (instance) {
            instance.label.textContent = label;
            if (instance.code) {
                instance.code.textContent = badgeText(lang);
            }
            instance.options.forEach(function (option) {
                var selected = option.getAttribute('data-code') === lang.code;
                option.setAttribute('aria-selected', selected ? 'true' : 'false');
            });
        });
    }

    /* ---------------------------------------------------------------------- */
    /* Boot                                                                   */
    /* ---------------------------------------------------------------------- */
    function init() {
        var nodes = document.querySelectorAll('[data-lang-switcher]');
        if (!nodes.length) return;

        Array.prototype.forEach.call(nodes, function (node) {
            if (node.getAttribute('data-lang-ready') === 'true') return;
            node.setAttribute('data-lang-ready', 'true');
            buildInstance(node);
        });

        syncInstances(getSavedLanguage());
        reapplySavedLanguage();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
