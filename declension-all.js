(function(window) {
  'use strict';

  const Declension = {
    languages: {},

    registerLanguage(code, module) {
      this.languages[code] = module;
    },

    inflectWord(word, lang, caseType, options = {}) {
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

      return langModule.inflect(word.trim(), caseType, options);
    },

    inflect(options) {
      const { selector, lang, case: caseType, target } = options;

      const sourceElement = document.querySelector(selector);
      if (!sourceElement) {
        throw new Error(`Элемент с селектором "${selector}" не найден`);
      }

      let text;
      if (sourceElement.tagName === 'INPUT' || sourceElement.tagName === 'TEXTAREA') {
        text = sourceElement.value;
      } else {
        text = sourceElement.textContent || sourceElement.innerText;
      }

      const inflectedText = this.inflectWord(text, lang, caseType);

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

  const exceptionsRu = {
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

  const masculineHard = {
    genitive: 'а',
    dative: 'у',
    accusative: '',
    instrumental: 'ом',
    prepositional: 'е'
  };

  const masculineSoft = {
    genitive: 'я',
    dative: 'ю',
    accusative: '',
    instrumental: 'ем',
    prepositional: 'е'
  };

  const feminineHard = {
    genitive: 'ы',
    dative: 'е',
    accusative: 'у',
    instrumental: 'ой',
    prepositional: 'е'
  };

  const feminineSoft = {
    genitive: 'и',
    dative: 'е',
    accusative: 'ю',
    instrumental: 'ей',
    prepositional: 'е'
  };

  const neuter = {
    genitive: 'а',
    dative: 'у',
    accusative: 'о',
    instrumental: 'ом',
    prepositional: 'е'
  };

  const neuterSoft = {
    genitive: 'я',
    dative: 'ю',
    accusative: 'е',
    instrumental: 'ем',
    prepositional: 'е'
  };

  function analyzeWord(word) {
    const lowerWord = word.toLowerCase();
    const len = word.length;

    if (len < 2) {
      return { stem: word, type: 'unknown', ending: '' };
    }

    const lastChar = lowerWord[len - 1];
    const lastTwo = lowerWord.slice(-2);

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

    if (lastChar === 'ь' || lastChar === 'й') {
      return {
        stem: word.slice(0, -1),
        type: 'masculine-soft',
        ending: lastChar,
        gender: 'm'
      };
    }

    const softConsonants = ['ч', 'щ', 'ш', 'ж'];
    const isSoft = softConsonants.includes(lastChar);

    return {
      stem: word,
      type: isSoft ? 'masculine-soft-cons' : 'masculine-hard',
      ending: '',
      gender: 'm'
    };
  }

  function applyStemChange(stem, caseType) {
    return stem;
  }

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

  function inflectRu(word, caseType) {
    const lowerWord = word.toLowerCase();

    if (caseType === 'nominative') {
      return word;
    }

    if (exceptionsRu[lowerWord] && exceptionsRu[lowerWord][caseType]) {
      const result = exceptionsRu[lowerWord][caseType];
      return word[0] === word[0].toUpperCase()
        ? result.charAt(0).toUpperCase() + result.slice(1)
        : result;
    }

    // Special handling for surnames ending in -ов/-ев in instrumental case
    if (caseType === 'instrumental') {
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев')) {
        const ending = lowerWord.endsWith('ов') ? 'ым' : 'ем';
        return word + ending;
      }
    }

    const analysis = analyzeWord(word);

    const ending = getEnding(analysis, caseType);

    const stem = applyStemChange(analysis.stem, caseType);

    return stem + ending;
  }

  function inflectFullNameRu(fullName, caseType, options = {}) {
    const parts = fullName.trim().split(/\s+/);
    const type = options.type || 'auto'; // 'auto', 'name', 'phrase'

    if (type === 'phrase') {
      // Для должностей и словосочетаний - склоняем только первое слово
      return parts.map((part, index) => {
        if (index === 0) {
          return inflectRu(part, caseType);
        }
        return part;
      }).join(' ');
    } else if (type === 'name') {
      // Для ФИО - склоняем все части, кроме казахских отчеств
      return parts.map(part => {
        const lowerPart = part.toLowerCase();
        if (lowerPart.endsWith('ұлы') || lowerPart.endsWith('қызы') ||
            lowerPart.endsWith('улы') || lowerPart.endsWith('кызы')) {
          return part;
        }
        return inflectRu(part, caseType);
      }).join(' ');
    } else {
      // auto - определяем автоматически
      // Если все слова с большой буквы и от 2 до 4 слов - это ФИО
      const allCapitalized = parts.every(part => part[0] === part[0].toUpperCase());
      if (allCapitalized && parts.length >= 2 && parts.length <= 4) {
        return inflectFullNameRu(fullName, caseType, { type: 'name' });
      } else {
        return inflectFullNameRu(fullName, caseType, { type: 'phrase' });
      }
    }
  }

  const RussianModule = {
    inflect: function(word, caseType, options = {}) {
      // Если в слове есть пробелы, используем inflectFullNameRu
      if (word.includes(' ')) {
        return inflectFullNameRu(word, caseType, options);
      }
      return inflectRu(word, caseType);
    },
    inflectFullName: inflectFullNameRu,
    exceptions: exceptionsRu
  };

  const frontVowels = ['е', 'ә', 'і', 'ө', 'ү', 'э', 'и', 'ю', 'ё'];

  const backVowels = ['а', 'о', 'ұ', 'ы', 'у', 'я'];

  const exceptionsKz = {
    'су': {
      ilik: 'судың',
      barys: 'суға',
      tabys: 'суды',
      jatys: 'суда',
      shygys: 'судан',
      komektes: 'сумен'
    }
  };

  function getVowelHarmony(word) {
    const lowerWord = word.toLowerCase();

    for (let i = lowerWord.length - 1; i >= 0; i--) {
      const char = lowerWord[i];

      if (frontVowels.includes(char)) {
        return 'front';
      }

      if (backVowels.includes(char)) {
        return 'back';
      }
    }

    return 'back';
  }

  function endsWithVowel(word) {
    const lastChar = word.toLowerCase()[word.length - 1];
    return frontVowels.includes(lastChar) || backVowels.includes(lastChar);
  }

  function endsWithVoiced(word) {
    const voicedConsonants = ['б', 'в', 'г', 'ғ', 'д', 'ж', 'з', 'й', 'л', 'м', 'н', 'ң', 'р', 'у', 'ү', 'і', 'ы'];
    const lastChar = word.toLowerCase()[word.length - 1];
    return voicedConsonants.includes(lastChar);
  }

  function endsWithSonorant(word) {
    const sonorants = ['н', 'ң', 'м'];
    const lastChar = word.toLowerCase()[word.length - 1];
    return sonorants.includes(lastChar);
  }

  function chooseAffix(word, frontVariant, backVariant) {
    const harmony = getVowelHarmony(word);
    return harmony === 'front' ? frontVariant : backVariant;
  }

  function inflectIlik(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lowerWord = word.toLowerCase();

    if (hasVowelEnd) {
      // Слова с притяжательными суффиксами -ы/-і меняются на -ның/-нің
      const lastChar = lowerWord[lowerWord.length - 1];
      if (lastChar === 'ы' || lastChar === 'і') {
        // Убираем последнюю гласную и добавляем соответствующее окончание
        // Гармонию определяем по основе слова (без последней гласной)
        const stem = word.slice(0, -1);
        // Для притяжательных форм используем полные окончания: -ының/-інің
        return stem + chooseAffix(stem, 'інің', 'ының');
      }
      return word + chooseAffix(word, 'нің', 'ның');
    } else {
      // Русские фамилии на -ов/-ев/-ова/-ева склоняются с глухим окончанием
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев') ||
          lowerWord.endsWith('ова') || lowerWord.endsWith('ева')) {
        return word + chooseAffix(word, 'тің', 'тың');
      }

      if (endsWithSonorant(word)) {
        return word + chooseAffix(word, 'нің', 'ның');
      } else if (endsWithVoiced(word)) {
        return word + chooseAffix(word, 'дің', 'дың');
      } else {
        return word + chooseAffix(word, 'тің', 'тың');
      }
    }
  }

  function inflectBarys(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lowerWord = word.toLowerCase();

    if (hasVowelEnd) {
      // Слова с притяжательными суффиксами -ы/-і меняются на -на/-не
      const lastChar = lowerWord[lowerWord.length - 1];
      if (lastChar === 'ы' || lastChar === 'і') {
        const stem = word.slice(0, -1);
        // Для притяжательных форм используем полные окончания: -ына/-іне
        return stem + chooseAffix(stem, 'іне', 'ына');
      }
      return word + chooseAffix(word, 'ге', 'ға');
    } else {
      // Русские фамилии на -ов/-ев/-ова/-ева склоняются с глухим окончанием
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев') ||
          lowerWord.endsWith('ова') || lowerWord.endsWith('ева')) {
        return word + chooseAffix(word, 'ке', 'қа');
      }

      if (endsWithSonorant(word)) {
        return word + chooseAffix(word, 'ге', 'ға');
      } else if (endsWithVoiced(word)) {
        return word + chooseAffix(word, 'ге', 'ға');
      } else {
        return word + chooseAffix(word, 'ке', 'қа');
      }
    }
  }

  function inflectTabys(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lowerWord = word.toLowerCase();

    if (hasVowelEnd) {
      // Слова с притяжательными суффиксами -ы/-і меняются на -н
      const lastChar = lowerWord[lowerWord.length - 1];
      if (lastChar === 'ы' || lastChar === 'і') {
        const stem = word.slice(0, -1);
        // Для притяжательных форм используем полные окончания: -ын/-ін
        return stem + chooseAffix(stem, 'ін', 'ын');
      }
      return word + chooseAffix(word, 'ні', 'ны');
    } else {
      // Русские фамилии на -ов/-ев/-ова/-ева склоняются с глухим окончанием
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев') ||
          lowerWord.endsWith('ова') || lowerWord.endsWith('ева')) {
        return word + chooseAffix(word, 'ті', 'ты');
      }

      if (endsWithVoiced(word)) {
        return word + chooseAffix(word, 'ді', 'ды');
      } else {
        return word + chooseAffix(word, 'ті', 'ты');
      }
    }
  }

  function inflectJatys(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lowerWord = word.toLowerCase();

    if (hasVowelEnd) {
      // Слова с притяжательными суффиксами -ы/-і меняются на -нда/-нде
      const lastChar = lowerWord[lowerWord.length - 1];
      if (lastChar === 'ы' || lastChar === 'і') {
        const stem = word.slice(0, -1);
        // Для притяжательных форм используем полные окончания: -ында/-інде
        return stem + chooseAffix(stem, 'інде', 'ында');
      }
      return word + chooseAffix(word, 'де', 'да');
    } else {
      // Русские фамилии на -ов/-ев/-ова/-ева склоняются с глухим окончанием
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев') ||
          lowerWord.endsWith('ова') || lowerWord.endsWith('ева')) {
        return word + chooseAffix(word, 'те', 'та');
      }

      if (endsWithSonorant(word)) {
        return word + chooseAffix(word, 'де', 'да');
      } else if (endsWithVoiced(word)) {
        return word + chooseAffix(word, 'де', 'да');
      } else {
        return word + chooseAffix(word, 'те', 'та');
      }
    }
  }

  function inflectShygys(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lowerWord = word.toLowerCase();

    if (hasVowelEnd) {
      // Слова с притяжательными суффиксами -ы/-і меняются на -нан/-нен
      const lastChar = lowerWord[lowerWord.length - 1];
      if (lastChar === 'ы' || lastChar === 'і') {
        const stem = word.slice(0, -1);
        // Для притяжательных форм используем полные окончания: -ынан/-інен
        return stem + chooseAffix(stem, 'інен', 'ынан');
      }
      return word + chooseAffix(word, 'ден', 'дан');
    } else {
      // Русские фамилии на -ов/-ев/-ова/-ева склоняются с глухим окончанием
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев') ||
          lowerWord.endsWith('ова') || lowerWord.endsWith('ева')) {
        return word + chooseAffix(word, 'тен', 'тан');
      }

      if (endsWithSonorant(word)) {
        return word + chooseAffix(word, 'нен', 'нан');
      } else if (endsWithVoiced(word)) {
        return word + chooseAffix(word, 'ден', 'дан');
      } else {
        return word + chooseAffix(word, 'тен', 'тан');
      }
    }
  }

  function inflectKomektes(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lowerWord = word.toLowerCase();
    const lastChar = lowerWord[lowerWord.length - 1];

    if (hasVowelEnd) {
      return word + 'мен';
    } else {
      // Русские фамилии на -ов/-ев/-ова/-ева склоняются с глухим окончанием
      if (lowerWord.endsWith('ов') || lowerWord.endsWith('ев') ||
          lowerWord.endsWith('ова') || lowerWord.endsWith('ева')) {
        return word + 'пен';
      }

      if (endsWithSonorant(word) || lastChar === 'й' || lastChar === 'л' || lastChar === 'р') {
        return word + 'мен';
      } else if (endsWithVoiced(word)) {
        return word + 'бен';
      } else {
        return word + 'пен';
      }
    }
  }

  function inflectKz(word, caseType) {
    const lowerWord = word.toLowerCase();

    if (caseType === 'ataw') {
      return word;
    }

    if (exceptionsKz[lowerWord] && exceptionsKz[lowerWord][caseType]) {
      const result = exceptionsKz[lowerWord][caseType];
      return word[0] === word[0].toUpperCase()
        ? result.charAt(0).toUpperCase() + result.slice(1)
        : result;
    }

    switch (caseType) {
      case 'ilik':
        return inflectIlik(word);

      case 'barys':
        return inflectBarys(word);

      case 'tabys':
        return inflectTabys(word);

      case 'jatys':
        return inflectJatys(word);

      case 'shygys':
        return inflectShygys(word);

      case 'komektes':
        return inflectKomektes(word);

      default:
        throw new Error(`Неизвестный падеж: ${caseType}`);
    }
  }

  function inflectFullNameKz(fullName, caseType, options = {}) {
    const parts = fullName.trim().split(/\s+/);
    const type = options.type || 'auto'; // 'auto', 'name', 'phrase'

    if (type === 'phrase') {
      // Для должностей и словосочетаний - склоняем только последнее слово
      return parts.map((part, index) => {
        if (index === parts.length - 1) {
          return inflectKz(part, caseType);
        }
        return part;
      }).join(' ');
    } else if (type === 'name') {
      // Для ФИО в казахском языке - склоняем только последнее слово (фамилию)
      // Имя и отчество остаются в именительном падеже
      return parts.map((part, index) => {
        if (index === parts.length - 1) {
          return inflectKz(part, caseType);
        }
        return part;
      }).join(' ');
    } else {
      // auto - определяем автоматически
      // Если все слова с большой буквы и от 2 до 4 слов - это ФИО
      const allCapitalized = parts.every(part => part[0] === part[0].toUpperCase());
      if (allCapitalized && parts.length >= 2 && parts.length <= 4) {
        return inflectFullNameKz(fullName, caseType, { type: 'name' });
      } else {
        return inflectFullNameKz(fullName, caseType, { type: 'phrase' });
      }
    }
  }

  const KazakhModule = {
    inflect: function(word, caseType, options = {}) {
      // Если в слове есть пробелы, используем inflectFullNameKz
      if (word.includes(' ')) {
        return inflectFullNameKz(word, caseType, options);
      }
      return inflectKz(word, caseType);
    },
    inflectFullName: inflectFullNameKz,
    exceptions: exceptionsKz,
    getVowelHarmony,
    endsWithVowel,
    endsWithVoiced,
    endsWithSonorant
  };

  Declension.registerLanguage('ru', RussianModule);
  Declension.registerLanguage('kz', KazakhModule);

  window.Declension = Declension;
  window.DeclensionRu = RussianModule;
  window.DeclensionKz = KazakhModule;

})(window);
