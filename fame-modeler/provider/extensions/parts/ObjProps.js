import { TextFieldEntry, CheckboxEntry, isSelectEntryEdited, HeaderButton } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';
import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';
import { html } from 'htm/preact';
import { createElement, createParameters, getParametersExtension } from '../Utils';


export default function ObjectParameterProps(props) {

  const { idPrefix, parameter, element } = props;

  const entries = [
    {
      id: idPrefix + '-output',
      component: IsOutput,
      idPrefix,
      parameter
    },
    {
      id: idPrefix + '-name',
      component: Name,
      isEdited: isSelectEntryEdited,
      idPrefix,
      parameter
    },
    {
      id: idPrefix + '-add',
      component: Add,
      idPrefix,
      parameter
    }
  ];

  if (!element.businessObject.data) {
    element.businessObject.data = []
    var dataObj = { name: '', value: '', isOutput: '' }
    element.businessObject.data.push(dataObj)
  }

  var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
  // if the data is not an output, show the value field
  if (!curr_data.isOutput) {
    entries.push(
      {
        id: idPrefix + '-value',
        component: Value,
        isEdited: isSelectEntryEdited,
        idPrefix,
        parameter
      }
    )
    // if the data is an output, put the data value to ${data_name}
  } else {
    curr_data.value = '${' + curr_data.name + '}'
  }

  console.log(props)
  return entries;
}

function Name(props) {

  const { commandStack, translate, bpmnFactory, debounce } = getServices()

  const { element, id } = props;

  let extensionElements = getExtensionElement(element, commandStack, bpmnFactory)


  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElements,
      properties: {
        name: value
      }
    });
    var curr_data = element.businessObject.data[element.businessObject.data.length - 1]

    curr_data.name = value

    if (curr_data.isOutput) {
      curr_data.value = '${' + curr_data.name + '}' // if the data is an output, put the data value to ${data_name}
      //saveData(element, commandStack, bpmnFactory)
    }
  };

  const getValue = () => {
    var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
    return curr_data.name;
  };

  console.log(element)

  return html`<${TextFieldEntry}
    id=${id + '-name'}
    element=${element}
    label=${translate('Name')}
    getValue=${getValue}
    setValue=${setValue}
    debounce=${debounce}
  />`
}

function Value(props) {

  const { commandStack, translate, bpmnFactory, debounce } = getServices()


  const { element, id } = props;

  let extensionElements = getExtensionElement(element)

  const setValue = (value) => {
    if (value) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: extensionElements,
        properties: {
          value: value
        }
      });
    }
    var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
    curr_data.value = value

    //saveData(element, commandStack, bpmnFactory)

  };

  const getValue = () => {
    var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
    return curr_data.value;
  };

  return html`<${TextFieldEntry}
    id=${id + '-value'}
    element=${element}
    label=${translate('Value')}
    getValue=${getValue}
    setValue=${setValue}
    debounce=${debounce}
  />`

}

function IsOutput(props) {

  const { commandStack, translate, bpmnFactory } = getServices()

  const { element, id } = props;

  let extensionElements = getExtensionElement(element, commandStack, bpmnFactory)

  const setValue = (value) => {
    console.log(value)

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElements,
      properties: {
        is_output: value
      }
    });
    var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
    curr_data.isOutput = value

    //saveData(element, commandStack, bpmnFactory)

  };

  const getValue = () => {
    var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
    return curr_data.isOutput;
  };

  return html`<${CheckboxEntry}
  id=${id + '-output'}
  element=${element}
  label=${translate('Is output?')}
  getValue=${getValue}
  setValue=${setValue}
/>`

}

function Add(props) {

  const { commandStack, translate, bpmnFactory } = getServices()

  const { element, id } = props;

  let extensionElements = getExtensionElement(element, commandStack, bpmnFactory)

  const save = () => {
    return saveData(element, commandStack, bpmnFactory)
  };

  return HeaderButton({
    element,
    id: "add",
    text: translate("add"),
    description: "add",
    children: "add",
    onClick: save,
  });

}

function getExtensionElement(element, commandStack, bpmnFactory) {

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
  }
  return extensionElements;
}


function saveData(element, commandStack, bpmnFactory) {
  let extensionElements = getExtensionElement(element, commandStack, bpmnFactory)
  var curr_data = element.businessObject.data[element.businessObject.data.length - 1]
  var name = curr_data.name || '';
  var value = curr_data.value || '';
  var isOutput = curr_data.isOutput

  console.log('dataaa')
  console.log(name + ' --- ' + value)

  // Add data information
  let data_extension = getParametersExtension(element);

  if (!data_extension) {
    data_extension = createParameters({
      values: [],
    }, extensionElements, bpmnFactory);

    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: extensionElements,
      properties: {
        values: [...extensionElements.get('values'), data_extension]
      }
    });
  }
  if (!isOutput) {
    console.log('sono qui 1')
    if (name != '' && value != '') {
      console.log('sono qui 1.0')

      const newParameter = createElement('data:parameter', {
        name: name,
        value: value
      }, data_extension, bpmnFactory);

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: data_extension,
        properties: {
          values: [...data_extension.get('values'), newParameter]
        }
      });
    }
  } else {
    console.log('sono qui 2')
    if (name != '') {
      console.log('sono qui 2.0')
      const newParameter = createElement('data:parameter', {
        name: name,
        value: '${' + curr_data.name + '}'
      }, data_extension, bpmnFactory);

      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: data_extension,
        properties: {
          values: [...data_extension.get('values'), newParameter]
        }
      });
    }
  }
}

/**
 * Get the list of useful services
 * @returns commandStack, translate, bpmnFactory, debounce
 */
function getServices() {
  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const bpmnFactory = useService('bpmnFactory');
  const debounce = useService('debounceInput');

  return { commandStack, translate, bpmnFactory, debounce }
}