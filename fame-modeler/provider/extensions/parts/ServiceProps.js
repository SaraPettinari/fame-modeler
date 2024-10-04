import { html } from 'htm/preact';
import { SelectEntry, isSelectEntryEdited, TextFieldEntry, isTextFieldEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';
import ROSLIB from 'roslib';


import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

import {
    getBusinessObject
} from 'bpmn-js/lib/util/ModelUtil';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import {
    createElement,
    createServiceData,
    createService,
    getServiceExtension,
    getServiceDataExtension
} from '../Utils';


var services = ''

export default function (element) {

    const entries = [{
        id: 'fameServiceName',
        element,
        component: ServiceType,
        isEdited: isSelectEntryEdited
    },
    {
        id: 'fameServiceMessage',
        element,
        component: ServiceMessage,
        isEdited: isSelectEntryEdited
    }];


    return entries;
}

/**
 * Customization of the messages type selection
 * @param {*} props 
 * @returns 
 */
function ServiceType(props) {
    const { element, id } = props;

    const translate = useService('translate');
    const debounce = useService('debounceInput');
    const commandStack = useService('commandStack');
    const bpmnFactory = useService('bpmnFactory');

    const getValue = () => {
        if (!element.businessObject.service_name) {
            element.businessObject.service_name = ''
            element.businessObject.service_type = ''
        }
        return element.businessObject.service_name || 0;
    }

    const setValue = (value) => {
        const businessObject = getBusinessObject(element);
        let extensionElements = businessObject.get('extensionElements');

        // Create new extension element
        if (!extensionElements) {
            extensionElements = createElement(
                'bpmn:ExtensionElements',
                { values: [] },
                businessObject,
                bpmnFactory
            );

            commandStack.execute('element.updateModdleProperties', {
                element,
                moddleElement: businessObject,
                properties: { extensionElements }
            });
        } else {
            // if the ROS message type is changed, clean previous values from the model
            if (extensionElements.values.length > 0)
                extensionElements.values = []
        }

        // Add ROS message type information
        let srv_extension = getServiceExtension(element);

        srv_extension = createService({
            name: '',
            type: '',
        }, extensionElements, bpmnFactory);



        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: extensionElements,
            properties: {
                values: [...extensionElements.get('values'), srv_extension]
            }
        });

        const newService = createElement('ros:service', {
            name: id,
            type: services[id],
            value: value
        }, srv_extension, bpmnFactory);

        element.businessObject.service_name = value

        var service = services.find((srv) => srv.name == value)
        element.businessObject.service_type = service.type

        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: srv_extension,
            properties: {
                name: value,
                type: service.type
            }
        });
    }

    const [types, setServices] = useState([]);

    /**
     * Creates the select based on service type in the ROS net
     */
    useEffect(() => {
        function fetchServices() {
            var ros = new ROSLIB.Ros({ url: "ws://localhost:9090" });

            ros.on('connection', () => {
                console.log('Connected to ROS server.');

                const backURL = 'http://localhost:9000';

                // Get the list of available services
                fetch(backURL + '/run-command', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        command: 'ros2 service list -t' // get ROS services and types
                    })
                })
                    .then(response => response.json())
                    .then(data => {

                        services = data.output.trim().split('\n').map(line => {
                            const [name, type] = line.split(' [');

                            return {
                                name: name.trim(),
                                type: type.replace(']', '').trim() // Remove the closing bracket and trim any whitespace
                            };
                        });
                        //console.log('services', services);
                        setServices(services) //set services list

                    })
                    .catch(error => {
                        console.error('Error:', error);
                    });

            });
        }
        fetchServices();
    }, [setServices]);


    const getOptions = () => {
        //console.log('types', types)
        return [
            { label: '<none>', value: undefined, type: 'none' },
            ...types.map(service => ({
                label: service.name,
                value: service.name,
                type: service.type
            }))
        ];
    }

    return html`<${SelectEntry}
  element=${element}
  id=${id}
  label=${translate('Name')}
  getValue=${getValue}
  setValue=${setValue}
  getOptions=${getOptions}
  debounce=${debounce}
  />`
}

function ServiceMessage(props) {

    const { element, id } = props;
    const translate = useService('translate');
    const debounce = useService('debounceInput');
    const commandStack = useService('commandStack');
    const bpmnFactory = useService('bpmnFactory');


    const setValue = (value) => {
        const businessObject = getBusinessObject(element);
        let extensionElements = businessObject.get('extensionElements');

        // Create new extension element
        if (!extensionElements) {
            extensionElements = createElement(
                'bpmn:ExtensionElements',
                { values: [] },
                businessObject,
                bpmnFactory
            );

            commandStack.execute('element.updateModdleProperties', {
                element,
                moddleElement: businessObject,
                properties: { extensionElements }
            });
        } else {
            if(extensionElements.values.length > 0)
                extensionElements.values = []
        }

        // Add ROS service payload
        let srv_extension = getServiceDataExtension(element);

        srv_extension = createServiceData({
            data: '',
        }, extensionElements, bpmnFactory);



        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: extensionElements,
            properties: {
                values: [...extensionElements.get('values'), srv_extension]
            }
        });

        createElement('ros:payload', {
            data: value
        }, srv_extension, bpmnFactory);

        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: srv_extension,
            properties: {
                data: value
            }
        });
        element.businessObject.service_payload = value
    }

    const getValue = () => {
        if (!element.businessObject.service_payload)
            element.businessObject.service_payload = ''


        return element.businessObject.service_payload;
    };

    function getLabel() {
        return element.businessObject.service_type || 'select_service';
    }

    var type = getLabel()

    return html`<${TextFieldEntry}
  element=${element}
  id=${id}
  label=${translate(type)}
  getValue=${getValue}
  setValue=${setValue}
  debounce=${debounce}
  />`
}