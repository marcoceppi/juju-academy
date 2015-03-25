var greet = "Welcome to Juju Academy ({0} {1} web)\n\n\
\
 * Documentation:  https://help.juju.academy\n\
 * Juju Documentation: https://juju.ubuntu.com/docs\n\
 * Academy Bugs: https://github.com/marcoceppi/juju-academy\n\n\
\
Last login: {2}";

window.commands = new Commands();
window.file = new Files();
window.modules ={};
window.module = null;
window.lesson = null;

function load_commands(cmds) {
  $.each(cmds, function(i, cmd) {
    window.commands.add(cmd);
  });
}

// Parse key=val key1=val to an Object
function parse_constraints(raw_constraints) {
  var pairs = raw_constraints.split(' '),
      constraints = {};
  for(var pair in pairs) {
    if(pair.indexOf('=') < 0) {
      throw "Invalid constraint format. Expected 'constraint=value'";
    }
    var data = pair.split('=', 1);
    constraints[data[0]] = data[1];
  }

  return constraints;
}

function ready_set_next() {
  ready = true;
  $('.sidebar .tasks .item').each(function() {
    if(!$(this).children('i.icon').hasClass('green')) {
      ready = false;
    }
  });

  $('.sidebar .tasks .item').promise().done(function() {
    if(ready) {
      $('.sidebar .button.next')
        .removeClass('disabled')
        .data('lesson', next_lesson(window.lesson))
        .click(function() {
          if(!$(this).hasClass('disabled')) {
            window.terminal.clear();
            $('.sidebar .lesson.description').show();
            $('.sidebar h1 i').removeClass('green');
            console.log($(this).data('lesson'));
            $.address.value($(this).data('lesson'));
          }
        });
    } else {
      $('.sidebar .button.next')
        .addClass('disabled')
        .data('lesson', '');
    }
  });
}

$(document).ready(function() {
  $('.ui.dropdown').dropdown();
  $('.sidebar h1').click(function(e) {
    $('.sidebar .lesson.description').slideToggle();
    $('.sidebar h1 i').toggleClass('green');
  });

  $.getJSON('bower.json', function(data) {
    $('#term').terminal(function(cmd, term) {
      window.terminal = term;
      window.commands.run(cmd, term);
    }, {
      prompt: 'demo@ubuntu:~$ ',
      greetings: greet.format(data.name, data.version, (new Date()).toString()),
      tabcompletion: true,
      completion: function(term, cmd, cb) {
        cb([]);
      }
    });
  });

  window.editor = ace.edit("editor");
  window.editor.setFontSize(18);
  window.editor.getSession().setUseSoftTabs(true);
  window.editor.getSession().setUseWrapMode(true);
  window.editor.setHighlightActiveLine(true);

  $.getScript("commands/builtins.jsonp");
  $.getScript("commands/juju.jsonp");
  $.getJSON('lessons.json', function(data) {
    console.log('far', data);
    Object.keys(data.modules).forEach(function(key, index) {
      console.log(key);
      window.modules[key] = data.modules[key];
    });
  });

  $(window).resize(function() {
    $('.scrollable').height($(window).height() - 10);
  });

  $(window).trigger('resize');
  $.address.change(function(e) {
    var path = e.value;
    var mod = path.split('/')[1];
    if(mod) {
      var lesson = path.split('/')[2].split('.')[0];
    }

    if(!mod || !lesson) {
      path = 'lessons/first-five-minutes/00-install-and-initialize.jsonp';
      $.address.value(path);
      mod = "first-five-minutes";
      lesson = "00-install-and-initialize";
    }
    $.getScript(path);
    window.module = mod;
    window.lesson = lesson;
  });
});
