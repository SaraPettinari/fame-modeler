if ! systemctl is-active --quiet mongod.service; then
    sudo systemctl start mongod.service
fi

npm run fame & ros2 run rosbridge_server rosbridge_websocket.py