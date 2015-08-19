# Documentation

jQuery List Draggable provide a flexible lists manager

## Table of Contents
  * [Usage](#usage)
  * [Options](#options)
  * [Data](#data)
  * [Renders](#renders)


## Usage
```javascript
 $('div.listDraggable').listDraggable({options});
```

## Options

| Parameter        | Type    | Default | Description |
|:-----------------|:-------:|:-------:|:------------|
| multiSelect      | boolean | false   | Enable multi-select mode |
| trash            | boolean | false   | Enable trash icon |
| removeIcon       | boolean | true    | Add a remove icon in order to delete the item from the current list |
| searchable       | boolean | false   | Add a search box in top of each list |
| displayResume    | boolean | true    | Display a summary of chosen lists for each groups on the original list, available when *displayGroup* is *true* |
| displayGroup     | boolean | false   | Display group of items names |
| displayShortcuts | boolean | false   | Add summary of each list name on top of each list in order to drag'n'drop or click on them to dispatch items quickly |
| hideSubList      | boolean | false   | Hide each list expected the original, useful with *displayShortcuts* enabled |
| trashList        | string  | 'none'  | Name of the trash list (not assigned items) |
| groups           | array   | []      | Group of list definitions |
| lists            | array   | []      | Lists definitions |
| language         | object  | {}      | Internationalization |
| data         | function/array  | null      | array of data passed to the lists manager |
 
### Group definitions
```javascript
 groups: [
   {class: 'col-md-3', lists: ['original']}
 ]
```
* **class** : name of CSS classes
* **lists** : array of each list which will include in the current group       
      
### List definitions  
```javascript 
 lists: [
   {name: 'original', label: 'Original', class: 'col-md-12'}
 ]
```
* **name**  : name of the list
* **label** : label of the list, if not specified equals to humanization of the name (ex: country-list => Country List)
* **class** : name of CSS classes

### Internationalization
* **dataMissing**              : displayed when *data* parameter is not specified
* **dataEmpty**                : displayed when *data* is empty
* **printDetails**             : displayed when *hideSubList* is *enabled*
* **multiSelectDifferentList** : displayed when drag'n'dropping on the same list

## Data
The *data* parameter can be a array or a function returning an array

**format**:
```javascript
 [
   {
     id:   string/integer   // id of the group,
     name: string           // name of the group,
     items: [
       {
         id: string/integer   // id of the item,
         list: string         // id of the list (use *trashList* as non assigned),
         name: string         // name of the item,
         ... any other data that could be useful to render an item,
       },
       ...
     ]
   },
   ...
 ]
```

**examples**:
```javascript 
 data: function () {
    var result;
    $.ajax({
      url: 'http://my-json-url.json',
      dataType: 'json',
      type: 'POST',
      async: false,
      success: function (json) {
        result = json;
      },
      error: function (e) {
        result = [];
      }
    });
    return result;
  }
```
or
```javascript 
 data: function () {
    return [{},{}];
  }
```

## Renders
* **renderList** : Fired when drawing the list, the *list* object is passed as argument of the drawing function
```javascript
 renderList : function(list) {
                return $('<div>'
                       + '<h1>' + list.label + '</h1>'
                       + '<ul name="' + list.name + '"></ul>'
                       + '</div>'
                );
              }
```
* **renderItem** : Fired when drawing the item, the *item* object is passed as argument of the drawing function 
```javascript
 renderItem : function(list) {
                return '<span class="text">' + item.name + '</span>';
              }
```
