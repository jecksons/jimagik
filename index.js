import {cwd} from 'process';
import  sharp from 'sharp';
import readline from 'readline';
import { readdir, mkdir } from 'fs/promises';
import path from 'path';
import logUpdate from 'log-update';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const getDirResult = async (readPath) => {
    const currDate = (new Date());
    let resDir = readPath + '/jimagik-' + [currDate.getFullYear().toString(),
        (currDate.getMonth()+1).toString().padStart(2, '0'),
        (currDate.getDate()).toString().padStart(2, '0'),
        (currDate.getHours()).toString().padStart(2, '0'),
        (currDate.getMinutes()).toString().padStart(2, '0') ,
        (currDate.getSeconds()).toString().padStart(2, '0')
    ].join('-') + '/';
    await mkdir(resDir);
    return resDir;
}

const convertImages = async(readPath, heightPx, widthPx) => {
    try {        
        const oriFiles = await readdir(readPath);
        const files = [];
        for (const file of oriFiles) {
            if (path.extname(file) === '.png') {
                files.push(file);
            }
        }
        if (files.length > 0) {
            const resDir = await getDirResult(readPath);            
            const normalDir = resDir + 'normal/';
            const smallDir = resDir + 'small/';
            await mkdir(normalDir);
            await mkdir(smallDir);            
            for (let i = 0; i < files.length; i++  ) {
                const file = files[i];
                const newFilename = file.substring(0, file.length - 4) + '.webp';
                logUpdate('Processing: ' + ((i+1) *2 -1).toString() + '/' + (files.length *2));                
                await sharp(readPath + '/' + file).webp({quality: 100}).toFile(normalDir + newFilename);                
                logUpdate('Processing: ' + ((i+1) *2).toString() + '/' + (files.length *2));                
                await sharp(readPath + '/' + file).webp({quality: 100}).resize(widthPx > 0 ? widthPx : null, heightPx > 0 ? heightPx : null).toFile(smallDir + newFilename);                
            }            
            console.log(' ');
            console.log(' ');
            console.log('Process successfully completed! ');
            console.log(`See the results in ${resDir}.`);
            console.log(' ');
        } else {
            throw new Error('No png files found!');
        }        
    } catch (err) {
        console.error(err);
    }

}

const logFiles = async (readPath) => {        
    try {
        const resDir = getDirResult(readPath);
        const files = await readdir(readPath);
        for (const file of files) {
            console.log(file);
        }
    } catch (err) {
        console.error(err);
    }
}


console.log(' ');
console.log('Welcome to Jimagik!');
console.log(' ');
console.log(' ');
rl.question(`Inform the directory (default '${cwd()}'): `, (dir) => {
    const dirApply = dir || cwd();        
    rl.question('Height (in pixels) (default: unset): ', (inputHeight) =>  {
        const heightPx = parseInt(inputHeight) || 0;
        rl.question('Width (in pixels) (default: unset): ', (inputWidth) =>  {
            const widthPx = parseInt(inputWidth) || 0;
            if (!heightPx && !widthPx) {
                console.log('At least one of measures must be provided!');
                rl.close();
            } else {
                console.log(`Path: ${dirApply}`);
                console.log(`Height: ${heightPx ? heightPx : 'unset'}`);
                console.log(`Width: ${widthPx ? widthPx : 'unset'}`);
                rl.question('Proceed (Yes)?', (rep) => {
                    const repStr = (rep || 'y').toLowerCase();        
                    if (repStr === 'y' || repStr === 'yes') {
                        convertImages(dirApply, heightPx, widthPx).then(() => rl.close());
                    } else {
                        rl.close();
                    }        
                } );
            }
        });    
    });    
});


rl.on('close', () => {
    console.log('\nExitting...');
    process.exit(0);
});