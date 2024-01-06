import CallProps from './parts/CallProps';

import ObjectParametersProps from './parts/ObjProps';

import FameSignalProps from './parts/FameSignalProps';

import { is } from 'bpmn-js/lib/util/ModelUtil';

import { ListGroup } from '@bpmn-io/properties-panel';

const LOW_PRIORITY = 500;


/**
 * A provider with a `#getGroups(element)` method
 * that exposes groups for a diagram element.
 *
 * @param {PropertiesPanel} propertiesPanel
 * @param {Function} translate
 */
export default function ExtensionElementsProvider(propertiesPanel, injector, translate) {

  // API ////////

  /**
   * Return the groups provided for the given element.
   *
   * @param {DiagramElement} element
   *
   * @return {(Object[]) => (Object[])} groups middleware
   */
  this.getGroups = function (element) {

    /**
     * Return a middleware that modifies
     * the existing groups.
     *
     * @param {Object[]} groups is the collection of the property panel tabs
     *
     * @return {Object[]} modified groups
     */
    return function (groups) {


      if (is(element, 'bpmn:CallActivity')) {
        console.log(groups)
        const calledElementTab = groups.find((e) => e.id === "CamundaPlatform__CallActivity");

          const entries = calledElementTab.entries;

          if (element.businessObject.get('calledElement') !== undefined) {
            entries.splice(1, 1, CallProps(element)[0]);
          }

      }

      if (is(element, 'bpmn:ScriptTask')) {

        const scriptTab = groups.find((e) => e.id === "CamundaPlatform__Script");

        const entries = scriptTab.entries;

        if (element.businessObject.scriptFormat == undefined || element.businessObject.scriptFormat == '') {
          element.businessObject.scriptFormat = 'JavaScript';
          /*
          console.log(element.businessObject);
          console.log(element.businessObject.get('scriptType'))
          */
          //console.log($('.bio-properties-panel-entry[data-entry-id="scriptType"] select').val())
          //$('#bio-properties-panel-scriptType').val('script').trigger();
          //console.log($('.bio-properties-panel-group').find('[data-group-id="group-CamundaPlatform__Script"]'))
          //$('.bio-properties-panel-group').find('[data-group-id="group-CamundaPlatform__Script"]').trigger('click')
        }

      }

      if (is(element, 'bpmn:StartEvent') || is(element, 'bpmn:EndEvent') || is(element, 'bpmn:IntermediateCatchEvent') || is(element, 'bpmn:IntermediateThrowEvent')) {
        console.log(groups)
        const signalTab = groups.find((e) => e.id === "signal");

        if (signalTab !== undefined) {
          if (element.businessObject.eventDefinitions[0].signalRef) {
            element.businessObject.name = element.businessObject.eventDefinitions[0].signalRef.name;
            if (typeof element.label != 'undefined') {
              element.label.businessObject.name = element.businessObject.eventDefinitions[0].signalRef.name;
              $(`.djs-element[data-element-id="${element.label.id}"] tspan`).text(element.businessObject.eventDefinitions[0].signalRef.name);
            }
          }
          groups.splice(3, 0, createFameSignal(element, translate));
        }

      }

      if (is(element, 'bpmn:DataObjectReference')) {
        groups.splice(2, 0, createObjectParametersGroup(element, injector, translate));
      }

      console.log(element)

      return groups;
    }
  };


  // registration ////////

  // Register our custom magic properties provider.
  // Use a lower priority to ensure it is loaded after
  // the basic BPMN properties.
  propertiesPanel.registerProvider(LOW_PRIORITY, this);
}

ExtensionElementsProvider.$inject = ['propertiesPanel', 'injector', 'translate'];

function createFameSignal(element, translate) {

  const fameGroup = {
    id: 'fameSignal',
    label: translate('ROS'),
    entries: FameSignalProps(element)
  };

  return fameGroup;
}

function createObjectParametersGroup(element, injector, translate) {

  const objectParametersGroup = {
    id: 'ObjectParameters',
    label: translate('ROS'),
    component: ListGroup,
    ...ObjectParametersProps({ element, injector })
  };

  return objectParametersGroup;
}