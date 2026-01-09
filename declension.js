/**
 * Библиотека склонения слов для русского и казахского языков
 * @version 1.0.0
 */

(function(window) {
  'use strict';

  // Основной объект библиотеки
  const Declension = {
    // Хранилище языковых модулей
    languages: {},

    /**
     * Регистрация языкового модуля
     * @param {string} code - код языка (ru, kz)
     * @param {object} module - модуль с функциями склонения
     */
    registerLanguage(code, module) {
      this.languages[code] = module;
    },

    /**
     * Склонение одного слова
     * @param {string} word - слово для склонения
     * @param {string} lang - код языка
     * @param {string} caseType - тип падежа
     * @returns {string} - склоненное слово
     */
    inflectWord(word, lang, caseType) {
      if (!word || typeof word !== 'string') {
        throw new Error('Слово должно быть непустой строкой');
      }

      const langModule = this.languages[lang];
      if (!langModule) {
        throw new Error(`Язык "${lang}" не поддерживается`);
      }

      if (typeof langModule.inflect !== 'function') {
        throw new Error(`Модуль языка "${lang}" не имеет метода inflect`);
      }

      return langModule.inflect(word.trim(), caseType);
    },

    /**
     * Склонение текста из DOM-элемента
     * @param {object} options - параметры
     * @param {string} options.selector - CSS-селектор элемента с текстом
     * @param {string} options.lang - код языка
     * @param {string} options.case - тип падежа
     * @param {string} options.target - CSS-селектор элемента для вывода (опционально)
     * @returns {string} - склоненный текст
     */
    inflect(options) {
      const { selector, lang, case: caseType, target } = options;

      // Получаем элемент-источник
      const sourceElement = document.querySelector(selector);
      if (!sourceElement) {
        throw new Error(`Элемент с селектором "${selector}" не найден`);
      }

      // Получаем текст из элемента
      let text;
      if (sourceElement.tagName === 'INPUT' || sourceElement.tagName === 'TEXTAREA') {
        text = sourceElement.value;
      } else {
        text = sourceElement.textContent || sourceElement.innerText;
      }

      // Склоняем текст
      const inflectedText = this.inflectWord(text, lang, caseType);

      // Если указан target, записываем результат туда
      if (target) {
        const targetElement = document.querySelector(target);
        if (targetElement) {
          if (targetElement.tagName === 'INPUT' || targetElement.tagName === 'TEXTAREA') {
            targetElement.value = inflectedText;
          } else {
            targetElement.textContent = inflectedText;
          }
        }
      }

      return inflectedText;
    },

    /**
     * Массовое склонение текста (для обработки предложений)
     * @param {string} text - текст для обработки
     * @param {string} lang - код языка
     * @param {string} caseType - тип падежа
     * @param {boolean} firstWordOnly - склонять только первое слово
     * @returns {string} - обработанный текст
     */
    inflectText(text, lang, caseType, firstWordOnly = true) {
      if (!text || typeof text !== 'string') {
        return '';
      }

      const words = text.trim().split(/\s+/);

      if (firstWordOnly) {
        words[0] = this.inflectWord(words[0], lang, caseType);
      } else {
        return words.map(word => this.inflectWord(word, lang, caseType)).join(' ');
      }

      return words.join(' ');
    }
  };

  // Экспорт в глобальную область
  window.Declension = Declension;

})(window);
