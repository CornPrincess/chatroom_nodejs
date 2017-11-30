//create newFunc function
function addLoadEvent(newFunc) {
    var oldFunc = window.onload;
    if(typeof oldFunc !== 'function') {
        window.onload = newFunc;
    } else {
        window.onload = function() {
            oldFunc();
            newFunc();
        }
    }
}

function Chat() {
    this.socket = null;
}

Chat.prototype = {
    //initiate
    init: function() {
        var that = this;

        //connect to the socket
        this.socket = io.connect();
        this.socket.on('connect', function() {
            document.getElementById('info').textContent = "take a nickname";
            document.getElementById('nicknameInput').placeholder = 'nickname';
            document.getElementById('nickWrapper').style.display = 'block';
            document.getElementById('nicknameInput').focus();
        });

        //login
        document.getElementById('loginBtn').addEventListener('click', function() {
            var nicknameInput = document.getElementById('nicknameInput');
            var nickName = nicknameInput.value;

            if(nickName.trim().length !== 0) {
                that.socket.emit('login', nickName);
            }else {
                nicknameInput.focus();
            }
        }, false);

        this.socket.on('nickExisted', function() {
            document.getElementById('info').textContent = 'nickname is existed.';
        });

        this.socket.on('loginSuccess', function() {
            document.title = document.getElementById('nicknameInput').value + "'s chatroom";
            document.getElementById('loginWrapper').style.display = "none";
            document.getElementById('messageInput').focus();
        });

        //statictis numbers of users
        this.socket.on('System: ', function(nickName, userCount, type) {
            var msg = nickName + (type === 'login' ? ' get in the chatroom' : ' leave the chatroom');

            that._displayNewMsg('System: ', msg, '#e91919');
            
            document.getElementById('count').textContent = userCount + (userCount > 1 ? ' users' : ' user') + ' online';

        });

        //send messages
        document.getElementById('sendBtn').addEventListener('click', function() {
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            var color = document.getElementById('colorStyle').value;

            messageInput.value = "";
            messageInput.focus();

            if(msg.trim().length !== 0) {
                that.socket.emit('postMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            }
        });

        //receive messages
        this.socket.on('newMsg', function(user, msg, color) {
            that._displayNewMsg(user, msg, color);
        })

        //show emoji
        this._initialEmoji();
        document.getElementById('emoji').addEventListener('click', function() {
            var emojiWrapper = document.getElementById('emojiWrapper');

            emojiWrapper.style.display = 'block';
            event.stopPropagation();

        }, false);
        document.body.addEventListener('click', function(event) {
            var emojiWrapper = document.getElementById('emojiWrapper');
            if(event.target !== emojiWrapper) {
                emojiWrapper.style.display = 'none';
            }
        }, false);
        document.getElementById('emojiWrapper').addEventListener('click', function(event) {
            var target = event.target;

            if(target.nodeName.toLowerCase() === 'img') {
                var messageInput = document.getElementById('messageInput');
                messageInput.focus();
                messageInput.value = messageInput.value + '[emoji:' + target.title + ']';

            }
        }, false);

        //add enter link
        document.getElementById('nicknameInput').addEventListener('keyup', function(event) {
            if(event.keyCode === 13) {
                var nickName = document.getElementById('nicknameInput').value;

                if(nickName.trim().length != 0) {
                    that.socket.emit('login', nickName);
                }
            }
        }, false);
        document.getElementById('messageInput').addEventListener('keyup', function(event) {
            var messageInput = document.getElementById('messageInput');
            var msg = messageInput.value;
            var color = document.getElementById('colorStyle').value;

            if(event.keyCode ===13 && msg.trim().length !==0) {
                messageInput.value = "";
                that.socket.emit('posMsg', msg, color);
                that._displayNewMsg('me', msg, color);
            }
        },false);
    },

    //display the message
    _displayNewMsg: function(user, msg, color) {
        var msgArea = document.getElementById('msgArea');
        var p = document.createElement('p');
        var date = new Date().toTimeString().substr(0, 8);

        msg = this._showEmoji(msg);

        p.style.color = color || '#610d0d';
        p.innerHTML = user + ' (' + date + ') : ' + msg;

        msgArea.appendChild(p);
        msgArea.scrollTop = msgArea.scrollHeight;

    },


    //initiate the emoji
    _initialEmoji: function() {
        var emojiWrapper = document.getElementById('emojiWrapper');
        var docFragment = document.createDocumentFragment();

        for(var i=1; i <= 32; i++) {
            var emoji = document.createElement('img');

            emoji.src = 'emoji/' + i + '.gif';
            emoji.title = i;
            docFragment.appendChild(emoji);
        }

        emojiWrapper.appendChild(docFragment);
    },

    //show the emoji
    _showEmoji: function(msg) {
        var result = msg;
        var reg = /\[emoji:\d+\]/g;
        var totalEmojiNum = document.getElementById('emojiWrapper').children.length;
        var match;
        var emojiIndex;

        while(match = reg.exec(msg)) {
            emojiIndex = match[0].slice(7, -1);

            if( emojiIndex > totalEmojiNum ) {
                result = result.replace(match[0], '2333333');
            } else {
                result = result.replace(match[0], '<img src="emoji/' + emojiIndex + '.gif">');

            }
        }

        return result;
    }

};

var chat = new Chat();

addLoadEvent(function() {
    chat.init();
});