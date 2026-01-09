/**
 * Модуль склонения для русского языка
 */

(function(window) {
  'use strict';

  // Словарь исключений и особых случаев
  const exceptions = {
    'путь': {
      genitive: 'пути',
      dative: 'пути',
      accusative: 'путь',
      instrumental: 'путём',
      prepositional: 'пути'
    },
    'мать': {
      genitive: 'матери',
      dative: 'матери',
      accusative: 'мать',
      instrumental: 'матерью',
      prepositional: 'матери'
    },
    'дочь': {
      genitive: 'дочери',
      dative: 'дочери',
      accusative: 'дочь',
      instrumental: 'дочерью',
      prepositional: 'дочери'
    }
  };

  // Окончания для мужского рода (твёрдая основа)
  const masculineHard = {
    genitive: 'а',
    dative: 'у',
    accusative: '', // как именительный для неодушевлённых
    instrumental: 'ом',
    prepositional: 'е'
  };

  // Окончания для мужского рода (мягкая основа)
  const masculineSoft = {
    genitive: 'я',
    dative: 'ю',
    accusative: '',
    instrumental: 'ем',
    prepositional: 'е'
  };

  // Окончания для женского рода (твёрдая основа)
  const feminineHard = {
    genitive: 'ы',
    dative: 'е',
    accusative: 'у',
    instrumental: 'ой',
    prepositional: 'е'
  };

  // Окончания для женского рода (мягкая основа)
  const feminineSoft = {
    genitive: 'и',
    dative: 'е',
    accusative: 'ю',
    instrumental: 'ей',
    prepositional: 'е'
  };

  // Окончания для среднего рода (твёрдая основа: окно)
  const neuter = {
    genitive: 'а',
    dative: 'у',
    accusative: 'о',
    instrumental: 'ом',
    prepositional: 'е'
  };

  // Окончания для среднего рода (мягкая основа: море, поле)
  const neuterSoft = {
    genitive: 'я',
    dative: 'ю',
    accusative: 'е',
    instrumental: 'ем',
    prepositional: 'е'
  };

  /**
   * Определение типа слова и его основы
   */
  function analyzeWord(word) {
    const lowerWord = word.toLowerCase();
    const len = word.length;

    if (len < 2) {
      return { stem: word, type: 'unknown', ending: '' };
    }

    const lastChar = lowerWord[len - 1];
    const lastTwo = lowerWord.slice(-2);

    // Женский род на -а, -я
    if (lastChar === 'а') {
      return {
        stem: word.slice(0, -1),
        type: 'feminine-hard',
        ending: 'а',
        gender: 'f'
      };
    }

    if (lastChar === 'я') {
      return {
        stem: word.slice(0, -1),
        type: 'feminine-soft',
        ending: 'я',
        gender: 'f'
      };
    }

    // Средний род на -о, -е
    if (lastChar === 'о') {
      return {
        stem: word.slice(0, -1),
        type: 'neuter',
        ending: 'о',
        gender: 'n'
      };
    }

    if (lastChar === 'е') {
      return {
        stem: word.slice(0, -1),
        type: 'neuter-soft',
        ending: 'е',
        gender: 'n'
      };
    }

    // Мужской род
    // Мягкая основа: ь, й
    if (lastChar === 'ь' || lastChar === 'й') {
      return {
        stem: word.slice(0, -1),
        type: 'masculine-soft',
        ending: lastChar,
        gender: 'm'
      };
    }

    // Твёрдая основа (согласная)
    const softConsonants = ['ч', 'щ', 'ш', 'ж'];
    const isSoft = softConsonants.includes(lastChar);

    return {
      stem: word,
      type: isSoft ? 'masculine-soft-cons' : 'masculine-hard',
      ending: '',
      gender: 'm'
    };
  }

  /**
   * Применение правил чередования согласных
   */
  function applyStemChange(stem, caseType) {
    // г, к, х → з, ц, с (в некоторых падежах)
    // Упрощённая версия
    return stem;
  }

  /**
   * Получение окончания для падежа
   */
  function getEnding(analysis, caseType) {
    const { type, stem } = analysis;

    switch (type) {
      case 'masculine-hard':
      case 'masculine-soft-cons':
        return masculineHard[caseType] || '';

      case 'masculine-soft':
        return masculineSoft[caseType] || '';

      case 'feminine-hard':
        return feminineHard[caseType] || '';

      case 'feminine-soft':
        return feminineSoft[caseType] || '';

      case 'neuter':
        return neuter[caseType] || '';

      case 'neuter-soft':
        return neuterSoft[caseType] || '';

      default:
        return '';
    }
  }

  /**
   * Основная функция склонения
   */
  function inflect(word, caseType) {
    const lowerWord = word.toLowerCase();

    // Именительный падеж - возвращаем как есть
    if (caseType === 'nominative') {
      return word;
    }

    // Проверка исключений
    if (exceptions[lowerWord] && exceptions[lowerWord][caseType]) {
      // Сохраняем регистр первой буквы
      const result = exceptions[lowerWord][caseType];
      return word[0] === word[0].toUpperCase()
        ? result.charAt(0).toUpperCase() + result.slice(1)
        : result;
    }

    // Анализ слова
    const analysis = analyzeWord(word);

    // Получение окончания
    const ending = getEnding(analysis, caseType);

    // Применение чередований
    const stem = applyStemChange(analysis.stem, caseType);

    // Сборка результата
    return stem + ending;
  }

  /**
   * Склонение ФИО
   */
  function inflectFullName(fullName, caseType) {
    const parts = fullName.trim().split(/\s+/);
    return parts.map(part => inflect(part, caseType)).join(' ');
  }

  // Регистрация модуля
  const RussianModule = {
    inflect,
    inflectFullName,
    exceptions
  };

  // Автоматическая регистрация при загрузке
  if (window.Declension) {
    window.Declension.registerLanguage('ru', RussianModule);
  }

  // Экспорт модуля
  window.DeclensionRu = RussianModule;

})(window);
