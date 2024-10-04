const bpmnXml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:modeler="http://camunda.org/schema/modeler/1.0" id="Definitions_1l4aedo" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="5.26.0" modeler:executionPlatform="Camunda Platform" modeler:executionPlatformVersion="7.21.0">
  <bpmn:collaboration id="Collaboration_0v3s67k">
  </bpmn:collaboration>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Collaboration_0v3s67k">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;

const backURL = 'http://localhost:9000'

export {bpmnXml, backURL}