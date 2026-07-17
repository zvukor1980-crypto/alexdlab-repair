const body = document.body;
const toggle = document.getElementById('themeToggle');

const savedTheme = localStorage.getItem('alexdlab-theme');
if (savedTheme === 'dark') body.classList.add('dark');

toggle.addEventListener('click', () => {
  body.classList.toggle('dark');
  localStorage.setItem('alexdlab-theme', body.classList.contains('dark') ? 'dark' : 'light');
});

const content = {
  power: {
    title: 'iPhone 5 не включается',
    steps: [
      'Осмотреть разъём, батарею и следы повреждения.',
      'Проверить напряжение аккумулятора.',
      'Подключить лабораторный блок питания и оценить потребление.',
      'Проверить основные линии питания и короткое замыкание.'
    ]
  },
  charge: {
    title: 'iPhone 5 не заряжается',
    steps: [
      'Проверить кабель, адаптер и загрязнение Lightning-разъёма.',
      'Измерить наличие входного USB-питания.',
      'Проверить цепи разъёма и защитные элементы.',
      'Перейти к диагностике Tristar и связанных линий.'
    ]
  },
  display: {
    title: 'На iPhone 5 нет изображения',
    steps: [
      'Проверить дисплейный модуль и разъёмы.',
      'Осмотреть коннектор и область вокруг него.',
      'Проверить линии питания дисплея.',
      'Отдельно диагностировать изображение и подсветку.'
    ]
  },
  audio: {
    title: 'На iPhone 5 нет звука',
    steps: [
      'Определить, какой канал не работает: динамик, разговорный динамик или наушники.',
      'Проверить соответствующий модуль и контакты.',
      'Проверить питание и сигнальные цепи аудиокодека.',
      'Сравнить результат с исправным узлом.'
    ]
  }
};

document.querySelectorAll('.fault').forEach(button => {
  button.addEventListener('click', () => {
    document.querySelectorAll('.fault').forEach(item => item.classList.remove('active'));
    button.classList.add('active');
    const item = content[button.dataset.fault];
    document.querySelector('#diagnosticResult h3').textContent = item.title;
    document.querySelector('#diagnosticResult ol').innerHTML = item.steps.map(step => `<li>${step}</li>`).join('');
  });
});
