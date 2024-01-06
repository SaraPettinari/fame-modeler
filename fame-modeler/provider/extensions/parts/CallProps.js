import { html } from 'htm/preact';
import { SelectEntry, isSelectEntryEdited } from '@bpmn-io/properties-panel';
import { useService } from 'bpmn-js-properties-panel';

import { useEffect, useState } from '@bpmn-io/properties-panel/preact/hooks';

export default function (element) {

  return [
    {
      id: 'calledElement',
      element,
      component: Call,
      isEdited: isSelectEntryEdited
    }
  ];
}

function Call(props) {
  const { element, id } = props;

  const modeling = useService('modeling');
  const translate = useService('translate');
  const debounce = useService('debounceInput');

  console.log(element)

  const backURL = 'http://localhost:9000';


  const getValue = () => {
    //return element.businessObject.idDB + ':' + element.businessObject.calledElement || '';
    return element.businessObject.calledElement || '';
  }

  /*const setValue = value => {
    const index = value.indexOf(':');
    const id = value.substring(0, index);
    const callValue = value.substring(index + 1);
    return modeling.updateProperties(element, {
      calledElement: callValue,
      idDB: id
    });
  }*/

  const setValue = value => {
    return modeling.updateProperties(element, {
      calledElement: value
    });
  }

  const [calls, setCalls] = useState([]);

  useEffect(() => {
    function fetchCalls() {
      fetch(backURL + '/processes')
        .then(res => res.json())
        .then(allCalls => {
          let options = [];
          var diagrams = allCalls.data;
          diagrams.forEach(element => {
            options.push({ name: element.name, process: element.process })
          });
          console.log(options)

          setCalls(options);
        })
        .catch(error => console.error(error));
    }
    fetchCalls();
  }, [setCalls]);


  const getOptions = () => {
    return [
      { label: '<none>', value: undefined },
      ...calls.map(call => ({
        label: call.name,
        value: call.process
      }))

    ];
  }

  return html`<${SelectEntry}
  element=${element}
  id=${id}
  label=${translate('Called element')}
  getValue=${getValue}
  setValue=${setValue}
  getOptions=${getOptions}
  debounce=${debounce}
  />`
}