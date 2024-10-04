import CustomRenderer from "./ServiceRenderer";


export default {
    __init__: ['customRendererProvider'],
    customRendererProvider: ['type', CustomRenderer]
};

