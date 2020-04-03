let lastType = performance.now();
let lastVal = '';
let curVal = '';
const loadingUpdates = [0, 0];
let audio;

$(document).ready(function () {
  setInterval(updateTranslation, 500)
  localStorage.setItem('targetLang', 'ja')
  if (localStorage.getItem('targetLang'))
    $('#languageName').html(langCodes[localStorage.getItem('targetLang')]);

  if (localStorage.getItem('language'))
    $('#languageName').html(localStorage.getItem('language'));

  $('#translateText').on('input', function () {
    updateTranslation()
    lastType = performance.now();
    auto_grow($(this))
  })

  $(window).click(function () {
    $('#pageSettings').addClass('close');
  });

  $('#pageSettings').click(function (e) {
    e.stopPropagation();
    // $('#pageSettings').css('cursor', 'default');
    $('#pageSettings').removeClass('close');
  })

  $('#pageSettingsBtn').click(function (e) {
    e.stopPropagation();
    // $('#pageSettings').css('cursor', 'default');
    $('#pageSettings').removeClass('close');
  })

  $('#pageSettings').click(function (e) {
    e.stopPropagation();
  })

  // $('#voice').submit(function (e) {
  //   e.preventDefault();
  //   const data = {
  //     text: $('#text').val(),
  //     voice: $('#lang').val()
  //   }
  //   let request = new XMLHttpRequest();
  //   request.open("GET", "http://localhost:3000/voices?voice=ja-JP_EmiV3Voice&text=" + $('#translatedText').html(), true);
  //   request.onload = function () {
  //     if (this.status == 200) {
  //       play(this.response)
  //     }
  //   }
  //   request.send();
  // })
  attachPlay()

  $('#LearningSForm').submit(function (e) {
    e.preventDefault();
    localStorage.setItem('speaker', $('input[name="speaker"]').val())
    localStorage.setItem('langId', $('input[name="langId"]').val())
    localStorage.setItem('originLang', $('input[name="originLang"]').val())
    localStorage.setItem('speakerName', $('input[name="speaker"]').parents('.dropdown').find('span').html())
    localStorage.setItem('langIdName', $('input[name="langId"]').parents('.dropdown').find('span').html())
    localStorage.setItem('originLangName', $('input[name="originLang"]').parents('.dropdown').find('span').html())
    $('#pageSettings').addClass('close');
  })

  /*Dropdown Menu*/
  $('.dropdown').click(function (e) {
    $(this).attr('tabindex', 1).focus();
    $(this).toggleClass('active');
    $(this).find('.dropdown-menu').slideToggle(300);
  });
  $('.dropdown').focusout(function (e) {
    $(this).removeClass('active');
    $(this).find('.dropdown-menu').slideUp(300);
  });
  insertData($('#langIdMenu'), langSpeakers, langNames, 'langId', 'langIdName');
  insertData($('#originLangMenu'), langCodes, langCodes, 'originLang', 'originLangName');
  setNameId($('#speakerMenu'), 'speaker', 'speakerName')
  /*End Dropdown Menu*/

})

function auto_grow(el) {
  console.log(el.prop('scrollHeight'))
  el.css('height', '5px');
  el.css('height', (el.prop('scrollHeight')) + "px");
}

function insertData(el, arrayId, arrayName = {}, localStorageId, localStorageName) {
  // console.log(localStorageId, localStorageName);
  setNameId(el, localStorageId, localStorageName);

  el.html('');

  for (let key in arrayId)
    el.append(`<li id="${key}">${arrayName[key] ? arrayName[key] : key}</li>`);


  el.find('li').click(function (e) {
    $(this).parents('.dropdown').find('span').text($(this).text());
    $(this).parents('.dropdown').find('input').attr('value', $(this).attr('id'));
    if (el.attr('id') == 'langIdMenu') {
      $('#speakerMenu').parents('.dropdown').find('span').text('Select Speaker');
      $('#speakerMenu').parents('.dropdown').find('input').attr('value', '');
      const arrayId = langSpeakers[$(this).attr('id')];
      insertData($('#speakerMenu'), arrayId, arrayId);
    }
  });
}

function setNameId(el, localStorageId, localStorageName) {
  if (localStorage.getItem(localStorageId))
    el.parents('.dropdown').find('input').attr('value', localStorage.getItem(localStorageId));
  if (localStorage.getItem(localStorageName))
    el.parents('.dropdown').find('span').html(localStorage.getItem(localStorageName));
}

function attachPlay() {
  if ($('#play').length) {
    $('#play').click(function (e) {
      e.preventDefault();
      loadingAudio();
      // const data = {
      //   text: $('#text').val(),
      //   voice: $('#lang').val()
      // }
      let request = new XMLHttpRequest();
      request.open("GET", `http://localhost:3000/voices?voice=${localStorage.getItem('speaker')}&text=${$('#translatedText').html()}`, true);
      request.onload = function () {
        if (this.status == 200) {
          play(this.response)
        }
      }
      request.send();
      // playAudio();
    });
  }
}

function loadingAudio() {
  if ($('#play').length) {
    $('#play').replaceWith(`
    <button id="loading" class="simple-button btn btn-lg text-uppercase full btn-icon  p-3 inner-shadow">
        Pause
    </button>`);
    $('#loading').html('Loading...');
    $('#loading').attr("disabled", true);
    $('#loading').css("cursor", "default");
  }
}

function playAudio() {
  if ($('#loading').length) {
    audio.play();
    $('#loading').replaceWith(`
    <button id="pause" class="simple-button btn btn-lg text-uppercase full btn-icon  p-3 inner-shadow">
        Pause
    </button>`);
    attachPause();
  }
}

function attachPause() {
  if ($('#pause').length) {
    $('#pause').click(function (e) {
      e.preventDefault();
      pauseAudio();
    });
  }
}
function pauseAudio() {
  if ($('#pause').length) {
    audio.pause();
    $('#pause').replaceWith(`
    <button id="play" class="simple-button btn btn-lg text-uppercase full btn-icon  p-3 inner-shadow">
        Play
    </button>`);
    attachPlay();
  }
}

function unloadAudio() {
  if ($('#loading').length) {
    $('#loading').replaceWith(`
    <button id="play" class="simple-button btn btn-lg text-uppercase full btn-icon  p-3 inner-shadow">
        Play
    </button>`);
    attachPlay();
  }
}

function updateTranslation() {
  curVal = $('#translateText').val();
  const curValArr = curVal.split(' ');
  if ((lastType + 500 < performance.now() ||
    curValArr[curValArr.length - 1] == '') && lastVal != curVal) {
    translate({
      translateFrom: localStorage.getItem('originLang'),
      translateTo: localStorage.getItem('targetLang'),
      text: curVal
    }, (resp) => {
      console.log(resp.translated.text)
      if (resp.translated.text.includes('NO QUERY SPECIFIED.'))
        $('#translatedText').html('Start typing to learn');
      else if (resp.translated.text.includes('QUERY LIMIT EXCEEDED.'))
        $('#translatedText').html('Maximum of 500 chars!');
      else
        $('#translatedText').html(resp.translated.text);
    })
    lastVal = curVal;
  }
  if (curVal != lastVal) {
    loadingUpdates[0]++;
    loadingAudio();
  }
  else if (loadingUpdates[0] > 0) {
    loadingUpdates[0] = 0;
    unloadAudio();
  }
}

function translate(data, cb) {
  console.log(data)
  $.ajax({
    method: 'GET',
    url: `http://localhost:3000/translate`,
    // headers: {
    //     accessToken: localStorage.getItem('accessToken')
    // },
    data
  })
    .done(function (response) {
      cb(response);
    })
    .fail(function (response) {
      console.log(response);
    })
}

function play(filePath) {
  var request2 = new XMLHttpRequest();
  request2.open("GET", 'http://localhost:3000/audio/' + filePath, true);
  request2.responseType = "blob";
  request2.onload = function () {
    if (this.status == 200) {
      audio = new Audio(URL.createObjectURL(this.response));
      audio.onended = pauseAudio;
      audio.load();
      playAudio();
    }
  }
  request2.send();
}




function showListPage() {
  showUserPage(); // Make sure to clear user page
  $('#TitleUser').html(`Hey ${localStorage.getItem('name')}, `);
  getClasses((data) => {
    $('#SubUser').text(`You've started learning ${data.length} languages!`);
    $('.list-group.class-list').html('');
    const subscribedList = {
      itemIds: [],
      langIds: []
    };
    for (let i in data) {
      const newItem = `<li class="list-group-item">
                <table class=" trash transition" style="color: white;position:relative; z-index:5;">
                    <tr>
                        <th class="button check idSPLIT${data[i]['id']}SPLIT btn-icon" style="padding:20px 25px;width:100%;text-align:center; z-index:5;">
                            <h5 class="class-title checked"style="margin:0;">${langCodes[data[i]['idLang']]}</h5>
                            <p class="description transition checked" >You've spent ${Math.floor(Math.random() * 100)} minutes today! Good Job!</p>
                        </th>
                    </tr>
                </table>
                <nav class="navbar" style="position:absolute; z-index:0; right:0; height:100%; top:0%; width:130px; background:rgba(0,0,0, 0.1);">
                    <h5 style="margin:0;" class="fa fa-trash button transition btn-icon idSPLIT${data[i]['id']}SPLIT" aria-hidden="true"></h5>
                </nav>
            </li>`
      subscribedList['langIds'].push(data[i]['idLang']);
      subscribedList['itemIds'].push(data[i]['id']);
      $('.list-group.subscribed-list').append(newItem);
    }
    for (let key in langCodes) {
      if (!subscribedList['langIds'].includes(key)) {
        const newItem = `<li class="list-group-item">
                <table class=" trash transition" style="color: white;position:relative; z-index:5;">
                    <tr>
                        <th class="button check btn-icon" style="padding:20px 25px;width:100%;text-align:center; z-index:5;">
                            <h5 class="class-title checked"style="margin:0;">${langCodes[key]}</h5>
                            <p class="description transition checked" ></p>
                        </th>
                    </tr>
                </table>
                <nav class="navbar" style="position:absolute; z-index:0; right:0; height:100%; top:0%; width:130px; background:rgba(0,0,0, 0.1);">
                    <h5 style="margin:0;" class="fa fa-check button transition btn-icon langIdSPLIT${key}">SPLIT" aria-hidden="true"></h5>
                </nav>
            </li>`
        $('.list-group.class-list').append(newItem);
      }
    }
    $('.list-group-item').hover(function (e) {
      $('.trash').removeClass("selected");
      $('.description').removeClass("selected");
      $(this).find('.trash').addClass("selected");
      if ($(this).find('.description').text().length > 0) {
        $(this).find('.description').addClass("selected");
      }
    });
    $('.list-group-item').mouseleave(function (e) {
      $('.trash').removeClass("selected");
      $('.description').removeClass("selected");
    });
    $('.button').click(function (e) {
      e.stopPropagation();
      const id = $(this).attr('class').split('SPLIT')[1];
      if ($(this).attr('class').includes('fa-trash')) {
        deleteClass(id, () => {
          showListPage();
        });
      }
      else if ($(this).attr('class').includes('check')) {
        if (!subscribedList['itemIds'].includes(id)) {
          addClass(id, function (e) {
            showListPage();
          })
        }
      }
    });
  })
  hideAll();
  $('#ListPage').show();
}


function hideAll() {
  $('#ListPage').hide();
  $('#LanguangePage').hide();
  $('#UserPage').hide();
  $('#AlreadySocialsPage').hide();
}

function getClasses(cb) {
  $.ajax({
    method: 'GET',
    url: 'http://localhost:3000/classes',
    headers: {
      accessToken: localStorage.getItem('accessToken'),
      name: localStorage.getItem('name')
    }
  })
    .done(function (response) {
      cb(response);
    })
    .fail(function (response) {
      alert(response);
    })
}

function addClasses(data, cb) {
  $.ajax({
    method: 'POST',
    url: 'http://localhost:3000/classes',
    headers: {
      accessToken: localStorage.getItem('accessToken'),
      name: localStorage.getItem('name')
    },
    data
  })
    .done(function (response) {
      cb(response);
    })
    .fail(function (response) {

      alert(response);
    })
}

function deleteClasses(id, cb) {
  $.ajax({
    method: 'DELETE',
    url: `http://localhost:3000/classes/${id}`,
    headers: {
      accessToken: localStorage.getItem('accessToken'),
      name: localStorage.getItem('name')
    }
  })
    .done(function (response) {
      cb(response);
    })
    .fail(function (response) {
      alert(response);
    })
}