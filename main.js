const { app, BrowserWindow } = require('electron')

function createWindow() {

    const win = new BrowserWindow({
        width: 500,
        height: 800,
        webPreferences: {
            nodeIntegration: true
        },
        autoHideMenuBar: true,
        closable: true,
        titleBarStyle: 'hiddenInset',
        resizable: false,
        maximizable: false,
        backgroundColor: '#595959'
    })

    win.loadFile('index.html')

}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow()
    }
})


