/**
 * Copyright 2015 Karl MARQUES <marques.karl@live.fr>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

(function ($) {

  $.listDraggable = function (element, options) {

    // private property
    //
    // plugin's default options
    //
    var defaults = {
      multiSelect: false,
      trash: false,
      removeIcon: true,
      searchable: false,
      groups: [
        {class: 'col-md-3', lists: ['original']},
        {class: 'col-md-9', lists: ['default']}
      ],
      lists: [
        {name: 'original', label: 'Original', class: 'col-md-12'}
      ],
      renderList: null,
      renderItem: null,
      displayResume: true,
      displayGroup: false,
      displayShortcuts: false,
      hideSubList: false,
      trashList: 'none',
      language: {
        dataMissing: 'data option not specified',
        dataEmpty: 'data option is empty',
        printDetails: 'Display details',
        multiSelectDifferentList: 'Multi-select only available on the same list'
      }
    };

    // to avoid confusions, use "plugin" to reference the
    // current instance of the object
    var plugin = this;
    var listElements = [], dataTransfer = [];
    plugin.settings = {};

    var $element = $(element), // reference to the jQuery version of DOM element
      element = element;    // reference to the actual DOM element

    // Constructor
    //
    // Constructor
    //
    plugin.init = function () {

      // Merge settings with defaults
      plugin.settings = $.extend(true, {}, defaults, options);

      if (checkRequirements()) {
        initList();
        refreshList();

        if (plugin.settings.hideSubList == true) {
          var $lists = $element.find('div[data-list]'),
            $checkbox = $(
              '<div class="checkbox">' +
                '<label>' +
                '<input type="checkbox">' + plugin.settings.language.printDetails +
                '</label>' +
                '</div>');

          $lists.not('[data-list=original]').hide();
          $lists.not('[data-list!=original]').prepend($checkbox);
        }

        bindEvents();
      }
    }
    ;

    // public method
    //
    // Refresh listing manually
    //
    plugin.refresh = function () {
      refreshList();
    };

    // public method
    //
    //
    //
    plugin.getData = function () {
      return plugin.settings.data;
    };

    plugin.getFilteredData = function () {
      var filtered = {};
      $.each(plugin.settings.lists, function () {
        filtered[this.name] = [];
      });
      filtered['none'] = [];

      $.each(plugin.settings.data, function () {
        var group = this;
        $.each(group.items, function () {
          var item = this;
          if (filtered.hasOwnProperty(item.list)) {
            filtered[item.list].push(item.id);
          }
        });
      });

      return filtered;
    };
    // private method
    //
    // Change a string to an human readable string
    //
    var humanize = function (string) {

      string = string.replace(/([0-9])([a-zA-Z])/g, '$1 $2');
      string = string.replace(/([a-zA-Z])([0-9])/g, '$1 $2');
      string = string.replace(/([a-z])([A-Z])/g, '$1 $2');
      string = string.replace(/([A-Z])([a-z])/g, '$1 $2');

      return string;
    };

    // private method
    //
    // Capitalize string
    //
    var capitalize = function (string) {

      return string[0].toUpperCase() + string.slice(1);

    };

    // private method
    //
    // Check requirements
    //
    var checkRequirements = function () {
      var result = true;

      if (plugin.settings.renderList == null) {
        plugin.settings.renderList = _renderList;
      }
      if (plugin.settings.renderItem == null) {
        plugin.settings.renderItem = _renderItem;
      }
      if (!plugin.settings.data) {
        $element.append('<p class="alert alert-error">' + plugin.settings.language.dataMissing + '</p>');
        result = false;
      }

      if ($.isFunction(plugin.settings.data)) {
        plugin.settings.data = plugin.settings.data();
      }

      if (plugin.settings.data.length < 1) {
        $element.append('<p class="alert alert-error">' + plugin.settings.language.dataEmpty + '</p>');
        result = false;
      }

      if (!plugin.settings.lists || plugin.settings.lists.length < 2) {
        $element.append(
          '<p class="alert alert-error">'
            + 'lists option not specified or is empty<br>'
            + '<small>lists:[<br>'
            + '  {name: "mylistname", label: "my list label", class: "span2"}<br>'
            + ' ,...<br>'
            + ']'
            + '</small>'
            + '</p>'
        );
        result = false;
      }

      return result;
    };

    // private method
    //
    // Initialise DOM
    //
    var initList = function () {
      renderGroups();
    };

    // private method
    //
    // refresh list from data
    //
    var refreshList = function () {
      $element.find('ul:not(.trash)').html('');
      var
        $originList = $element.find('div[data-list=original] ul');

      $.each(plugin.settings.data, function (index, group) {
        //create group item
        var groupLi = '<li class="group" data-name="' + group.name + '" data-id="' + group.id + '" draggable="true"><span class="text" name="' + group.id + '">' + group.name + '</span></li>',
          risks = [],
          lis = [];

        if (plugin.settings.displayGroup) {
          //append group to all list
          for (var key in listElements) {
            if (listElements.hasOwnProperty(key) && key != 'original') {
              $(listElements[key]).find('ul').append(groupLi);
            }
          }
        }

        //compute items
        $.each(group.items, function (index, item) {
            var itemLi = '<li class="item" draggable="true" data-group="' + group.id + '" data-id="' + item.id + '" data-name="' + item.name + '">'
                + (
                plugin.settings.removeIcon && item.list != 'none' && item.list != plugin.settings.trashList
                  ? '<button type="button" class="close" data-dismiss="item">&times;</button>'
                  : ''
                )
                + plugin.settings.renderItem(item)
                + '</li>',
              list = '';

            if (listElements[item.list]) {
              listElements[item.list].find('ul').append(itemLi);
              list = $('div[data-list=' + item.list + ']').find('.title').text();
              if (!list)
                list = capitalize(item.list);
            }

            if (list != '')
              risks.indexOf(list) < 0 ? risks.push(list) : true;
            lis.push($(itemLi).append('<span class="list">' + list + '</span>'));
          }
        );

        //append all li to originList
        var $groupLi = $(groupLi),
          $risk = $('<span class="pull-right list">' + risks.join('/') + '</span>');
        if (plugin.settings.displayGroup) {
          if (plugin.settings.displayResume)
            $groupLi.append($risk);
          $originList.append($groupLi);
        }
        $(lis).each(function () {
          $originList.append(this)
        });
      });

    };

    // private method
    //
    // Bind events (drag, drop, click
    //
    var bindEvents = function () {
      $element
        .on('click', 'input[type=checkbox]', function (e) {
          if ($(this).is(':checked'))
            $element.find('div[data-list]').show();
          else
            $element.find('div[data-list]').not('[data-list=original]').hide();
        })
        .on('keyup', 'input[type=text]', function (e) {
          var $this = $(this), $ul = $(this).next('ul');

          $ul.find('li').each(function () {
            if ($(this).data('name').toLowerCase().indexOf($this.val().toLowerCase()) != -1) {
              $(this).fadeIn('fast');
            } else {
              $(this).fadeOut('fast');
            }
          });
        })
        .on('click', 'button.close', function (e) {
          e.preventDefault();
          e.stopPropagation();
          var $parentLi = $(this).closest('li');
          var itemId = $parentLi.data('id');
          var itemGroup = $parentLi.data('group');
          var group = $.grep(plugin.settings.data, function (group) {
            return group.id == itemGroup
          });
          var item = $.grep(group[0].items, function (item) {
            return item.id == itemId
          });
          item[0].list = plugin.settings.trashList;
          $(this).remove();
          refreshList();
        })
        .on('click', 'li', function (e) {
          if (!plugin.settings.multiSelect)
            return false;
          $ulName = $('li.alert-info[draggable=true]').parents('ul').data('id');

          if ($ulName && $ulName != $(this).parents('ul').data('id')) {
            alert(plugin.settings.language.multiSelectDifferentList);
            return false;
          }
          if ($(this).hasClass('group')) {
            $(this).nextUntil('li.group').toggleClass('alert-info');
          } else {
            $(this).toggleClass('alert-info');
          }
        })
        .on('click', 'button[data-rel=list-choice]', function (e) {
          var $selected = $('li.alert-info[draggable=true]');
          if ($selected.length) {
            $selected.first().trigger('dragstart');
            $('div[data-list=' + $(this).attr('name') + ']').find('ul').trigger('drop');
          }
        })
        .on('dragstart', 'li[draggable=true]', function (e) {
          var $this = $(this), names = [],
          //get multi-select
            selectedNames = $('li.alert-info[draggable=true]').filter(function (a) {
              return $(this).data('id') != $this.data('id');
            }),
            displayNames = [];

          //push selected items on transfer list
          selectedNames.each(function () {
            names.push($(this).data('id'));
            displayNames.push($(this).data('name'));
          });

          $(this).find('span.list').hide();
          if ($(this).hasClass('item')) {
            if (names.indexOf($(this).data('id')) == -1) {
              names.push($(this).data('id'));
              displayNames.push($(this).data('name'));
              dataTransfer["group"] = $(this).data('group');
            }
          }
          else {
            dataTransfer["group"] = $(this).data('id');
            $.each($(this).nextUntil('li.group').filter('li'), function () {
              if (-1 == $.inArray($(this).data('id'), names)) {
                names.push($(this).data('id'));
                displayNames.push($(this).data('name'));
              }
            });
          }

          dataTransfer["item"] = names.join('/');
          dataTransfer["fromlist"] = $(this).closest('ul').data('id');

          if (displayNames.length > 10) {
            displayNames.splice(10);
            displayNames.push('...');
          }
          var draggedItem = $('<div></div>').html(displayNames.join('<br>'));

          if (e.originalEvent) {
            var crt = draggedItem[0].cloneNode(true);
            crt.style.backgroundColor = "#FFFFFF";
            crt.style.border = "1px solid black";
            crt.style.position = "absolute";
            crt.style.top = "0";
            crt.style.right = "-1000px";
            crt.style.padding = "20px";
            document.body.appendChild(crt);

            e.originalEvent.dataTransfer.setDragImage(crt, 0, 0);
            e.originalEvent.dataTransfer.setData('text', '');
          }
        })
        .on('drop', 'ul', function (e) {
          e.preventDefault();
          var toList = $(this).attr('name'),
            itemValue = dataTransfer["item"].split('/'),
            groupValue = dataTransfer["group"] ,
            fromList = dataTransfer["fromlist"];

          if (!(toList == 'originList' || toList == fromList)) {

            var groupResult = $.grep(plugin.settings.data, function (item, index) {
                return item.id == groupValue;
              }),
              itemResult = $.grep(groupResult[0].items, function (item, index) {
                return (itemValue ? $.inArray(String(item.id), itemValue) != -1 : true);
              });

            $.each(itemResult, function () {
              if (toList != 'original')
                this.list = toList.replace('List', '');
              else
                this.list = 'none';
            });
          }
          refreshList();

        })
        .on('dragover', 'ul, button[data-rel=list-choice]', function (e) {
          e.preventDefault();
        })
        .on('drop', 'button[data-rel=list-choice]', function (e) {
          e.preventDefault();
          $('div[data-list=' + $(this).attr('name') + ']').find('ul').trigger('drop');
        });
    };

    var renderGroups = function () {
      $.each(plugin.settings.groups, function () {
        var name = this.lists.join('-');
        var $group = $('<div data-group="' + name + '" class="' + this.class + '"></div>');
        renderLists($group);

        $group.find('div[data-list]').each(function () {
          var $list = $(this), listSetting = $.grep(plugin.settings.lists, function (a, i) {
            return a.name == $list.data('list')
          });

          if (plugin.settings.searchable || (listSetting[0].searchable && listSetting[0].searchable == true)) {
            $list.find('ul').before($('<input placeholder="Search" type="text" name="friend" class="form-control">'));
          }

          if (plugin.settings.displayShortcuts) {
            var
              $shortcut = $('<div class="pull-right"></div>'), $title = $list.find('.title').addClass('pull-left');

            $.each(plugin.settings.lists, function () {
              if (this.name != $list.data('list') && this.name != 'original')
                $shortcut.append($('<button class="btn btn-default" data-rel="list-choice" name="' + this.name + '">' + this.label + '</button>'))
            });

            $title.wrap('<div class="clearfix"></div>').after($shortcut);
          }
        });

        $group.appendTo($element);
      });
    };

    var renderLists = function (group) {
      var filtered = $.grep(plugin.settings.lists, function (item) {
        return (group.data('group').indexOf(item.name) >= 0);
      });
      $.each(filtered, function () {
        var $list = $('<div data-list="' + this.name + '" class="draggable-list ' + this.class + '"></div>');

        if (this.label == undefined)
          this.label = humanize(this.name);

        listElements[this.name] = plugin.settings.renderList(this);

        listElements[this.name].appendTo($list);

        $list.appendTo(group);
      });
    };

    var _renderList = function (list) {
      return $('<div>'
        + '<h1>' + list.label + '</h1>'
        + '<ul name="' + list.name + '"></ul>'
        + '</div>'
      );
    };

    var _renderItem = function (item) {
      return '<span class="text">' + item.name + '</span>';
    };

    // call the "constructor" method
    plugin.init();

  };

  // add the plugin to the jQuery.fn object
  $.fn.listDraggable = function (options) {

    var args = Array.prototype.slice.call(arguments, 1);

    var returns;

    // iterate through the DOM elements we are attaching the plugin to
    this.each(function () {
      // if plugin has not already been attached to the element

      if (undefined == $(this).data('plugin_listDraggable') || typeof options === 'object') {


        // create a new instance of the plugin
        // pass the DOM element and the user-provided options as arguments
        var plugin = new $.listDraggable(this, options);

        // store a reference to the plugin object
        $(this).data('plugin_listDraggable', plugin);
        console.log("list draggable initialized");

      } else if (typeof options === 'string' && options[0] !== '_' && options !== 'init') {


        var instance = $(this).data('plugin_listDraggable');

        if (instance instanceof $.listDraggable && typeof instance[options] === 'function') {

          returns = instance[options].apply(instance, Array.prototype.slice.call(args, 1));
        }

        // Allow instances to be destroyed via the 'destroy' method
        if (options === 'destroy') {
          $(this).data('plugin_listDraggable', null);
        }

      }
    });

    return returns !== undefined ? returns : this;

  };

  // Fix problems with console object when browser debug mode not activated
  if (!window.console) window.console = {log: function () {
  }};

})
  (jQuery);
