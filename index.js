const electron = require('electron')
const path = require('path')
const dialog = electron.remote.dialog
const BrowserWindow = electron.remote.BrowserWindow
const remote = require('electron').remote;
var ipcRenderer = require('electron').ipcRenderer;
const fs = require('fs')
var $ = require("jquery");

require('electron').ipcRenderer.on('callToRendererForContents', function(event,message) {
      var text = document.getElementById('text').value;
      console.log(message, text);
      console.log(remote.getGlobal('sharedObj').prop3);
      remote.getGlobal('sharedObj').prop3 = text;
      ipcRenderer.send('show-prop3');
    });

require('electron').ipcRenderer.on('callToRendererForOpeningFile', function(event,message) {
      document.getElementById('text').value = message;
      console.log(message,"code loaded on the editor");
    });

require('electron').ipcRenderer.on('callToRendererForContentsCompare', function(event,message) {
      var text = document.getElementById('text').value;
      console.log("hsgdysgd",text)
      remote.getGlobal('sharedObj').prop1 = text;
      ipcRenderer.send('show-prop1');
    });

function newBtn()
{
  ipcRenderer.send('newCallFromRenderer',"newCallFromRenderer");
}

function saveBtn()
{
  ipcRenderer.send('saveCallFromRenderer',"saveCallFromRenderer");
}

function saveAsBtn()
{
  ipcRenderer.send('saveAsCallFromRenderer',"saveAsCallFromRenderer");
}

function openBtn()
{
  ipcRenderer.send('openFileCallFromRenderer',"openFileCallFromRenderer");
}
