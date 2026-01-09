/**
 * Модуль склонения для казахского языка
 * Основан на системе аффиксов и гармонии гласных
 */

(function(window) {
  'use strict';

  // Гласные переднего ряда (казахские + русские)
  const frontVowels = ['е', 'ә', 'і', 'ө', 'ү', 'э', 'и', 'ю', 'ё'];

  // Гласные заднего ряда (казахские + русские)
  const backVowels = ['а', 'о', 'ұ', 'ы', 'у', 'я'];

  // Словарь исключений
  const exceptions = {
    'су': {
      ilik: 'судың',
      barys: 'суға',
      tabys: 'суды',
      jatys: 'суда',
      shygys: 'судан',
      komektes: 'сумен'
    }
  };

  /**
   * Определение типа гласных в слове (передние/задние)
   * Используется для гармонии гласных
   */
  function getVowelHarmony(word) {
    const lowerWord = word.toLowerCase();

    // Ищем последнюю гласную
    for (let i = lowerWord.length - 1; i >= 0; i--) {
      const char = lowerWord[i];

      if (frontVowels.includes(char)) {
        return 'front';
      }

      if (backVowels.includes(char)) {
        return 'back';
      }
    }

    // По умолчанию задний ряд
    return 'back';
  }

  /**
   * Проверка, заканчивается ли слово на гласную
   */
  function endsWithVowel(word) {
    const lastChar = word.toLowerCase()[word.length - 1];
    return frontVowels.includes(lastChar) || backVowels.includes(lastChar);
  }

  /**
   * Проверка, заканчивается ли слово на звонкую согласную
   */
  function endsWithVoiced(word) {
    const voicedConsonants = ['б', 'в', 'г', 'ғ', 'д', 'ж', 'з', 'й', 'л', 'м', 'н', 'ң', 'р', 'у', 'ү', 'і', 'ы'];
    const lastChar = word.toLowerCase()[word.length - 1];
    return voicedConsonants.includes(lastChar);
  }

  /**
   * Проверка, заканчивается ли слово на носовую согласную (н, ң, м)
   * После этих согласных используются аффиксы с -н- в падежах Ілік и Шығыс
   * Примечание: р, л и й ведут себя как обычные звонкие (используют -д-)
   */
  function endsWithSonorant(word) {
    const sonorants = ['н', 'ң', 'м'];
    const lastChar = word.toLowerCase()[word.length - 1];
    return sonorants.includes(lastChar);
  }

  /**
   * Выбор варианта аффикса на основе гармонии гласных
   */
  function chooseAffix(word, frontVariant, backVariant) {
    const harmony = getVowelHarmony(word);
    return harmony === 'front' ? frontVariant : backVariant;
  }

  /**
   * Склонение в родительный падеж (Ілік септік)
   */
  function inflectIlik(word) {
    const hasVowelEnd = endsWithVowel(word);

    if (hasVowelEnd) {
      // После гласной: -ның/-нің
      return word + chooseAffix(word, 'нің', 'ның');
    } else {
      // После согласной
      if (endsWithSonorant(word)) {
        // После сонорных (н, ң, м, л, р, й): -ның/-нің
        return word + chooseAffix(word, 'нің', 'ның');
      } else if (endsWithVoiced(word)) {
        // После других звонких: -дың/-дің
        return word + chooseAffix(word, 'дің', 'дың');
      } else {
        // После глухих: -тың/-тің
        return word + chooseAffix(word, 'тің', 'тың');
      }
    }
  }

  /**
   * Склонение в дательно-направительный падеж (Барыс септік)
   */
  function inflectBarys(word) {
    const hasVowelEnd = endsWithVowel(word);

    if (hasVowelEnd) {
      // После гласной: -ға/-ге
      return word + chooseAffix(word, 'ге', 'ға');
    } else {
      // После согласной
      if (endsWithSonorant(word)) {
        // После сонорных: -ға/-ге
        return word + chooseAffix(word, 'ге', 'ға');
      } else if (endsWithVoiced(word)) {
        // После других звонких: -ға/-ге
        return word + chooseAffix(word, 'ге', 'ға');
      } else {
        // После глухих: -қа/-ке
        return word + chooseAffix(word, 'ке', 'қа');
      }
    }
  }

  /**
   * Склонение в винительный падеж (Табыс септік)
   */
  function inflectTabys(word) {
    const hasVowelEnd = endsWithVowel(word);

    if (hasVowelEnd) {
      // После гласной: -ны/-ні
      return word + chooseAffix(word, 'ні', 'ны');
    } else {
      // После согласной
      // В винительном падеже после всех звонких (включая сонорные) используется -ды/-ді
      if (endsWithVoiced(word)) {
        // После звонких (включая сонорные): -ды/-ді
        return word + chooseAffix(word, 'ді', 'ды');
      } else {
        // После глухих: -ты/-ті
        return word + chooseAffix(word, 'ті', 'ты');
      }
    }
  }

  /**
   * Склонение в местный падеж (Жатыс септік)
   */
  function inflectJatys(word) {
    const hasVowelEnd = endsWithVowel(word);

    if (hasVowelEnd) {
      // После гласной: -да/-де
      return word + chooseAffix(word, 'де', 'да');
    } else {
      // После согласной
      if (endsWithSonorant(word)) {
        // После сонорных: -да/-де
        return word + chooseAffix(word, 'де', 'да');
      } else if (endsWithVoiced(word)) {
        // После других звонких: -да/-де
        return word + chooseAffix(word, 'де', 'да');
      } else {
        // После глухих: -та/-те
        return word + chooseAffix(word, 'те', 'та');
      }
    }
  }

  /**
   * Склонение в исходный падеж (Шығыс септік)
   */
  function inflectShygys(word) {
    const hasVowelEnd = endsWithVowel(word);

    if (hasVowelEnd) {
      // После гласной: -дан/-ден
      return word + chooseAffix(word, 'ден', 'дан');
    } else {
      // После согласной
      if (endsWithSonorant(word)) {
        // После сонорных: -нан/-нен
        return word + chooseAffix(word, 'нен', 'нан');
      } else if (endsWithVoiced(word)) {
        // После других звонких: -дан/-ден
        return word + chooseAffix(word, 'ден', 'дан');
      } else {
        // После глухих: -тан/-тен
        return word + chooseAffix(word, 'тен', 'тан');
      }
    }
  }

  /**
   * Склонение в творительный падеж (Көмектес септік)
   */
  function inflectKomektes(word) {
    const hasVowelEnd = endsWithVowel(word);
    const lastChar = word.toLowerCase()[word.length - 1];

    if (hasVowelEnd) {
      // После гласной: -мен
      return word + 'мен';
    } else {
      // После согласной
      if (endsWithSonorant(word) || lastChar === 'й' || lastChar === 'л' || lastChar === 'р') {
        // После носовых (н, ң, м), сонорных (р, л) и й: -мен
        return word + 'мен';
      } else if (endsWithVoiced(word)) {
        // После других звонких: -бен
        return word + 'бен';
      } else {
        // После глухих: -пен
        return word + 'пен';
      }
    }
  }

  /**
   * Основная функция склонения
   */
  function inflect(word, caseType) {
    const lowerWord = word.toLowerCase();

    // Именительный падеж (Атау септік)
    if (caseType === 'ataw') {
      return word;
    }

    // Проверка исключений
    if (exceptions[lowerWord] && exceptions[lowerWord][caseType]) {
      const result = exceptions[lowerWord][caseType];
      // Сохраняем регистр первой буквы
      return word[0] === word[0].toUpperCase()
        ? result.charAt(0).toUpperCase() + result.slice(1)
        : result;
    }

    // Выбор функции склонения
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

  /**
   * Склонение ФИО
   */
  function inflectFullName(fullName, caseType) {
    const parts = fullName.trim().split(/\s+/);
    return parts.map(part => inflect(part, caseType)).join(' ');
  }

  // Регистрация модуля
  const KazakhModule = {
    inflect,
    inflectFullName,
    exceptions,
    // Вспомогательные функции для расширения
    getVowelHarmony,
    endsWithVowel,
    endsWithVoiced,
    endsWithSonorant
  };

  // Автоматическая регистрация при загрузке
  if (window.Declension) {
    window.Declension.registerLanguage('kz', KazakhModule);
  }

  // Экспорт модуля
  window.DeclensionKz = KazakhModule;

})(window);
