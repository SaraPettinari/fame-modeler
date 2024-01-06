import { TextFieldEntry, CheckboxEntry } from '@bpmn-io/properties-panel';

import { useService } from 'bpmn-js-properties-panel';

import { getExtension } from '../Utils';

export default function ObjectParameterProps(props) {

  const {
    idPrefix,
    parameter
  } = props;

  const entries = [ 
    {
      id: idPrefix + '-name',
      component: Name,
      idPrefix,
      parameter
    },
    {
      id: idPrefix + '-output',
      component: IsOutput,
      idPrefix,
      parameter
    }
  ];

  if(typeof parameter.value == 'undefined' || parameter.value != '') {
    entries.push({
      id: idPrefix + '-value',
      component: Value,
      idPrefix,
      parameter
    })
  }

  return entries;
}

function Name(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    commandStack.execute('element.updateModdleProperties', {
      element,
      moddleElement: parameter,
      properties: {
        name: value
      }
    });
  };

  const getValue = (parameter) => {
    return parameter.name;
  };

  return TextFieldEntry({
    element: parameter,
    id: idPrefix + '-name',
    label: translate('Name'),
    getValue,
    setValue,
    debounce
  });
}

function Value(props) {
  const {
    idPrefix,
    element,
    parameter
  } = props;

  const commandStack = useService('commandStack');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  const setValue = (value) => {
    if(value) {
      commandStack.execute('element.updateModdleProperties', {
        element,
        moddleElement: parameter,
        properties: {
          value: value
        }
      });
    }
  };

  const getValue = (parameter) => {
    return parameter.value;
  };

  return TextFieldEntry({
    element: parameter,
    id: idPrefix + '-value',
    label: translate('Value'),
    getValue,
    setValue,
    debounce
  });
}

function IsOutput(props) {
    const {
      idPrefix,
      element,
      parameter
    } = props;
  
    const commandStack = useService('commandStack');
    const translate = useService('translate');
  
    const setValue = (value) => {
      if(value) {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: parameter,
          properties: {
            value: undefined
          }
        });
      } else {
        commandStack.execute('element.updateModdleProperties', {
          element,
          moddleElement: parameter,
          properties: {
            value: ''
          }
        });
      }
    };
  
    const getValue = () => {
      if(parameter.value != '') {
        return true;
      } 
      return false;
    };
  
    return CheckboxEntry({
      element: parameter,
      id: idPrefix + '-output',
      label: translate('is output?'),
      getValue,
      setValue
    });
}