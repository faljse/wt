Running at: http://abgabe.cs.univie.ac.at:9594
xes file at: http://abgabe.cs.univie.ac.at:9594/logging


tar xf node-v9.2.0-linux-x64.tar.xz
export PATH=~/node-v9.2.0-linux-x64/bin/:$PATH
cd <abgabe>
npm install
npm run compile
npm run start


Server app in src/App.ts
Client app in static/worklist.html
config.json to set server port

"Root" menu entry shows all tasks for all users 
(read only; not possible with permissions only atm)

xes logging file
