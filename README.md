# Running this thing locally

You need to run 2 processes. IDK if it's possible to serve the react app from
the express app. It probably is but I'm not great at web dev.  

In one terminal:
```
cd server
npm start
```

That'll start the game server where the logic for the game actually lives  

In a different terminal:
```
cd client
npm start
```

That'll start the react app which should open in your browser automatically.
If it doesn't, just type `localhost:3000` in your url and BLAM.

