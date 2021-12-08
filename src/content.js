//#region init value
var messageHashList = [];
var curentUserName = '';

arabicNumbers = ["١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "٠"];
persianNumbers = ["۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹", "۰"];
englishNumbers = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"];
//#endregion

//#region public methods
String.prototype.hashCode = function () {
  var hash = 0, i, chr;
  if (this.length === 0) return hash;
  for (i = 0; i < this.length; i++) {
    chr = this.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

String.prototype.toEnglish = function () {
  var english = '', i, chr;
  if (this.length === 0)
    return english;
  english = this;
  for (i = 0; i < 10; i++) {
    english = english.replace(arabicNumbers[9 - i], englishNumbers[i]);
    english = english.replace(persianNumbers[i], englishNumbers[i]);
  }
  return english;
};
//#endregion

//#region tag selected
var select_chatArea = '#chat-messages';
var select_currentUserName = '[class^="userNameMain"]>span';
var select_chatMessage = '#chat-messages [class^="message"]';
var select_whiteBoardIsFullScreen = '.icon--2q1XXw.icon-bbb-exit_fullscreen';
var select_dashBoardBTN = 'body header button';
var select_chatMessageBTN = '#chat-toggle-button';
//#endregion

//check url Access:
if (`${document.location.href}`.match("http.*class.*.daan.ir") != null) {
  
  //chrome.browserAction.setIcon({path: 'icon48_active.png'});

  //Change icon to acctive

  try {
    var checkMessageBox = setInterval(function () {

      if (document.querySelector(select_chatArea) != null) {

        clearInterval(checkMessageBox);

        curentUserName = `${document.querySelector(select_currentUserName).textContent}`.trim();

        document.querySelector(select_chatArea).addEventListener('DOMSubtreeModified', function (a) {

          var messages = document.querySelectorAll(select_chatMessage);

          var messageTime = new Date(new Date().toDateString() + ' ' + messages[messages.length - 1].parentElement.parentElement.querySelector('time').textContent.toEnglish());

          console.log(`${messages[messages.length - 1].parentElement.parentElement.querySelector('span').textContent}`.trim().hashCode());
          console.log(curentUserName.hashCode());
          console.log(`${messages[messages.length - 1].parentElement.parentElement.querySelector('span').textContent}`.trim().hashCode() == curentUserName.hashCode());
          console.log(messageTime.getMinutes() != new Date().getMinutes());

          //check message
          if (messageTime.getMinutes() != new Date().getMinutes() || messageTime.getHours() != new Date().getHours()
            || messageHashList.indexOf(messages[messages.length - 1].parentElement.parentElement.textContent.hashCode()) != -1
            || `${messages[messages.length - 1].parentElement.parentElement.querySelector('span').textContent}`.trim().hashCode() == curentUserName.hashCode()) {
            console.log("dn");
            return 0;
          }

          //insert hash message
          messageHashList.push(messages[messages.length - 1].parentElement.parentElement.textContent.hashCode());

          var lastmessage = { body: messages[messages.length - 1].textContent, name: messages[messages.length - 1].parentElement.parentElement.querySelector('div').querySelector('div').textContent };

          chrome.runtime.sendMessage({
            url: window.location.href,
            name: `${lastmessage.name}`,
            message: `${lastmessage.body}`,
            whiteBoardIsFullScreen: document.body.querySelector(select_whiteBoardIsFullScreen) != null
          });

        }, false);

        //more btn click to show other message
        document.querySelector(select_chatArea).parentElement.parentElement.addEventListener('DOMSubtreeModified', function (a) {
          if (document.querySelector(select_chatArea).parentElement.querySelector('button') != null)
            document.querySelector(select_chatArea).parentElement.querySelector('button').click();
        })
      }
      else {
        if (document.querySelector(select_dashBoardBTN) != null) {
          document.querySelector(select_dashBoardBTN).click();
          document.querySelector(select_chatMessageBTN).click();
        }
      }

    }, 5000);
  }
  catch (e) {
    console.log(e);
  }
}

