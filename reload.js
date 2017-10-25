; (function () {

    'use strict';

    const protocol = window.location.protocol === 'http:' ? 'ws://' : 'wss://';
    let address = protocol + window.location.host + window.location.pathname + '/ws';
    let socket;
    let isActive = false;

    function init(data) {
        if (data.proxySetup === true) {
            //Correction
            if (data.liveServerUrl.indexOf('http') !== 0)
                data.liveServerUrl = 'http' + data.liveServerUrl;
            if (data.actualUrl.indexOf('http') !== 0)
                data.actualUrl = 'http' + data.actualUrl;
            if (!data.actualUrl.endsWith('/'))
                data.actualUrl = data.actualUrl + '/';

            address = data.liveServerUrl.replace('http', 'ws');
        }
        socket = new WebSocket(address);
        socket.onmessage = (msg) => {
            reloadWindow(msg, data)
        };
    }

    function reloadWindow(msg, data) {
        if (!isActive) return;
        const currentUrl = window.location.protocol + '//' + window.location.host + '/';
        if (msg.data == 'reload' || msg.data == 'refreshcss') {
            if (data.proxySetup === false || (data.proxySetup === true && currentUrl === data.actualUrl)) {
                window.location.reload();
            }
        }
        console.log("reloaded. - From Extension");
    };


    chrome.runtime.onMessage.addListener((msg) => {
        if (typeof msg !== 'object') return;
        if (msg.req === 'live-server-config-updated') {
            isActive = msg.data.isEnable;
            if (isActive && !socket) {
                init(msg.data);
            }
        }
    });

    chrome.runtime.sendMessage({
        req: 'get-live-server-config'
    }, (data) => {
        isActive = data.isEnable;
        if (isActive && !socket) {
            init(data);
        }

    });

})();