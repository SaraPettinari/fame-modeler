import { is } from "bpmn-js/lib/util/ModelUtil";
import { bpmnXml } from "./constants";

/**
 * 
 * @param {*} command bash command to be executed
 * @param {*} backURL backend url
 * @returns posted data
 */
function runBackCommand(command, backURL) {
    return new Promise((resolve, reject) => {
        var result = ''
        // Get the list of available services
        fetch(backURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ command }),
        })
            .then(response => response.json())
            .then(data => {
                result = data.output
                resolve(result)
            })
            .catch(error => {
                console.error('Error fetching nodes:', error);
                reject(error)
            });
    })
}




// Create pools based on the robot in the ROS network
function createPools(modeler, participants) {
    modeler.importXML(bpmnXml).then(() => {
        const modeling = modeler.get('modeling'),
         elementFactory = modeler.get("elementFactory"),
            elementRegistry = modeler.get("elementRegistry")

        // Get the collaboration
        const collaboration = elementRegistry.filter(function (element) {
            return is(element, "bpmn:Collaboration");
        })[0];

        // Create pools based on participants
        participants.forEach((participantName, index) => {
            // Create a participant shape 
        const participant = elementFactory.createParticipantShape({
            type: "bpmn:Participant"
        });

        participant.id = 'Process_' + participantName

        participant.businessObject.id = participant.id

        participant.businessObject.name = participantName

        console.log(participant)

        // Add the new participant to the diagram with collaboration as root
        modeling.createShape(participant, { x: 300, y: 300 * index }, collaboration);
        // Refresh the diagram
        modeler.get('canvas').zoom('fit-viewport');
    })})

}



export { runBackCommand, createPools }

