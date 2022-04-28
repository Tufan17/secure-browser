const electron=require("electron");
const url=require("url");
const path=require("path");
const {BrowserWindow, Menu, ipcMain  } = require("electron");
const {exec}=require("child_process");

const {app}=electron;

let mainWindow;


let page;
let lockedKey=false;
let newPage=false;


let list = [
    'PaintStudio.View',
    'mspaint',
    'WhatsApp',
    'GitHubDesktop',
];


async function checkBlacklistPrograms()
{
    let result= await new Promise(e => exec('tasklist', async (err, stdout, stderr) => {e(stdout)}));
    let blackList = new RegExp(list.join('|'),"ig");

    console.log( result.match(blackList));
    return result.match(blackList);
};
async function killBlackListPrograms()
{
    let whiteList = await checkBlacklistPrograms();
    let arr = [];
    for(let y = 0; y < whiteList.length; y++)
    {
        let x = whiteList[y];
        arr.push(new Promise(ok => 
            exec(`taskkill /F /IM ${x}.exe`)
        ));
    };
    await Promise.all(arr);
};

app.on('ready',()=>{
    console.log("uygulama calısıyor...");

    

    mainWindow=new BrowserWindow({
            fullscreen: lockedKey,
            show:true,
            webPreferences:{   
            nodeIntegration: true,
            contextIsolation: false,
            autoHideMenuBar: true,
        }
    });

        ///uygulama kapandıktan sonra nasıl biteceğine karar verir
        app.on('window-close-all', app.quit);
        app.on('before-quit', () => {
            console.log("Bittii");
        });

        
        ///uygulama başladığından sonra nasıl devam edeceğine karar verir
        mainWindow.once('ready-to-show', () => {
            killBlackListPrograms();
            console.log("uygulama başladı");

        });



        ///Klaveyi kapatma
        mainWindow.webContents.addListener("before-input-event",event => {
            if(lockedKey){
                event.preventDefault();
                
            }     
        });
    

        mainWindow.webContents.on("before-input-event",(event, input) => {
    
            console.log(input["key"]);
            
            if(input["key"]=='Escape'&&input['type']=='keyUp'){
                mainWindow.maximize();
                mainWindow.show();
                mainWindow.webContents.send('flscrenn');
                console.log("burada");
            }
        });

    ///arayüz
    mainWindow.loadURL(
        url.format({
            pathname:path.join(__dirname,"main.html"),
            protocol:"file:",
            slashes:false,
        }),
    );

    ///menüyü yok etmek için kullanılır
    //mainWindow.setMenuBarVisibility(false);

    const mainMenu=Menu.buildFromTemplate(mainMenuTemplate);

    Menu.setApplicationMenu(mainMenu);



    ///dinleyici

    ipcMain.on("key:new",(err,data)=>{
        mainWindow.loadURL(
            url.format({
                pathname:path.join(__dirname,"camera.html"),
                protocol:"file:",
                slashes:false,
            }),
        );
     });
 

    ipcMain.on("key:locked",(err,data)=>{
       lockedKey=!lockedKey;
    });

    ipcMain.on("key:1",(err,data)=>{
         page=data;
        console.log(page);
        mainWindow.webContents.send('page',page);
    });
    ipcMain.on("key:2",(err,data)=>{
        page=data;

        mainWindow.webContents.send('page', page);
        console.log(page);

    }); 
     ipcMain.on("key:search",(err,data)=>{
        mainWindow.webContents.send('sk', data);

        console.log(data);

    });

});
const mainMenuTemplate=[{

    label:"Dosya",
    submenu:[
        {
        label:"Yeni Dosya",
        }       ,

        {
            label:"Tümünü Sil",
            }       ,
            {
                label:"Çıkış Yap",
                accelerator:"Alt+C",
                role:"quit",
            },
    ],

},
{

    label:"Dev Tools",
    submenu:[
        {
        label:"Geliştirici Penceresi",
        click(item,focusWindow){
            focusWindow.toggleDevTools();
        }
        } ,
        {
            label:"Yenile",
            role:"reload",
        },
       
    ],

},

];

function createWindow(){
    addWindow=new BrowserWindow({
        width:450,
        height:200,
        title:"Yeni Penceree"
    });
    addWindow.loadURL(
        url.format({
            pathname:path.join(__dirname,"model.html"),
            protocol:"file:",
            slashes:true
        }),
    );
}

