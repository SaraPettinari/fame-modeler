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
import { backURL } from '../../../src/utils/constants';
import { runBackCommand } from '../../../src/utils/scripts';


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

                let command = 'ros2 service list -t'
                let url = backURL + '/run-command'

                runBackCommand(command, url)
                    .then(data => {

                        services = data.trim().split('\n').map(line => {
                            const [name, type] = line.split(' [');

                            return {
                                name: name.trim(),
                                type: type.replace(']', '').trim() // Remove the closing bracket and trim any whitespace
                            };
                        });
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

    const [dynamicProperties, setDynamicProperties] = useState([]);
    const [fieldValues, setFieldValues] = useState({});

    const curr_service = element.businessObject.service_type

    const initializeValues = (properties) => {
        const initialValues = {};
        properties.forEach(prop => {
            initialValues[prop.name] = prop.default;
        });
        setFieldValues(initialValues);
    };

    useEffect(() => {
        if (curr_service) {
            async function fetchProperties() {
                try {
                    const properties = await getDynamicProperties(curr_service);
                    setDynamicProperties(properties);
                    initializeValues(properties); // Initialize field values
                } catch (error) {
                    console.error('Error in retrieving service properties:', error);
                }
            }
            fetchProperties();
        }
    }, [curr_service]);




    // Function to dynamically update the value of a specific field
    const setValue = (fieldName, value) => {
        setFieldValues(prevValues => ({
            ...prevValues,
            [fieldName]: value
        }));
        const compositeValue = { ...fieldValues, [fieldName]: value };
        var payload_value = JSON.stringify(compositeValue)

        const businessObject = getBusinessObject(element);
        let extensionElements = businessObject.get('extensionElements');

        // Add ROS service payload
        let srv_extension = getServiceDataExtension(element);

        if (!srv_extension) {
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
                data: payload_value
            }, srv_extension, bpmnFactory);
        }



        commandStack.execute('element.updateModdleProperties', {
            element,
            moddleElement: srv_extension,
            properties: {
                data: payload_value
            }
        });

        // Store the payload as a JSON string in the business object
        element.businessObject.service_payload = payload_value;
    };

    // Function to get the current value of each dynamic field
    const getValue = (fieldName) => {
        return fieldValues[fieldName] || '';
    };

    // Dynamically render input fields based on the dynamic properties
    return html`<div>
        ${dynamicProperties.map((property) => html`
            <${TextFieldEntry}
                element=${element}
                id=${id + '_' + property.name}
                label=${translate(property.name + ' (' + property.type + ')')}
                getValue=${() => getValue(property.name)}
                setValue=${value => setValue(property.name, value)}
                debounce=${debounce}
            />
        `)}
    </div>`;
}


async function getDynamicProperties(curr_service) {
    const command = `ros2 interface show ${curr_service}`;
    const url = `${backURL}/run-command`;

    try {
        const data = await runBackCommand(command, url);
        const fields = data.trim().split('---')[0].split('\n').filter(i => i);

        // Map over the fields to construct an array of properties
        const result = fields.map(field => {
            const [type, name] = field.split(' ');
            return { name, type, default: '' };
        });

        return result;
    } catch (error) {
        console.error('Error fetching properties:', error);
        return [];
    }
}

