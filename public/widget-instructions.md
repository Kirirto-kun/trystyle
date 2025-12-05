# Инструкция по встраиванию TryStyle Chat Widget

## Быстрый старт

Просто скопируйте и вставьте этот код на вашу страницу:

```html
<!-- Контейнер для виджета чата -->
<div id="trystyle-widget"></div>

<!-- Скрипт виджета -->
<script src="https://trystyle.live/widget.js"></script>
```

Виджет автоматически появится на странице с размером 400×600px.

## Настройка размера

Если нужно изменить размер виджета, используйте кастомную конфигурацию:

```html
<script>
  window.TryStyleWidget = {
    width: '500px',   // Ширина виджета
    height: '700px'   // Высота виджета
  };
</script>
<script src="https://trystyle.live/widget.js"></script>
<div id="trystyle-widget"></div>
```

## Адаптивный размер

Для адаптивного размера (100% ширины контейнера):

```html
<div id="trystyle-widget" class="responsive"></div>
<script src="https://trystyle.live/widget.js"></script>
```

Или через конфигурацию:

```html
<script>
  window.TryStyleWidget = {
    responsive: true,
    height: '600px'  // Минимальная высота
  };
</script>
<script src="https://trystyle.live/widget.js"></script>
<div id="trystyle-widget"></div>
```

## Кастомный ID контейнера

Если нужно использовать другой ID для контейнера:

```html
<div id="my-custom-widget"></div>
<script>
  window.TryStyleWidget = {
    containerId: 'my-custom-widget'
  };
</script>
<script src="https://trystyle.live/widget.js"></script>
```

## Полный пример HTML страницы

```html
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мой сайт</title>
</head>
<body>
    <h1>Добро пожаловать на мой сайт</h1>
    
    <!-- Виджет чата TryStyle -->
    <div id="trystyle-widget"></div>
    <script src="https://trystyle.live/widget.js"></script>
</body>
</html>
```

## API для программного управления

После загрузки виджета доступен объект `TryStyleWidgetAPI`:

```javascript
// Перезагрузить виджет
TryStyleWidgetAPI.reload();

// Изменить размер
TryStyleWidgetAPI.setSize('500px', '700px');

// Получить iframe элемент
const iframe = TryStyleWidgetAPI.getIframe();
```

## Требования

- Современный браузер с поддержкой JavaScript
- HTTPS соединение (для безопасности)
- Интернет соединение для загрузки виджета

## Поддержка

При возникновении проблем обращайтесь к команде TryStyle.

