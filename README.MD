
M2X-Demo is an example of using using a smartphone as a m2m/iot device to interact with the AT&T M2X IoT Cloud Platform and Services. To run this demo, you will need access to a Node-Red instance on a server of your choice (Node-Red is an IBM open-source m2m project which is an application that runs on node.js).  You will also need a developer account with AT&T M2X (which is free!).

There is a client portion (web application) and a M2M middleware / application server portion to this demo.  

Consider the web application as emulating a M2M/IoT device.  That is its role in this demo.  In a real environment, this would likely be an embedded module running similar logic and tied to the local assets sensors, PLC, etc.

The Node-Red / M2X portion represents the application server (Node-Red) and a time-series intelligent database platform (M2X).  

Smartphone Hardware -> Web Application -> Network -> Node-Red (app engine) -> M2X (data store)

Pre-requisites:

Server (or PC) with Node.js that will be accessible to the web application
Node-Red installed and tested on the server (or PC) running Node.js
Developer account with AT&T M2X
Apache / Ngnix server for serving the web application (html5 + css3 + JS + images)
A bit of patience and a willingness to provide feedback to Kevin W. Jones (via Github)

Getting things up and running...

M2X Stuff
1. Get your free developer account.
2. Examine this feed https://m2x.att.com/feed/46e330aa2218faf9cdc1e5186f94918f in order to create a similar feed under your own account.  You should be able to match the streams (fields) with the web application and node-red logic.  In a nutshell, the web application gathers information about the device (via the browser its running within) as well as some external information (via Google Maps and Yahoo Weather) that is then fed (via web sockets) into the M2X platform via the Node-Red middleware (app engine).


Nodejs and Node-Red Stuff
1. Install node.js (nodejs.org)
2. Install node-red (nodered.org)
3. Open m2x-demo.js ( from the node-red directory ) into an editor or view and copy into your clipboard. Then, import the clipboard contents into Node-Red via the import->clipboard option
4. You should now have a Node-Red "flow" that can be used for this demo after you change the MX2 Key values in the "Prep Sensor" and "Pre Location" function nodes and the M2X feed-API values in the "POST data to M2X!" and "PUT location to M2X!" http request nodes.

Web Application Stuff
1. Install Apache or Ngnix ( probably the long pole in the instructions if you have not done this before. )
2. Install the html, img, and JS files on the Apache/Ngnix server in a location that you can reach via your phone/tablet/laptop browser (I recommend Chrome)

Integration Test
1. Start loading your web applicaton (point your browser to the index.html file) and debug as needed.  Chrome debugging tools are excellent for this, as is the debugging option within Node-Red.



