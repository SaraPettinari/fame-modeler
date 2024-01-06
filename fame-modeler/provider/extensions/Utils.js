import Ids from 'ids';

import { getBusinessObject } from 'bpmn-js/lib/util/ModelUtil';


export function getParametersExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'dataObject:Parameters');
}

export function getSignalParametersExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'ros:payload');
}

export function getSignalTopicExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'ros:message');
}


export function getSignalQoSExtension(element) {
  const businessObject = getBusinessObject(element);
  return getExtension(businessObject, 'qos:policy');
}


export function getParameters(element) {
  const parameters = getParametersExtension(element);
  return parameters && parameters.get('values');
}

export function getSignalParameters(element) {
  const parameters = getSignalParametersExtension(element);
  return parameters && parameters.get('values');
}

export function getExtension(element, type) {
  if (!element.extensionElements) {
    return null;
  }

  return element.extensionElements.values.filter(function (e) {
    return e.$instanceOf(type);
  })[0];
}

export function createElement(elementType, properties, parent, factory) {
  const element = factory.create(elementType, properties);

  if (parent) {
    element.$parent = parent;
  }

  return element;
}

export function createParameters(properties, parent, bpmnFactory) {
  return createElement('dataObject:Parameters', properties, parent, bpmnFactory);
}

export function createSignalParameters(properties, parent, bpmnFactory) {
  return createElement('ros:payload', properties, parent, bpmnFactory);
}

export function createSignalTopic(properties, parent, bpmnFactory) {
  return createElement('ros:message', properties, parent, bpmnFactory);
}

export function createSignalQoS(properties, parent, bpmnFactory) {
  return createElement('qos:policy', properties, parent, bpmnFactory);
}

export function nextId(prefix) {
  const ids = new Ids([32, 32, 1]);

  return ids.nextPrefixed(prefix);
}