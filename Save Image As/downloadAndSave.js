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
  saveImageAs(info, info.menuItemId.toLowerCase());
});

function saveImageAs(info, type){
    if(info.srcUrl.includes("base64")){
      var blob = convertBase64ToBlob(info.srcUrl);

      downloadBlob(blob, "Image", type);
    }
    else{
      var blob = convertURLImageToBlob(info.srcUrl);

      downloadBlob(blob, "Image", type);
    }
}

function convertBase64ToBlob(base64Image){

}

function convertURLImageToBlob(url){

}

function downloadBlob(blob, name, type){

}