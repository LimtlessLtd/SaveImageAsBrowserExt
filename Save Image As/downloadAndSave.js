chrome.contextMenus.create({
  id: "SaveImageAs",
	title: 'Save image as >',
	contexts: ['image']
});

chrome.contextMenus.create({
  id: "PNG",
  parentId: "SaveImageAs",
	title: 'PNG',
	contexts: ['image']
});

chrome.contextMenus.create({
  id: "JPEG",
  parentId: "SaveImageAs",
	title: 'JPEG',
	contexts: ['image']
});

chrome.contextMenus.onClicked.addListener(function(info, tab) {
    switch (info.menuItemId) {
        case "JPEG":
            saveImageAs(info, "JPEG");
            break;
        case "PNG":
            saveImageAs(info, "PNG");
            break;
        default:
            break;
    }
});

async function saveImageAs(info, type){
    console.log(this);
    console.log(info);
    console.log(type);

    if(info.srcUrl.includes("base64")){
        var encodedProperly = info.srcUrl.substring(info.srcUrl.indexOf(";base64,") + 8);
        var blob = base64toBlob(decodeURIComponent(encodedProperly));

        downloadBlob(blob, "Image." + type.toLowerCase());
    }
    else{


        downloadBlob(blob, "Image." + type.toLowerCase());
    }
}

function base64toBlob(base64Data, contentType) {
    contentType = contentType || '';
    var sliceSize = 1024;
    var byteCharacters = atob(base64Data);
    var bytesLength = byteCharacters.length;
    var slicesCount = Math.ceil(bytesLength / sliceSize);
    var byteArrays = new Array(slicesCount);

    for (var sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
        var begin = sliceIndex * sliceSize;
        var end = Math.min(begin + sliceSize, bytesLength);

        var bytes = new Array(end - begin);
        for (var offset = begin, i = 0; offset < end; ++i, ++offset) {
            bytes[i] = byteCharacters[offset].charCodeAt(0);
        }
        byteArrays[sliceIndex] = new Uint8Array(bytes);
    }
    return new Blob(byteArrays, { type: contentType });
}

async function downloadBlob(blob, name, destroyBlob = true) {
    // When `destroyBlob` parameter is true, the blob is transferred instantly,
    // but it's unusable in SW afterwards, which is fine as we made it only to download
    const send = async (dst, close) => {
      dst.postMessage({blob, name, close}, destroyBlob ? [await blob.arrayBuffer()] : []);
    };
    // try an existing page/frame
    const [client] = await self.clients.matchAll({type: 'window'});
    if (client) return send(client);
    const WAR = chrome.runtime.getManifest().web_accessible_resources;
    const tab = WAR?.some(r => r.resources?.includes('downloader.html'))
      && (await chrome.tabs.query({url: '*://*/*'})).find(t => t.url);
    if (tab) {
      chrome.scripting.executeScript({
        target: {tabId: tab.id},
        func: () => {
          const iframe = document.createElement('iframe');
          iframe.src = chrome.runtime.getURL('downloader.html');
          iframe.style.cssText = 'display:none!important';
          document.body.appendChild(iframe);
        }
      });
    } else {
      chrome.windows.create({url: 'downloader.html', state: 'minimized'});
    }
  }
  
  self.addEventListener('message', function onMsg(e) {
    if (e.data === 'sendBlob') {
      self.removeEventListener('message', onMsg);
      send(e.source, !tab);
    }
  });