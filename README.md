**WIP**

# SwooshTable.js

SwooshTable.js is a library enables table rows swipable and shows operation buttons.

# Usage

## Include

```html
<link rel="stylesheet" href="swooshTable.css" />

<script src="jquery.js"></script>
<script src="swooshTable.js"></script>
```

This depends on jQuery.
I'll remove that dependency one day.

## HTML of Target Table

```html
<table class="js-theTable">
  <tbody>
    <tr>
      <td>Colomun 1</td>
      <td>Colomun 2</td>
      <td>Colomun 3</td>
    </tr>
    <tr>
      <td>Colomun 1</td>
      <td>Colomun 2</td>
      <td>Colomun 3</td>
    </tr>
    <!-- ... -->
  </tbody>
</table>
```

## Run

```html
<script>
var $table = $('.js-theTable');
var elTable = $table[0];
var theTable = SwooshTable(elTable);
theTable.on('removerow', function(event, elRow) {
  var $row = $(event.elRow);
  $row.remove();
});
</script>
```
