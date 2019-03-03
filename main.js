const { app, BrowserWindow, Menu, dialog} = require('electron')
/*Keep a global reference of the window object, if you don't, the window will
 be closed automatically when the JavaScript object is garbage collected.*/
var ipcMain = require('electron').ipcMain
const fs = require('fs')

let mainWindow
var filepath = null

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 })

  // Open the DevTools.
  //mainWindow.webContents.openDevTools()

  // and load the index.html of the app.
  mainWindow.loadURL(`file://${__dirname}/index.html`);

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    /* Dereference the window object, usually you would store windows
     in an array if your app supports multi windows, this is the time
     when you should delete the corresponding element.*/
    mainWindow = null
  })

  var menu = Menu.buildFromTemplate([
  {
    label: 'Menu',
    submenu:[
      {
        label: 'New',
        click()
        {
          //code for opening a new document
          windowReload();
        }
      },
      {
        label: 'Save',
        click()
        {
          //code for saving document
          saveFile(1); // '1' indicates the function is called from save method
        }
      },
      {
        label: 'Save As',
        click()
        {
          //code for save As
          filepath=null; //set null for saving a new copy of document
					saveAsHandler(2);
        }
      },
      {
        label: 'Open',
        click()
        {
          //code for opening document
          dialog.showOpenDialog({filters: [
										{ name: 'text', extensions: ['txt'] }
  										]},
										(fileNames) => {
                    // fileNames is an array that contains all the selected
                    if(fileNames === undefined){
                      return;
                    }
                    fs.readFile(fileNames[0], 'utf-8', (err, data) => {
                      if(err){
                        alert("An error ocurred reading the file 22:" + err.message);
                        return;
                      }
                      filepath=fileNames[0];
                      // Change how to handle the file content
											console.log(fileNames[0]);
                      mainWindow.webContents.send('callToRendererForOpeningFile',data);
											mainWindow.setTitle(filepath);
                    });
                  });
        }
      },
      {
        type:'separator'
      },
      {
        label: 'Refresh',
        click()
        {
          //code for refreshing application
          mainWindow.reload();
        }
      },
      {
        label: 'Exit',
        click()
        {
          //code for exiting application
          app.quit();
        }
      },
    ]
  }
])
Menu.setApplicationMenu(menu);
}

/* This method will be called when Electron has finished
 initialization and is ready to create browser windows.
 Some APIs can only be used after this event occurs.*/
app.on('ready', function()
{
  createWindow();
  mainWindow.on('close', function(event)
  {
    event.preventDefault();
      if(!filepath)
      {
        mainWindow.webContents.send('callToRendererForContents','callToRendererForContents');
        global.sharedObj = {prop3: null};
        ipcMain.once('show-prop3', function(event)
        {
            content = global.sharedObj.prop3;
            console.log(content,"content");
            if(content == "")
            {
              mainWindow.removeAllListeners('close');
              mainWindow.close();
            }
            else
            {
              closeHandlerFunction(event);
            }
        });
      }
      else
      {
          event.preventDefault();
          mainWindow.webContents.send('callToRendererForContentsCompare',"callToRendererForContentsCompare");
          global.sharedObj = {prop1: null};
          ipcMain.once('show-prop1', function(event)
          {
             currentFileContent = global.sharedObj.prop1;
             fs.readFile(filepath, 'utf-8', (err, data) =>
                  {
                    if(err)
                    {
                       alert("An error ocurred reading the file :" + err.message);
                       return;
                    }
                    // Change how to handle the file content
                    if(currentFileContent == data)
                    {
                        mainWindow.removeAllListeners('close');
                        mainWindow.close();
                    }
                    else
                    {
                        closeHandlerDialog(event)
                    }
                  });
            });
          }
  });
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  /* On macOS it is common for applications and their menu bar
     to stay active until the user quits explicitly with Cmd + Q */
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  /* On macOS it's common to re-create a window in the app when the
   dock icon is clicked and there are no other windows open. */
  if (mainWindow === null) {
    createWindow()
  }
})

/* In this file you can include the rest of your app's specific main process
 code. You can also put them in separate files and require them here. */

//Gets called from saveFile()
function savePath(filepathVar)
{
  filepath = filepathVar;
  if(filepath)
  {
    writeToFile(filepath)
  }
}

//Gets called on clicking save or saveAs
function saveFile(saveFlag)
{
  if(!filepath)
  {
    dialog.showSaveDialog(mainWindow,{filters: [
      {
        name: 'text', extensions: ['txt']
      }
    ]},savePath);
  }
  else
  {
    writeToFile(filepath,saveFlag);
  }
}

function writeToFile(filepath,saveFlag)
{
  mainWindow.webContents.send('callToRendererForContents','callToRendererForContents');
  global.sharedObj = {prop3: null};
  ipcMain.once('show-prop3', function(event)
  {
      content = global.sharedObj.prop3;
      console.log(content, filepath);
      if (typeof content !== "string")
      {
        throw new TypeError("getContent must return a string")
      }
      fs.writeFile(filepath, content, function (err)
      {
        if (err)
        {
          console.log(err)
          return;
        }
        else {
          mainWindow.setTitle(filepath);
        }
      });
  });
}

function savePathChosenHandler(filepathArg)
{
  filepath = filepathArg;
  if(filepath)
  {
    writeToFile(filepath)
  }
}

function saveAsHandler(saveFlag)
{
 	if (!filepath)
	{
   dialog.showSaveDialog(mainWindow,{ filters: [
       { name: 'text', extensions: ['txt'] }
     ]},savePathChosenHandler);
 	}
	else
	{
   	writeToFile(filepath,saveFlag)
 	}
}

function closeHandlerFunction(event)
{
   let currentFileContent = null;
   // ask if file ought to be saved. If yes, save, then close.
   if (!filepath)
   {
     //if the file never has been saved, ask if it should be saved before closing right away
     closeHandlerDialog(event);
   }
   else
   {
     //if the file has been saved, check if it has changed since the last save
    }
 }

 function closeHandlerDialog(event)
{
   var button = dialog.showMessageBox({
     type: "question",
     buttons: ["Save changes", "Discard changes", "Cancel"],
     message: "Your file was changed since saving the last time. Do you want to save before closing?"
   });

   if (button === 0)
   { //SAVE
       event.preventDefault();
       saveAsHandler(1);
       return true;
   }
   else if(button == 1)
   {
     mainWindow.removeAllListeners('close');
     mainWindow.close();
   }
}
function windowReload()
{
  filepath = null;
  mainWindow.reload();
}


//Following are function calls to New, Save, SaveAS, Open from the Renderer
ipcMain.on('newCallFromRenderer', (event, arg) =>
{
    windowReload();
});

ipcMain.on('saveCallFromRenderer', (event, arg) =>
{
    saveFile(1);
});

ipcMain.on('saveAsCallFromRenderer', (event, arg) =>
{
    filepath=null; //set null for saving a new copy of document
    saveAsHandler(2);
});

ipcMain.on('openFileCallFromRenderer', (event, arg) =>
{
  //code for opening document
  dialog.showOpenDialog({filters: [
            { name: 'text', extensions: ['txt'] }
              ]},
            (fileNames) => {
            // fileNames is an array that contains all the selected
            if(fileNames === undefined){
              return;
            }
            fs.readFile(fileNames[0], 'utf-8', (err, data) => {
              if(err){
                alert("An error ocurred reading the file 22:" + err.message);
                return;
              }
              filepath=fileNames[0];
              // Change how to handle the file content
              console.log(fileNames[0]);
              mainWindow.webContents.send('callToRendererForOpeningFile',data);
              mainWindow.setTitle(filepath);
            });
          });
});
