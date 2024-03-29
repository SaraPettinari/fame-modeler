# FaMe-Modeler

## Init
- Clone the repository
- Navigate /fame-modeler folder
- Install node dependencies:
```
npm install
```

- Install ros2-web-bridge library see [documentation](https://github.com/RobotWebTools/rosbridge_suite).


## Execute
```
npm run fame
```

```
ros2 run rosbridge_server rosbridge_websocket.py
```


## Directory layout
    .
    └── fame-modeler/
        ├── assets/             # bpmn-io style
        ├── db/                 # Backend with database construction
        ├── fame-modeler/       # FaMe modeler app
        ├── lib/                # bpmn-io libraries
        ├── src                 # Icons
        ├── test                # Tests
        └── README.md

## Acknowledgements
- [bpmn-js](https://github.com/bpmn-io/bpmn-js) and [bpmn-js-token-simulation](https://github.com/bpmn-io/bpmn-js-token-simulation) libraries.
        